import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { MAP_CONFIGS } from '../game/maps.js';
import { World3D } from '../game/world3d.js';
import { ThemeObstacleKit } from '../game/themeObstacles3d.js';
import { TrackChallengeKit } from '../game/trackChallenges3d.js';
import { WingFlightRoute3D } from '../game/wingFlight3d.js';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const { Player3D } = await import('../game/player3d.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true;

const THEMES = ['store', 'tea', 'pond', 'laundry'];
const pose = player => ({ x: player.x, y: player.y, z: player.z, isSliding: player.isSliding, slideTimer: player.slideTimer });

function makePlayer(z = 0) {
    const player = Object.create(Player3D.prototype);
    player.character = { group: new THREE.Group(), update() {}, setLobbyMode() {}, setFlightMode() {}, animateCrash() {} };
    player.reset(); player.z = z;
    return player;
}

function makeWorld(id) {
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
    world.scene.fog = new THREE.Fog(0xffffff, 85, 180);
    world.obstacleKit = new ThemeObstacleKit(id);
    world.challengeKit = new TrackChallengeKit(world.scene, world.obstacleKit);
    world.wingFlight = new WingFlightRoute3D(world);
    world.reset();
    return world;
}

function disposeWorld(world) {
    world.clearEntities(); world.challengeKit?.dispose(); world.obstacleKit?.dispose(); world.environment.dispose();
}

function control(player, challenge, speed, skipIndex = -1) {
    const next = challenge.targets.find(target => !target.processed);
    if (!next) return;
    if (challenge.type === 'pond') player.targetLane = next.index === skipIndex ? (next.lane === 0 ? 1 : 0) : next.lane;
}

function runChallenge(world, player, speed, dt, controls = control) {
    const challenge = world.challenges[0];
    let reward = 0, ticks = 0;
    Object.assign(world.challengePrevious, pose(player));
    while (challenge.targets.some(target => !target.processed)) {
        controls(player, challenge, speed);
        player.update(dt, speed, { ramps: world.ramps, trains: world.trains });
        world.update(dt, speed, player);
        reward += world.consumeChallengeRewards();
        assert.equal(world.consumeChallengeRewards(), 0, 'a reward was available twice');
        assert.ok(++ticks < 3000, 'challenge never finished');
    }
    return { challenge, reward };
}

function cross(world, player, target, options = {}) {
    Object.assign(player, { x: -target.lane * CONFIG.LANE_WIDTH, y: target.y ? target.y - .8 : 0,
        z: target.z + .2, isSliding: false, slideTimer: 0, isGrounded: true, ...options });
    Object.assign(world.challengePrevious, pose(player), { z: target.z - 2 });
    world.updateChallenges(.05, 56, player);
    return world.consumeChallengeRewards();
}

for (const id of THEMES) {
    test(`${id}: real player physics can complete the three targets at normal, maximum, and rush speed`, () => {
        const world = makeWorld(id);
        try {
            for (const speed of [26, 56, 65]) for (const dt of [1 / 60, .05]) for (const phase of [0, .49, .95]) {
                world.reset();
                const player = makePlayer(phase * speed * dt);
                const { challenge, reward } = runChallenge(world, player, speed, dt);
                assert.equal(reward, 18, `${id}, speed=${speed}, dt=${dt}, phase=${phase}: available rewards ${reward}`);
                assert.equal(challenge.state.completed, 3);
                assert.equal(challenge.state.combo, 3);
                assert.equal(challenge.state.remaining, 0);
                assert.ok(challenge.targets.every(target => target.hit));
                if (id === 'tea' || id === 'laundry') assert.equal(challenge.launched, true, 'the launch pad was skipped by a frame boundary');
                const oldCompleted = challenge.state.completed;
                for (let repeat = 0; repeat < 4; repeat++) world.updateChallenges(.05, speed, player);
                assert.equal(world.consumeChallengeRewards(), 0, 'remaining on a checkpoint repeats its reward');
                assert.equal(challenge.state.completed, oldCompleted);
            }
        } finally { disposeWorld(world); }
    });

    test(`${id}: wrong lane or height fail, interrupting the combo`, () => {
        const world = makeWorld(id), player = makePlayer();
        try {
            const challenge = world.challenges[0];
            // Deliberately bypass the launch; inspect checkpoint behavior without an automatic change of height.
            challenge.launchAttempted = true;
            assert.equal(cross(world, player, challenge.targets[0]), 2);
            assert.equal(challenge.state.combo, 1);
            assert.equal(cross(world, player, challenge.targets[1], { x: -challenge.targets[1].lane * CONFIG.LANE_WIDTH + 2 }), 0);
            assert.equal(challenge.state.combo, 0, 'a miss did not break the consecutive streak');
            assert.equal(cross(world, player, challenge.targets[2]), 2);
            assert.equal(challenge.state.combo, 1);
            assert.equal(challenge.state.completed, 2);
            assert.equal(challenge.state.reward, 4, 'a partial route was given the completion bonus');
            world.reset();
            const other = world.challenges[0]; other.launchAttempted = true;
            const failure = { y: 6 };
            assert.equal(cross(world, player, other.targets[0], failure), 0);
            assert.equal(other.targets[0].hit, false);
            assert.equal(other.targets[0].processed, true, 'failed targets keep accepting later retries');
            if (id === 'store') {
                assert.equal(cross(world, player, other.targets[1], { isSliding: true, slideTimer: .5, y: 2 }), 0, 'an airborne slide passed a floor scan gate');
            }
        } finally { disposeWorld(world); }
    });

    test(`${id}: flying skips ground challenges and does not trigger a launch or receive rewards`, () => {
        const world = makeWorld(id), player = makePlayer();
        try {
            const challenge = world.challenges[0]; player.props.flight = 5;
            player.y = 5.6; player.vy = 0; player.isGrounded = false;
            player.z = challenge.launchZ + .2;
            Object.assign(world.challengePrevious, pose(player), { z: challenge.launchZ - 2 });
            world.updateChallenges(.05, 65, player);
            assert.equal(challenge.launched, false, 'a floor launch pad changed flight mode');
            assert.equal(player.vy, 0);
            for (const target of challenge.targets) {
                player.z = target.z + .2; world.updateChallenges(.05, 65, player);
            }
            assert.equal(world.consumeChallengeRewards(), 0);
            assert.equal(challenge.state.completed, 0);
            assert.equal(challenge.state.remaining, 0);
            assert.equal(challenge.state.active, false);
            assert.equal(world.challengeState, null);
            player.props.flight = 0; world.updateChallenges(.05, 56, player);
            assert.equal(world.consumeChallengeRewards(), 0, 'landing retroactively collects a skipped target');
        } finally { disposeWorld(world); }
    });
}

test('a swept crossing judges the actual horizontal position at the checkpoint', () => {
    const world = makeWorld('pond'), player = makePlayer();
    try {
        const target = world.challenges[0].targets[0];
        const targetX = -target.lane * CONFIG.LANE_WIDTH;
        Object.assign(world.challengePrevious, { x: targetX - 2, y: 0, z: target.z - .1, isSliding: false, slideTimer: 0 });
        Object.assign(player, { x: targetX, y: 0, z: target.z + 3.15, targetLane: target.lane });
        world.updateChallenges(.05, 65, player);
        assert.equal(world.consumeChallengeRewards(), 0, 'finishing a lane change after the checkpoint earned a reward');
        assert.equal(target.hit, false);
    } finally { disposeWorld(world); }
});

test('store order uses familiar gold pickups, collects upright once, and restores pooled visuals', () => {
    const world = makeWorld('store'), player = makePlayer();
    try {
        const challenge = world.challenges[0];
        const goldGeometry = challenge.targets[0].coin.mesh.children[0].geometry;
        for (const target of challenge.targets) {
            assert.deepEqual(target.visual.children, [target.coin.mesh], 'a scanner beam, post or arrow remains in the reward target');
            assert.equal(target.coin.mesh.children[0].geometry, goldGeometry, 'order pickups allocate separate coin geometry');
            assert.equal(cross(world, player, target), target.index === 2 ? 14 : 2);
            assert.equal(player.isSliding, false, 'a coin pickup still requires sliding');
            assert.equal(target.coin.collected, true);
            assert.equal(target.visual.scale.x, 0, 'a collected reward remains visible');
            assert.equal(world.consumeChallengeRewards(), 0, 'a collected reward paid twice');
        }
        world.reset();
        assert.equal(world.challenges[0], challenge, 'the order segment stopped reusing its visual pool');
        for (const target of challenge.targets) {
            assert.equal(target.coin.collected, false);
            assert.equal(target.visual.scale.x, 1, 'a new run starts with hidden order coins');
            assert.equal(target.coin.mesh.children[0].geometry, goldGeometry);
        }
    } finally { disposeWorld(world); }
});

test('laundry can collect its socks along the safe ramp when the launch pad is bypassed', () => {
    const world = makeWorld('laundry'), player = makePlayer();
    try {
        const challenge = world.challenges[0]; challenge.launchAttempted = true;
        const { reward } = runChallenge(world, player, 65, .05);
        assert.equal(reward, 18);
        assert.equal(challenge.launched, false);
        assert.equal(player.isOnRoof, true);
        assert.equal(player.y, CONFIG.WORLD.RAMP_HEIGHT);
        assert.ok(world.ramps.includes(challenge.support), 'the deck is missing from actual player support surfaces');
        assert.ok(!world.trains.includes(challenge.support), 'the safe deck also has a damage collider');
    } finally { disposeWorld(world); }
});

test('reserved challenge stretches stay clear of random hazards and map changes clear progress', () => {
    for (const id of THEMES) {
        const world = makeWorld(id), player = makePlayer();
        try {
            const challenge = world.challenges[0];
            const mid = challenge.targets[0];
            challenge.launchAttempted = true; cross(world, player, mid);
            assert.ok(world.challengeState);
            for (let z = 0; z <= 1200; z += 2.8) {
                player.z = z; world.update(.05, 56, player);
                for (const segment of world.challenges) {
                    for (const obstacle of [...world.trains, ...world.barriers, ...world.features]) {
                        const endZ = obstacle.z + (obstacle.length || 0);
                        assert.ok(endZ < segment.startZ || obstacle.z > segment.endZ,
                            `${id}: random ${obstacle.constructor.name} at ${obstacle.z} occupies a challenge`);
                    }
                    for (const ramp of world.ramps) {
                        if (ramp === segment.support) continue;
                        assert.ok(ramp.endZ < segment.startZ || ramp.startZ > segment.endZ, 'an unrelated ramp occupies a challenge');
                    }
                }
                assert.ok(world.trains.every(train => train.speed === 0), 'a moving themed platform can enter the reserved area later');
            }
            assert.ok(world.challengeKit.pool.length <= 2, 'passed challenge meshes are never reused');
            world.reset();
            assert.equal(world.challengeState, null);
            assert.equal(world.consumeChallengeRewards(), 0);
            assert.equal(world.challenges[0].state.completed, 0);
            assert.equal(world.challenges[0].state.combo, 0);
            assert.deepEqual(world.challengePrevious, { x: 0, y: 0, z: 0, isSliding: false, slideTimer: 0 });
            const nextMap = id === 'tea' ? 'pond' : 'tea';
            const oldKit = world.challengeKit, oldSegments = [...oldKit.pool];
            world.applyMapTheme(MAP_CONFIGS[nextMap]);
            assert.equal(world.challengeState, null);
            assert.equal(world.consumeChallengeRewards(), 0);
            assert.equal(world.challenges.length, 0);
            assert.ok(oldSegments.every(segment => !segment.inUse && segment.mesh.parent === null));
            assert.equal(oldKit.pool.length, 0);
            world.reset();
            assert.equal(world.challenges[0].type, nextMap);
            assert.equal(world.challenges[0].state.completed, 0);
        } finally { disposeWorld(world); }
    }
});
