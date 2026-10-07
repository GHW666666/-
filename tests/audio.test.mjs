import test from 'node:test';
import assert from 'node:assert/strict';

const initialStorage = globalThis.localStorage;
if (!initialStorage) globalThis.localStorage = { getItem: () => null };
const { AudioManager, BGM_ASSET_PATH, audio } = await import('../game/audio.js');
const { platform } = await import('../game/adapter.js');
const { GameEngine, GAME_STATE } = await import('../game/main.js');
if (!initialStorage) delete globalThis.localStorage;

function deferred() {
    let resolve, reject;
    const promise = new Promise((accept, decline) => { resolve = accept; reject = decline; });
    return { promise, resolve, reject };
}

const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

function fixture(t, { env = 'browser', webAudio = true, muted = false, singleton = false, play, createNative } = {}) {
    const names = ['window', 'document', 'wx', 'tt', 'setInterval', 'clearInterval', 'requestAnimationFrame'];
    const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    const platformPrevious = { env: platform.env, getStorage: platform.getStorage, setStorage: platform.setStorage };
    const singletonPrevious = singleton ? { ...audio } : null;
    const saved = new Map([['naiwa_muted', muted]]);
    const players = [], contexts = [], intervals = new Map(), frames = [];
    const warnings = [];
    const previousWarn = console.warn;
    console.warn = (...args) => warnings.push(args);
    platform.env = env;
    platform.getStorage = (key, fallback) => saved.get(key) ?? fallback;
    platform.setStorage = (key, value) => { saved.set(key, value); return true; };
    delete globalThis.wx; delete globalThis.tt;

    const parameter = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
    class FakeAudioContext {
        constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; this.oscillators = []; contexts.push(this); }
        createOscillator() {
            const oscillator = { frequency: parameter(), connect() {}, start() {}, stop() {} };
            this.oscillators.push(oscillator);
            return oscillator;
        }
        createGain() { return { gain: parameter(), connect() {} }; }
        resume() { this.state = 'running'; return Promise.resolve(); }
    }
    class FakeAudio {
        constructor(src) { this.src = src; this.currentTime = 0; this.paused = true; this.playCalls = 0; this.pauseCalls = 0; this.listeners = new Map(); players.push(this); }
        play() { this.playCalls++; this.paused = false; return play ? play(this) : Promise.resolve(); }
        pause() { this.pauseCalls++; this.paused = true; }
        addEventListener(name, listener) { this.listeners.set(name, listener); }
        emitError(error = { code: 4 }) { this.error = error; this.listeners.get('error')?.(); }
    }
    const nativeApi = {
        createInnerAudioContext() {
            const player = {
                currentTime: 0, paused: true, playCalls: 0, pauseCalls: 0, stopCalls: 0,
                onError(callback) { this.errorCallback = callback; },
                play() { this.playCalls++; this.paused = false; return play?.(this); },
                pause() { this.pauseCalls++; this.paused = true; },
                stop() { this.stopCalls++; this.currentTime = 0; this.paused = true; },
                emitError(error = { errCode: 10003 }) { this.errorCallback?.(error); },
            };
            players.push(player);
            return createNative ? createNative(player) : player;
        },
    };
    if (env === 'wechat') globalThis.wx = nativeApi;
    if (env === 'douyin') globalThis.tt = nativeApi;
    globalThis.window = { Audio: FakeAudio, ...(webAudio ? { AudioContext: FakeAudioContext } : {}) };
    globalThis.document = { hidden: false };
    let nextInterval = 0;
    globalThis.setInterval = callback => { const id = nextInterval++; intervals.set(id, callback); return id; };
    globalThis.clearInterval = id => intervals.delete(id);
    globalThis.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
    const fresh = new AudioManager();
    const manager = singleton ? Object.assign(audio, fresh) : fresh;
    t.after(() => {
        manager.stopBGM();
        Object.assign(platform, platformPrevious);
        if (singletonPrevious) Object.assign(audio, singletonPrevious);
        console.warn = previousWarn;
        for (const [name, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        }
    });
    return { manager, players, contexts, intervals, frames, saved, warnings };
}

test('browser plays the local looping MP3 independently of Web Audio and repeated starts are idempotent', async t => {
    const { manager, players, intervals } = fixture(t, { webAudio: false });
    manager.startBGM(); manager.startBGM(); manager.resume();
    await settle();
    assert.equal(players.length, 1);
    assert.equal(players[0].src, `./${BGM_ASSET_PATH}`);
    assert.equal(players[0].loop, true);
    assert.equal(players[0].autoplay, false);
    assert.equal(players[0].preload, 'auto');
    assert.equal(players[0].volume, 0.34);
    assert.equal(players[0].playCalls, 1);
    assert.equal(manager.ctx, null);
    assert.equal(manager.bgmRequested, true);
    assert.equal(manager.bgmPlaying, true);
    assert.equal(intervals.size, 0);
});

