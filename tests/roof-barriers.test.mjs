import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { World3D } from '../game/world3d.js';
import { ThemeObstacleKit } from '../game/themeObstacles3d.js';
import { Train3D, Ramp3D, HighBarrier3D, LowBarrier3D, RoofBarrier3D } from '../game/obstacles3d.js';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { Player3D } = await import('../game/player3d.js');
const { GameEngine } = await import('../game/main.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true;

const MAPS = ['egypt', 'store', 'tea', 'pond', 'laundry'];
let randomState = 0x84a732e1;
function nextRandom() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
}
function generateChosenPattern(world, patternRandom, z) {
    const originalRandom = Math.random;
    let first = true;
    Math.random = () => {
        if (first) { first = false; return patternRandom; }
        return nextRandom();
    };
    try { return world.generatePattern(z); } finally { Math.random = originalRandom; }
}
function kitFor(id) { return id === 'egypt' ? null : new ThemeObstacleKit(id); }
function makePlayer() {
    const player = Object.create(Player3D.prototype);
    player.character = { group: new THREE.Group(), update() {}, animateCrash() {} };
    player.reset(); return player;
}
function meshes(group) {
    const result = [];
    group.traverse(mesh => {
        if (mesh.isMesh) result.push({ geometry: mesh.geometry, material: mesh.material,
            position: mesh.position.toArray(), rotation: mesh.rotation.toArray(), scale: mesh.scale.toArray(), name: mesh.name });
    });
    return result;
}
function collisionEngine(player, train, barrier) {
    const engine = Object.create(GameEngine.prototype);
    Object.assign(engine, { player, previousPlayerX: player.x, previousPlayerY: player.y, previousPlayerZ: player.z,
        world: { coins: [], props: [], trains: [train], barriers: [barrier] }, hits: 0 });
    engine.handleHit = () => engine.hits++;
    return engine;
}

