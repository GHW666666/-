import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { installWeChatRuntime } from '../minigame/runtime.js';

// The entry also imports the shared audio singleton; its browser storage read is irrelevant here.
const previousStorage = globalThis.localStorage;
if (!previousStorage) globalThis.localStorage = { getItem: () => null };
const { attachNativeUIOverlay, connectNativeUIInput, startNativeGame } = await import('../minigame/entry.js');
if (!previousStorage) delete globalThis.localStorage;

function createHost({ offscreen = true, webgl = {}, context2D = {} } = {}) {
    const callbacks = new Map();
    const counts = { screen: 0, offscreen: 0 };
    const modals = [];
    const makeCanvas = () => ({ width: 1, height: 1, getContext: type => type === 'webgl2' ? webgl : context2D });
    const subscribe = event => callback => {
        if (!callbacks.has(event)) callbacks.set(event, []);
        callbacks.get(event).push(callback);
    };
    const host = { GameGlobal: {}, requestAnimationFrame: () => 7, cancelAnimationFrame: () => {} };
    const wxApi = {
        createCanvas() { counts.screen++; return makeCanvas(); },
        getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 3 }),
        onWindowResize: subscribe('resize'), onHide: subscribe('hide'), onShow: subscribe('show'),
        onTouchStart: subscribe('start'), onTouchMove: subscribe('move'), onTouchEnd: subscribe('end'),
        onTouchCancel: subscribe('cancel'), showModal: modal => modals.push(modal),
    };
    if (offscreen) wxApi.createOffscreenCanvas = options => { counts.offscreen++; assert.equal(options.type, '2d'); return makeCanvas(); };
    const runtime = installWeChatRuntime(wxApi, host);
    return {
        host, wxApi, runtime, counts, modals,
        emit(event, value = {}) { for (const callback of callbacks.get(event) || []) callback(value); },
    };
}

test('native runtime owns one screen canvas; textures use detached 2D canvases', () => {
    const fixture = createHost();
    const { runtime, counts, host, wxApi } = fixture;
    assert.equal(counts.screen, 1);
    assert.equal(runtime.document.getElementById('gameCanvas'), runtime.canvas);
    const textureCanvas = runtime.document.createElement('canvas');
    assert.notEqual(textureCanvas, runtime.canvas);
    assert.equal(counts.screen, 1);
    assert.equal(counts.offscreen, 1);
    assert.equal(runtime.document.getElementById('btnStartRun'), null);
    assert.throws(() => runtime.document.createElement('div'), /原生小游戏不提供 HTML 元素/);
    assert.equal(installWeChatRuntime(wxApi, host), runtime);
    assert.equal(counts.screen, 1);
});

test('native canvas backing resolution does not change logical layout or pointer coordinates', () => {
    const { runtime, emit } = createHost();
    runtime.canvas.width = 585; runtime.canvas.height = 1266;
    assert.equal(runtime.canvas.clientWidth, 390);
    assert.equal(runtime.canvas.clientHeight, 844);
    assert.equal(runtime.canvas.getBoundingClientRect().width, 390);
    assert.equal(runtime.window.devicePixelRatio, 3);
    let resized = 0;
    runtime.window.addEventListener('resize', () => resized++);
    emit('resize', { size: { windowWidth: 430, windowHeight: 932 } });
    assert.equal(resized, 1);
    assert.equal(runtime.canvas.clientWidth, 430);
    assert.equal(runtime.window.innerHeight, 932);
    assert.equal(runtime.document.documentElement.clientWidth, 430);
});

test('native hide/show produce shared engine lifecycle events and removable listeners', () => {
    const { runtime, emit } = createHost();
    let hidden = 0, visibilityChanges = 0, shows = 0;
    const onHide = () => hidden++;
    runtime.window.addEventListener('pagehide', onHide);
    runtime.window.addEventListener('pageshow', () => shows++);
    runtime.document.addEventListener('visibilitychange', () => visibilityChanges++);
    emit('hide');
    assert.equal(runtime.document.hidden, true);
    assert.equal(runtime.document.visibilityState, 'hidden');
    assert.equal(hidden, 1);
    emit('show');
    assert.equal(runtime.document.hidden, false);
    assert.equal(shows, 1);
    assert.equal(visibilityChanges, 2);
    runtime.window.removeEventListener('pagehide', onHide);
    emit('hide');
    assert.equal(hidden, 1);
});

