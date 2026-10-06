/**
 * 奶娃快跑 - 微信 / 抖音小游戏原生入口文件
 * 当移植到微信小游戏或抖音小游戏项目工程根目录时，使用此文件作为主启动脚本
 */
import { GameEngine } from './game/main.js';
import { platform } from './game/adapter.js';

// 获取当前小游戏环境的全局全局主画布
let mainCanvas = null;
if (typeof wx !== 'undefined' && wx.createCanvas) {
    mainCanvas = wx.createCanvas();
} else if (typeof tt !== 'undefined' && tt.createCanvas) {
    mainCanvas = tt.createCanvas();
}

// 启动游戏引擎
const engine = new GameEngine();
engine.init(mainCanvas);

console.log('[奶娃快跑] 小游戏引擎初始化完毕，当前平台:', platform.env);
