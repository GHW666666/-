import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { World3D } from '../game/world3d.js';
import { RoadVehicle3D } from '../game/vehicles3d.js';
import { Train3D, Ramp3D, RoofBarrier3D } from '../game/obstacles3d.js';
import { ThemeObstacleKit } from '../game/themeObstacles3d.js';
import { TrackChallengeKit } from '../game/trackChallenges3d.js';
import { WorldEntityBatch3D } from '../game/worldEntityBatch3d.js';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { Player3D } = await import('../game/player3d.js');
const { GameEngine } = await import('../game/main.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true;

const MAPS = ['egypt', 'store', 'tea', 'pond', 'laundry'];
const KINDS = ['hatchback', 'bus', 'truck'];
const LONG_LENGTH = 220;
const EPSILON = 1e-5;
// The stream continues across every test and every instance. Fixing Math.random
// to one value also fixes Three.js UUIDs and hides resource/batching failures.
let randomState = 0x239cd871;
function nextRandom() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
}
function generateChosenPattern(world, branch, z) {
    const originalRandom = Math.random;
    let first = true;
    Math.random = () => {
        if (first) { first = false; return branch; }
        return nextRandom();
    };
    try { return world.generatePattern(z); } finally { Math.random = originalRandom; }
}
function vehicle(scene, kind, mapId = 'egypt', lane = 0, z = 45, movingSpeed = 0) {
    return new RoadVehicle3D(scene, lane, z, { kind, mapId, movingSpeed,
        ...(kind === 'hatchback' ? {} : {
            width: CONFIG.WORLD.TRAIN_WIDTH, height: CONFIG.WORLD.RAMP_HEIGHT, length: LONG_LENGTH,
        }),
    });
}
function meshes(group) {
    const result = [];
    group.traverse(node => { if (node.isMesh) result.push(node); });
    return result;
}
function makePlayer(z = 0, y = 0) {
    const player = Object.create(Player3D.prototype);
    player.character = { group: new THREE.Group(), update() {}, animateCrash() {} };
    player.reset(); player.z = z; player.y = y;
    return player;
}
function makeWorld(mapId, challenges = false) {
    const world = Object.create(World3D.prototype);
    Object.assign(world, {
        scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(),
        dirLight: new THREE.DirectionalLight(), hemiLight: new THREE.HemisphereLight(),
        environment: { reset() {}, update() {}, dispose() {} },
        coinBatch: { clear() {} }, entityBatch: { clear() {}, dispose() {} },
        wingFlight: { reset() {}, update() {} },
        trains: [], ramps: [], barriers: [], coins: [], props: [], particles: [], features: [], challenges: [], renderEntities: [],
        mapId, patternIndex: 1, nextPatternZ: 45, featureState: null, challengeState: null, challengeRewards: 0,
        challengePrevious: { x: 0, y: 0, z: 0, isSliding: false, slideTimer: 0 },
    });
    world.obstacleKit = mapId === 'egypt' ? null : new ThemeObstacleKit(mapId);
    world.challengeKit = challenges && world.obstacleKit ? new TrackChallengeKit(world.scene, world.obstacleKit) : null;
    return world;
}
function disposeWorld(world) {
    world.clearEntities(); world.challengeKit?.dispose(); world.obstacleKit?.dispose();
}
function assertRoofBounds(barrier, car) {
    const bounds = new THREE.Box3().setFromObject(barrier.mesh);
    const centerX = car.mesh.position.x;
    assert.ok(bounds.min.x > centerX - car.roofWidth / 2 + .02, 'left roof-obstacle foot hangs outside the vehicle deck');
    assert.ok(bounds.max.x < centerX + car.roofWidth / 2 - .02, 'right roof-obstacle foot hangs outside the vehicle deck');
    assert.ok(bounds.min.z > car.z && bounds.max.z < car.z + car.length, 'roof obstacle is beyond a vehicle end');
    assert.equal(barrier.deckWidth, car.roofWidth);
    assert.equal(barrier.baseY, car.height + car.roofTopOffset);
}

