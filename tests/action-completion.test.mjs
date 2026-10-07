import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
globalThis.localStorage = { getItem() { return null; }, setItem() {} };
const { Player3D } = await import('../game/player3d.js');
const { audio } = await import('../game/audio.js');

audio.isMuted = true;
function fixture() {
    const player = Object.create(Player3D.prototype), completed = [];
    player.character = { group: new THREE.Group(), update() {}, animateCrash() {} };
    player.reset(); player.onActionCompleted = type => completed.push(type);
    return { player, completed };
}
function advance(player, seconds = 1.5) {
    for (let i = 0; i < Math.ceil(seconds / .025); i++) player.update(.025, 26, { ramps: [], trains: [] });
}

test('jump achievements count a real landing once, despite repeated airborne input', () => {
    const { player, completed } = fixture();
    player.jump();
    for (let i = 0; i < 8; i++) player.jump();
    assert.deepEqual(completed, []);
    advance(player);
    assert.deepEqual(completed, ['jump']);
    advance(player);
    assert.deepEqual(completed, ['jump']);
    player.y = 2; player.isGrounded = false; player.vy = 0;
    advance(player);
    assert.deepEqual(completed, ['jump'], 'walking off a platform counts as an intentional jump');
});

test('slide achievements count the completed slide rather than button repeats', () => {
    const { player, completed } = fixture();
    player.slide(); advance(player, .2); player.slide();
    assert.deepEqual(completed, []);
    advance(player);
    assert.deepEqual(completed, ['slide']);
    player.slide(); player.jump(); advance(player);
    assert.deepEqual(completed, ['slide', 'jump'], 'an interrupted slide counted as completed');
});

test('retry, flight pickup and death discard unfinished achievement actions', () => {
    const { player, completed } = fixture();
    player.jump(); player.reset(); advance(player);
    assert.deepEqual(completed, []);
    player.jump(); player.slide(); player.addProp('flight'); advance(player, 10);
    assert.deepEqual(completed, [], 'a flight landing counts as a completed ground action');
    player.reset(); player.slide(); player.takeHit(); advance(player);
    assert.deepEqual(completed, [], 'an action completed after the run ended');
});
