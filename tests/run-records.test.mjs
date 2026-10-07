import test from 'node:test';
import assert from 'node:assert/strict';
import { RunRecords, RUN_RECORDS_LIMIT, RUN_RECORDS_STORAGE_KEY } from '../game/runRecords.js';

function storageFixture(initial = null) {
    let value = initial;
    const writes = [];
    return {
        writes,
        getStorage(key, fallback) {
            assert.equal(key, RUN_RECORDS_STORAGE_KEY);
            return value ?? fallback;
        },
        setStorage(key, saved) {
            assert.equal(key, RUN_RECORDS_STORAGE_KEY);
            value = structuredClone(saved);
            writes.push(value);
        },
    };
}

function run(distance, coins = 0, finishedAt = 100) {
    return { distance, coins, finishedAt, mapId: 'tea', mapName: '奶茶星球' };
}

test('personal rankings sort by distance, coins, completion time, then the latest run id', () => {
    const records = new RunRecords(storageFixture());
    const lower = records.recordRun(run(100, 500, 600));
    const older = records.recordRun(run(250, 5, 100));
    const newer = records.recordRun(run(250, 5, 200));
    const richer = records.recordRun(run(250, 6, 50));
    const sameTime = records.recordRun(run(250, 5, 200));
    const longest = records.recordRun(run(500, 0, 1));
    assert.deepEqual(records.snapshot().entries.map(entry => entry.id),
        [longest.id, richer.id, sameTime.id, newer.id, older.id, lower.id]);
    assert.equal(records.snapshot().bestDistance, 500);
});

test('only the highest 20 runs are retained while totalRuns counts every recorded run', () => {
    const storage = storageFixture();
    const records = new RunRecords(storage);
    for (let distance = 1; distance <= 35; distance++) records.recordRun(run(distance, distance));
    const snapshot = records.snapshot();
    assert.equal(snapshot.entries.length, RUN_RECORDS_LIMIT);
    assert.equal(snapshot.totalRuns, 35);
    assert.deepEqual(snapshot.entries.map(entry => entry.distance), Array.from({ length: 20 }, (_, index) => 35 - index));
    assert.equal(storage.writes.length, 35, 'each completed run is saved once');
    assert.equal(new RunRecords(storage).snapshot().totalRuns, 35);
});

test('legacy best seeds a clearly unknown historical record without adding a played run', () => {
    const storage = storageFixture();
    const records = new RunRecords(storage, { bestDistance: 11216.9 });
    assert.deepEqual(records.snapshot(), {
        bestDistance: 11216,
        totalRuns: 0,
        entries: [{ id: 'legacy-best', legacy: true, distance: 11216, coins: null, mapId: null, mapName: null, finishedAt: null }],
    });
    assert.equal(storage.writes.length, 1, 'migration is persisted even before the next run');
    records.recordRun(run(400, 20));
    assert.equal(records.snapshot().entries[0].legacy, true);
    assert.equal(records.snapshot().totalRuns, 1);
    records.recordRun(run(11216, 0));
    assert.equal(records.snapshot().entries.some(entry => entry.legacy), false);
    assert.equal(records.snapshot().totalRuns, 2);
    assert.equal(records.snapshot().bestDistance, 11216);
});

test('reload preserves actual run data, best distance and cumulative run count without replaying entries', () => {
    const storage = storageFixture();
    const first = new RunRecords(storage);
    first.recordRun(run(900.8, 32.9, 1000.8));
    first.recordRun({ distance: 800, coins: 4, finishedAt: 2000, mapId: 'store', mapName: '巨物便利店' });
    const restored = new RunRecords(storage, { bestDistance: 700 });
    assert.equal(storage.writes.length, 2, 'a clean reload does not rewrite storage');
    assert.deepEqual(restored.snapshot(), first.snapshot());
    const third = restored.recordRun(run(950, 7, 3000));
    assert.equal(third.distance, 950);
    assert.equal(restored.snapshot().totalRuns, 3);
    assert.equal(restored.snapshot().bestDistance, 950);
    assert.equal(new RunRecords(storage).snapshot().entries[1].coins, 32);
});

test('zero, invalid and sub-meter attempts do not create records or writes', () => {
    const storage = storageFixture();
    const records = new RunRecords(storage);
    for (const distance of [0, 0.99, -1, NaN, Infinity, '50', null, undefined]) {
        assert.equal(records.recordRun({ distance, coins: 8 }), null);
    }
    for (const malformed of [null, [], 'run', 5]) assert.equal(records.recordRun(malformed), null);
    assert.deepEqual(records.snapshot(), { entries: [], bestDistance: 0, totalRuns: 0 });
    assert.equal(storage.writes.length, 0);
});