test('mute preserves a run request while stopped or lobby music stays silent after unmute', async t => {
    const { manager, players, saved } = fixture(t, { muted: true });
    manager.startBGM();
    assert.equal(manager.bgmRequested, true);
    assert.equal(players.length, 0);
    manager.toggleMute(); await settle();
    assert.equal(players[0].playCalls, 1);
    players[0].currentTime = 19;
    manager.toggleMute();
    assert.equal(players[0].paused, true);
    assert.equal(manager.bgmRequested, true);
    manager.toggleMute(); await settle();
    assert.equal(players[0].currentTime, 19);
    assert.equal(players[0].playCalls, 2);
    manager.stopBGM();
    manager.toggleMute(); manager.toggleMute(); await settle();
    assert.equal(players[0].playCalls, 2);
    assert.equal(manager.bgmRequested, false);
    assert.equal(saved.get('naiwa_muted'), false);
});

test('pause preserves playback position and a new run explicitly resets it', async t => {
    const { manager, players } = fixture(t);
    manager.startBGM(); await settle();
    players[0].currentTime = 27;
    manager.stopBGM(); manager.startBGM(); await settle();
    assert.equal(players[0].currentTime, 27);
    manager.stopBGM({ reset: true }); manager.startBGM(); await settle();
    assert.equal(players[0].currentTime, 0);
    assert.equal(players[0].playCalls, 3);
});

test('autoplay rejection retries on the next gesture without disabling the file track', async t => {
    const blocked = Object.assign(new Error('gesture required'), { name: 'NotAllowedError' });
    const { manager, players, intervals } = fixture(t, { play: player => player.playCalls === 1 ? Promise.reject(blocked) : Promise.resolve() });
    manager.startBGM(); await settle();
    assert.equal(manager.bgmRequested, true);
    assert.equal(manager.bgmPlaying, false);
    assert.equal(manager.bgmFileFailed, false);
    assert.equal(intervals.size, 0);
    manager.resume(); await settle();
    assert.equal(players[0].playCalls, 2);
    assert.equal(manager.bgmPlaying, true);
});

test('pending play completion from an earlier run cannot stop a restarted player or revive synthesis', async t => {
    const first = deferred(), second = deferred();
    const { manager, players, intervals } = fixture(t, { play: player => player.playCalls === 1 ? first.promise : second.promise });
    manager.startBGM();
    manager.stopBGM(); manager.startBGM();
    const pauses = players[0].pauseCalls;
    first.reject(new Error('old failed request')); await settle();
    assert.equal(manager.bgmFileFailed, false);
    assert.equal(manager.bgmPlaying, true);
    assert.equal(players[0].pauseCalls, pauses);
    assert.equal(intervals.size, 0);
    manager.stopBGM();
    second.resolve(); await settle();
    assert.equal(manager.bgmRequested, false);
    assert.equal(manager.bgmPlaying, false);
    assert.equal(players[0].paused, true);
});

test('AbortError remains retryable, while genuine media errors use the original synth loop and effects', async t => {
    const aborted = Object.assign(new Error('interrupted'), { name: 'AbortError' });
    const { manager, players, contexts, intervals } = fixture(t, { play: player => player.playCalls === 1 ? Promise.reject(aborted) : Promise.resolve() });
    manager.startBGM(); await settle();
    assert.equal(manager.bgmFileFailed, false);
    manager.resume(); await settle();
    players[0].emitError();
    assert.equal(players[0].paused, true);
    assert.equal(manager.bgmFileFailed, true);
    assert.equal(intervals.size, 1);
    for (const callback of intervals.values()) callback();
    assert.equal(contexts[0].oscillators[0].type, 'square');
    manager.playCoin();
    assert.equal(contexts[0].oscillators[1].type, 'triangle');
    manager.startBGM();
    assert.equal(intervals.size, 1);
    manager.stopBGM();
    assert.equal(intervals.size, 0, 'the synth timer is removed even when its handle is zero');
});

for (const env of ['wechat', 'douyin']) {
    test(`${env} uses a local native looping player, preserves pause position, and resets with stop`, t => {
        const { manager, players } = fixture(t, { env, webAudio: false });
        manager.startBGM(); manager.startBGM();
        assert.equal(players.length, 1);
        assert.equal(players[0].src, BGM_ASSET_PATH);
        assert.equal(players[0].loop, true);
        assert.equal(players[0].playCalls, 1);
        assert.equal(manager.ctx, null);
        players[0].currentTime = 11;
        manager.stopBGM(); manager.startBGM();
        assert.equal(players[0].currentTime, 11);
        manager.stopBGM({ reset: true });
        assert.equal(players[0].stopCalls, 1);
        assert.equal(players[0].currentTime, 0);
    });
}