for (const id of MAPS) {
    test(`${id}: legacy ramp and incoming platforms keep one roof obstacle with both original ground styles`, () => {
        const scene = new THREE.Scene(), kit = kitFor(id);
        const world = Object.create(World3D.prototype);
        Object.assign(world, { scene, obstacleKit: kit, mapId: id, patternIndex: 1,
            challengeKit: null, trains: [], ramps: [], barriers: [], coins: [], props: [], features: [] });
        try {
            const cases = [];
            for (const patternRandom of [.1, .4]) for (const type of ['jump', 'slide']) {
                let found = false;
                for (let attempt = 0; attempt < 100 && !found; attempt++) {
                    // Only the branch choice is fixed. A changing PRNG keeps UUIDs and
                    // the vehicle/obstacle choices independent throughout the test.
                    world.patternIndex = 1;
                    generateChosenPattern(world, patternRandom, 45 + world.trains.length * 300);
                    const train = world.trains.at(-1);
                    const barriers = world.barriers.filter(barrier => barrier.train === train);
                    if (!(train instanceof Train3D) || barriers[0]?.type !== type) continue;
                    assert.equal(barriers.length, 1);
                    cases.push([train, barriers[0]]); found = true;
                }
                assert.ok(found, `the legacy ${patternRandom === .1 ? 'ramp' : 'incoming'} ${type} path was never generated`);
            }
            assert.equal(cases.length, 4);
            for (const [train, barrier] of cases) {
                assert.equal(barrier.train, train);
                assert.equal(barrier.lane, train.lane);
                assert.equal(barrier.z, train.z + 10, 'barrier blocks the ramp exit');
                assert.ok(barrier.z + barrier.depth / 2 < train.z + train.length - 2);
                assert.equal(barrier.mesh.position.y, barrier.baseY);
                const baseline = barrier.type === 'jump' ? new HighBarrier3D(scene, train.lane, 0, kit)
                    : new LowBarrier3D(scene, train.lane, 0, kit);
                const semantics = group => meshes(group).map(({ geometry, material, name, position, rotation, scale }) =>
                    ({ geometry, material, name, y: position[1], z: position[2], rotation, height: scale[1], depth: scale[2] }));
                assert.deepEqual(semantics(barrier.mesh), semantics(baseline.mesh), 'roof obstacle lost the ground style, action sign, or height');
                assert.equal(barrier.height, baseline.height);
                assert.ok(barrier.width < baseline.width, 'roof obstacle did not adapt to the narrower deck');
                const bounds = new THREE.Box3().setFromObject(barrier.mesh), centerX = barrier.mesh.position.x;
                assert.ok(bounds.min.x > centerX - barrier.deckWidth / 2 + .02, 'left foot hangs outside the roof');
                assert.ok(bounds.max.x < centerX + barrier.deckWidth / 2 - .02, 'right foot hangs outside the roof');
                baseline.destroy();
            }
        } finally {
            for (const collection of ['trains', 'ramps', 'barriers', 'coins', 'props', 'features']) world[collection].forEach(entity => entity.destroy());
            kit?.dispose();
        }
        assert.equal(scene.children.length, 0);
    });

    for (const type of ['jump', 'slide']) {
        test(`${id} roof ${type}: normal action clears it at all run speeds, wrong action collides`, () => {
            const scene = new THREE.Scene(), kit = kitFor(id), ramp = new Ramp3D(scene, 0, 30, kit);
            const train = new Train3D(scene, 0, ramp.endZ, 0, kit), barrier = new RoofBarrier3D(scene, train, kit, type);
            try {
                for (const speed of [26, 56, 65]) {
                    for (const dt of [1 / 60, .05]) {
                        for (const action of [type, type === 'jump' ? 'slide' : 'none']) {
                            const player = makePlayer();
                            player.z = ramp.endZ - 5;
                            player.y = ramp.getHeightAtZ(player.z);
                            const engine = collisionEngine(player, train, barrier);
                            let acted = false;
                            while (player.z < barrier.z + 2) {
                                if (!acted && player.z >= train.z - .5) {
                                    if (action === 'jump') player.jump();
                                    else if (action === 'slide') player.slide();
                                    acted = true;
                                }
                                engine.previousPlayerX = player.x; engine.previousPlayerY = player.y; engine.previousPlayerZ = player.z;
                                player.update(dt, speed, { trains: [train], ramps: [ramp] });
                                barrier.update(); engine.checkCollisions();
                            }
                            assert.equal(acted, true);
                            if (action === type) assert.equal(engine.hits, 0, `${speed} m/s, dt=${dt}: correct ${action} hit a roof obstacle`);
                            else assert.ok(engine.hits > 0, `${speed} m/s, dt=${dt}: wrong ${action} passed the roof obstacle`);
                        }
                    }
                }
            } finally { ramp.destroy(); train.destroy(); barrier.destroy(); kit?.dispose(); }
        });
    }
}

test('roof collision sweeps frames, ignores ground and other lanes, and follows moving trains', () => {
    const scene = new THREE.Scene(), train = new Train3D(scene, 1, 70, 12), barrier = new RoofBarrier3D(scene, train, null, 'slide');
    try {
        const standing = { x: -CONFIG.LANE_WIDTH, y: train.height, z: barrier.z + 2, isSliding: false };
        assert.equal(barrier.collidesWith(standing, { ...standing, z: barrier.z - 2 }), true, 'a large frame skipped the beam');
        assert.equal(barrier.collidesWith({ ...standing, y: 0, z: barrier.z }, { ...standing, y: 0, z: barrier.z }), false, 'ground player hit a roof beam');
        assert.equal(barrier.collidesWith({ ...standing, x: 0, z: barrier.z }), false, 'neighbor lane hit a roof beam');
        assert.equal(barrier.collidesWith({ ...standing, y: barrier.baseY + barrier.height + .01, z: barrier.z }), false, 'above-beam player hit it');
        assert.equal(barrier.collidesWith({ ...standing, isSliding: true, z: barrier.z }), false);
        const oldZ = barrier.z;
        train.update(.5); barrier.update();
        assert.equal(barrier.previousZ, oldZ);
        assert.equal(barrier.z, oldZ - 6);
        assert.equal(barrier.mesh.position.z, barrier.z);
        assert.equal(barrier.collidesWith({ ...standing, z: barrier.z }), true);
        assert.equal(barrier.collidesWith({ ...standing, z: oldZ + 2 }, { ...standing, z: oldZ + 2 }), false);
        assert.equal(barrier.collidesWith({ ...standing, y: train.height, z: barrier.z + 1 },
            { ...standing, y: train.height + 3, z: barrier.z - 1 }), true, 'an unsliding early descent bypassed a beam');
    } finally { train.destroy(); barrier.destroy(); }
});