test('runtime exposes engine globals in GameGlobal and wraps native WebAudio', () => {
    const { runtime, wxApi, host } = createHost();
    const engine = { state: 'LOBBY' };
    runtime.expose('naiwaGame', engine);
    assert.equal(host.naiwaGame, engine);
    assert.equal(host.GameGlobal.naiwaGame, engine);
    assert.equal(host.GameGlobal.window, runtime.window);
    assert.equal(host.GameGlobal.document, runtime.document);
    assert.equal(runtime.window.requestAnimationFrame(() => {}), 7);
    const audioContext = { createOscillator() {}, createGain() {} };
    wxApi.createWebAudioContext = () => audioContext;
    const secondHost = { GameGlobal: {} };
    const secondRuntime = installWeChatRuntime(wxApi, secondHost);
    assert.equal(new secondRuntime.window.AudioContext(), audioContext);
});

test('WeChat microsecond clocks are converted to milliseconds and shared by frame callbacks', () => {
    let clock = 1_250_000, nextFrame;
    const host = { GameGlobal: {}, requestAnimationFrame: callback => { nextFrame = callback; return 9; } };
    const wxApi = {
        createCanvas: () => ({ width: 1, height: 1, getContext: () => ({}) }),
        getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844 }),
        getPerformance: () => ({ now: () => clock }),
    };
    const runtime = installWeChatRuntime(wxApi, host);
    assert.equal(runtime.window.performance.now(), 1250);
    let timestamp;
    assert.equal(host.requestAnimationFrame(time => { timestamp = time; }), 9);
    clock += 16_000;
    nextFrame(123456789);
    assert.equal(timestamp, 1266);
});

test('older native hosts can create detached texture canvases without replacing the screen', () => {
    const { runtime, counts } = createHost({ offscreen: false });
    const screen = runtime.canvas;
    const textureCanvas = runtime.createOffscreenCanvas(128, 256);
    assert.notEqual(textureCanvas, screen);
    assert.equal(runtime.canvas, screen);
    assert.equal(textureCanvas.width, 128);
    assert.equal(textureCanvas.height, 256);
    assert.equal(counts.screen, 2);
    assert.equal(counts.offscreen, 0);
});

test('UI touch consumption survives end-listener ordering, while track swipes still reach the engine', () => {
    const { runtime, emit, wxApi } = createHost();
    const gestures = [];
    const uiPoints = [];
    const adapter = { notifyGesture: (gesture, data) => gestures.push({ gesture, data }) };
    const engine = { ui: {
        onPointerStart: (x, y) => { uiPoints.push([x, y]); return x < 100; },
        onPointerMove: () => false, onPointerEnd: () => false,
    } };
    connectNativeUIInput(engine, runtime, adapter);
    // PlatformAdapter registers its touch handlers after the UI handlers.
    wxApi.onTouchEnd(() => adapter.notifyGesture('swipe_up'));
    emit('start', { touches: [{ clientX: 20, clientY: 40 }] });
    emit('end', { changedTouches: [{ clientX: 20, clientY: 4 }] });
    assert.equal(gestures.length, 0);
    emit('start', { touches: [{ clientX: 200, clientY: 40 }] });
    emit('end', { changedTouches: [{ clientX: 200, clientY: 4 }] });
    assert.deepEqual(gestures.map(item => item.gesture), ['swipe_up']);
    assert.deepEqual(uiPoints, [[20, 40], [200, 40]]);
    emit('start', { touches: [{ clientX: 200, clientY: 40 }] });
    emit('cancel');
    adapter.notifyGesture('swipe_left');
    assert.equal(gestures.length, 1);
});

