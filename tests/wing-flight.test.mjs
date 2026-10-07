import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { World3D } from '../game/world3d.js';
import { ThemeObstacleKit } from '../game/themeObstacles3d.js';
import { TrackChallengeKit } from '../game/trackChallenges3d.js';
import { WingFlightRoute3D } from '../game/wingFlight3d.js';
import { WingSystem3D } from '../game/wings3d.js';
import { Coin3D, PropItem3D, Train3D, Ramp3D, HighBarrier3D } from '../game/obstacles3d.js';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { Player3D } = await import('../game/player3d.js');
const { GameEngine } = await import('../game/main.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true;

function makePlayer(realModel = false) {
    if (realModel) return new Player3D(new THREE.Scene());
    const player = Object.create(Player3D.prototype);
    player.character = { group: new THREE.Group(), update() {}, animateCrash() {} };
    player.reset(); return player;
}

function makeWorld(id = 'store', flightRandom = Math.random) {
    const world = Object.create(World3D.prototype);
    Object.assign(world, {
        scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(),
        dirLight: new THREE.DirectionalLight(), hemiLight: new THREE.HemisphereLight(),
        environment: { reset() {}, update() {}, dispose() {} },
        coinBatch: { clear() {} }, entityBatch: { clear() {}, dispose() {} },
        trains: [], ramps: [], barriers: [], coins: [], props: [], particles: [], features: [], challenges: [], renderEntities: [],
        mapId: id, featureState: null, challengeState: null, challengeRewards: 0,
        challengePrevious: { x: 0, y: 0, z: 0, isSliding: false, slideTimer: 0 },
    });
    world.obstacleKit = id === 'egypt' ? null : new ThemeObstacleKit(id);
    world.challengeKit = world.obstacleKit ? new TrackChallengeKit(world.scene, world.obstacleKit) : null;
    world.wingFlight = new WingFlightRoute3D(world, flightRandom);
    world.reset(); return world;
}

function disposeWorld(world) {
    world.clearEntities(); world.challengeKit?.dispose(); world.obstacleKit?.dispose();
}

function collisionEngine(player, world) {
    const engine = Object.create(GameEngine.prototype);
    Object.assign(engine, { player, world, coins: 0, previousPlayerZ: player.z });
    engine.handleHit = () => { throw new Error('flight collided with a floor hazard'); };
    return engine;
}

function visibleGeometryBottom(character) {
    character.group.updateMatrixWorld(true);
    character.bodyMesh.skeleton.update();
    let bottom = Infinity;
    const vertex = new THREE.Vector3();
    character.group.traverseVisible(mesh => {
        if (!mesh.isMesh) return;
        for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
            mesh.getVertexPosition(i, vertex).applyMatrix4(mesh.matrixWorld);
            bottom = Math.min(bottom, vertex.y);
        }
    });
    return bottom;
}