test('all three road vehicles have recognisable tires, glass, lamps, and map-independent driving dimensions', () => {
    assert.equal(typeof document, 'undefined');
    for (const mapId of MAPS) for (const kind of KINDS) {
        const scene = new THREE.Scene(), car = vehicle(scene, kind, mapId, -1);
        try {
            assert.equal(car.kind, kind); assert.equal(car.lane, -1); assert.equal(car.z, 45);
            assert.equal(car.mesh.position.x, CONFIG.LANE_WIDTH); assert.equal(car.mesh.position.z, car.z);
            assert.equal(car.mesh.parent, scene); assert.equal(car.speed, 0);
            assert.equal(car.isRideable, kind !== 'hatchback');
            if (kind === 'hatchback') {
                assert.equal(car.length, 6); assert.equal(car.height, 1.4);
            } else {
                assert.equal(car.length, LONG_LENGTH); assert.equal(car.height, CONFIG.WORLD.RAMP_HEIGHT);
                assert.equal(car.roofWidth, car.width); assert.equal(car.roofTopOffset, .1);
            }
            assert.ok(car.width <= CONFIG.LANE_WIDTH, 'vehicle spans more than one lane');
            const parts = meshes(car.mesh);
            const tires = parts.filter(part => /tire|tyre/i.test(part.name));
            const windows = parts.filter(part => /window$|windshield$/i.test(part.name));
            const headLights = parts.filter(part => /head.?light/i.test(part.name));
            const tailLights = parts.filter(part => /tail.?light/i.test(part.name));
            assert.ok(tires.length >= 4, `${mapId} ${kind} has no complete set of road wheels`);
            assert.ok(windows.length >= 3, `${mapId} ${kind} lacks its front and side windows`);
            assert.ok(headLights.length >= 2 && tailLights.length >= 2, `${mapId} ${kind} lacks front or rear lamps`);
            for (const tire of tires) {
                assert.ok(tire.geometry.attributes.position.count > 16, 'a tire is a plain box');
                const bounds = new THREE.Box3().setFromObject(tire);
                assert.ok(bounds.min.y < car.height * .4, 'a road wheel floats at the roof');
            }
            for (const glass of windows) {
                const material = glass.material;
                assert.ok(material.isMeshStandardMaterial || material.isMeshPhysicalMaterial, 'glass has no lit material');
                assert.ok(material.roughness <= .4, 'windows use the same rough finish as a cargo box');
            }
            for (const part of parts) {
                assert.ok([...part.position.toArray(), ...part.scale.toArray()].every(Number.isFinite));
                assert.ok(part.geometry.attributes.position.count > 0);
            }
            const bounds = new THREE.Box3().setFromObject(car.mesh);
            assert.ok(!bounds.isEmpty());
            assert.ok(bounds.max.z - bounds.min.z >= car.length * .9, 'model does not fill its collision length');
            assert.ok(bounds.max.x - bounds.min.x < CONFIG.LANE_WIDTH + .02, 'vehicle accessories intrude into a neighboring lane');
        } finally { car.destroy(); }
        assert.equal(scene.children.length, 0);
    }
});

test('repeated vehicle instances share assets and removing one does not dispose its neighbors', () => {
    for (const mapId of MAPS) for (const kind of KINDS) {
        const scene = new THREE.Scene(), a = vehicle(scene, kind, mapId), b = vehicle(scene, kind, mapId, 1, 400);
        const first = meshes(a.mesh), second = meshes(b.mesh);
        const resources = new Set(first.flatMap(mesh => [mesh.geometry, ...[mesh.material].flat()]));
        let disposed = 0;
        for (const resource of resources) resource.addEventListener('dispose', () => disposed++);
        try {
            assert.equal(first.length, second.length);
            for (let i = 0; i < first.length; i++) {
                assert.equal(first[i].geometry, second[i].geometry, `${mapId} ${kind}: instance allocated private geometry`);
                assert.equal(first[i].material, second[i].material, `${mapId} ${kind}: instance allocated private material`);
            }
            a.destroy(); assert.equal(a.mesh.parent, null); assert.equal(b.mesh.parent, scene);
            assert.equal(disposed, 0);
            const c = vehicle(scene, kind, mapId, -1, 750);
            try {
                for (const mesh of meshes(c.mesh)) {
                    assert.ok(resources.has(mesh.geometry)); assert.ok(resources.has(mesh.material));
                }
            } finally { c.destroy(); }
        } finally { a.destroy(); b.destroy(); }
        assert.equal(disposed, 0, 'vehicle cleanup disposed assets still cached for the next run');
        assert.equal(scene.children.length, 0);
    }
});

