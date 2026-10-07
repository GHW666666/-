import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 12);

export async function buildBrowser() {
    const result = await build({
        absWorkingDir: root,
        entryPoints: ['game/browserEntry.js'],
        outfile: 'game/browser.bundle.js',
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: 'es2020',
        minify: true,
        charset: 'utf8',
        legalComments: 'inline',
        write: false,
        metafile: true,
    });
    if (result.outputFiles.length !== 1) throw new Error('The local preview must be one self-contained script.');
    const output = result.outputFiles[0];
    const version = hash(output.contents);
    await fs.writeFile(output.path, output.contents);

    const indexPath = path.join(root, 'index.html');
    const html = await fs.readFile(indexPath, 'utf8');
    const cssVersion = hash(await fs.readFile(path.join(root, 'style.css')));
    const entry = `<script defer data-naiwa-bundle data-build="${version}" src="./game/browser.bundle.js?v=${version}"></script>`;
    const updated = html
        .replace(/<script\b[^>]*data-naiwa-bundle[^>]*>[\s\S]*?<\/script>/, entry)
        .replace(/href="style\.css(?:\?[^\"]*)?"/, `href="style.css?v=${cssVersion}"`);
    if (!updated.includes(entry)) throw new Error('index.html is missing its browser bundle entry.');
    if (updated !== html) await fs.writeFile(indexPath, updated);
    console.log(`Browser build ${version}: ${Math.round(output.contents.length / 1024)} KB, ${Object.keys(result.metafile.inputs).length} bundled modules.`);
    return version;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildBrowser();