for (const speed of [26, 56, 65]) {
    test(`wing flight at ${speed}: real model flies belly down, retains lane controls, and lands safely`, () => {
        const player = makePlayer(true);
        try {
            player.props.shield = true;
            player.addProp('flight');
            let previousHeight = player.y, landingFrames = 0, ticks = 0, sawLanding = false;
            while (player.isFlying) {
                if (ticks === 25) player.moveLeft();
                if (ticks === 60) { player.moveRight(); player.moveRight(); }
                const oldVy = player.vy;
                player.jump(); player.slide();
                assert.equal(player.vy, oldVy, 'jump/slide changed flight velocity');
                assert.equal(player.isSliding, false);
                assert.equal(player.takeHit(), false);
                assert.equal(player.props.shield, true, 'flight consumed a shield');
                const descending = player.props.flight === 0;
                player.update(.05, speed, { ramps: [], trains: [] });
                assert.ok(Number.isFinite(player.y) && player.y >= 0 && player.y <= CONFIG.FLIGHT.HEIGHT + 1e-6);
                assert.ok(Math.abs(player.z - (ticks + 1) * speed * .05) < 1e-6);
                if (ticks === 45) assert.ok(Math.abs(player.x - CONFIG.LANE_WIDTH) < .01, 'left lane control did not work in flight');
                if (ticks === 85) assert.ok(Math.abs(player.x + CONFIG.LANE_WIDTH) < .01, 'right lane control did not work in flight');
                if (ticks > 20 && !descending) {
                    player.character.group.updateMatrixWorld(true);
                    const front = new THREE.Vector3(0, 0, 1).applyQuaternion(player.character.bodyGroup.getWorldQuaternion(new THREE.Quaternion()));
                    assert.ok(front.y < -.98, `the belly does not face the ground: ${front.y}`);
                }
                if (descending) {
                    sawLanding = true; landingFrames++;
                    assert.ok(player.y <= previousHeight + 1e-6, 'the descent moved upwards');
                    assert.ok(previousHeight - player.y <= CONFIG.FLIGHT.HEIGHT * .05 / CONFIG.FLIGHT.LANDING_DURATION + 1e-6, 'landing height snapped');
                    if (player.flightLandingTimer <= .25) assert.ok(visibleGeometryBottom(player.character) >= -.1, 'the rotated flight model entered the floor during landing');
                }
                previousHeight = player.y;
                assert.ok(++ticks <= 186, 'flight or landing did not end within its duration');
            }
            assert.ok(sawLanding && landingFrames >= 21 && landingFrames <= 23);
            assert.equal(player.y, 0);
            assert.equal(player.isGrounded, true);
            assert.equal(player.props.flight, 0);
            assert.equal(player.flightLandingTimer, 0);
            assert.ok(player.invincibleTimer > 1.3, 'landing grace is missing');
            assert.equal(player.takeHit(), false, 'landing instantly exposes the player to a collision');
            assert.ok(player.flightBlend < .05, 'the character landed while still lying horizontally');
            const grace = player.invincibleTimer;
            for (let step = 0; step < 5; step++) player.update(.05, speed, { ramps: [], trains: [] });
            assert.ok(player.invincibleTimer < grace - .2, 'landing grace is renewed after touchdown');
            assert.ok(player.flightBlend < .65, 'the flight pose did not begin returning upright');
            player.reset();
            assert.equal(player.isFlying, false);
            assert.equal(player.flightBlend, 0);
            assert.equal(player.invincibleTimer, 0);
        } finally { player.character.wings.dispose(); }
    });
}

test('wing appearance selection and flight flapping share the same finite resources', () => {
    const parent = new THREE.Group(), wings = new WingSystem3D(parent);
    try {
        const meshes = []; wings.group.traverse(node => { if (node.isMesh) meshes.push(node); });
        assert.ok(meshes.length >= 12);
        assert.equal(new Set(meshes.map(mesh => mesh.geometry)).size, 1, 'each feather has private geometry');
        const materialIds = meshes.map(mesh => mesh.material.uuid);
        wings.equip('none'); wings.update(.05, false);
        assert.equal(wings.group.visible, false);
        wings.update(.05, true);
        assert.equal(wings.group.visible, true, 'the flight pickup failed to reveal wings');
        const before = wings.wings.map(({ wing }) => wing.rotation.y);
        wings.update(.17, true);
        assert.notDeepEqual(wings.wings.map(({ wing }) => wing.rotation.y), before, 'flight wings are static');
        for (let i = 0; i < 20; i++) { wings.equip('cream'); wings.update(.05, false); wings.equip('none'); wings.update(.05, true); }
        assert.deepEqual(meshes.map(mesh => mesh.material.uuid), materialIds);
    } finally { wings.dispose(); }
    assert.equal(parent.children.length, 0);
});

test('flight keeps the safe drying deck and descends onto its actual support height', () => {
    for (const speed of [26, 56, 65]) {
        const world = makeWorld('laundry'), player = makePlayer(true);
        try {
            const support = world.challenges[0].support;
            assert.equal(support.safeSupport, true);
            player.z = support.startZ + .5;
            player.addProp('flight'); player.props.flight = .2; player.y = CONFIG.FLIGHT.HEIGHT;
            Object.assign(world.challengePrevious, { x: player.x, y: player.y, z: player.z, isSliding: false, slideTimer: 0 });
            let ticks = 0;
            while (player.isFlying) {
                player.update(.05, speed, { ramps: world.ramps, trains: world.trains });
                world.update(.05, speed, player);
                assert.ok(world.ramps.includes(support), 'flight removed a harmless support surface');
                assert.equal(support.mesh.parent, world.scene);
                assert.ok(++ticks < 32);
            }
            assert.equal(player.isGrounded, true);
            assert.ok(player.z <= support.endZ && player.z >= support.startZ);
            assert.ok(Math.abs(player.y - support.getHeightAtZ(player.z)) < 1e-5, `landed at ${player.y} through a deck at ${support.height}`);
            const bottom = visibleGeometryBottom(player.character);
            assert.ok(bottom >= support.getHeightAtZ(player.z) - .1, `the character mesh penetrates its landing platform: speed ${speed}, bottom ${bottom}, deck ${support.getHeightAtZ(player.z)}, blend ${player.flightBlend}`);
            assert.ok(player.invincibleTimer > 1.3);
        } finally { player.character.wings.dispose(); disposeWorld(world); }
    }
});