for (const mapId of MAPS) {
    test(`${mapId}: ramp and incoming waves mix road vehicles with the original platforms and all four roof action pairs`, () => {
        const world = makeWorld(mapId);
        const rampKinds = new Set(), incomingKinds = new Set(), pairs = new Set();
        try {
            for (const branch of [.1, .4]) {
                for (let attempt = 0; attempt < 100; attempt++) {
                    world.patternIndex = 1;
                    const z = 45 + attempt * 300;
                    const reservedLength = generateChosenPattern(world, branch, z);
                    assert.equal(world.trains.length, 1);
                    const car = world.trains[0], bars = world.barriers.filter(barrier => barrier.train === car);
                    const kind = car instanceof RoadVehicle3D ? car.kind : 'platform';
                    (branch === .1 ? rampKinds : incomingKinds).add(kind);
                    if (branch === .1) {
                        assert.equal(world.ramps.length, 1);
                        assert.equal(car.z, world.ramps[0].endZ);
                        assert.equal(car.height, world.ramps[0].height);
                        if (car instanceof RoadVehicle3D) {
                            assert.ok(['bus', 'truck'].includes(kind)); assert.equal(car.isRideable, true);
                            assert.equal(car.length, LONG_LENGTH); assert.equal(car.speed, 0);
                            assert.equal(reservedLength, CONFIG.WORLD.RAMP_LENGTH + LONG_LENGTH + 35);
                            assert.equal(bars.length, 2);
                            assert.deepEqual(bars.map(barrier => barrier.offsetZ), [40, 140]);
                            pairs.add(bars.map(barrier => barrier.type[0]).join(''));
                            for (const barrier of bars) assertRoofBounds(barrier, car);
                        } else {
                            assert.ok(car instanceof Train3D); assert.equal(bars.length, 1); assert.equal(bars[0].offsetZ, 10);
                        }
                    } else {
                        assert.equal(world.ramps.length, 0);
                        if (car instanceof RoadVehicle3D) {
                            assert.equal(kind, 'hatchback'); assert.equal(car.isRideable, false);
                            assert.equal(car.height, 1.4); assert.equal(car.length, 6); assert.equal(bars.length, 0);
                        } else {
                            assert.ok(car instanceof Train3D); assert.equal(bars.length, 1); assert.equal(bars[0].offsetZ, 10);
                        }
                        // Keep themed vehicles still so they cannot enter a later reserved challenge.
                        if (mapId !== 'egypt') assert.equal(car.speed, 0);
                    }
                    world.clearEntities();
                    const complete = branch === .1 ? rampKinds.size === 3 && pairs.size === 4 : incomingKinds.size === 2;
                    if (complete) break;
                }
            }
            assert.deepEqual([...rampKinds].sort(), ['bus', 'platform', 'truck']);
            assert.deepEqual([...incomingKinds].sort(), ['hatchback', 'platform']);
            assert.deepEqual([...pairs].sort(), ['jj', 'js', 'sj', 'ss']);
        } finally { disposeWorld(world); }
        assert.equal(world.scene.children.length, 0);
    });

    test(`${mapId}: vehicle roof barriers keep their feet on the deck and support explicit offsets`, () => {
        const scene = new THREE.Scene(), kit = mapId === 'egypt' ? null : new ThemeObstacleKit(mapId);
        for (const kind of ['bus', 'truck']) {
            const car = vehicle(scene, kind, mapId, 1);
            const bars = [new RoofBarrier3D(scene, car, kit, 'jump', 40), new RoofBarrier3D(scene, car, kit, 'slide', 140),
                new RoofBarrier3D(scene, car, kit, 'jump')];
            try {
                assert.deepEqual(bars.map(barrier => barrier.z), [car.z + 40, car.z + 140, car.z + 10]);
                for (const barrier of bars) {
                    assert.equal(barrier.train, car); assert.equal(barrier.lane, car.lane);
                    assert.equal(barrier.mesh.position.y, car.height + .1); assertRoofBounds(barrier, car);
                }
            } finally { bars.forEach(barrier => barrier.destroy()); car.destroy(); }
        }
        kit?.dispose(); assert.equal(scene.children.length, 0);
    });
}

