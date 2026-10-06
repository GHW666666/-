/**
 * 奶娃快跑 - 3D 游戏主引擎与状态控制器
 * 集成：主页面正脸萌动展示、互动抚摸拉近距离、平滑运镜起跑、多地图扩展架构与对标跑酷
 */
import { CONFIG } from './config.js';
import { platform } from './adapter.js';
import { audio } from './audio.js';
import { World3D } from './world3d.js';
import { Player3D } from './player3d.js';
import { UIManager } from './ui.js';
import { HighBarrier3D, LowBarrier3D } from './obstacles3d.js';
import { mapManager } from './maps.js';

export const GAME_STATE = {
    LOBBY: 'LOBBY',
    TRANSITION: 'TRANSITION',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
};

const DEATH_JOKES = [
    '等我奶蛙跑酷达到10万米我也要去问问许嵩 那阵子我们的感情到底出了什么问题#奶娃',
    '奶龙跑得太快，肚皮把金字塔撞出了一个窟窿！',
    '刚才那一脚后蹬太帅，可惜撞到了迎面驶来的埃及特快！',
    '人在埃及刚下火车，被奶龙的白肚皮弹飞了300米！',
    '据说只要在砂岩集市车顶跑够2万米，就能召唤黄金烤全羊！'
];

export class GameEngine {
    constructor() {
        this.state = GAME_STATE.LOBBY;
        this.canvas = null;

        this.world = null;
        this.player = null;
        this.ui = new UIManager();

        this.score = 0;
        this.coins = platform.getStorage('naiwa_coins', 0);
        this.speed = CONFIG.SPEED.INITIAL;
        this.highScore = platform.getStorage('naiwa_highscore', 0);

        this.lobbyTime = 0;
        this.transitionTime = 0;
        this.transitionDuration = 0.85; // 0.85秒顺畅运镜起跑

        this.lastTime = 0;
        this.deathJoke = '';
        this.boundLoop = this.loop.bind(this);
    }

    /**
     * 初始化 3D 游戏与主界面
     */
    init(customCanvas = null) {
        this.canvas = customCanvas || document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Cannot find #gameCanvas');
            return;
        }

        // 初始化平台环境与输入监听
        platform.initCanvas(this.canvas, 'webgl');

        // 创建 3D 世界与奶龙玩家
        this.world = new World3D(this.canvas);
        this.player = new Player3D(this.world.scene);

        // 应用初始地图光影与天空色 (埃及·砂岩集市)
        this.world.applyMapTheme(mapManager.getCurrentMap());

        // 初始化为主页面模式 (奶龙正脸微笑面向镜头)
        this.player.setLobbyMode(true);
        this.world.setLobbyCamera(0);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 绑定手势与键盘
        platform.onGesture((gesture) => this.handleGesture(gesture));

        // 绑定主页面与弹窗全部交互事件
        this.bindEvents();

        // 呈现主页面 UI
        const currentMap = mapManager.getCurrentMap();
        this.ui.showLobby({
            coins: this.coins,
            highScore: this.highScore,
            currentMap: currentMap
        });
        if (currentMap.dialogues && currentMap.dialogues.length > 0) {
            this.ui.setSpeechBubble(currentMap.dialogues[0]);
        }
        this.ui.updateMuteIcon(audio.isMuted);

