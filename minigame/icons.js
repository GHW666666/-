/** Browser SVG artwork baked to package-local PNGs for the native wx canvas. */
export const NATIVE_ICON_PATHS = Object.freeze([
    'coin', 'trophy', 'map', 'wardrobe', 'achievement', 'rank', 'daily',
    'sound-on', 'sound-off',
    'skin-none', 'skin-nurse', 'skin-bandit', 'skin-street', 'skin-ufo',
    'skin-tv', 'skin-jellyfish', 'skin-mushroom', 'skin-zipper', 'skin-dumpling',
    'wing-none', 'wing-cream',
    'map-egypt', 'map-store', 'map-tea', 'map-pond', 'map-laundry',
].reduce((paths, key) => { paths[key] = `assets/ui/${key}.png`; return paths; }, {}));

// Separate runtimes/tests must never share native Image handles.
const caches = new WeakMap();
const validHost = wxApi => wxApi !== null
    && (typeof wxApi === 'object' || typeof wxApi === 'function')
    && typeof wxApi.createImage === 'function';
const knownKey = key => typeof key === 'string'
    && Object.prototype.hasOwnProperty.call(NATIVE_ICON_PATHS, key);

/** Returns only a loaded wx.Image; callers draw their vector fallback while pending. */
export function getNativeIcon(key, wxApi = typeof wx !== 'undefined' ? wx : null) {
    if (!knownKey(key) || !validHost(wxApi)) return null;
    let cache = caches.get(wxApi);
    if (!cache) { cache = new Map(); caches.set(wxApi, cache); }
    let entry = cache.get(key);
    if (!entry) {
        entry = { status: 'loading', image: null };
        cache.set(key, entry);
        try {
            const image = wxApi.createImage();
            if (!image) throw new Error('Native image creation unavailable.');
            entry.image = image;
            image.onload = () => {
                if (entry.status === 'loading') entry.status = 'ready';
            };
            image.onerror = () => { entry.status = 'failed'; entry.image = null; };
            image.src = NATIVE_ICON_PATHS[key];
        } catch {
            entry.status = 'failed'; entry.image = null;
        }
    }
    return entry.status === 'ready' ? entry.image : null;
}

/** Read-only diagnostics: checking status never starts another image request. */
export function nativeIconStatus(key, wxApi = typeof wx !== 'undefined' ? wx : null) {
    if (!knownKey(key)) return 'unknown';
    if (!validHost(wxApi)) return 'unavailable';
    return caches.get(wxApi)?.get(key)?.status || 'unloaded';
}
