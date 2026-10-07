import test from 'node:test';
import assert from 'node:assert/strict';
import { AchievementProgress, ACHIEVEMENT_STORAGE_KEY } from '../game/achievements.js';

function storageFixture(initial = null) {
    let value = initial;
    const writes = [];
    return {
        writes,
        getStorage(key, fallback) {
            assert.equal(key, ACHIEVEMENT_STORAGE_KEY);
            return value ?? fallback;
        },
        setStorage(key, saved) {
            assert.equal(key, ACHIEVEMENT_STORAGE_KEY);
            value = structuredClone(saved);
            writes.push(value);
        },
    };
}

test('first use migrates the existing record and balance without inventing action history', () => {
    const storage = storageFixture();
    const progress = new AchievementProgress(storage, { highScore: 11216.75, coins: 361 });
    assert.deepEqual(progress.snapshot(), { bestDistance: 11216, lifetimeCoins: 361, jumps: 0, slides: 0 });
    assert.equal(storage.writes.length, 0, 'migration waits for an explicit flush');
    assert.equal(progress.save(), true);
    assert.deepEqual(storage.writes[0], { version: 1, bestDistance: 11216, lifetimeCoins: 361, jumps: 0, slides: 0 });
});

test('legacy migration only increases persisted totals and does not confuse spending with earnings', () => {
    const storage = storageFixture({ version: 1, bestDistance: 900, lifetimeCoins: 1200, jumps: 14, slides: 9 });
    const progress = new AchievementProgress(storage, { highScore: 850, coins: 25 });
    assert.equal(progress.dirty, false);
    assert.equal(progress.mergeLegacy({ highScore: 950.9, coins: 30 }), true);
    assert.deepEqual(progress.snapshot(), { bestDistance: 950, lifetimeCoins: 1200, jumps: 14, slides: 9 });
    assert.equal(progress.mergeLegacy({ highScore: 900, coins: 25 }), false);
});

test('distance is a floor-rounded maximum across runs rather than a sum', () => {
    const progress = new AchievementProgress(storageFixture(), { highScore: 50 });
    assert.equal(progress.recordDistance(51.9), true);
    assert.equal(progress.recordDistance(51.99), false);
    assert.equal(progress.recordDistance(40), false);
    assert.equal(progress.recordDistance(130.8), true);
    assert.equal(progress.stats.bestDistance, 130);
});

test('earned coins and completed actions persist without being counted again on reload', () => {
    const storage = storageFixture();
    const progress = new AchievementProgress(storage, { coins: 40 });
    progress.addCoins(1);
    progress.addCoins(18);
    progress.addCoins(100);
    progress.completeAction('jump');
    progress.completeAction('jump');
    progress.completeAction('slide');
    progress.recordDistance(310.8);
    assert.equal(progress.save(), true);
    assert.equal(progress.save(), false);
    const restored = new AchievementProgress(storage, { coins: 159, highScore: 310 });
    assert.deepEqual(restored.snapshot(), { bestDistance: 310, lifetimeCoins: 159, jumps: 2, slides: 1 });
    assert.equal(restored.save(), false);
    restored.addCoins(5);
    restored.completeAction('slide');
    restored.save();
    assert.equal(storage.writes.length, 2);
    assert.deepEqual(storage.writes[1], { version: 1, bestDistance: 310, lifetimeCoins: 164, jumps: 2, slides: 2 });
});

test('corrupt persisted fields and invalid events never produce negative or nonfinite totals', () => {
    const storage = storageFixture({ version: 1, bestDistance: -10, lifetimeCoins: '400', jumps: Infinity, slides: 3.9 });
    const progress = new AchievementProgress(storage);
    assert.deepEqual(progress.snapshot(), { bestDistance: 0, lifetimeCoins: 0, jumps: 0, slides: 3 });
    for (const invalid of [-1, 0, NaN, Infinity, -Infinity, null, undefined, '100', {}, 0.99]) {
        assert.equal(progress.addCoins(invalid), false);
        assert.equal(progress.recordDistance(invalid), false);
    }
    for (const invalid of ['jump-start', 'land', 'slide-start', '', null, undefined, 'jumps']) {
        assert.equal(progress.completeAction(invalid), false);
    }
    progress.save();
    assert.deepEqual(storage.writes[0], { version: 1, bestDistance: 0, lifetimeCoins: 0, jumps: 0, slides: 3 });
});

test('missing or malformed records migrate safely and snapshots cannot alter saved statistics', () => {
    for (const malformed of [null, 'broken json', ['unexpected'], 42]) {
        const storage = storageFixture(malformed);
        const progress = new AchievementProgress(storage, { coins: 7, highScore: 24 });
        const snapshot = progress.snapshot();
        snapshot.jumps = 999;
        snapshot.bestDistance = 0;
        assert.deepEqual(progress.snapshot(), { bestDistance: 24, lifetimeCoins: 7, jumps: 0, slides: 0 });
        progress.save();
        assert.equal(storage.writes[0].jumps, 0);
    }
});

test('recording a run does not synchronously write per-frame and clean saves do nothing', () => {
    const storage = storageFixture({ version: 1, bestDistance: 0, lifetimeCoins: 0, jumps: 0, slides: 0 });
    const progress = new AchievementProgress(storage);
    assert.equal(progress.save(), false);
    for (let frame = 1; frame <= 240; frame++) progress.recordDistance(frame / 10);
    assert.equal(storage.writes.length, 0);
    progress.save();
    assert.equal(storage.writes.length, 1);
    assert.equal(storage.writes[0].bestDistance, 24);
    assert.equal(progress.recordDistance(24.9), false);
    assert.equal(progress.save(), false);
});

test('failed storage flush retains pending statistics for retry and counters stay within safe integers', () => {
    const storage = storageFixture();
    const write = storage.setStorage.bind(storage);
    storage.setStorage = () => { throw new Error('storage unavailable'); };
    const progress = new AchievementProgress(storage);
    progress.addCoins(Number.MAX_VALUE);
    progress.recordDistance(Number.MAX_VALUE);
    assert.equal(progress.addCoins(1), false);
    assert.equal(progress.save(), false);
    assert.equal(progress.dirty, true);
    storage.setStorage = () => false;
    assert.equal(progress.save(), false, 'an explicit false from the adapter also leaves the save pending');
    assert.equal(progress.dirty, true);
    assert.equal(storage.writes.length, 0);
    assert.equal(progress.stats.lifetimeCoins, Number.MAX_SAFE_INTEGER);
    storage.setStorage = write;
    assert.equal(progress.save(), true);
    assert.equal(progress.dirty, false);
    assert.equal(storage.writes[0].lifetimeCoins, Number.MAX_SAFE_INTEGER);
    assert.equal(storage.writes[0].bestDistance, Number.MAX_SAFE_INTEGER);
});