test('roof hazards preserve flight protection and are removed during reset and cleanup', () => {
    const scene = new THREE.Scene(), train = new Train3D(scene, 0, 45), barrier = new RoofBarrier3D(scene, train, null, 'jump');
    const player = makePlayer(); player.z = barrier.z; player.y = train.height;
    const engine = collisionEngine(player, train, barrier);
    engine.checkCollisions(); assert.equal(engine.hits, 1);
    player.props.flight = 1; engine.checkCollisions(); assert.equal(engine.hits, 1, 'flight hit a roof hazard');
    player.props.flight = 0; player.dead = true; engine.checkCollisions(); assert.equal(engine.hits, 1);
    const world = Object.create(World3D.prototype);
    Object.assign(world, { scene, trains: [train], barriers: [barrier], ramps: [], coins: [], props: [], features: [], challenges: [] });
    world.cleanupBehind(train.z + train.length + 1);
    assert.equal(scene.children.length, 0);
    assert.equal(world.trains.length, 0); assert.equal(world.barriers.length, 0);
    const nextTrain = new Train3D(scene, 0, 75), nextBarrier = new RoofBarrier3D(scene, nextTrain, null, 'slide');
    world.trains.push(nextTrain); world.barriers.push(nextBarrier);
    world.clearEntities(); assert.equal(scene.children.length, 0);
    assert.equal(world.trains.length, 0); assert.equal(world.barriers.length, 0);
});

test('fast ramp exits carry standing and sliding runners without pulling low, airborne, or neighboring players onto roofs', () => {
    const scene = new THREE.Scene(), ramp = new Ramp3D(scene, 0, 30), train = new Train3D(scene, 0, ramp.endZ);
    try {
        for (const slide of [false, true]) {
            const player = makePlayer(); player.z = ramp.endZ - 5; player.y = ramp.getHeightAtZ(player.z);
            if (slide) player.slide();
            for (let i = 0; i < 3; i++) player.update(.05, 56, { ramps: [ramp], trains: [train] });
            assert.equal(player.isOnRoof, true); assert.equal(player.isGrounded, true);
            assert.equal(player.y, train.height); assert.equal(player.isSliding, slide);
        }
        for (const mode of ['low', 'airborne', 'other-lane', 'gap']) {
            const player = makePlayer(); player.z = ramp.endZ - 2.2; player.y = ramp.getHeightAtZ(player.z);
            let supports = [ramp];
            if (mode === 'low') player.y = 0;
            if (mode === 'airborne') { player.isGrounded = false; player.vy = -1; }
            if (mode === 'other-lane') { player.x = CONFIG.LANE_WIDTH; player.targetLane = 0; }
            if (mode === 'gap') supports = [new Ramp3D(scene, 0, 24)];
            player.update(.05, 56, { ramps: supports, trains: [train] });
            assert.equal(player.isOnRoof, false, `${mode} player was pulled onto the roof`);
            assert.ok(player.y < train.height - .35, `${mode} height jumped to the roof`);
            if (mode === 'gap') supports[0].destroy();
        }
    } finally { train.destroy(); ramp.destroy(); }
});
