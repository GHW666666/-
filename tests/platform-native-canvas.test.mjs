import test from 'node:test';
import assert from 'node:assert/strict';
import { PlatformAdapter } from '../game/adapter.js';

test('WeChat supplied main canvas stays shared with renderer and touch gestures', () => {
    const previous = globalThis.wx;
    const handlers = {};
    let creations = 0;
    const screen = { id: 'screen' };
    globalThis.wx = {
        createCanvas() { creations++; return { id: 'unexpected-second-screen' }; },
        getSystemInfoSync: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2 }),
        onTouchStart: callback => handlers.start = callback,
        onTouchMove: callback => handlers.move = callback,
        onTouchEnd: callback => handlers.end = callback,
    };
    try {
        const adapter = new PlatformAdapter();
        assert.equal(adapter.env, 'wechat');
        assert.equal(adapter.initCanvas(screen).canvas, screen);
        assert.equal(creations, 0);
        assert.deepEqual(adapter.getWindowSize(), { width: 375, height: 667, pixelRatio: 2 });
        const gestures = [];
        adapter.onGesture(type => gestures.push(type));
        handlers.start({ touches: [{ clientX: 100, clientY: 200 }] });
        handlers.end({ changedTouches: [{ clientX: 160, clientY: 200 }] });
        assert.deepEqual(gestures, ['swipe_right']);
    } finally {
        if (previous === undefined) delete globalThis.wx; else globalThis.wx = previous;
    }
});

test('WeChat creates a screen only when no canvas was supplied', () => {
    const previous = globalThis.wx;
    let creations = 0;
    const screen = { id: 'native-screen' };
    globalThis.wx = {
        createCanvas() { creations++; return screen; },
        getSystemInfoSync: () => ({ windowWidth: 375, windowHeight: 667 }),
        onTouchStart() {}, onTouchMove() {}, onTouchEnd() {},
    };
    try {
        const adapter = new PlatformAdapter();
        assert.equal(adapter.initCanvas().canvas, screen);
        assert.equal(creations, 1);
    } finally {
        if (previous === undefined) delete globalThis.wx; else globalThis.wx = previous;
    }
});
