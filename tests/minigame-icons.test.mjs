import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inflateSync } from 'node:zlib';
import { getNativeIcon, nativeIconStatus, NATIVE_ICON_PATHS } from '../minigame/icons.js';

function host(options = {}) {
    const images = [];
    return {
        images,
        createImage() {
            if (options.throwCreate) throw new Error('createImage unavailable');
            const image = {
                set src(value) {
                    if (options.throwSource) throw new Error('invalid resource');
                    this.requestedSource = value;
                    if (options.immediate) this.onload();
                },
            };
            images.push(image);
            return image;
        },
    };
}

test('native icons load package-local PNG once and return only after onload', () => {
    const wxApi = host();
    assert.equal(nativeIconStatus('coin', wxApi), 'unloaded');
    assert.equal(getNativeIcon('coin', wxApi), null);
    assert.equal(nativeIconStatus('coin', wxApi), 'loading');
    assert.equal(wxApi.images[0].requestedSource, 'assets/ui/coin.png');
    for (let i = 0; i < 20; i++) assert.equal(getNativeIcon('coin', wxApi), null);
    assert.equal(wxApi.images.length, 1);
    wxApi.images[0].onload();
    assert.equal(getNativeIcon('coin', wxApi), wxApi.images[0]);
    assert.equal(nativeIconStatus('coin', wxApi), 'ready');
    assert.equal(wxApi.images.length, 1);
});

test('native image handles are scoped to each wx runtime and icon key', () => {
    const first = host(), second = host();
    getNativeIcon('map', first); getNativeIcon('map', second); getNativeIcon('wardrobe', first);
    first.images[0].onload(); second.images[0].onload(); first.images[1].onload();
    assert.notEqual(getNativeIcon('map', first), getNativeIcon('map', second));
    assert.notEqual(getNativeIcon('map', first), getNativeIcon('wardrobe', first));
    assert.equal(first.images.length, 2); assert.equal(second.images.length, 1);
});

test('failed image loads retain the vector fallback without repeated requests', () => {
    const wxApi = host();
    getNativeIcon('sound-off', wxApi); wxApi.images[0].onerror(new Error('missing image'));
    assert.equal(nativeIconStatus('sound-off', wxApi), 'failed');
    for (let i = 0; i < 20; i++) assert.equal(getNativeIcon('sound-off', wxApi), null);
    assert.equal(wxApi.images.length, 1);
    // A spurious late load event must not expose the invalid image.
    wxApi.images[0].onload(); assert.equal(getNativeIcon('sound-off', wxApi), null);
});

test('unsupported hosts, unknown keys, and native create/source failures are safe', () => {
    for (const value of [null, undefined, false, 'wx', 1, {}, { createImage: false }]) {
        assert.equal(getNativeIcon('coin', value), null);
        assert.equal(nativeIconStatus('coin', value), 'unavailable');
    }
    const wxApi = host();
    for (const key of ['__proto__', 'constructor', 'toString', '../coin', '', null, {}]) {
        assert.equal(getNativeIcon(key, wxApi), null);
        assert.equal(nativeIconStatus(key, wxApi), 'unknown');
    }
    assert.equal(wxApi.images.length, 0);
    for (const options of [{ throwCreate: true }, { throwSource: true }]) {
        const faultyHost = host(options);
        assert.equal(getNativeIcon('coin', faultyHost), null);
        assert.equal(nativeIconStatus('coin', faultyHost), 'failed');
        assert.equal(getNativeIcon('coin', faultyHost), null);
        assert.ok(faultyHost.images.length <= 1);
    }
    const immediate = host({ immediate: true });
    assert.equal(getNativeIcon('coin', immediate), immediate.images[0]);
});

test('default wx host works without DOM, fetch, or browser Image', () => {
    const previous = globalThis.wx;
    try {
        delete globalThis.wx;
        assert.equal(getNativeIcon('rank'), null);
        const wxApi = host({ immediate: true }); globalThis.wx = wxApi;
        assert.equal(getNativeIcon('rank'), wxApi.images[0]);
        assert.equal(nativeIconStatus('rank'), 'ready');
    } finally {
        if (previous === undefined) delete globalThis.wx; else globalThis.wx = previous;
    }
});

/** Decode the browser's RGBA PNG scanlines to check real transparency, not just the header. */
function pngPixels(buffer) {
    assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    const parts = []; let width, height;
    for (let offset = 8; offset < buffer.length;) {
        const size = buffer.readUInt32BE(offset), kind = buffer.toString('ascii', offset + 4, offset + 8);
        const bytes = buffer.subarray(offset + 8, offset + 8 + size);
        if (kind === 'IHDR') {
            width = bytes.readUInt32BE(0); height = bytes.readUInt32BE(4);
            assert.equal(bytes[8], 8, '8-bit image'); assert.equal(bytes[9], 6, 'RGBA image'); assert.equal(bytes[12], 0, 'non-interlaced');
        } else if (kind === 'IDAT') parts.push(bytes);
        offset += size + 12;
    }
    const packed = inflateSync(Buffer.concat(parts)), stride = width * 4;
    assert.equal(packed.length, (stride + 1) * height);
    const pixels = Buffer.alloc(stride * height);
    const paeth = (a, b, c) => {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    };
    for (let y = 0; y < height; y++) {
        const filter = packed[y * (stride + 1)]; assert.ok(filter <= 4);
        for (let x = 0; x < stride; x++) {
            const i = y * stride + x, left = x >= 4 ? pixels[i - 4] : 0;
            const up = y ? pixels[i - stride] : 0, upperLeft = y && x >= 4 ? pixels[i - stride - 4] : 0;
            const predictor = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, upperLeft)][filter];
            pixels[i] = (packed[y * (stride + 1) + x + 1] + predictor) & 255;
        }
    }
    return { width, height, pixels };
}

test('every registered package icon is a real 128px PNG with visible multicolor art and transparent pixels', () => {
    assert.equal(Object.keys(NATIVE_ICON_PATHS).length, 26);
    for (const [key, source] of Object.entries(NATIVE_ICON_PATHS)) {
        const image = fs.readFileSync(new URL(`../minigame/${source}`, import.meta.url));
        const { width, height, pixels } = pngPixels(image);
        assert.equal(width, 128, key); assert.equal(height, 128, key);
        let transparent = 0, visible = 0; const colors = new Set();
        for (let i = 0; i < pixels.length; i += 4) {
            if (!pixels[i + 3]) transparent++;
            else { visible++; colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`); }
        }
        assert.ok(transparent > 20, `${key}: transparent background`);
        assert.ok(visible > 100, `${key}: artwork is not empty`);
        assert.ok(colors.size > 3, `${key}: rendered artwork colors`);
    }
});