test('long vehicle reservations keep the following random waves and challenges beyond the rear bumper', () => {
    for (const mapId of MAPS) {
        const world = makeWorld(mapId, true), generated = [];
        const generate = world.generatePattern.bind(world);
        world.generatePattern = function (z) {
            const trainsBefore = this.trains.length, challengesBefore = this.challenges.length;
            const reserved = generate(z);
            generated.push({ z, reserved, cars: this.trains.slice(trainsBefore), challenges: this.challenges.slice(challengesBefore) });
            return reserved;
        };
        const originalRandom = Math.random;
        Math.random = nextRandom;
        try {
            world.reset();
            const player = makePlayer();
            for (let z = 0; z < 6000; z += 120) {
                player.z = z; world.update(0, 26, player);
            }
            const longWaves = generated.filter(wave => wave.cars.some(car => car instanceof RoadVehicle3D && car.isRideable));
            assert.ok(longWaves.length > 0, `${mapId}: scheduler never generated a long roof vehicle`);
            for (const wave of longWaves) {
                const car = wave.cars.find(car => car instanceof RoadVehicle3D && car.isRideable);
                assert.equal(wave.reserved, CONFIG.WORLD.RAMP_LENGTH + LONG_LENGTH + 35);
                const next = generated[generated.indexOf(wave) + 1];
                if (next) assert.ok(next.z >= car.z + car.length + 35 - EPSILON, 'the next wave starts inside a long vehicle');
                for (const other of generated) for (const challenge of other.challenges) {
                    assert.ok(car.z + car.length < challenge.startZ || car.z > challenge.endZ,
                        `${mapId}: vehicle overlaps a reserved map challenge`);
                }
            }
        } finally { Math.random = originalRandom; disposeWorld(world); }
        assert.equal(world.scene.children.length, 0);
    }
});

test('Egypt incoming trains stay beyond an active long roof, then regain movement after that roof is cleaned up', () => {
    const world = makeWorld('egypt');
    try {
        let roofVehicle, reservedLength;
        for (let attempt = 0; attempt < 80; attempt++) {
            world.patternIndex = 1;
            reservedLength = generateChosenPattern(world, .1, 45);
            const candidate = world.trains.at(-1);
            if (candidate instanceof RoadVehicle3D && candidate.isRideable) { roofVehicle = candidate; break; }
            world.clearEntities();
        }
        assert.ok(roofVehicle, 'the ramp branch never generated a long road vehicle');
        const roofEndZ = roofVehicle.z + roofVehicle.length;
        const nextWaveZ = 45 + reservedLength;
        let followingTrain;
        for (let attempt = 0; attempt < 80; attempt++) {
            world.patternIndex = 1;
            generateChosenPattern(world, .4, nextWaveZ);
            const candidate = world.trains.at(-1);
            if (candidate instanceof Train3D && candidate.lane === roofVehicle.lane) { followingTrain = candidate; break; }
        }
        assert.ok(followingTrain, 'the incoming branch never generated a legacy train in the roof lane');
        assert.equal(followingTrain.speed, 0, 'an incoming train can drive backward into the reserved roof');
        assert.equal(followingTrain.z, roofEndZ + 35);
        const followingBarrier = world.barriers.find(barrier => barrier.train === followingTrain);
        assert.ok(followingBarrier);
        // Advance real player and world time through the whole roof. An incoming
        // train at 12 m/s would cross the 35 m gap in under three seconds.
        world.nextPatternZ = Infinity;
        const player = makePlayer(roofVehicle.z + 2, roofVehicle.height);
        player.x = -roofVehicle.lane * CONFIG.LANE_WIDTH; player.targetLane = roofVehicle.lane;
        let elapsed = 0;
        while (player.z <= roofEndZ) {
            player.update(.05, 26, { ramps: world.ramps, trains: world.trains });
            world.update(.05, 26, player); elapsed += .05;
            assert.ok(world.trains.includes(roofVehicle), 'the still-active long roof was removed too early');
            assert.ok(followingTrain.z >= roofEndZ + 35 - EPSILON, 'elapsed time carried the next train into the roof segment');
            assert.equal(followingTrain.mesh.position.z, followingTrain.z);
            assert.equal(followingBarrier.z, followingTrain.z + 10);
        }
        assert.ok(elapsed > 8, 'the test did not advance enough time for a moving train to enter the roof');
        world.cleanupBehind(roofEndZ + 1);
        assert.equal(roofVehicle.mesh.parent, null);
        assert.ok(!world.trains.some(car => car instanceof RoadVehicle3D && car.isRideable));
        let resumedTrain;
        for (let attempt = 0; attempt < 80; attempt++) {
            world.patternIndex = 1;
            generateChosenPattern(world, .4, nextWaveZ + 70);
            const candidate = world.trains.at(-1);
            if (candidate instanceof Train3D) { resumedTrain = candidate; break; }
        }
        assert.ok(resumedTrain, 'the incoming branch never generated a train after roof cleanup');
        assert.equal(resumedTrain.speed, 12, 'ordinary Egypt trains stayed frozen after the long roof was removed');
        const beforeZ = resumedTrain.z;
        world.update(.5, 26, player);
        assert.equal(resumedTrain.z, beforeZ - 6); assert.equal(resumedTrain.mesh.position.z, resumedTrain.z);
    } finally { disposeWorld(world); }
    assert.equal(world.scene.children.length, 0);
});

