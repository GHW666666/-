/** Match the native screen's pixel density without allocating unbounded buffers. */
const MAX_PIXEL_RATIO = 3;
const MAX_FRAME_PIXELS = 4_000_000;
const positive = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;

export function selectNativePixelRatio({ width, height, pixelRatio }, limits = {}) {
    const w = positive(width, 375), h = positive(height, 667);
    return Math.min(
        positive(pixelRatio, 1), MAX_PIXEL_RATIO,
        Math.sqrt(MAX_FRAME_PIXELS / (w * h)),
        positive(limits.maxWidth, Infinity) / w,
        positive(limits.maxHeight, Infinity) / h,
    );
}

function renderLimits(renderer) {
    let maxBuffer = Infinity, viewport = [Infinity, Infinity];
    try {
        const gl = renderer.getContext();
        maxBuffer = positive(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), Infinity);
        viewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || viewport;
    } catch { /* The renderer's texture limit remains available on older hosts. */ }
    const texture = positive(renderer.capabilities?.maxTextureSize, Infinity);
    return {
        maxWidth: Math.min(texture, maxBuffer, positive(viewport[0], Infinity)),
        maxHeight: Math.min(texture, maxBuffer, positive(viewport[1], Infinity)),
    };
}

/** The existing resize listener calls engine.resize dynamically, including native rotation. */
export function configureNativeRenderResolution(engine, bridge) {
    const renderer = engine.world.renderer, limits = renderLimits(renderer);
    engine.resize = () => {
        const size = bridge.getWindowSize();
        const width = positive(engine.canvas.clientWidth, size.width);
        const height = positive(engine.canvas.clientHeight, size.height);
        const pixelRatio = selectNativePixelRatio({ ...size, width, height }, limits);
        renderer.setDrawingBufferSize(width, height, pixelRatio);
        engine.world.camera.aspect = width / height;
        engine.world.camera.updateProjectionMatrix();
        // Keep inspection available without exposing renderer details in the product UI.
        engine.nativeRenderInfo = { width, height, pixelRatio };
    };
    engine.resize();
}