test('feather approaches and flight landings clear real hazards across all five maps', () => {
    for (const id of ['egypt', 'store', 'tea', 'pond', 'laundry']) {
        const world = makeWorld(id), player = makePlayer();
        try {
            const pickupZ = world.wingFlight.nextPickupZ;
            player.z = pickupZ - 90;
            world.wingFlight.update(player, 65);
            const feather = world.props.find(prop => prop.type === 'flight');
            assert.ok(feather, `${id}: no scheduled feather appeared`);
            assert.ok(world.challenges.every(challenge => feather.z < challenge.startZ || feather.z > challenge.endZ), 'the pickup occupies a challenge checkpoint stretch');
            const nearTrain = new Train3D(world.scene, 0, feather.z - 3, 0, world.obstacleKit);
            const nearRamp = new Ramp3D(world.scene, 1, feather.z - 5, world.obstacleKit);
            const nearBarrier = new HighBarrier3D(world.scene, -1, feather.z + 2, world.obstacleKit);
            const outside = new HighBarrier3D(world.scene, -1, feather.z + 30, world.obstacleKit);
            world.trains.push(nearTrain); world.ramps.push(nearRamp); world.barriers.push(nearBarrier, outside);
            world.wingFlight.update(player, 65);
            assert.equal(nearTrain.mesh.parent, null);
            assert.equal(nearRamp.mesh.parent, null);
            assert.equal(nearBarrier.mesh.parent, null);
            assert.equal(outside.mesh.parent, world.scene, 'pickup clearance removed a distant safe obstacle');
            player.addProp('flight'); player.y = CONFIG.FLIGHT.HEIGHT; player.props.flight = 1;
            const landingBarrier = new HighBarrier3D(world.scene, 0, player.z + 65, world.obstacleKit);
            world.barriers.push(landingBarrier); world.wingFlight.update(player, 65);
            assert.equal(landingBarrier.mesh.parent, null, 'the landing corridor contains a damage collider');
        } finally { disposeWorld(world); }
    }
});

test('sky routes provide all three lanes above the scenery and reset removes their entities', () => {
    for (const speed of [26, 56, 65]) {
        const world = makeWorld(), player = makePlayer();
        try {
            player.addProp('flight'); player.y = CONFIG.FLIGHT.HEIGHT;
            world.wingFlight.update(player, speed);
            const sky = world.coins.filter(coin => coin.airborne);
            assert.ok(sky.length >= 6);
            const rows = new Map();
            for (const coin of sky) {
                assert.ok(coin.mesh.position.y > 8, 'sky rewards are mixed into floor obstacles');
                if (!rows.has(coin.z)) rows.set(coin.z, []);
                rows.get(coin.z).push(coin.lane);
            }
            for (const lanes of rows.values()) assert.deepEqual(lanes.sort(), [-1, 0, 1]);
            world.wingFlight.update(player, speed);
            assert.equal(world.coins.filter(coin => coin.airborne).length, sky.length, 'stationary updates duplicate sky rewards');
            player.props.flight = 0; player.flightLandingTimer = 0;
            world.wingFlight.update(player, speed);
            assert.equal(world.coins.some(coin => coin.airborne), false);
            assert.ok(sky.every(coin => coin.mesh.parent === null));
            player.addProp('flight'); world.wingFlight.update(player, speed);
            const oldNodes = [...world.coins.map(coin => coin.mesh), ...world.props.map(prop => prop.mesh)];
            world.reset();
            assert.equal(world.wingFlight.active, false);
            assert.equal(world.coins.some(coin => coin.airborne), false);
            assert.ok(oldNodes.every(node => node.parent === null));
        } finally { disposeWorld(world); }
    }
});

test('a feather scheduled inside a challenge moves to its safe exit instead of interrupting the task', () => {
    for (const id of ['store', 'tea', 'pond', 'laundry']) {
        const world = makeWorld(id), player = makePlayer();
        try {
            const challenge = world.challenges[0];
            world.wingFlight.nextPickupZ = challenge.startZ + 10;
            player.z = challenge.startZ;
            world.wingFlight.update(player, 56);
            assert.equal(world.props.some(prop => prop.type === 'flight' && prop.z <= challenge.endZ + 25), false);
            player.z = challenge.endZ - 40;
            world.wingFlight.update(player, 56);
            const feather = world.props.find(prop => prop.type === 'flight');
            assert.ok(feather && feather.z >= challenge.endZ + 50);
            if (challenge.support) assert.ok(world.ramps.includes(challenge.support), 'rescheduling removed the challenge deck');
        } finally { disposeWorld(world); }
    }
});

