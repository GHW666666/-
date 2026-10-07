import { runtime } from './runtime.js';
import { GameEngine } from '../game/main.js';
import { platform } from '../game/adapter.js';
import { audio } from '../game/audio.js';
import * as THREE from '../libs/three.module.js';
import { configureNativeRenderResolution } from './renderResolution.js';

/** Native HUD is a transparent texture over the same 3D screen, never a second screen canvas. */
export function attachNativeUIOverlay(engine, bridge, three = THREE) {
    const renderer = engine.world.renderer;
    const canvas = bridge.createOffscreenCanvas();
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建小游戏界面的离屏 2D 画布。');
    const texture = new three.CanvasTexture(canvas);
    texture.colorSpace = three.SRGBColorSpace;
    texture.minFilter = texture.magFilter = three.LinearFilter;
    texture.generateMipmaps = false;
    const scene = new three.Scene();
    const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const plane = new three.Mesh(new three.PlaneGeometry(2, 2), new three.MeshBasicMaterial({
        map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    }));
    plane.position.z = -.5; plane.frustumCulled = false; scene.add(plane);
    const viewport = new three.Vector4();
    const scissor = new three.Vector4();
    const viewportSize = new three.Vector2();
    const drawingBufferSize = new three.Vector2();
    const originalRender = renderer.render.bind(renderer);
    let drawing = false;
    renderer.render = (worldScene, worldCamera) => {
        const result = originalRender(worldScene, worldCamera);
        if (drawing || worldScene === scene || renderer.getRenderTarget() !== null) return result;
        drawing = true;
        const autoClear = renderer.autoClear;
        const scissorTest = renderer.getScissorTest();
        renderer.getViewport(viewport); renderer.getScissor(scissor);
        try {
            renderer.getSize(viewportSize);
            const width = viewportSize.x, height = viewportSize.y;
            renderer.getDrawingBufferSize(drawingBufferSize);
            const pixelsX = Math.max(1, drawingBufferSize.x);
            const pixelsY = Math.max(1, drawingBufferSize.y);
            if (canvas.width !== pixelsX || canvas.height !== pixelsY) {
                canvas.width = pixelsX; canvas.height = pixelsY;
                // Three's immutable texture storage must be allocated again at the new size.
                texture.dispose();
            }
            context.setTransform(pixelsX / width, 0, 0, pixelsY / height, 0, 0);
            context.clearRect(0, 0, width, height);
            engine.ui.draw(context, width, height);
            texture.needsUpdate = true;
            renderer.setScissorTest(false); renderer.setViewport(0, 0, width, height);
            renderer.autoClear = false;
            renderer.clearDepth();
            originalRender(scene, camera);
        } finally {
            renderer.autoClear = autoClear;
            renderer.setViewport(viewport); renderer.setScissor(scissor); renderer.setScissorTest(scissorTest);
            drawing = false;
        }
        return result;
    };
    return { canvas, texture, scene, camera };
}

export function connectNativeUIInput(engine, bridge, adapter) {
    let consumed = false;
    let active = false;
    const position = (event, ended = false) => {
        const touch = (ended ? event?.changedTouches : event?.touches)?.[0];
        return touch ? { x: Number(touch.clientX ?? touch.x) || 0, y: Number(touch.clientY ?? touch.y) || 0 } : null;
    };
    const originalNotify = adapter.notifyGesture.bind(adapter);
    adapter.notifyGesture = (gesture, data) => {
        if (!consumed) originalNotify(gesture, data);
    };
    bridge.wx.onTouchStart?.(event => {
        const point = position(event); if (!point) return;
        active = true; consumed = Boolean(engine.ui.onPointerStart?.(point.x, point.y));
    });
    bridge.wx.onTouchMove?.(event => {
        const point = position(event); if (!point || !active) return;
        consumed = Boolean(engine.ui.onPointerMove?.(point.x, point.y)) || consumed;
    });
    bridge.wx.onTouchEnd?.(event => {
        const point = position(event, true);
        if (point && active) consumed = Boolean(engine.ui.onPointerEnd?.(point.x, point.y)) || consumed;
        active = false;
        // Preserve consumption until the next start: adapter's end listener fires after this one.
    });
    bridge.wx.onTouchCancel?.(() => {
        active = false; consumed = true;
        engine.ui.onPointerCancel?.();
    });
}

export function startNativeGame(bridge = runtime) {
    if (!bridge) throw new Error('请使用微信开发者工具导入小游戏目录。');
    try {
        const gl = bridge.canvas.getContext('webgl2', { antialias: true, alpha: false });
        if (!gl) throw new Error('WebGL2 上下文不可用。');
        const engine = new GameEngine();
        bridge.expose('naiwaGame', engine);
        // Input must be registered before adapter.initCanvas to consume UI gestures first.
        connectNativeUIInput(engine, bridge, platform);
        engine.init(bridge.canvas);
        if (!engine.world?.renderer) throw new Error('3D 场景初始化没有完成。');
        engine.world.stableLobbyCamera = true;
        engine.world.setLobbyCamera(0);
        configureNativeRenderResolution(engine, bridge);
        engine.nativeUIOverlay = attachNativeUIOverlay(engine, bridge);
        bridge.window.addEventListener('pagehide', () => {
            if (engine.state === 'PLAYING') engine.pause();
            audio.stopBGM(); engine.flushProgress();
        });
        bridge.window.addEventListener('pageshow', () => { engine.lastTime = performance.now(); });
        // Paint the initial page immediately; later rendering uses the engine's RAF loop.
        engine.world.render();
        console.log('[奶蛙快跑] 微信小游戏已启动，3D 场景与原生界面使用同一画布。');
        return engine;
    } catch (error) {
        bridge.reportError(error);
        return null;
    }
}

if (runtime) startNativeGame(runtime);