test('bus and truck decks carry fast ramp exits while hatchbacks never become support surfaces', () => {
    const scene = new THREE.Scene();
    for (const kind of ['bus', 'truck']) {
        const ramp = new Ramp3D(scene, 0, 30), car = vehicle(scene, kind, 'egypt', 0, ramp.endZ);
        try {
            for (const speed of [26, 56, 65]) for (const slide of [false, true]) {
                const player = makePlayer(ramp.endZ - 5, ramp.getHeightAtZ(ramp.endZ - 5));
                if (slide) player.slide();
                for (let frame = 0; frame < 5; frame++) player.update(.05, speed, { ramps: [ramp], trains: [car] });
                assert.equal(player.isOnRoof, true); assert.equal(player.isGrounded, true);
                assert.equal(player.y, car.height); assert.equal(player.isSliding, slide);
            }
        } finally { ramp.destroy(); car.destroy(); }
    }
    const car = vehicle(scene, 'hatchback', 'egypt', 0, 30);
    try {
        const player = makePlayer(car.z + 2, car.height + .1);
        player.isGrounded = false; player.vy = -2;
        for (let frame = 0; frame < 20; frame++) {
            player.update(.05, 0, { ramps: [], trains: [car] });
            assert.equal(player.isOnRoof, false, 'a low car snapped a jumping player onto its roof');
        }
        assert.equal(player.y, 0); assert.equal(player.isGrounded, true);
        const engine = Object.create(GameEngine.prototype);
        Object.assign(engine, { player, world: { trains: [car], barriers: [], coins: [], props: [] },
            previousPlayerZ: player.z, hits: 0 });
        engine.handleHit = () => engine.hits++;
        engine.checkCollisions(); assert.equal(engine.hits, 1, 'a hatchback lost its ground damage collider');
        player.y = car.height + .1; engine.checkCollisions();
        assert.equal(engine.hits, 1, 'jumping above the low vehicle still causes a hit');
    } finally { car.destroy(); }
    assert.equal(scene.children.length, 0);
});

