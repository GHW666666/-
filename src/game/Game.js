/**
 * Game.js
 * 游戏主循环控制器、碰撞检测与全流程状态机
 */

import * as THREE from 'three';
import { Renderer } from '../core/Renderer.js';
import { InputManager } from '../core/InputManager.js';
import { BabyPlayer } from '../entities/BabyPlayer.js';
import { BullChaser } from '../entities/BullChaser.js';
import { TrackManager } from '../world/TrackManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Audio } from '../platform/AudioSynth.js';
import { Platform } from '../platform/Platform.js';
import { ITEM_TYPES } from '../entities/Collectible.js';

export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAMEOVER: 'gameover'
};

export class Game {
  constructor() {
    this.state = GAME_STATE.MENU;

    // 基础参数
    this.baseSpeed = 18;
    this.maxSpeed = 38;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.bottles = 0;
    this.highScore = Platform.getStorage('naiwa_highscore', 0);
    this.canRevive = true;

    // 道具状态计时器
    this.magnetTimer = 0;
    this.invincibleTimer = 0;

    // 核心子系统
    this.renderer = new Renderer();
    this.input = new InputManager(this.renderer.renderer.domElement);
    this.player = new BabyPlayer(this.renderer.scene);
    this.chaser = new BullChaser(this.renderer.scene);
    this.track = new TrackManager(this.renderer.scene);

    this.ui = new UIManager(
      () => this.startGame(),
      () => this.restartGame(),
      () => this.reviveGame()
    );

    this.clock = new THREE.Clock();
    this.lastTime = 0;

    this.bindInputs();
    this.ui.showMenu(this.highScore);

    // 启动动画循环
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindInputs() {
    this.input.on('left', () => {
      if (this.state === GAME_STATE.PLAYING) this.player.changeLane(-1);
    });
    this.input.on('right', () => {
      if (this.state === GAME_STATE.PLAYING) this.player.changeLane(1);
    });
    this.input.on('jump', () => {
      if (this.state === GAME_STATE.PLAYING) this.player.jump();
      else if (this.state === GAME_STATE.MENU) {
        this.ui.hideMenu();
        this.startGame();
      }
    });
    this.input.on('slide', () => {
      if (this.state === GAME_STATE.PLAYING) this.player.slide();
    });
  }

  startGame() {
    this.state = GAME_STATE.PLAYING;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.bottles = 0;
    this.canRevive = true;
    this.magnetTimer = 0;
    this.invincibleTimer = 0;

    this.player.reset();
    this.chaser.reset();
    this.track.reset();

    // 抖音平台自动开启录屏（若支持）
    Platform.startRecording();
  }

  restartGame() {
    this.startGame();
  }

  reviveGame() {
    this.state = GAME_STATE.PLAYING;
    this.canRevive = false;

    // 清除玩家身旁 25 米内的所有障碍物
    const pz = this.player.mesh.position.z;
    this.track.obstacles.forEach(obs => {
      if (Math.abs(obs.z - pz) < 25) {
        obs.isDestroyed = true;
        this.renderer.scene.remove(obs.mesh);
      }
    });

    // 赠送 3 秒神牛无敌冲撞防护罩
    this.invincibleTimer = 3.5;
    this.player.isInvincible = true;

    // 牛拉回安全距离
    this.chaser.reset();
    Audio.startBGM();
  }

  gameOver(reason = '你被狂暴神牛顶飞啦！') {
    if (this.state === GAME_STATE.GAMEOVER) return;
    this.state = GAME_STATE.GAMEOVER;

    Audio.stopBGM();
    Audio.playGameOver();
    Platform.vibrate('long');

    // 停止抖音录屏并保存
    Platform.stopRecording();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      Platform.setStorage('naiwa_highscore', this.highScore);
    }

    document.getElementById('go-reason').textContent = reason;
    this.ui.showGameOver(this.score, this.bottles, this.highScore, this.canRevive);
  }

  update(delta) {
    if (this.state !== GAME_STATE.PLAYING) return;

    // 1. 速度阶梯上升（随跑动距离越快越刺激）
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + (this.score / 150));

    // 2. 主角向前推进
    this.player.mesh.position.z += this.speed * delta;
    this.score = this.player.mesh.position.z;

    // 3. 道具倒计时更新
    if (this.magnetTimer > 0) {
      this.magnetTimer -= delta;
      this.player.isMagnet = this.magnetTimer > 0;
    }
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      this.player.isInvincible = this.invincibleTimer > 0;
    }

    // 4. 更新角色、追击者、赛道
    this.player.update(delta, this.speed);
    this.chaser.update(delta, this.player, this.speed);
    this.track.update(this.player.mesh.position.z, delta, this.player.isInvincible);

    // 5. 碰撞检测逻辑
    this.checkCollisions();

    // 6. UI HUD 刷新
    this.ui.updateHUD(this.score, this.bottles, this.chaser.isEnraged);
  }

  checkCollisions() {
    const playerBox = this.player.getBoundingBox();
    const pPos = this.player.mesh.position;

    // 1. 检测收集品
    this.track.collectibles.forEach(item => {
      if (item.isCollected) return;

      item.update(0.016, pPos, this.player.isMagnet);

      const itemBox = item.getBoundingBox();
      if (playerBox.intersectsBox(itemBox)) {
        item.isCollected = true;
        this.renderer.scene.remove(item.mesh);

        switch (item.type) {
          case ITEM_TYPES.MILK:
            this.bottles++;
            Audio.playCoin();
            break;

          case ITEM_TYPES.MAGNET:
            this.magnetTimer = 10;
            this.player.isMagnet = true;
            Audio.playPowerup();
            break;

          case ITEM_TYPES.BULL:
            // 触发【牛来！速归！】狂暴模式
            this.invincibleTimer = 8;
            this.player.isInvincible = true;
            Audio.playBullRoar();
            Platform.vibrate('short');
            break;

          case ITEM_TYPES.JETPACK:
            this.invincibleTimer = 6;
            this.player.isInvincible = true;
            Audio.playPowerup();
            break;
        }
      }
    });

    // 2. 检测障碍物
    this.track.obstacles.forEach(obs => {
      if (obs.isDestroyed) return;

      const obsBox = obs.getBoundingBox();
      if (playerBox.intersectsBox(obsBox)) {
        if (this.player.isInvincible) {
          // 【牛来无敌狂暴】：直接撞碎撞飞一切障碍！
          obs.isDestroyed = true;
          this.renderer.scene.remove(obs.mesh);
          Audio.playBullRoar();
          Platform.vibrate('short');
        } else {
          // 正常状态被撞击
          if (this.chaser.isEnraged) {
            // 牛已经逼近紧随其后，再次撞击直接 Game Over！
            this.gameOver('再次磕碰，被身后狂暴神牛一头顶飞！');
          } else {
            // 首次磕碰：玩家踉跄，神牛瞬间逼近咆哮！
            obs.isDestroyed = true;
            this.renderer.scene.remove(obs.mesh);
            this.chaser.triggerStumbleEnrage();
            Platform.vibrate('medium');
          }
        }
      }
    });
  }

  loop() {
    requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);

    this.renderer.updateCamera(this.player, delta);
    this.renderer.render();
  }
}