test('all five maps keep opening runs feather-free and provide sparse, varying flight rewards over 10 km', () => {
    for (const id of ['egypt', 'store', 'tea', 'pond', 'laundry']) {
        const samples = [.02, .24, .98, .49, .76, .11, .62];
        let sample = 0;
        const world = makeWorld(id, () => samples[sample++ % samples.length]), player = makePlayer();
        const pickups = new Map();
        try {
            for (player.z = 0; player.z <= 10000; player.z += 20) {
                world.update(0, 65, player);
                for (const prop of world.props) {
                    if (prop.type !== 'flight') continue;
                    if (!pickups.has(prop.z)) {
                        assert.ok(world.challenges.every(segment => prop.z < segment.startZ - 20 || prop.z > segment.endZ + 25), `${id}: a rare feather interrupted a challenge`);
                        pickups.set(prop.z, prop);
                    }
                }
            }
            const positions = [...pickups.keys()].filter(z => z <= 10000).sort((a, b) => a - b);
            assert.ok(positions[0] >= 600, `${id}: flight appeared in the opening run`);
            assert.ok(positions.length >= 5 && positions.length <= 9, `${id}: ${positions.length} feathers in 10 km should be a sparse but recurring reward`);
            const gaps = positions.slice(1).map((z, index) => z - positions[index]);
            assert.ok(gaps.every(gap => gap >= 1100 && gap <= 1900), `${id}: the spacing is too short or flight has stopped appearing: ${gaps}`);
            assert.ok(new Set(gaps).size >= 3, `${id}: feather spacing is still fixed`);
            world.reset();
            assert.ok(world.wingFlight.nextPickupZ >= 600 && world.wingFlight.nextPickupZ <= 900);
            assert.equal(world.props.some(prop => prop.type === 'flight'), false, `${id}: retry kept a stale feather`);
        } finally { disposeWorld(world); }
    }
});

test('real collision collection catches high-speed sky coins without picking floor props', () => {
    const player = makePlayer(), scene = new THREE.Scene();
    const sky = new Coin3D(scene, 0, 1.1, CONFIG.FLIGHT.HEIGHT + .4);
    const wrongLane = new Coin3D(scene, 1, 1.1, CONFIG.FLIGHT.HEIGHT + .4);
    const floor = new Coin3D(scene, 0, 1.1, .9);
    const prop = new PropItem3D(scene, 0, 1.1, 'milk');
    player.addProp('flight'); player.y = CONFIG.FLIGHT.HEIGHT; player.z = 3.25;
    const world = { coins: [sky, wrongLane, floor], props: [prop], trains: [], barriers: [] };
    const engine = collisionEngine(player, world); engine.previousPlayerZ = 0;
    try {
        engine.checkCollisions();
        assert.equal(engine.coins, 1, 'a coin crossed between two 65 m/s frames was missed');
        assert.equal(sky.collected, true);
        assert.equal(wrongLane.collected, false);
        assert.equal(floor.collected, false);
        assert.equal(prop.collected, false);
        assert.equal(player.props.milk, 0);
        engine.checkCollisions();
        assert.equal(engine.coins, 1, 'the same sky coin was collected again');
    } finally { [sky, wrongLane, floor, prop].forEach(entity => entity.destroy()); }
});

test('a feather crossed between frames activates flight once and makes the pickup frame safe', () => {
    const player = makePlayer(), scene = new THREE.Scene();
    const feather = new PropItem3D(scene, 0, 1.1, 'flight');
    const train = new Train3D(scene, 0, 2, 0);
    player.z = 3.25;
    const world = { coins: [], props: [feather], trains: [train], barriers: [] };
    const engine = collisionEngine(player, world); engine.previousPlayerZ = 0;
    let activations = 0;
    const addProp = player.addProp.bind(player);
    player.addProp = type => { activations++; addProp(type); };
    try {
        engine.checkCollisions();
        assert.equal(activations, 1);
        assert.equal(player.props.flight, 8);
        assert.equal(feather.collected, true);
        assert.equal(feather.mesh.parent, null);
        assert.equal(player.isFlying, true);
        assert.equal(player.isGrounded, false);
        engine.checkCollisions();
        assert.equal(activations, 1);
    } finally { feather.destroy(); train.destroy(); }
});