test('all two-obstacle action pairs clear long vehicle roofs at every speed and finish before the rear edge', () => {
    for (const mapId of MAPS) {
        const scene = new THREE.Scene(), kit = mapId === 'egypt' ? null : new ThemeObstacleKit(mapId);
        for (const kind of ['bus', 'truck']) {
            const car = vehicle(scene, kind, mapId, 0, 30);
            for (const pair of [['jump', 'jump'], ['jump', 'slide'], ['slide', 'jump'], ['slide', 'slide']]) {
                const bars = pair.map((action, index) => new RoofBarrier3D(scene, car, kit, action, [40, 140][index]));
                try {
                    for (const speed of [26, 56, 65]) for (const dt of [1 / 60, .05]) for (const phase of [0, .95]) for (const shoe of [false, true]) {
                        const label = `${mapId} ${kind} ${pair.join('/')} speed=${speed} dt=${dt} phase=${phase} shoe=${shoe}`;
                        const player = makePlayer(car.z + phase * speed * dt, car.height);
                        if (shoe) player.props.shoe = 20;
                        const completed = [];
                        player.onActionCompleted = action => completed.push({ action, z: player.z, y: player.y });
                        let actionIndex = 0;
                        while (player.z <= car.z + car.length + 1) {
                            if (actionIndex < pair.length && player.z >= bars[actionIndex].z - speed * (pair[actionIndex] === 'jump' ? .4 : .25)) {
                                assert.equal(player.isGrounded, true, `${label}: the preceding action has not landed`);
                                player[pair[actionIndex]](); actionIndex++;
                            }
                            const previous = { x: player.x, y: player.y, z: player.z };
                            player.update(dt, speed, { ramps: [], trains: [car] });
                            for (const barrier of bars) {
                                barrier.update(); assert.equal(barrier.collidesWith(player, previous), false, `${label}: correct action hit the roof obstacle`);
                            }
                        }
                        assert.equal(actionIndex, 2); assert.deepEqual(completed.map(event => event.action), pair, label);
                        assert.ok(completed.every(event => event.z < car.z + car.length && event.y === car.height), `${label}: an action finishes after leaving the roof`);
                    }
                } finally { bars.forEach(barrier => barrier.destroy()); }
            }
            car.destroy();
        }
        kit?.dispose(); assert.equal(scene.children.length, 0);
    }
});

test('a normal jump clears the short hatchback at every speed while standing or sliding into it causes a hit', () => {
    for (const speed of [26, 56, 65]) for (const dt of [1 / 60, .05]) for (const movingSpeed of [0, 12]) {
        for (const action of ['jump', 'slide', 'none']) {
            const scene = new THREE.Scene(), car = vehicle(scene, 'hatchback', 'egypt', 0, 60, movingSpeed);
            const player = makePlayer(car.z - speed * .4);
            const engine = Object.create(GameEngine.prototype);
            Object.assign(engine, { player, world: { trains: [car], barriers: [], coins: [], props: [] }, hits: 0 });
            engine.handleHit = () => engine.hits++;
            if (action !== 'none') player[action]();
            try {
                let frames = 0;
                while (player.z <= car.z + car.length + 1) {
                    engine.previousPlayerX = player.x; engine.previousPlayerY = player.y; engine.previousPlayerZ = player.z;
                    car.update(dt); player.update(dt, speed, { ramps: [], trains: [car] }); engine.checkCollisions();
                    assert.equal(player.isOnRoof, false, 'jumping over a short car enabled roof support');
                    assert.ok(++frames < 200);
                }
                const label = `${action}: speed=${speed}, dt=${dt}, movingSpeed=${movingSpeed}`;
                if (action === 'jump') assert.equal(engine.hits, 0, label);
                else assert.ok(engine.hits > 0, label);
            } finally { car.destroy(); }
            assert.equal(scene.children.length, 0);
        }
    }
});

test('moving vehicle roof hazards sweep skipped frames and keep both offsets relative to their owner', () => {
    const scene = new THREE.Scene(), car = vehicle(scene, 'bus', 'egypt', 1, 70, 12);
    const bars = [new RoofBarrier3D(scene, car, null, 'jump', 40), new RoofBarrier3D(scene, car, null, 'slide', 140)];
    try {
        const originalZ = bars.map(barrier => barrier.z);
        car.update(.5); bars.forEach(barrier => barrier.update());
        assert.equal(car.z, 64); assert.equal(car.mesh.position.z, car.z);
        for (let index = 0; index < bars.length; index++) {
            const barrier = bars[index], player = { x: -CONFIG.LANE_WIDTH, y: car.height, z: barrier.z + 3, isSliding: false };
            assert.equal(barrier.previousZ, originalZ[index]); assert.equal(barrier.z, originalZ[index] - 6);
            assert.equal(barrier.mesh.position.z, barrier.z); assert.equal(barrier.train, car);
            assert.equal(barrier.collidesWith(player, { ...player, z: barrier.z - 9 }), true, 'a fast frame jumped through a moving roof hazard');
            assert.equal(barrier.collidesWith({ ...player, x: 0, z: barrier.z }), false, 'neighbor lane collided with a vehicle roof hazard');
            assert.equal(barrier.collidesWith({ ...player, y: 0, z: barrier.z }), false, 'ground player collided with a roof hazard');
            if (barrier.type === 'slide') assert.equal(barrier.collidesWith({ ...player, isSliding: true, z: barrier.z }), false);
        }
    } finally { bars.forEach(barrier => barrier.destroy()); car.destroy(); }
    assert.equal(scene.children.length, 0);
});