test('native HUD preserves 3D color and the wardrobe viewport when it renders its transparent overlay', () => {
    const order = [];
    let drawn = 0, depthClears = 0;
    const transforms = [];
    const context = { setTransform: (...args) => transforms.push(args), clearRect() {} };
    const canvas = { width: 1, height: 1, getContext: () => context };
    const initialViewport = new THREE.Vector4(12, 200, 350, 390);
    const initialScissor = initialViewport.clone();
    let viewport = initialViewport.clone(), scissor = initialScissor.clone(), scissorTest = true;
    let width = 390, height = 844, ratio = 3;
    const renderer = {
        autoClear: true,
        render: scene => order.push(scene.name || 'overlay'),
        getRenderTarget: () => null, getScissorTest: () => scissorTest,
        getViewport: result => result.copy(viewport), getScissor: result => result.copy(scissor),
        getSize: result => result.set(width, height),
        getDrawingBufferSize: result => result.set(Math.floor(width * ratio), Math.floor(height * ratio)),
        setViewport: (x, y, width, height) => { viewport = x?.isVector4 ? x.clone() : new THREE.Vector4(x, y, width, height); },
        setScissor: result => { scissor = result.clone(); }, setScissorTest: result => { scissorTest = result; },
        clearDepth: () => depthClears++,
    };
    const engine = { world: { renderer }, ui: { draw(ctx, width, height) {
        assert.equal(ctx, context); assert.ok(width > 0 && height > 0); drawn++;
    } } };
    const overlay = attachNativeUIOverlay(engine, { createOffscreenCanvas: () => canvas, getWindowSize: () => ({ pixelRatio: 3 }) });
    let disposals = 0;
    overlay.texture.addEventListener('dispose', () => disposals++);
    const scene = new THREE.Scene(); scene.name = '3d';
    renderer.render(scene, new THREE.Camera());
    assert.deepEqual(order, ['3d', 'overlay']);
    assert.equal(depthClears, 1);
    assert.equal(drawn, 1);
    assert.deepEqual(transforms, [[3, 0, 0, 3, 0, 0]]);
    assert.equal(canvas.width, 1170); assert.equal(canvas.height, 2532);
    assert.equal(renderer.autoClear, true);
    assert.deepEqual(viewport.toArray(), initialViewport.toArray());
    assert.deepEqual(scissor.toArray(), initialScissor.toArray());
    assert.equal(scissorTest, true);
    const material = overlay.scene.children[0].material;
    assert.equal(material.transparent, true);
    assert.equal(material.depthTest, false);
    assert.equal(material.depthWrite, false);
    assert.equal(overlay.texture.version, 2);
    assert.equal(disposals, 1);
    renderer.render(scene, new THREE.Camera());
    assert.equal(disposals, 1, 'unchanged frames keep the allocated GPU texture');
    width = 430; height = 932; ratio = 2.625;
    renderer.render(scene, new THREE.Camera());
    assert.equal(canvas.width, 1128); assert.equal(canvas.height, 2446);
    assert.deepEqual(transforms.at(-1), [1128 / 430, 0, 0, 2446 / 932, 0, 0]);
    assert.equal(disposals, 2, 'a resize recreates immutable texture storage');
    assert.deepEqual(viewport.toArray(), initialViewport.toArray());
    assert.deepEqual(scissor.toArray(), initialScissor.toArray());
    assert.equal(scissorTest, true);
});

test('missing WebGL2 stops startup and presents a Chinese native error instead of a blank screen', () => {
    const { runtime, modals, host } = createHost({ webgl: null });
    const originalError = console.error;
    console.error = () => {};
    try { assert.equal(startNativeGame(runtime), null); } finally { console.error = originalError; }
    assert.equal(modals.length, 1);
    assert.match(modals[0].content, /WebGL2/);
    assert.match(modals[0].title, /启动失败/);
    assert.equal(modals[0].showCancel, false);
    assert.equal(host.GameGlobal.naiwaBootError, modals[0].content);
    assert.equal(host.GameGlobal.naiwaGame, undefined);
});
