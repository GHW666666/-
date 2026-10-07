import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNativePixelRatio, configureNativeRenderResolution } from '../minigame/renderResolution.js';
import { World3D } from '../game/world3d.js';
import * as THREE from '../libs/three.module.js';

test('common native phones retain their real pixel density, including fractional DPR', () => {
    for (const pixelRatio of [1, 1.5, 2, 2.625, 3]) {
        assert.equal(selectNativePixelRatio({ width: 390, height: 844, pixelRatio }), pixelRatio);
    }
    assert.equal(selectNativePixelRatio({ width: 390, height: 844, pixelRatio: 4 }), 3);
    assert.equal(selectNativePixelRatio({ width: 390, height: 844, pixelRatio: NaN }), 1);
});

test('large screens and GL dimension limits bound the actual backing buffers', () => {
    for (const [width, height] of [[1024, 1366], [2160, 3840], [390, 844]]) {
        const limits = { maxWidth: 2048, maxHeight: 2048 };
        const ratio = selectNativePixelRatio({ width, height, pixelRatio: 4 }, limits);
        assert.ok(width * height * ratio * ratio <= 4_000_000 + 1e-6);
        assert.ok(width * ratio <= limits.maxWidth && height * ratio <= limits.maxHeight);
        assert.ok(ratio > 0 && ratio <= 3);
    }
    assert.equal(selectNativePixelRatio({ width: 390, height: 844, pixelRatio: 3 }, { maxHeight: 1024 }), 1024 / 844);
});

test('native resize updates DPR, logical camera layout, and physical buffer in one operation', () => {
    let size = { width: 390, height: 844, pixelRatio: 3 }, projections = 0;
    const allocations = [], gl = { MAX_RENDERBUFFER_SIZE: 1, MAX_VIEWPORT_DIMS: 2,
        getParameter: id => id === 1 ? 4096 : [4096, 4096] };
    const engine = {
        canvas: { get clientWidth() { return size.width; }, get clientHeight() { return size.height; } },
        world: { renderer: { capabilities: { maxTextureSize: 4096 }, getContext: () => gl,
            setDrawingBufferSize: (...args) => allocations.push(args) },
            camera: { updateProjectionMatrix: () => projections++ } },
    };
    configureNativeRenderResolution(engine, { getWindowSize: () => size });
    assert.deepEqual(allocations[0], [390, 844, 3]);
    assert.equal(engine.world.camera.aspect, 390 / 844);
    size = { width: 844, height: 390, pixelRatio: 2.625 }; engine.resize();
    assert.deepEqual(allocations[1], [844, 390, 2.625]);
    assert.equal(engine.world.camera.aspect, 844 / 390);
    assert.equal(projections, 2);
    assert.deepEqual(engine.nativeRenderInfo, size);
});

test('stable native lobby camera does not drift while browser camera and start transition remain available', () => {
    const world = { camera: new THREE.PerspectiveCamera(), stableLobbyCamera: true };
    for (const time of [0, .25, 1.3, 4.1, 20]) {
        World3D.prototype.setLobbyCamera.call(world, time);
        assert.deepEqual(world.camera.position.toArray(), [0, 1.25, -3.6]);
    }
    World3D.prototype.updateTransitionCamera.call(world, 0, { x: 0, y: 0, z: 0 });
    assert.deepEqual(world.camera.position.toArray(), [0, 1.25, -3.6]);
    world.stableLobbyCamera = false;
    World3D.prototype.setLobbyCamera.call(world, 1.3);
    assert.notEqual(world.camera.position.x, 0);
});