test('vehicle instances follow movement and transformed scenes without stale batch sources', () => {
    const scene = new THREE.Scene(); scene.position.set(4, 2, -18); scene.rotation.y = .2;
    const batch = new WorldEntityBatch3D(scene);
    const cars = [vehicle(scene, 'bus', 'tea', -1, 45, 8), vehicle(scene, 'bus', 'tea', 1, 330, 4)];
    const bars = cars.map(car => new RoofBarrier3D(scene, car, null, 'slide', 140));
    const entities = [...cars, ...bars], inverse = new THREE.Matrix4(), expected = new THREE.Matrix4(), actual = new THREE.Matrix4();
    const destroyedSources = new Set(meshes(cars[0].mesh));
    const assertMatrices = () => {
        scene.updateWorldMatrix(true, true); inverse.copy(scene.matrixWorld).invert();
        for (const record of batch.pool.values()) {
            assert.equal(record.mesh.count, record.sources.length);
            record.sources.forEach((source, index) => {
                expected.multiplyMatrices(inverse, source.matrixWorld); record.mesh.getMatrixAt(index, actual);
                for (let element = 0; element < 16; element++) {
                    // Instance matrices use Float32 storage, including the hundreds
                    // of metres occupied by these vehicle bodies and window spans.
                    const tolerance = EPSILON + Math.abs(expected.elements[element]) * 1e-7;
                    assert.ok(Math.abs(expected.elements[element] - actual.elements[element]) < tolerance,
                        `instance matrix differs from the vehicle source at element ${element}`);
                }
            });
        }
    };
    try {
        batch.sync(entities); assertMatrices();
        const nodes = new Set([...batch.pool.values()].map(record => record.mesh));
        cars.forEach(car => car.update(.375)); bars.forEach(barrier => barrier.update());
        batch.sync(entities); assertMatrices();
        assert.deepEqual(new Set([...batch.pool.values()].map(record => record.mesh)), nodes, 'movement allocated new render buffers');
        cars[0].destroy(); bars[0].destroy(); batch.sync(entities); assertMatrices();
        assert.ok([...batch.pool.values()].every(record => record.sources.every(source => !destroyedSources.has(source))), 'destroyed vehicle remains in the render batch');
        batch.clear(); assert.ok([...batch.pool.values()].every(record => record.mesh.count === 0 && record.sources.length === 0));
    } finally { entities.forEach(entity => entity.destroy()); batch.dispose(); }
    assert.equal(batch.pool.size, 0); assert.equal(scene.children.length, 0);
});

test('vehicles and their roof obstacles use the existing train lifecycle during cleanup and reset', () => {
    const world = makeWorld('egypt'), bus = vehicle(world.scene, 'bus'), hatchback = vehicle(world.scene, 'hatchback', 'egypt', 1, 65);
    const bars = [new RoofBarrier3D(world.scene, bus, null, 'jump', 40), new RoofBarrier3D(world.scene, bus, null, 'slide', 140)];
    world.trains.push(bus, hatchback); world.barriers.push(...bars);
    try {
        world.cleanupBehind(bus.z + 100);
        assert.deepEqual(world.trains, [bus]); assert.deepEqual(world.barriers, [bars[1]]);
        assert.equal(bus.mesh.parent, world.scene); assert.equal(hatchback.mesh.parent, null); assert.equal(bars[0].mesh.parent, null);
        world.cleanupBehind(bus.z + bus.length + 1);
        assert.equal(world.trains.length, 0); assert.equal(world.barriers.length, 0); assert.equal(world.scene.children.length, 0);
        const truck = vehicle(world.scene, 'truck'), barrier = new RoofBarrier3D(world.scene, truck, null, 'slide', 140);
        world.trains.push(truck); world.barriers.push(barrier);
        world.reset(); assert.equal(truck.mesh.parent, null); assert.equal(barrier.mesh.parent, null);
        assert.ok(!world.trains.includes(truck)); assert.ok(!world.barriers.includes(barrier));
        world.clearEntities(); assert.equal(world.scene.children.length, 0);
    } finally { disposeWorld(world); }
});
