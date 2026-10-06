/**
 * UIManager.js
 * 响应式高颜值魔性 UI 界面系统（HUD顶栏、狂暴特效预警、结算与看广告复活弹窗）
 */

import { Audio } from '../platform/AudioSynth.js';
import { Platform } from '../platform/Platform.js';

export class UIManager {
  constructor(onStart, onRestart, onRevive) {
    this.onStart = onStart;
    this.onRestart = onRestart;
    this.onRevive = onRevive;

    this.container = null;
    this.hudElement = null;
    this.menuElement = null;
    this.gameOverElement = null;

    this.initStyles();
    this.createDOM();
  }

  initStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #game-ui {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #fff;
        z-index: 100;
        overflow: hidden;
      }
      .interactive {
        pointer-events: auto;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff7b00, #ff3c00);
        color: #fff;
        font-weight: 800;
        font-size: 20px;
        padding: 14px 38px;
        border-radius: 36px;
        border: 3px solid #ffe600;
        box-shadow: 0 8px 24px rgba(255, 60, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: transform 0.1s, filter 0.1s;
      }
      .btn:active {
        transform: scale(0.94);
      }
      .btn-ad {
        background: linear-gradient(135deg, #00c853, #009624);
        border-color: #b9f6ca;
        box-shadow: 0 8px 24px rgba(0, 200, 83, 0.45);
      }
      .btn-share {
        background: linear-gradient(135deg, #2979ff, #1565c0);
        border-color: #82b1ff;
        box-shadow: 0 8px 24px rgba(41, 121, 255, 0.45);
      }
      /* 顶部 HUD */
      #hud {
        position: absolute;
        top: 20px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 0 24px;
        box-sizing: border-box;
      }
      .hud-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(8px);
        padding: 8px 18px;
        border-radius: 24px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        font-size: 19px;
        font-weight: 900;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      }
      /* 牛逼近危险红框警戒 */
      #danger-warning {
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(220, 20, 60, 0.9);
        padding: 8px 22px;
        border-radius: 20px;
        border: 2px solid #ffeb3b;
        font-weight: 900;
        font-size: 17px;
        animation: pulseWarning 0.4s infinite alternate;
        display: none;
      }
      @keyframes pulseWarning {
        from { transform: translateX(-50%) scale(1); opacity: 0.9; }
        to { transform: translateX(-50%) scale(1.1); opacity: 1; }
      }
      /* 状态弹窗模态框 */
      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 24px;
        box-sizing: border-box;
      }
      .title-box {
        text-align: center;
      }
      .title-main {
        font-size: 44px;
        font-weight: 900;
        color: #ffeb3b;
        text-shadow: 0 4px 16px rgba(255, 87, 34, 0.9), 0 0 8px #000;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }
      .title-sub {
        font-size: 18px;
        color: #fff;
        font-weight: 700;
        text-shadow: 0 2px 8px rgba(0,0,0,0.7);
      }
      .stats-card {
        background: rgba(255, 255, 255, 0.12);
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-radius: 20px;
        padding: 18px 36px;
        text-align: center;
        min-width: 240px;
      }
      .stat-line {
        font-size: 20px;
        margin: 8px 0;
        font-weight: 800;
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'game-ui';

    // 1. HUD
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'hud';
    this.hudElement.innerHTML = `
      <div class="hud-pill">🏃 <span id="hud-score">0 m</span></div>
      <div class="hud-pill">🍼 <span id="hud-bottles">0</span></div>
    `;
    this.container.appendChild(this.hudElement);

    // 危险逼近警告横幅
    this.dangerAlert = document.createElement('div');
    this.dangerAlert.id = 'danger-warning';
    this.dangerAlert.textContent = '⚠️ “牛来”逼近！再次失误就扑街啦！';
    this.container.appendChild(this.dangerAlert);

    // 2. 开始菜单
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'modal-overlay interactive';
    this.menuElement.innerHTML = `
      <div class="title-box">
        <div class="title-main">🍼 奶娃跑跑 🏃</div>
        <div class="title-sub">“牛来！速归！”—— 魔性三轨跑酷</div>
      </div>
      <div class="stats-card">
        <div class="stat-line">🏆 历史最高: <span id="menu-highscore">0</span> m</div>
        <div style="font-size:14px; opacity:0.8; margin-top:6px;">上滑跳跃 | 下滑滑铲 | 左右滑屏换轨</div>
      </div>
      <button class="btn" id="btn-start">开始狂奔 🚀</button>
      <div style="display:flex; gap:12px; margin-top:10px;">
        <button class="hud-pill interactive" id="btn-sound" style="font-size:15px; cursor:pointer;">🔊 音效: 开启</button>
      </div>
    `;
    this.container.appendChild(this.menuElement);

    // 3. 游戏结束模态框
    this.gameOverElement = document.createElement('div');
    this.gameOverElement.className = 'modal-overlay interactive';
    this.gameOverElement.style.display = 'none';
    this.gameOverElement.innerHTML = `
      <div class="title-box">
        <div class="title-main" style="color:#ff3d00;">😵 扑街了！</div>
        <div class="title-sub" id="go-reason">神牛一个大顶把你撞飞了！</div>
      </div>
      <div class="stats-card">
        <div class="stat-line">本次奔跑: <span id="go-score" style="color:#ffd600;">0</span> m</div>
        <div class="stat-line">收集兽奶: <span id="go-bottles" style="color:#00e5ff;">0</span> 瓶</div>
        <div class="stat-line" style="font-size:16px; opacity:0.85;">历史纪录: <span id="go-high">0</span> m</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px; width:260px;">
        <button class="btn btn-ad" id="btn-revive">📺 看广告复活 (1次)</button>
        <button class="btn" id="btn-restart">🔄 再来一局</button>
        <button class="btn btn-share" id="btn-share">🚀 发抖音 / 分享好友</button>
      </div>
    `;
    this.container.appendChild(this.gameOverElement);

    document.body.appendChild(this.container);

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-start').onclick = () => {
      this.hideMenu();
      Audio.ensureContext();
      Audio.startBGM();
      this.onStart();
    };

    document.getElementById('btn-restart').onclick = () => {
      this.hideGameOver();
      Audio.startBGM();
      this.onRestart();
    };

    document.getElementById('btn-revive').onclick = () => {
      Platform.showRewardVideoAd({
        onReward: () => {
          this.hideGameOver();
          this.onRevive();
        },
        onFail: (err) => {
          alert('广告播放未完成，无法复活');
        }
      });
    };

    document.getElementById('btn-share').onclick = () => {
      const score = parseInt(document.getElementById('go-score').textContent, 10) || 0;
      Platform.shareGame({ score });
    };

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.onclick = () => {
      const enabled = Audio.toggleSound();
      soundBtn.textContent = enabled ? '🔊 音效: 开启' : '🔇 音效: 静音';
    };
  }

  updateHUD(score, bottles, isEnraged) {
    document.getElementById('hud-score').textContent = `${Math.floor(score)} m`;
    document.getElementById('hud-bottles').textContent = bottles;

    if (isEnraged) {
      this.dangerAlert.style.display = 'block';
    } else {
      this.dangerAlert.style.display = 'none';
    }
  }

  showMenu(highScore) {
    document.getElementById('menu-highscore').textContent = Math.floor(highScore);
    this.menuElement.style.display = 'flex';
    this.gameOverElement.style.display = 'none';
  }

  hideMenu() {
    this.menuElement.style.display = 'none';
  }

  showGameOver(score, bottles, highScore, canRevive = true) {
    document.getElementById('go-score').textContent = Math.floor(score);
    document.getElementById('go-bottles').textContent = bottles;
    document.getElementById('go-high').textContent = Math.floor(highScore);

    const reviveBtn = document.getElementById('btn-revive');
    reviveBtn.style.display = canRevive ? 'inline-flex' : 'none';

    this.gameOverElement.style.display = 'flex';
  }

  hideGameOver() {
    this.gameOverElement.style.display = 'none';
  }
}