test('coins are per-run earnings, invalid fields are sanitized, and snapshots do not mutate records', () => {
    const records = new RunRecords(storageFixture());
    const first = records.recordRun({ distance: 50, coins: -10, finishedAt: NaN, mapId: {}, mapName: ['wrong'] });
    assert.deepEqual(first, { id: 'run-1-unknown', legacy: false, distance: 50, coins: 0, mapId: null, mapName: null, finishedAt: null });
    const second = records.recordRun({ distance: 70, coins: Infinity, mapId: ' store ', mapName: ' 巨物便利店 ', finishedAt: 0 });
    assert.equal(second.coins, 0);
    assert.equal(second.mapId, 'store');
    assert.equal(second.mapName, '巨物便利店');
    assert.equal(second.finishedAt, 0);
    first.distance = 100000;
    const snapshot = records.snapshot();
    snapshot.entries[0].coins = 100000;
    snapshot.entries.length = 0;
    assert.equal(records.snapshot().entries.length, 2);
    assert.equal(records.snapshot().entries[0].coins, 0);
});

test('corrupt storage repairs invalid fields and duplicate ids while preserving valid history', () => {
    const storage = storageFixture({ version: 'broken', totalRuns: -2, entries: [
        null, { id: 'bad', distance: NaN },
        { id: 'one', distance: 25.9, coins: -4, mapId: {}, finishedAt: Infinity },
        { id: 'one', distance: 50, coins: 5 },
        { distance: 12, coins: 3, mapName: '便利店', finishedAt: 42 },
        { id: 'wrong legacy', legacy: true, distance: 80, coins: 300, finishedAt: 500, mapId: 'invented' },
    ] });
    const records = new RunRecords(storage);
    const snapshot = records.snapshot();
    assert.equal(snapshot.bestDistance, 80);
    assert.equal(snapshot.totalRuns, 2);
    assert.equal(snapshot.entries.length, 3);
    assert.deepEqual(snapshot.entries[0], { id: 'legacy-best', legacy: true, distance: 80, coins: null, mapId: null, mapName: null, finishedAt: null });
    assert.equal(snapshot.entries[1].distance, 25);
    assert.equal(snapshot.entries[1].coins, 0);
    assert.equal(snapshot.entries[1].finishedAt, null);
    assert.equal(snapshot.entries[2].id, 'recovered-4');
    assert.equal(storage.writes[0].version, 1);
    assert.deepEqual(new RunRecords(storage).snapshot(), snapshot);
});

test('non-object records and failed storage backends leave an in-memory leaderboard usable', () => {
    for (const malformed of ['broken json', ['unexpected'], 42]) {
        const records = new RunRecords(storageFixture(malformed), { bestDistance: 7 });
        assert.equal(records.snapshot().bestDistance, 7);
        assert.equal(records.snapshot().totalRuns, 0);
    }
    const storage = {
        getStorage() { throw new Error('read unavailable'); },
        setStorage() { throw new Error('write unavailable'); },
    };
    const records = new RunRecords(storage, { bestDistance: 5 });
    records.recordRun(run(20, 3));
    assert.equal(records.snapshot().entries[0].distance, 20);
    assert.equal(records.snapshot().totalRuns, 1);
    assert.equal(records.dirty, true);
    storage.setStorage = () => false;
    assert.equal(records.save(), false, 'an explicit false from the adapter does not discard pending runs');
    assert.equal(records.dirty, true);
    assert.equal(records.snapshot().totalRuns, 1);
    assert.equal(records.snapshot().entries[0].distance, 20);
    const writes = [];
    storage.setStorage = (key, value) => writes.push({ key, value });
    assert.equal(records.save(), true);
    assert.equal(records.save(), false);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].key, RUN_RECORDS_STORAGE_KEY);
});

test('large numeric values stay finite and repeated timestamps still produce distinct ids', () => {
    const storage = storageFixture({ version: 1, entries: [], totalRuns: Number.MAX_VALUE });
    const records = new RunRecords(storage);
    const first = records.recordRun(run(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE));
    const second = records.recordRun(run(Number.MAX_VALUE, 0, Number.MAX_VALUE));
    assert.notEqual(first.id, second.id);
    assert.equal(first.distance, Number.MAX_SAFE_INTEGER);
    assert.equal(first.coins, Number.MAX_SAFE_INTEGER);
    assert.equal(first.finishedAt, 8.64e15);
    assert.equal(records.snapshot().bestDistance, Number.MAX_SAFE_INTEGER);
    assert.equal(records.snapshot().totalRuns, Number.MAX_SAFE_INTEGER);
});
