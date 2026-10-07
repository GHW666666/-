import fs from "fs";
import path from "path";
import { fileURLToPath } from 'node:url';
import { buildBrowser } from './build-browser.mjs';

await buildBrowser();
const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
// Resolve the release folder before removing it, including a possible link.
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Invalid release directory');
if (fs.existsSync(dist)) {
  const resolved = fs.realpathSync(dist);
  if (path.dirname(resolved) !== fs.realpathSync(root) || path.basename(resolved) !== 'dist') throw new Error('Release directory points outside the project');
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

// Copy website files to dist
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, "index.html"));
fs.copyFileSync(path.join(root, 'style.css'), path.join(dist, "style.css"));
// The browser bundle contains all game code and Three.js. Ship only the
// asset it loads at runtime, rather than development sources and artwork.
fs.mkdirSync(path.join(dist, 'game'), { recursive: true });
fs.copyFileSync(path.join(root, 'game', 'browser.bundle.js'), path.join(dist, 'game', 'browser.bundle.js'));
fs.mkdirSync(path.join(dist, 'assets', 'audio'), { recursive: true });
fs.copyFileSync(path.join(root, 'assets', 'audio', 'naiwa-sunny-run.mp3'), path.join(dist, 'assets', 'audio', 'naiwa-sunny-run.mp3'));

console.log("Built dist successfully!");