        // 启动主渲染循环
        this.lastTime = performance.now();
        requestAnimationFrame(this.boundLoop);
    }

    /**
     * 绑定主页面、玩法弹窗与操作事件
     */
    bindEvents() {
        // A. 抚摸/点击奶龙身体或气泡触发互动动作
        const handleInteract = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (this.state !== GAME_STATE.LOBBY) return;

            audio.playInteract();
            this.player.triggerInteract();

            const currentMap = mapManager.getCurrentMap();
            if (currentMap.dialogues && currentMap.dialogues.length > 0) {
                const randomLine = currentMap.dialogues[Math.floor(Math.random() * currentMap.dialogues.length)];
                this.ui.setSpeechBubble(randomLine);
            }
            this.ui.spawnReaction();
        };

        if (this.ui.dom.characterTouchZone) {
            this.ui.dom.characterTouchZone.addEventListener('click', handleInteract);
            this.ui.dom.characterTouchZone.addEventListener('touchstart', handleInteract, { passive: false });
        }
        if (this.ui.dom.speechBubble) {
            this.ui.dom.speechBubble.addEventListener('click', handleInteract);
        }

        // B. 点击“出发！开始跑酷”按钮
        if (this.ui.dom.btnStartRun) {
            this.ui.dom.btnStartRun.addEventListener('click', () => this.startRunTransition());
        }

        // C. 地图选择与漫游
        const openMapModal = () => {
            this.ui.renderMapList(mapManager.getAllMaps(), mapManager.getCurrentMap().id, (mapId) => this.switchMap(mapId));
            this.ui.showMapModal();
        };
        if (this.ui.dom.btnChangeMap) this.ui.dom.btnChangeMap.addEventListener('click', openMapModal);
        if (this.ui.dom.btnOpenMaps) this.ui.dom.btnOpenMaps.addEventListener('click', openMapModal);
        if (this.ui.dom.btnCloseMapModal) this.ui.dom.btnCloseMapModal.addEventListener('click', () => this.ui.hideMapModal());

        // D. 奶龙衣橱 (未来装扮玩法预留)
        if (this.ui.dom.btnOpenWardrobe) this.ui.dom.btnOpenWardrobe.addEventListener('click', () => this.ui.showWardrobeModal());
        if (this.ui.dom.btnCloseWardrobeModal) this.ui.dom.btnCloseWardrobeModal.addEventListener('click', () => this.ui.hideWardrobeModal());

        // E. 荣誉天梯榜
        if (this.ui.dom.btnOpenRank) this.ui.dom.btnOpenRank.addEventListener('click', () => this.ui.showRankModal(this.highScore));
        if (this.ui.dom.btnCloseRankModal) this.ui.dom.btnCloseRankModal.addEventListener('click', () => this.ui.hideRankModal());

        // F. 每日好运补给
        if (this.ui.dom.btnOpenDaily) this.ui.dom.btnOpenDaily.addEventListener('click', () => this.ui.showDailyModal());
        if (this.ui.dom.btnCloseDailyModal) this.ui.dom.btnCloseDailyModal.addEventListener('click', () => this.ui.hideDailyModal());
        if (this.ui.dom.btnClaimDaily) {
            this.ui.dom.btnClaimDaily.addEventListener('click', () => {
                this.coins += 100;
                platform.setStorage('naiwa_coins', this.coins);
                audio.playCoin();
                this.ui.showLobby({ coins: this.coins, highScore: this.highScore, currentMap: mapManager.getCurrentMap() });
                this.ui.hideDailyModal();
                this.ui.spawnReaction('⭐');
            });
        }

        // G. 音效开关
        if (this.ui.dom.btnMute) {
            this.ui.dom.btnMute.addEventListener('click', (e) => {
                e.stopPropagation();
                const isMuted = audio.toggleMute();
                this.ui.updateMuteIcon(isMuted);
            });
        }

        // H. 暂停与结算弹窗
        if (this.ui.dom.pauseBtn) {
            this.ui.dom.pauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.pause();
            });
        }
        if (this.ui.dom.btnResume) this.ui.dom.btnResume.addEventListener('click', () => this.resume());
        if (this.ui.dom.btnPauseToLobby) this.ui.dom.btnPauseToLobby.addEventListener('click', () => this.returnToLobby());

        if (this.ui.dom.btnRestart) this.ui.dom.btnRestart.addEventListener('click', () => this.restart());
        if (this.ui.dom.btnGameOverToLobby) this.ui.dom.btnGameOverToLobby.addEventListener('click', () => this.returnToLobby());
    }

    /**
     * 切换地图 (埃及 / 赛博 / 雨林)
     */
    switchMap(mapId) {
        if (mapManager.setMap(mapId)) {
            const currentMap = mapManager.getCurrentMap();
            this.world.applyMapTheme(currentMap);
            this.ui.showLobby({
                coins: this.coins,
                highScore: this.highScore,
                currentMap: currentMap
            });
            if (currentMap.dialogues && currentMap.dialogues.length > 0) {
                this.ui.setSpeechBubble(currentMap.dialogues[0]);
            }
        }
    }

    /**
     * 丝滑起跑过渡 (从主页正面镜头电影化滑向越肩冲刺视角)
     */
    startRunTransition() {
        if (this.state === GAME_STATE.TRANSITION || this.state === GAME_STATE.PLAYING) return;

        audio.resume();
        audio.playStartRun();

        this.ui.hideLobby();
        this.state = GAME_STATE.TRANSITION;
        this.transitionTime = 0;

        this.score = 0;
        this.speed = CONFIG.SPEED.INITIAL;
        this.world.reset();
        this.player.reset();
    }

    start() {
        this.startRunTransition();
    }

    /**
     * 返回主页面
     */
    returnToLobby() {
        this.state = GAME_STATE.LOBBY;
        this.lobbyTime = 0;
        audio.stopBGM();

        this.world.reset();
        this.player.reset();
        this.player.setLobbyMode(true);
        this.world.setLobbyCamera(0);

        this.ui.showLobby({
            coins: this.coins,
            highScore: this.highScore,
            currentMap: mapManager.getCurrentMap()
        });
    }

    /**
     * 立即重新开跑 (再来一次)
     */
    restart() {
        this.player.reset();
        this.world.reset();
        this.player.setLobbyMode(false);
        this.score = 0;
        this.speed = CONFIG.SPEED.INITIAL;
        this.state = GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.ui.hideGameOver();
        this.ui.hidePause();
        this.ui.hideLobby();
        audio.resume();
        audio.startBGM();
    }

    pause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.ui.showPause();
            audio.stopBGM();
        }
    }

    resume() {
        if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.ui.hidePause();
            audio.startBGM();
            this.lastTime = performance.now();
        }
    }

    resize() {
        if (!this.world || !this.canvas) return;
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;

        if (this.world.renderer && this.world.camera) {
            this.world.renderer.setSize(width, height, false);
            this.world.camera.aspect = width / height;
            this.world.camera.updateProjectionMatrix();
        }
    }

    handleGesture(gesture) {
        audio.resume();

        if (this.state === GAME_STATE.LOBBY) {
            return;
        }

        if (this.state === GAME_STATE.GAMEOVER || this.state === GAME_STATE.PAUSED) {
            return;
        }

        switch (gesture) {
            case 'swipe_left':
                this.player.moveLeft();
                break;
            case 'swipe_right':
                this.player.moveRight();
                break;
            case 'swipe_up':
                this.player.jump();
                break;
            case 'swipe_down':
                this.player.slide();
                break;
        }
    }

    /**
     * 主帧循环
     */
    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.max(0, Math.min((timestamp - this.lastTime) / 1000, 0.05));
        this.lastTime = timestamp;

        if (this.state === GAME_STATE.LOBBY) {
            // 主页面待机与正脸互动
            this.lobbyTime += dt;
            this.player.updateLobby(dt);
            this.world.setLobbyCamera(this.lobbyTime);
        } else if (this.state === GAME_STATE.TRANSITION) {
            // 点击开始后平滑起跑运镜过渡
            this.transitionTime += dt;
            const progress = Math.min(1, this.transitionTime / this.transitionDuration);
            this.player.updateStartTransition(progress);
            this.world.updateTransitionCamera(progress, this.player);

            if (progress >= 1) {
                this.state = GAME_STATE.PLAYING;
                this.player.setLobbyMode(false);
                audio.startBGM();
            }
        } else if (this.state === GAME_STATE.PLAYING) {
            // 正常跑酷核心逻辑
            this.update(dt);
        }

        // 渲染 3D 场景
        if (this.world) {
            this.world.render();
        }

        requestAnimationFrame(this.boundLoop);
    }

    /**
     * 跑酷逻辑更新
     */
    update(dt) {
        // 1. 速度自然递增 (暴走加速)
        if (this.player.props.milk > 0) {
            this.speed = CONFIG.SPEED.RUSH_SPEED;
        } else {
            this.speed = Math.min(this.speed + CONFIG.SPEED.ACCELERATION * dt, CONFIG.SPEED.MAX);
        }

        // 里程累计
        this.score += this.speed * dt;

        // 2. 玩家物理与高度更新 (包含车顶判定)
        this.player.update(dt, this.speed, {
            ramps: this.world.ramps,
            trains: this.world.trains,
        });

        // 3. 世界推进
        this.world.update(dt, this.speed, this.player);

        // 4. 碰撞与收集检测
        this.checkCollisions();

        // 5. 刷新 UI HUD
        this.ui.updateHUD({
            score: this.score,
            coins: this.coins,
            speed: this.speed,
            player: this.player,
        });
    }

    /**
     * 3D 碰撞检测
     */
    checkCollisions() {
        const pLane = Math.round(-this.player.x / CONFIG.LANE_WIDTH);

        // A. 金币收集判定
        for (const coin of this.world.coins) {
            if (!coin.collected && coin.lane === pLane) {
                const distZ = Math.abs(coin.z - this.player.z);
                const distY = Math.abs(coin.mesh.position.y - (this.player.y + 0.8));
                if (distZ < 1.3 && distY < 1.4) {
                    coin.collected = true;
                    this.coins += 1;
                    platform.setStorage('naiwa_coins', this.coins);
                    audio.playCoin();
                    coin.destroy();
                }
            }
        }

        // B. 道具拾取判定
        for (const prop of this.world.props) {
            if (!prop.collected && prop.lane === pLane) {
                const distZ = Math.abs(prop.z - this.player.z);
                if (distZ < 1.5) {
                    prop.collected = true;
                    this.player.addProp(prop.type);
                    prop.destroy();
                }
            }
        }

        // 如果玩家已阵亡则跳过致死判定
        if (this.player.dead) return;

        // C. 列车正面碰撞 (非车顶)
        for (const train of this.world.trains) {
            if (train.lane === pLane) {
                if (this.player.z >= train.z - 0.4 && this.player.z <= train.z + train.length) {
                    if (this.player.y >= train.height - 0.35) {
                        // 安全在车顶奔跑
                    } else {
                        this.handleHit();
                        return;
                    }
                }
            }
        }

        // D. 高跨栏碰撞判定 (必须跳跃翻过)
        for (const b of this.world.barriers) {
            if (b instanceof HighBarrier3D && b.lane === pLane) {
                if (Math.abs(b.z - this.player.z) < 0.65) {
                    if (this.player.y < b.height - 0.15) {
                        this.handleHit();
                        return;
                    }
                }
            }
        }

        // E. 限高杆碰撞判定 (必须滑铲通过)
        for (const b of this.world.barriers) {
            if (b instanceof LowBarrier3D && b.lane === pLane) {
                if (Math.abs(b.z - this.player.z) < 0.65) {
                    if (!this.player.isSliding || this.player.y > 0.4) {
                        this.handleHit();
                        return;
                    }
                }
            }
        }
    }

    handleHit() {
        const isDead = this.player.takeHit();
        if (isDead) {
            this.state = GAME_STATE.GAMEOVER;
            audio.stopBGM();

            platform.setStorage('naiwa_coins', this.coins);

            if (this.score > this.highScore) {
                this.highScore = Math.floor(this.score);
                platform.setStorage('naiwa_highscore', this.highScore);
            }

            this.deathJoke = DEATH_JOKES[Math.floor(Math.random() * DEATH_JOKES.length)];
            setTimeout(() => {
                this.ui.showGameOver(this.score, this.coins, this.deathJoke);
            }, 600);
        }
    }
}
