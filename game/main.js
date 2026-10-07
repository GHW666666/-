/**
 * 奶蛙快跑 - 3D 游戏主引擎与状态控制器
 * 集成：主页面正脸萌动展示、互动抚摸拉近距离、平滑运镜起跑、多地图扩展架构与对标跑酷
 */
import { CONFIG } from './config.js';
import { platform } from './adapter.js';
import { audio } from './audio.js';
import { World3D } from './world3d.js';
import { Player3D } from './player3d.js';
import { UIManager } from './ui.js';
import { HighBarrier3D, LowBarrier3D, RoofBarrier3D } from './obstacles3d.js';
import { mapManager } from './maps.js';
import { WING_SKINS } from './wings3d.js';
import { OUTFIT_SKINS } from './outfits3d.js';
import { AchievementProgress } from './achievements.js';
import { WardrobePreview3D } from './wardrobePreview3d.js';
import { RunRecords } from './runRecords.js';
import { WardrobeInventory } from './wardrobeInventory.js';

export const GAME_STATE = {
    LOBBY: 'LOBBY',
    TRANSITION: 'TRANSITION',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
};

const DEATH_JOKES = [
    '等我奶蛙跑酷达到10万米我也要去问问许嵩 那阵子我们的感情到底出了什么问题#奶蛙',
    '奶龙跑得太快，肚皮把金字塔撞出了一个窟窿！',
    '刚才那一脚后蹬太帅，可惜撞到了迎面驶来的埃及特快！',
    '人在埃及刚下火车，被奶龙圆滚滚的大肚皮弹飞了300米！',
    '据说只要在砂岩集市车顶跑够2万米，就能召唤黄金烤全羊！'
];

const MAP_DEATH_JOKES = {
    store: ['差一点就到零食区了！肚皮已经准备好，脚却先打了结。', '收银员说：这只奶蛙超速了，先排队再结账！', '刚才那个零食盒太大，奶蛙决定先吃掉它再跑。'],
    tea: ['珍珠太Q弹，奶蛙也被弹成了三分糖！', '奶盖航线暂时靠岸，下一杯继续出发！', '吸管拦住了去路，奶蛙申请加一份勇气。'],
    pond: ['这一拍没跟上！奶蛙决定摸摸肚皮，重新找节奏。', '荷塘主唱摔了个跤，观众说：再来一首！', '音箱还在响，奶蛙先去后台喝口水。'],
    laundry: ['袜子追到了，奶蛙却被毛巾绊住了！', '暖风把勇气吹满了，脚步还得再晒一晒。', '奶蛙宣布：刚才那一下是柔顺剂太滑！'],
};

