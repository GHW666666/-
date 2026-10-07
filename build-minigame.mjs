import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));

export async function buildMinigame() {
    const musicName = 'naiwa-sunny-run.mp3';
    const musicSource = path.join(root, 'assets', 'audio', musicName);
    try {
        const musicStat = await fs.stat(musicSource);
        if (!musicStat.isFile() || musicStat.size === 0) throw new Error('音频文件为空或不是普通文件');
    } catch (error) {
        throw new Error(`小游戏构建缺少原创 BGM：assets/audio/${musicName}。请先生成或恢复此 MP3 文件。`, { cause: error });
    }
    const nativeUI = path.join(root, 'minigame', 'ui.js');
    const result = await build({
        absWorkingDir: root,
        entryPoints: ['minigame/entry.js'],
        outfile: 'minigame/game.js',
        bundle: true,
        format: 'cjs',
        platform: 'browser',
        target: 'es2018',
        minify: true,
        charset: 'utf8',
        legalComments: 'inline',
        write: false,
        metafile: true,
        plugins: [{
            name: 'native-canvas-ui',
            setup(bundler) {
                bundler.onResolve({ filter: /^\.\/ui\.js$/ }, args => {
                    if (path.resolve(args.resolveDir) === path.join(root, 'game')) return { path: nativeUI };
                });
            },
        }],
    });
    if (result.outputFiles.length !== 1) throw new Error('Mini game must have one self-contained entry.');
    if (Object.values(result.metafile.outputs).some(output => output.imports.some(entry => entry.external))) throw new Error('Mini game has an unresolved runtime dependency.');
    if (Object.keys(result.metafile.inputs).includes('game/ui.js')) throw new Error('Browser HTML UI entered the mini game package.');
    const musicTarget = path.join(root, 'minigame', 'assets', 'audio');
    await fs.mkdir(musicTarget, { recursive: true });
    // Package only the compressed runtime track; the WAV master is a browser/source artifact.
    await fs.copyFile(musicSource, path.join(musicTarget, musicName));
    const output = result.outputFiles[0];
    await fs.writeFile(output.path, output.contents);
    const hash = createHash('sha256').update(output.contents).digest('hex').slice(0, 12);
    const info = { hash, bytes: output.contents.length, modules: Object.keys(result.metafile.inputs).length, entry: 'game.js', ui: 'native-canvas' };
    await fs.writeFile(path.join(root, 'minigame', 'build-info.json'), JSON.stringify(info, null, 2) + '\n');
    console.log(`WeChat mini game ${hash}: ${Math.round(info.bytes / 1024)} KB, ${info.modules} bundled modules, native Canvas UI.`);
    return info;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildMinigame();