test('late native errors while muted or stopped cannot bring back fallback music', t => {
    const { manager, players, intervals } = fixture(t, { env: 'wechat' });
    manager.startBGM(); manager.toggleMute();
    players[0].emitError();
    assert.equal(intervals.size, 0);
    assert.equal(manager.bgmRequested, true);
    manager.toggleMute();
    assert.equal(intervals.size, 1);
    manager.stopBGM(); players[0].emitError();
    assert.equal(intervals.size, 0);
});

test('native source-setting and synchronous playback failures safely enter the synth fallback', t => {
    const { manager, players, intervals } = fixture(t, {
        env: 'wechat',
        createNative(player) {
            Object.defineProperty(player, 'src', { set() { player.emitError(); } });
            return player;
        },
    });
    manager.startBGM();
    assert.equal(players[0].playCalls, 0);
    assert.equal(manager.bgmFileFailed, true);
    assert.equal(intervals.size, 1);
});

test('synchronous play failures stop the file before starting synthesis', t => {
    const { manager, players, intervals } = fixture(t, { play() { throw new Error('unsupported codec'); } });
    manager.startBGM();
    assert.equal(players[0].paused, true);
    assert.equal(manager.bgmFileFailed, true);
    assert.equal(intervals.size, 1);
});

test('a genuine asynchronous play rejection starts one fallback while the run remains requested', async t => {
    const { manager, players, intervals } = fixture(t, { play: () => Promise.reject(new Error('cannot decode MP3')) });
    manager.startBGM(); await settle();
    assert.equal(players[0].paused, true);
    assert.equal(manager.bgmFileFailed, true);
    assert.equal(manager.bgmRequested, true);
    assert.equal(manager.bgmPlaying, true);
    assert.equal(intervals.size, 1);
    manager.resume();
    assert.equal(intervals.size, 1);
});

function engineFixture() {
    const engine = Object.create(GameEngine.prototype);
    Object.assign(engine, {
        state: GAME_STATE.LOBBY, transitionTime: 0, transitionDuration: 0.85, lastTime: 0,
        score: 0, coins: 0, highScore: 0, lobbyTime: 0, activeRun: null,
        ui: { hideLobby() {}, hidePause() {}, hideGameOver() {}, showPause() {}, showLobby() {} },
        player: { reset() {}, setLobbyMode() {}, updateStartTransition() {}, updateLobby() {} },
        world: { reset() {}, render() {}, updateTransitionCamera() {}, setLobbyCamera() {} },
        finishRun() {}, beginRun() {}, flushProgress() {},
    });
    return engine;
}

test('the start gesture plays immediately; a hidden transition stays paused until explicit resume', async t => {
    const { players, manager } = fixture(t, { singleton: true });
    const engine = engineFixture();
    engine.start();
    assert.equal(engine.state, GAME_STATE.TRANSITION);
    assert.equal(players[0].playCalls, 1, 'the original start gesture reaches HTML play synchronously');
    engine.transitionTime = 0.4;
    document.hidden = true;
    engine.handleBackground();
    assert.equal(engine.state, GAME_STATE.PAUSED);
    assert.equal(engine.pausedState, GAME_STATE.TRANSITION);
    assert.equal(manager.bgmRequested, false);
    engine.loop(1000);
    assert.equal(engine.transitionTime, 0.4);
    assert.equal(players[0].paused, true);
    document.hidden = false;
    engine.loop(1100);
    assert.equal(engine.state, GAME_STATE.PAUSED);
    assert.equal(players[0].playCalls, 1, 'showing the game alone cannot autoplay music');
    engine.resume();
    assert.equal(engine.state, GAME_STATE.TRANSITION);
    assert.equal(players[0].playCalls, 2);
    engine.transitionTime = 0.84;
    engine.lastTime = 1000;
    engine.loop(1050); await settle();
    assert.equal(engine.state, GAME_STATE.PLAYING);
    assert.equal(players[0].playCalls, 2, 'transition completion does not duplicate the current play request');
});

test('running background pauses, explicit resume continues, and restart begins the track at zero', async t => {
    const { players } = fixture(t, { singleton: true });
    const engine = engineFixture();
    engine.restart(); await settle();
    players[0].currentTime = 24;
    document.hidden = true; engine.handleBackground();
    assert.equal(engine.state, GAME_STATE.PAUSED);
    document.hidden = false; engine.resume(); await settle();
    assert.equal(engine.state, GAME_STATE.PLAYING);
    assert.equal(players[0].currentTime, 24);
    engine.restart(); await settle();
    assert.equal(players[0].currentTime, 0);
    engine.returnToLobby();
    audio.toggleMute(); audio.toggleMute();
    assert.equal(players[0].paused, true);
});

test('hidden documents cannot begin file or fallback playback through a late start call', t => {
    const { manager, players, intervals } = fixture(t);
    document.hidden = true;
    manager.startBGM();
    assert.equal(players.length, 0);
    assert.equal(intervals.size, 0);
    assert.equal(manager.bgmPlaying, false);
});