export class GameEngine {
    constructor() {
        this.state = GAME_STATE.LOBBY;
        this.canvas = null;

        this.world = null;
        this.player = null;
        this.ui = new UIManager();

        this.score = 0;
        this.coins = platform.getStorage('naiwa_coins', 0);
        this.savedCoinBalance = this.coins;
        this.wardrobeInventory = new WardrobeInventory(platform, { outfits: OUTFIT_SKINS, wings: WING_SKINS, coins: this.coins });
        this.coins = this.wardrobeInventory.coins;
        this.speed = CONFIG.SPEED.INITIAL;
        this.highScore = platform.getStorage('naiwa_highscore', 0);
        this.savedHighScore = this.highScore;
        this.progress = new AchievementProgress(platform, { highScore: this.highScore, coins: this.coins });
        this.highScore = this.progress.stats.bestDistance;
        this.runRecords = new RunRecords(platform, { bestDistance: this.highScore });
        this.progress.recordDistance(this.runRecords.snapshot().bestDistance);
        this.highScore = this.progress.stats.bestDistance;
        this.activeRun = null;
        this.progressSaveElapsed = 0;
        this.wardrobeSession = null;

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
        const savedWing = platform.getStorage('naiwa_wing_skin', 'none');
        const validWing = this.wardrobeInventory.isOwned('wings', savedWing) ? savedWing : 'none';
        this.player.character.wings.equip(validWing);
        this.equippedWingId = this.player.character.wings.skinId;
        const savedOutfit = platform.getStorage('naiwa_outfit_skin', 'none');
        this.equippedOutfitId = this.wardrobeInventory.isOwned('clothes', savedOutfit) ? savedOutfit : 'none';
        this.player.character.outfits.equip(this.equippedOutfitId);
        if (validWing !== savedWing) platform.setStorage('naiwa_wing_skin', validWing);
        if (this.equippedOutfitId !== savedOutfit) platform.setStorage('naiwa_outfit_skin', this.equippedOutfitId);
        this.player.onActionCompleted = type => {
            if (this.state === GAME_STATE.PLAYING) {
                this.progress.completeAction(type);
                this.flushProgress();
            }
        };
        window.addEventListener('pagehide', () => this.handleBackground());
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.handleBackground(); });
        this.flushProgress();

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

        // D. Clothes and wings share a real, rotatable character fitting stage.
        if (this.ui.dom.btnOpenWardrobe) this.ui.dom.btnOpenWardrobe.addEventListener('click', () => this.openWardrobe());
        if (this.ui.dom.btnCloseWardrobeModal) this.ui.dom.btnCloseWardrobeModal.addEventListener('click', () => this.ui.hideWardrobeModal());
        this.ui.onWardrobeClose = () => this.closeWardrobe();
        this.bindWardrobeControls();
        if (this.ui.dom.btnOpenAchievements) this.ui.dom.btnOpenAchievements.addEventListener('click', () => {
            this.flushProgress();
            this.ui.renderAchievements(this.progress.snapshot());
            this.ui.showAchievementsModal();
        });
        if (this.ui.dom.btnCloseAchievementsModal) this.ui.dom.btnCloseAchievementsModal.addEventListener('click', () => this.ui.hideAchievementsModal());

        // E. Rank the player's own saved runs.
        if (this.ui.dom.btnOpenRank) this.ui.dom.btnOpenRank.addEventListener('click', () => this.ui.showRankModal(this.runRecords.snapshot()));
        if (this.ui.dom.btnCloseRankModal) this.ui.dom.btnCloseRankModal.addEventListener('click', () => this.ui.hideRankModal());

        // F. 每日好运补给
        if (this.ui.dom.btnOpenDaily) this.ui.dom.btnOpenDaily.addEventListener('click', () => {
            this.ui.updateDailyAvailability({ claimed: this.wardrobeInventory.hasClaimedDaily(this.dailyDateKey()) });
            this.ui.showDailyModal();
        });
        if (this.ui.dom.btnCloseDailyModal) this.ui.dom.btnCloseDailyModal.addEventListener('click', () => this.ui.hideDailyModal());
        if (this.ui.dom.btnClaimDaily) {
            this.ui.dom.btnClaimDaily.addEventListener('click', () => {
                this.claimDaily();
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
        if (this.state !== GAME_STATE.LOBBY) return;
        if (mapManager.setMap(mapId)) {
            const currentMap = mapManager.getCurrentMap();
            this.world.applyMapTheme(currentMap);
            this.player.reset();
            this.player.setLobbyMode(true);
            this.lobbyTime = 0;
            this.world.setLobbyCamera(0);
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
        if (this.wardrobeSession) this.ui.hideWardrobeModal();
        this.finishRun();

        audio.stopBGM({ reset: true });
        audio.resume();
        audio.playStartRun();
        // Start within the button/touch gesture; starting only after the camera transition can be blocked.
        audio.startBGM();

        this.ui.hideLobby();
        this.state = GAME_STATE.TRANSITION;
        this.transitionTime = 0;

        this.score = 0;
        this.speed = CONFIG.SPEED.INITIAL;
        this.world.reset();
        this.player.reset();
        this.beginRun();
    }

    start() {
        this.startRunTransition();
    }

    /**
     * 返回主页面
     */
    returnToLobby() {
        this.finishRun();
        this.flushProgress();
        if (this.wardrobeSession) this.ui.hideWardrobeModal();
        this.state = GAME_STATE.LOBBY;
        this.lobbyTime = 0;
        audio.stopBGM({ reset: true });

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
        this.finishRun();
        this.flushProgress();
        this.player.reset();
        this.world.reset();
        this.player.setLobbyMode(false);
        this.score = 0;
        this.beginRun();
        this.speed = CONFIG.SPEED.INITIAL;
        this.state = GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.ui.hideGameOver();
        this.ui.hidePause();
        this.ui.hideLobby();
        audio.stopBGM({ reset: true });
        audio.resume();
        audio.startBGM();
    }

    pause() {
        if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.TRANSITION) {
            this.flushProgress();
            this.pausedState = this.state;
            this.state = GAME_STATE.PAUSED;
            this.ui.showPause();
            audio.stopBGM();
        }
    }

    resume() {
        if (this.state === GAME_STATE.PAUSED) {
            this.state = this.pausedState === GAME_STATE.TRANSITION ? GAME_STATE.TRANSITION : GAME_STATE.PLAYING;
            this.pausedState = null;
            this.ui.hidePause();
            audio.startBGM();
            this.lastTime = performance.now();
        }
    }

    handleBackground() {
        if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.TRANSITION) this.pause();
        else this.flushProgress();
        audio.stopBGM();
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
        if (this.state !== GAME_STATE.PLAYING) return;

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
            if (!this.wardrobeSession) this.world.setLobbyCamera(this.lobbyTime);
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
            if (this.wardrobeSession) this.renderWardrobe(dt);
            else this.world.render();
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
        const runSpeed = this.speed * this.world.getSpeedMultiplier(this.player);
        this.score += runSpeed * dt;
        if (this.progress) {
            this.progress.recordDistance(this.score);
            this.highScore = this.progress.stats.bestDistance;
            this.progressSaveElapsed += dt;
            if (this.progressSaveElapsed >= 2) this.flushProgress();
        }

        // 2. 玩家物理与高度更新 (包含车顶判定)
        this.previousPlayerZ = this.player.z;
        this.previousPlayerX = this.player.x;
        this.previousPlayerY = this.player.y;
        this.player.update(dt, runSpeed, {
            ramps: this.world.ramps,
            trains: this.world.trains,
        });

        // 3. 世界推进
        this.world.update(dt, runSpeed, this.player);

        const challengeReward = this.world.consumeChallengeRewards();
        if (challengeReward > 0) {
            this.addCoins(challengeReward);
            audio.playCoin();
        }

        // 4. 碰撞与收集检测
        this.checkCollisions();

        // 5. 刷新 UI HUD
        this.ui.updateHUD({
            score: this.score,
            coins: this.coins,
            speed: runSpeed,
            player: this.player,
            challenge: this.world.challengeState,
        });
    }

    /**
     * 3D 碰撞检测
     */
    checkCollisions() {
        const pLane = Math.round(-this.player.x / CONFIG.LANE_WIDTH);
        const collectionHeight = this.player.y + (this.player.isFlying ? .4 : .8);
        const previousZ = this.previousPlayerZ ?? this.player.z;

        // A. 金币收集判定
        for (const coin of this.world.coins) {
            if (!coin.collected && coin.lane === pLane) {
                const coinZ = coin.mesh.position.z;
                const crossed = coinZ >= Math.min(previousZ, this.player.z) - .7 && coinZ <= Math.max(previousZ, this.player.z) + .7;
                const distY = Math.abs(coin.mesh.position.y - collectionHeight);
                const distX = Math.abs(coin.mesh.position.x - this.player.x);
                if (crossed && distY < 1.4 && distX < 1.2) {
                    coin.collected = true;
                    this.addCoins(1);
                    audio.playCoin();
                    coin.destroy();
                }
            }
        }

        // B. 道具拾取判定
        for (const prop of this.world.props) {
            if (!prop.collected && prop.lane === pLane) {
                const distZ = Math.abs(prop.z - this.player.z);
                const crossed = prop.z >= Math.min(previousZ, this.player.z) - .7 && prop.z <= Math.max(previousZ, this.player.z) + .7;
                if ((distZ < 1.5 || crossed) && Math.abs(prop.mesh.position.y - collectionHeight) < 1.65 &&
                    Math.abs(prop.mesh.position.x - this.player.x) < 1.2) {
                    prop.collected = true;
                    this.player.addProp(prop.type);
                    prop.destroy();
                }
            }
        }

        // 如果玩家已阵亡则跳过致死判定
        if (this.player.dead || this.player.isFlying) return;

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

        // D. 车顶高低栏，动作与地面栏杆相同，高度以所在车顶为基准。
        for (const b of this.world.barriers) {
            if (b instanceof RoofBarrier3D && b.collidesWith(this.player, {
                x: this.previousPlayerX, y: this.previousPlayerY, z: previousZ,
            })) {
                this.handleHit();
                return;
            }
        }

        // E. 高跨栏碰撞判定 (必须跳跃翻过)
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

        // F. 限高杆碰撞判定 (必须滑铲通过)
        for (const b of this.world.barriers) {
            if (b instanceof LowBarrier3D && b.lane === pLane) {
                if (Math.abs(b.z - this.player.z) < 0.65) {
                    const playerHeight = this.player.isSliding ? CONFIG.PLAYER.SLIDE_HEIGHT : CONFIG.PLAYER.COLLIDER_HEIGHT;
                    if (this.player.y < b.height && this.player.y + playerHeight > b.clearanceY) {
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
            this.finishRun();
            this.state = GAME_STATE.GAMEOVER;
            audio.stopBGM();

            this.persistCoinWallet();

            if (this.score > this.highScore) {
                this.highScore = Math.floor(this.score);
                platform.setStorage('naiwa_highscore', this.highScore);
            }
            this.progress?.recordDistance(this.score);
            this.flushProgress();

            const jokes = MAP_DEATH_JOKES[mapManager.getCurrentMap().id] || DEATH_JOKES;
            this.deathJoke = jokes[Math.floor(Math.random() * jokes.length)];
            setTimeout(() => {
                this.ui.showGameOver(this.score, this.coins, this.deathJoke);
            }, 600);
        }
    }

    addCoins(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const earned = Math.floor(amount);
        if (this.wardrobeInventory) {
            this.wardrobeInventory.addCoins(earned);
            this.coins = this.wardrobeInventory.coins;
        } else this.coins += earned;
        if (this.activeRun && this.state === GAME_STATE.PLAYING) {
            this.activeRun.coins = Math.min(Number.MAX_SAFE_INTEGER, this.activeRun.coins + earned);
        }
        this.progress?.addCoins(earned);
        this.persistCoinWallet();
    }

    persistCoinWallet() {
        if (this.wardrobeInventory) {
            this.wardrobeInventory.save();
            if (this.wardrobeInventory.dirty) return false;
        }
        if (this.savedCoinBalance === this.coins) return true;
        if (platform.setStorage('naiwa_coins', this.coins) === false) return false;
        this.savedCoinBalance = this.coins;
        return true;
    }

    dailyDateKey() {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    claimDaily() {
        if (this.state !== GAME_STATE.LOBBY) return;
        const day = this.dailyDateKey(), result = this.wardrobeInventory.claimDaily(day, 100);
        this.ui.updateDailyAvailability({ claimed: this.wardrobeInventory.hasClaimedDaily(day) });
        if (!result.ok) return;
        this.coins = result.coins;
        this.progress?.addCoins(result.amount);
        this.flushProgress();
        audio.playCoin();
        this.ui.showLobby({ coins: this.coins, highScore: this.highScore, currentMap: mapManager.getCurrentMap() });
        this.ui.spawnReaction('⭐');
    }

    beginRun() {
        const map = mapManager.getCurrentMap();
        this.activeRun = { coins: 0, mapId: map.id, mapName: map.name };
    }

    finishRun() {
        if (!this.activeRun) return null;
        const run = this.activeRun;
        this.activeRun = null;
        return this.runRecords?.recordRun({ ...run, distance: this.score }) ?? null;
    }

    flushProgress() {
        this.persistCoinWallet();
        this.runRecords?.save();
        if (!this.progress) return;
        this.progress.save();
        if (this.highScore > this.savedHighScore) {
            platform.setStorage('naiwa_highscore', this.highScore);
            this.savedHighScore = this.highScore;
        }
        this.progressSaveElapsed = 0;
    }

    bindWardrobeControls() {
        const dom = this.ui.dom;
        dom.btnWardrobeClothes?.addEventListener('click', () => this.setWardrobeTab('clothes'));
        dom.btnWardrobeWings?.addEventListener('click', () => this.setWardrobeTab('wings'));
        dom.btnEquipWardrobe?.addEventListener('click', () => this.equipWardrobeSelection());
        dom.btnWardrobeLeft?.addEventListener('click', () => this.wardrobePreview?.rotate(-Math.PI / 2));
        dom.btnWardrobeRight?.addEventListener('click', () => this.wardrobePreview?.rotate(Math.PI / 2));
        dom.btnWardrobeReset?.addEventListener('click', () => this.wardrobePreview?.resetAngle());
        let pointer = null;
        dom.wardrobePreview?.addEventListener('pointerdown', event => {
            if (!this.wardrobeSession || event.target.closest('button')) return;
            event.preventDefault();
            pointer = { id: event.pointerId, x: event.clientX, angle: this.wardrobePreview.targetAngle };
            dom.wardrobePreview.setPointerCapture(event.pointerId);
        });
        dom.wardrobePreview?.addEventListener('pointermove', event => {
            if (!pointer || pointer.id !== event.pointerId) return;
            this.wardrobePreview.targetAngle = pointer.angle + (event.clientX - pointer.x) * .014;
        });
        const endDrag = event => { if (pointer?.id === event.pointerId) pointer = null; };
        dom.wardrobePreview?.addEventListener('pointerup', endDrag);
        dom.wardrobePreview?.addEventListener('pointercancel', endDrag);
        dom.wardrobePreview?.addEventListener('keydown', event => {
            if (!this.wardrobeSession || !['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
            event.preventDefault(); event.stopPropagation();
            if (event.key === 'Home') this.wardrobePreview.resetAngle();
            else this.wardrobePreview.rotate(event.key === 'ArrowLeft' ? -.35 : .35);
        });
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            if (this.wardrobeSession) this.ui.hideWardrobeModal();
            else this.ui.hideAchievementsModal();
        });
    }

    openWardrobe() {
        if (this.state !== GAME_STATE.LOBBY || this.wardrobeSession) return;
        this.wardrobeSession = { tab: 'clothes', clothes: this.equippedOutfitId, wings: this.equippedWingId, purchaseMessage: '' };
        this.wardrobePreview ||= new WardrobePreview3D(this.world, this.player, this.ui.dom.wardrobePreview);
        this.wardrobePreview.open(); this.ui.showWardrobeModal();
        this.setWardrobeTab('clothes');
    }

    setWardrobeTab(tab) {
        if (!this.wardrobeSession) return;
        this.wardrobeSession.tab = tab;
        this.ui.showWardrobeTab(tab); this.refreshWardrobe();
    }

    refreshWardrobe() {
        const fitting = this.wardrobeSession;
        if (!fitting) return;
        const inventory = this.wardrobeInventory.snapshot();
        this.ui.renderOutfitSkins(OUTFIT_SKINS, this.equippedOutfitId, fitting.clothes, id => {
            if (!Object.prototype.hasOwnProperty.call(OUTFIT_SKINS, id)) return;
            fitting.purchaseMessage = '';
            fitting.clothes = id; this.player.character.outfits.equip(id); this.refreshWardrobe();
        }, inventory);
        this.ui.renderWingSkins(WING_SKINS, this.equippedWingId, id => {
            if (id !== 'none' && !Object.prototype.hasOwnProperty.call(WING_SKINS, id)) return;
            fitting.purchaseMessage = '';
            fitting.wings = id; this.player.character.wings.equip(id); this.refreshWardrobe();
        }, fitting.wings, inventory);
        const id = fitting[fitting.tab], equipped = fitting.tab === 'clothes' ? this.equippedOutfitId : this.equippedWingId;
        const name = fitting.tab === 'clothes' ? OUTFIT_SKINS[id].name : WING_SKINS[id]?.name || '不佩戴翅膀';
        const description = fitting.tab === 'clothes' ? OUTFIT_SKINS[id].description : WING_SKINS[id]?.description || '轻装跑酷，拾到羽毛仍可飞行';
        this.ui.updateWardrobePreview({ name, description, equipped: id === equipped,
            owned: this.wardrobeInventory.isOwned(fitting.tab, id),
            price: this.wardrobeInventory.getPrice(fitting.tab, id), coins: this.coins,
            purchaseMessage: fitting.purchaseMessage });
    }

    equipWardrobeSelection() {
        const fitting = this.wardrobeSession;
        if (!fitting) return;
        const id = fitting[fitting.tab];
        if (!this.wardrobeInventory.isOwned(fitting.tab, id)) {
            const result = this.wardrobeInventory.purchase(fitting.tab, id, this.coins);
            if (!result.ok) {
                fitting.purchaseMessage = result.status === 'insufficient'
                    ? `还差 ${Math.max(0, this.wardrobeInventory.getPrice(fitting.tab, id) - this.coins).toLocaleString('zh-CN')} 金币`
                    : '购买没有保存，请重试';
                this.refreshWardrobe(); return;
            }
            this.coins = result.coins;
            this.persistCoinWallet();
            if (this.ui.dom.lobbyCoins) this.ui.dom.lobbyCoins.textContent = this.coins;
            fitting.purchaseMessage = '已解锁，已为奶蛙装备';
            audio.playCoin();
        }
        if (fitting.tab === 'clothes') {
            this.equippedOutfitId = fitting.clothes;
            platform.setStorage('naiwa_outfit_skin', this.equippedOutfitId);
        } else {
            this.equippedWingId = fitting.wings;
            platform.setStorage('naiwa_wing_skin', this.equippedWingId);
        }
        this.refreshWardrobe();
    }

    renderWardrobe(dt) { this.wardrobePreview.render(dt); }

    closeWardrobe() {
        if (!this.wardrobeSession) return;
        this.wardrobePreview.close(); this.wardrobeSession = null;
        this.player.character.outfits.equip(this.equippedOutfitId);
        this.player.character.wings.equip(this.equippedWingId);
        this.player.setLobbyMode(true); this.world.setLobbyCamera(this.lobbyTime);
        this.resize();
    }
}
