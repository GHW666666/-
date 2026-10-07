/** The native host bridge. HTML/CSS widgets are intentionally not emulated. */
function eventTarget(target) {
    const listeners = new Map();
    target.addEventListener = (type, callback) => {
        if (typeof callback !== 'function') return;
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(callback);
    };
    target.removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
    target.dispatchEvent = event => {
        for (const callback of [...(listeners.get(event.type) || [])]) callback.call(target, event);
        return !event.defaultPrevented;
    };
    return target;
}

function publish(target, key, value) {
    try { target[key] = value; } catch (_) { /* Some host globals are readonly. */ }
    if (target[key] === value) return;
    try { Object.defineProperty(target, key, { value, configurable: true, writable: true }); } catch (_) { /* Native equivalent wins. */ }
}

function getter(target, key, read) {
    try { Object.defineProperty(target, key, { get: read, configurable: true }); } catch (_) { /* Native equivalent wins. */ }
}

export function installWeChatRuntime(wxApi, host = globalThis) {
    if (!wxApi?.createCanvas) throw new Error('请在微信小游戏环境运行此入口。');
    if (host.__naiwaRuntime) return host.__naiwaRuntime;
    const gameGlobal = host.GameGlobal || (host === globalThis && typeof GameGlobal !== 'undefined' ? GameGlobal : host);
    const readWindow = () => {
        let info = {};
        try { info = wxApi.getWindowInfo ? wxApi.getWindowInfo() : wxApi.getSystemInfoSync(); } catch (_) { /* Defaults below. */ }
        return {
            width: Math.max(1, Number(info.windowWidth) || 375),
            height: Math.max(1, Number(info.windowHeight) || 667),
            pixelRatio: Math.max(1, Number(info.pixelRatio) || 1),
            safeArea: info.safeArea || null,
        };
    };
    let size = readWindow();
    // The first native canvas is the only screen canvas. All other drawings are textures.
    const canvas = wxApi.createCanvas();
    const windowBridge = eventTarget({});
    const documentBridge = eventTarget({ hidden: false, visibilityState: 'visible' });
    const adaptCanvas = (value, screen = false) => {
        if (!value) throw new Error('微信画布创建失败。');
        if (!value.style) publish(value, 'style', {});
        if (!value.addEventListener || !value.removeEventListener) eventTarget(value);
        if (!value.getBoundingClientRect) value.getBoundingClientRect = () => {
            const width = screen ? size.width : value.width;
            const height = screen ? size.height : value.height;
            return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: height, width, height };
        };
        const attrs = new Map();
        if (!value.setAttribute) value.setAttribute = (name, attribute) => attrs.set(name, String(attribute));
        if (!value.getAttribute) value.getAttribute = name => attrs.get(name) ?? null;
        if (!value.hasAttribute) value.hasAttribute = name => attrs.has(name);
        if (screen) {
            getter(value, 'clientWidth', () => size.width);
            getter(value, 'clientHeight', () => size.height);
        } else {
            getter(value, 'clientWidth', () => value.width);
            getter(value, 'clientHeight', () => value.height);
        }
        publish(value, 'ownerDocument', documentBridge);
        return value;
    };
    adaptCanvas(canvas, true);
    canvas.width = size.width; canvas.height = size.height;

    const createOffscreenCanvas = (width = 1, height = 1) => {
        let value;
        if (typeof wxApi.createOffscreenCanvas === 'function') {
            try { value = wxApi.createOffscreenCanvas({ type: '2d', width, height }); } catch (_) { /* Older hosts support detached createCanvas. */ }
        }
        if (!value) value = wxApi.createCanvas();
        adaptCanvas(value);
        value.width = width; value.height = height;
        return value;
    };
    documentBridge.createElement = name => {
        if (name === 'canvas') return createOffscreenCanvas();
        if (name === 'img' || name === 'image') return wxApi.createImage();
        throw new Error(`原生小游戏不提供 HTML 元素：${name}`);
    };
    documentBridge.createElementNS = (_namespace, name) => documentBridge.createElement(name);
    documentBridge.getElementById = id => id === 'gameCanvas' ? canvas : null;
    documentBridge.querySelector = () => null;
    documentBridge.documentElement = { dataset: {}, clientWidth: size.width, clientHeight: size.height };
    getter(windowBridge, 'innerWidth', () => size.width);
    getter(windowBridge, 'innerHeight', () => size.height);
    getter(windowBridge, 'devicePixelRatio', () => size.pixelRatio);
    const nativePerformance = wxApi.getPerformance?.();
    const performanceBridge = host.performance?.now
        ? host.performance
        // wx Performance.now() reports microseconds; the engine uses browser milliseconds.
        : nativePerformance?.now ? { now: () => nativePerformance.now() / 1000 } : { now: () => Date.now() };
    const nativeRAF = host.requestAnimationFrame || gameGlobal.requestAnimationFrame || canvas.requestAnimationFrame || wxApi.requestAnimationFrame;
    const nativeCancelRAF = host.cancelAnimationFrame || gameGlobal.cancelAnimationFrame || canvas.cancelAnimationFrame || wxApi.cancelAnimationFrame;
    const requestFrame = nativeRAF
        ? callback => nativeRAF.call(nativeRAF === canvas.requestAnimationFrame ? canvas : gameGlobal, () => callback(performanceBridge.now()))
        : callback => setTimeout(() => callback(performanceBridge.now()), 16);
    const cancelFrame = nativeCancelRAF
        ? handle => nativeCancelRAF.call(nativeCancelRAF === canvas.cancelAnimationFrame ? canvas : gameGlobal, handle)
        : clearTimeout;
    Object.assign(windowBridge, {
        document: documentBridge, canvas, performance: performanceBridge,
        requestAnimationFrame: requestFrame, cancelAnimationFrame: cancelFrame,
        setTimeout, clearTimeout, setInterval, clearInterval,
    });
    if (wxApi.createWebAudioContext) {
        // A constructor can return the native context, preserving the existing synth code.
        windowBridge.AudioContext = function WeChatAudioContext() { return wxApi.createWebAudioContext(); };
    }
    const navigatorBridge = { userAgent: 'WeChat MiniGame', platform: 'wechat' };
    windowBridge.navigator = navigatorBridge;
    windowBridge.window = windowBridge;
    windowBridge.self = windowBridge;
    const runtime = {
        wx: wxApi, canvas, window: windowBridge, document: documentBridge,
        createOffscreenCanvas, getWindowSize: () => ({ ...size }),
        expose(name, value) { publish(host, name, value); publish(gameGlobal, name, value); windowBridge[name] = value; },
        reportError(error) {
            const detail = error?.message || String(error);
            const content = /WebGL|webgl/i.test(detail)
                ? `当前设备未能创建 WebGL2 画布，请更新微信和开发者工具，或换一台支持 WebGL2 的设备测试。\n${detail}`
                : `游戏启动遇到问题：${detail}`;
            runtime.expose('naiwaBootError', content);
            console.error('[奶蛙快跑] 启动失败', error);
            if (wxApi.showModal) wxApi.showModal({ title: '奶蛙快跑启动失败', content: content.slice(0, 900), showCancel: false });
            else {
                try {
                    const context = canvas.getContext('2d');
                    if (context) {
                        context.fillStyle = '#fff5df'; context.fillRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = '#4a4f40'; context.font = '16px sans-serif';
                        context.fillText('奶蛙快跑启动失败', 20, 45);
                        context.fillText('请更新微信或使用支持 WebGL2 的设备。', 20, 80);
                    }
                } catch (_) { /* A WebGL canvas cannot switch to a 2D context. */ }
            }
        },
    };
    for (const [name, value] of Object.entries({
        window: windowBridge, self: windowBridge, document: documentBridge, canvas,
        navigator: navigatorBridge, performance: performanceBridge,
    })) runtime.expose(name, value);
    runtime.expose('requestAnimationFrame', requestFrame);
    runtime.expose('cancelAnimationFrame', cancelFrame);
    runtime.expose('__naiwaRuntime', runtime);
    wxApi.onWindowResize?.(event => {
        const info = readWindow();
        size = { ...info, width: Number(event?.size?.windowWidth) || info.width, height: Number(event?.size?.windowHeight) || info.height };
        documentBridge.documentElement.clientWidth = size.width;
        documentBridge.documentElement.clientHeight = size.height;
        windowBridge.dispatchEvent({ type: 'resize' });
    });
    wxApi.onHide?.(() => {
        documentBridge.hidden = true; documentBridge.visibilityState = 'hidden';
        documentBridge.dispatchEvent({ type: 'visibilitychange' });
        windowBridge.dispatchEvent({ type: 'pagehide' });
    });
    wxApi.onShow?.(() => {
        documentBridge.hidden = false; documentBridge.visibilityState = 'visible';
        documentBridge.dispatchEvent({ type: 'visibilitychange' });
        windowBridge.dispatchEvent({ type: 'pageshow' });
    });
    return runtime;
}

// Dependency evaluation runs this bridge before importing the shared engine and Three.js.
export const runtime = typeof wx !== 'undefined' && wx.createCanvas ? installWeChatRuntime(wx) : null;
