/**
 * build-minigame.js
 * 自动化打包构建小游戏发布包（适配微信小游戏与抖音小游戏）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'dist-minigame');

async function buildMinigame() {
  console.log('🚀 开始构建小游戏发布包...');

  // 1. 清空或创建输出目录
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 2. 使用 Vite 进行前端工程打包
  await build({
    root: rootDir,
    build: {
      outDir: path.join(outDir, 'web'),
      emptyOutDir: true,
      lib: {
        entry: path.resolve(rootDir, 'main.js'),
        name: 'NaiwaRunner',
        fileName: () => 'bundle.js',
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          extend: true
        }
      }
    }
  });

  // 3. 复制 game.json 与 project.config.json
  fs.copyFileSync(path.resolve(rootDir, 'game.json'), path.resolve(outDir, 'game.json'));
  fs.copyFileSync(path.resolve(rootDir, 'project.config.json'), path.resolve(outDir, 'project.config.json'));

  // 4. 创建统一小游戏启动入口 game.js
  const gameEntryContent = `/**
 * 奶娃跑跑 - 小游戏总入口 (微信/抖音双端自适应)
 */
const platform = typeof tt !== 'undefined' ? 'douyin' : (typeof wx !== 'undefined' ? 'wechat' : 'browser');
console.log('🎮 启动奶娃跑跑小游戏, 当前平台:', platform);

// 引入适配层与游戏核心包
require('./web/bundle.js');
`;
  fs.writeFileSync(path.resolve(outDir, 'game.js'), gameEntryContent, 'utf-8');

  console.log('✅ 小游戏工程构建完成！输出目录:', outDir);
  console.log('💡 可直接在微信开发者工具中打开当前项目或 dist-minigame 目录进行调试预览。');
}

buildMinigame().catch(err => {
  console.error('❌ 构建失败:', err);
  process.exit(1);
});
