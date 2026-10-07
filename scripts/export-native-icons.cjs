/** Run with node scripts/export-native-icons.cjs. No network or image-generation API. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const outputDirectory = path.join(root, 'minigame', 'assets', 'ui');

function loadPlaywright() {
    try { return require('playwright'); }
    catch { return require('C:/Users/31219/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
}

async function exportNativeIcons() {
    const [html, css, uiSource] = await Promise.all([
        fs.readFile(path.join(root, 'index.html'), 'utf8'),
        fs.readFile(path.join(root, 'style.css'), 'utf8'),
        fs.readFile(path.join(root, 'game', 'ui.js'), 'utf8'),
    ]);
    await fs.mkdir(outputDirectory, { recursive: true });
    const browser = await loadPlaywright().chromium.launch({
        channel: 'chrome', headless: true,
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    try {
        const context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        // Load the real DOM and CSS without game startup, remote fonts, or URL requests.
        await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, ''));
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: uiSource.replace(/^export\s+(?=class\s+UIManager\b)/m, '')
            + '\nwindow.__nativeIconSources = { mapPreview, wardrobePreviewIcon, UIManager };' });
        const drawings = await page.evaluate(() => {
            const result = {};
            const resolvedSVG = svg => {
                const clone = svg.cloneNode(true);
                const originals = [svg, ...svg.querySelectorAll('*')];
                const copies = [clone, ...clone.querySelectorAll('*')];
                // Resolve CSS/currentColor inside the actual browser UI before isolating SVG.
                const properties = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                    'fill-opacity', 'stroke-opacity', 'opacity', 'color'];
                originals.forEach((original, i) => {
                    const style = getComputedStyle(original);
                    for (const property of properties) copies[i].style.setProperty(property, style.getPropertyValue(property));
                });
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                clone.setAttribute('width', '128'); clone.setAttribute('height', '128');
                clone.style.width = '128px'; clone.style.height = '128px';
                clone.style.display = 'block'; clone.style.position = 'static';
                clone.style.background = 'transparent';
                return new XMLSerializer().serializeToString(clone);
            };
            const selectors = {
                coin: '#lobbyCoinsPill .pill-icon svg', trophy: '#lobbyRankPill .pill-icon svg',
                map: '#btnOpenMaps svg', wardrobe: '#btnOpenWardrobe svg',
                achievement: '#btnOpenAchievements svg', rank: '#btnOpenRank svg', daily: '#btnOpenDaily svg',
            };
            for (const [key, selector] of Object.entries(selectors)) {
                const svg = document.querySelector(selector);
                if (!svg) throw new Error(`Browser icon missing: ${key}`);
                result[key] = resolvedSVG(svg);
            }
            const source = window.__nativeIconSources;
            const holder = document.createElement('span'); document.body.append(holder);
            const resolveMarkup = markup => { holder.innerHTML = markup; return resolvedSVG(holder.querySelector('svg')); };
            for (const id of ['none', 'nurse', 'bandit', 'street', 'ufo', 'tv', 'jellyfish', 'mushroom', 'zipper', 'dumpling']) {
                result[`skin-${id}`] = resolveMarkup(source.wardrobePreviewIcon(id, 'outfit'));
            }
            for (const id of ['none', 'cream']) result[`wing-${id}`] = resolveMarkup(source.wardrobePreviewIcon(id, 'wing'));
            for (const id of ['egypt', 'store', 'tea', 'pond', 'laundry']) result[`map-${id}`] = resolveMarkup(source.mapPreview({ id }));
            const soundBody = '<path d="M5 12h5l7-6v20l-7-6H5Z" fill="#a8c1a7"/><path d="M10 12v8" stroke="#5b846e" stroke-width="1.4" stroke-linecap="round"/>';
            for (const muted of [false, true]) {
                const ui = Object.create(source.UIManager.prototype); ui.dom = { muteIcon: holder };
                ui.updateMuteIcon(muted);
                if (!holder.querySelector('svg')) {
                    // Older HTML used platform-dependent emoji; keep the same speaker semantics in vector form.
                    holder.innerHTML = `<svg viewBox="0 0 32 32" fill="none">${soundBody}${muted
                        ? '<path d="m5 5 22 22" stroke="#d8838a" stroke-width="2" stroke-linecap="round"/>'
                        : '<path d="M21 11q5 5 0 10M24 7q9 9 0 18" stroke="#5b846e" stroke-width="1.7" stroke-linecap="round"/>'}</svg>`;
                }
                result[muted ? 'sound-off' : 'sound-on'] = resolvedSVG(holder.querySelector('svg'));
            }
            return result;
        });
        const manifest = { size: 128, source: 'Existing browser inline SVGs, resolved CSS; native PNG export', assets: {} };
        for (const [key, svg] of Object.entries(drawings)) {
            await page.setContent('<!doctype html><html><body style="margin:0;background:transparent">' + svg + '</body></html>');
            const pixels = await page.locator('svg').screenshot({ omitBackground: true });
            const filename = `${key}.png`;
            await fs.writeFile(path.join(outputDirectory, filename), pixels);
            manifest.assets[key] = { path: `assets/ui/${filename}`, bytes: pixels.length,
                sha256: createHash('sha256').update(pixels).digest('hex') };
        }
        await fs.writeFile(path.join(outputDirectory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
        console.log(`Exported ${Object.keys(drawings).length} native PNG icons to ${outputDirectory}.`);
    } finally { await browser.close(); }
}

if (require.main === module) exportNativeIcons().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { exportNativeIcons };
