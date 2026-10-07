import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem() { return null; }, setItem() {} };
const { GameEngine, GAME_STATE } = await import('../game/main.js');
const { RunRecords } = await import('../game/runRecords.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true;
audio.initialized = true;

function fixture() {
    const saved = new Map();
    const storage = {
        getStorage(key, fallback) { return saved.get(key) ?? fallback; },
        setStorage(key, value) { saved.set(key, structuredClone(value)); },
    };
    const engine = Object.create(GameEngine.prototype);
    const ui = new Proxy({}, { get() { return () => {}; } });
    Object.assign(engine, {
        state: GAME_STATE.LOBBY, score: 0, coins: 100,
        highScore: 400, savedHighScore: 400, activeRun: null,
        runRecords: new RunRecords(storage, { bestDistance: 400 }),
        ui, player: { reset() {}, setLobbyMode() {}, takeHit() { return true; } },
        world: { reset() {}, setLobbyCamera() {} },
    });
    return { engine, storage };
}

test('pausing and returning saves a run once with earned coins, excluding lobby supply', () => {
    const { engine, storage } = fixture();
    engine.addCoins(100);
    engine.startRunTransition(); engine.state = GAME_STATE.PLAYING;
    engine.score = 512.9; engine.addCoins(2); engine.addCoins(18);
    engine.pause();
    assert.equal(engine.runRecords.snapshot().totalRuns, 0, 'pause does not end the run');
    engine.resume(); engine.pause(); engine.returnToLobby(); engine.returnToLobby();
    const board = engine.runRecords.snapshot();
    assert.equal(board.totalRuns, 1);
    assert.equal(board.entries[0].distance, 512);
    assert.equal(board.entries[0].coins, 20);
    assert.equal(board.entries[0].mapId, 'egypt');
    assert.equal(engine.coins, 220);
    assert.equal(engine.activeRun, null);
    assert.deepEqual(new RunRecords(storage, { bestDistance: 512 }).snapshot(), board);
});

test('death, return and retry boundaries never duplicate previous runs', () => {
    const { engine } = fixture();
    engine.startRunTransition(); engine.state = GAME_STATE.PLAYING;
    engine.score = 800; engine.addCoins(5); engine.handleHit();
    assert.equal(engine.state, GAME_STATE.GAMEOVER);
    assert.equal(engine.runRecords.snapshot().totalRuns, 1);
    assert.equal(engine.finishRun(), null);
    engine.restart();
    assert.equal(engine.runRecords.snapshot().totalRuns, 1);
    engine.score = 950; engine.addCoins(6); engine.restart();
    assert.equal(engine.runRecords.snapshot().totalRuns, 2);
    assert.equal(engine.activeRun.coins, 0);
    assert.equal(engine.score, 0);
    engine.score = 100; engine.returnToLobby();
    const board = engine.runRecords.snapshot();
    assert.equal(board.totalRuns, 3);
    assert.deepEqual(board.entries.map(entry => entry.distance), [950, 800, 100]);
    assert.deepEqual(board.entries.map(entry => entry.coins), [6, 5, 0]);
});

test('cancelling before the first meter produces no ranked run', () => {
    const { engine } = fixture();
    engine.startRunTransition(); engine.score = .8; engine.returnToLobby();
    const board = engine.runRecords.snapshot();
    assert.equal(board.totalRuns, 0);
    assert.equal(board.entries.length, 1);
    assert.equal(board.entries[0].legacy, true);
    assert.equal(board.entries[0].distance, 400);
});
