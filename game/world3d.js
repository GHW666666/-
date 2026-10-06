/**
 * 奶蛙快跑 - 3D 场景总控、摄像机跟踪、光影系统与程序化障碍物生成
 */
import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';
import { Environment3D } from './environment3d.js';
import { Coin3D, Ramp3D, Train3D, HighBarrier3D, LowBarrier3D, PropItem3D } from './obstacles3d.js';

export class World3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;

        // 环境与光照
        this.dirLight = null;
        this.hemiLight = null;
        this.environment = null;

        // 场景实体池
        this.trains = [];
        this.ramps = [];
        this.barriers = [];
        this.coins = [];
        this.props = [];
        this.particles = [];

        this.nextPatternZ = 45; // 第一个障碍生成位置
        this.distance = 0;
        this.cameraMode = 'LOBBY'; // 'LOBBY' | 'TRANSITION' | 'PLAYING'
        this.lobbyTime = 0;

        this.initThree();
    }

    initThree() {
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;

        // 1. 摄像机
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            width / height,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );

        // 2. WebGL 渲染器
        // 2. WebGL 渲染器与防崩溃保护
        if (!this.contextListenerBound && this.canvas) {
            this.contextListenerBound = true;
            this.canvas.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('WebGL context lost - preventing default to enable recovery');
            }, false);
            this.canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored - recovering 3D scene');
            }, false);
        }

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 3. 埃及沙漠明媚高亮环境光照 (晴空万里、金光灿烂)
        this.scene.background = new THREE.Color(CONFIG.THEME.SKY_COLOR);
        this.scene.fog = new THREE.Fog(CONFIG.THEME.FOG_COLOR, 150, 320); // 线性远景晨雾：近处通透，远界顺滑

        // 半球环境光 (高亮晴空蓝 + 暖金大地反光)
        this.hemiLight = new THREE.HemisphereLight(0xe0f7fa, 0xfff8e7, 1.35);
        this.scene.add(this.hemiLight);

        // 基础环境柔光 (彻底消除暗角与脏色)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
        this.scene.add(ambientLight);

        // 强劲阳光平行光 (投射清晰柔和阴影)
        this.dirLight = new THREE.DirectionalLight(CONFIG.THEME.SUN_COLOR, 1.95);
        this.dirLight.position.set(25, 45, -15);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 10;
        this.dirLight.shadow.camera.far = 120;
        this.dirLight.shadow.camera.left = -20;
        this.dirLight.shadow.camera.right = 20;
        this.dirLight.shadow.camera.top = 35;
        this.dirLight.shadow.camera.bottom = -10;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);

        // 4. 埃及砂岩集市环境
        this.environment = new Environment3D(this.scene);

        // 5. 立即设定为主页面正面视锥 (消灭任何瞬间空洞或默认0点朝向)
        this.setLobbyCamera(0);
    }

    reset() {
        this.distance = 0;
        this.nextPatternZ = 45;

        // 清空所有障碍物与金币
        this.clearEntities();

        // 彻底重置环境赛道与地块，保证重生与开局瞬间赛道完全就绪，绝无蓝屏空洞
        if (this.environment) {
            this.environment.reset();
        }

        // 预生成前方赛道波次
        while (this.nextPatternZ < 220) {
            this.generatePattern(this.nextPatternZ);
            this.nextPatternZ += 45 + Math.random() * 12;
        }
    }

    clearEntities() {
        this.trains.forEach(t => t.destroy());
        this.ramps.forEach(r => r.destroy());
        this.barriers.forEach(b => b.destroy());
        this.coins.forEach(c => c.destroy());
        this.props.forEach(p => p.destroy());

        this.trains = [];
        this.ramps = [];
        this.barriers = [];
        this.coins = [];
        this.props = [];
    }

    /**
     * 程序化障碍物与引桥模式生成器
     */
    generatePattern(z) {
        const lanes = [-1, 0, 1];
        const rand = Math.random();

        // 5% 概率生成道具
        if (Math.random() < 0.08) {
            const types = ['milk', 'magnet', 'shoe', 'shield'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            const propLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.props.push(new PropItem3D(this.scene, propLane, z + 5, chosen));
        }

        if (rand < 0.35) {
            // 模式 A (标志性玩法！)：左轨或中轨生成「引桥斜坡 + 金币弧线 + 顺接列车车顶 (屋顶冲刺)」！
            const rampLane = lanes[Math.floor(Math.random() * lanes.length)];
            const ramp = new Ramp3D(this.scene, rampLane, z);
            this.ramps.push(ramp);

            // 顺着斜坡向上排列的金色五角星金币！(完美复刻截图)
            for (let i = 0; i < 6; i++) {
                const coinZ = z + 1.5 + i * 1.8;
                const coinY = (i / 6) * ramp.height + 0.9;
                this.coins.push(new Coin3D(this.scene, rampLane, coinZ, coinY));
            }

            // 引桥正后方顺接一辆列车，供玩家在车顶继续狂奔！
            const trainZ = z + ramp.length;
            const train = new Train3D(this.scene, rampLane, trainZ, 0);
            this.trains.push(train);

            // 车顶一排丰厚金币
            for (let i = 0; i < 5; i++) {
                this.coins.push(new Coin3D(this.scene, rampLane, trainZ + 2.5 + i * 2.2, train.height + 0.85));
            }

            // 其余车道放置单车道高栏杆或地面金币
            const otherLanes = lanes.filter(l => l !== rampLane);
            this.spawnCoinLine(otherLanes[0], z, 5, 0.9);

        } else if (rand < 0.60) {
            // 模式 B：迎面驶来列车 + 地面安全道金币
            const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
            const train = new Train3D(this.scene, trainLane, z, 12.0); // 迎面行驶
            this.trains.push(train);

            const safeLane = lanes.find(l => l !== trainLane);
            this.spawnCoinLine(safeLane, z - 5, 6, 0.9);

        } else if (rand < 0.80) {
            // 模式 C：高跨栏 (跳跃翻过) + 抛物线金币
            const bLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.barriers.push(new HighBarrier3D(this.scene, bLane, z));
            this.spawnCoinArc(bLane, z, 5);

            // 其余道限高杆
            const other = lanes.find(l => l !== bLane);
            this.barriers.push(new LowBarrier3D(this.scene, other, z));
            this.spawnCoinLine(other, z - 8, 4, 0.4);

        } else {
            // 模式 D：纯金币大丰收阵列 (全轨道金币)
            lanes.forEach(l => {
                this.spawnCoinLine(l, z - 10, 5, 0.9);
            });
        }
    }

    spawnCoinLine(lane, startZ, count, y = 0.9) {
        for (let i = 0; i < count; i++) {
            this.coins.push(new Coin3D(this.scene, lane, startZ + i * 2.2, y));
        }
    }

    spawnCoinArc(lane, centerZ, count = 5) {
        for (let i = 0; i < count; i++) {
            const t = (i - (count - 1) / 2) / ((count - 1) / 2); // -1 ~ 1
            const arcY = 0.9 + (1 - t * t) * 1.8;
            this.coins.push(new Coin3D(this.scene, lane, centerZ - 4 + i * 2.0, arcY));
        }
    }

    /**
     * 场景主更新循环
     */
    update(dt, speed, player) {
        this.distance = player.z;

        // 1. 阳光光源跟随玩家前进，保证实时阴影覆盖
        this.dirLight.position.z = player.z - 15;
        this.dirLight.target.position.set(0, 0, player.z + 20);
        this.dirLight.target.updateMatrixWorld();

        // 2. 更新环境地块推进
        this.environment.update(player.z);

        // 3. 更新动态实体 (迎面列车、旋转金币、浮动道具)
        this.trains.forEach(t => t.update(dt));
        this.coins.forEach(c => c.update(dt));
        this.props.forEach(p => p.update(dt));

        // 4. 磁铁吸附金币逻辑
        const hasMagnet = player.props.magnet > 0 || player.props.milk > 0;
        if (hasMagnet) {
            for (const coin of this.coins) {
                if (!coin.collected) {
                    const dist = Math.hypot(coin.mesh.position.x - player.x, coin.mesh.position.z - player.z);
                    if (dist < CONFIG.MAGNET_RANGE) {
                        coin.mesh.position.x += (player.x - coin.mesh.position.x) * Math.min(1, dt * 10);
                        coin.mesh.position.z += (player.z - coin.mesh.position.z) * Math.min(1, dt * 10);
                        coin.mesh.position.y += (player.y + 1.0 - coin.mesh.position.y) * Math.min(1, dt * 10);
                    }
                }
            }
        }

        // 5. 持续补充前方障碍物
        while (this.nextPatternZ < player.z + 180) {
            this.generatePattern(this.nextPatternZ);
            this.nextPatternZ += 42 + Math.random() * 10;
        }

        // 6. 回收身后废弃实体
        this.cleanupBehind(player.z - 25);

        // 7. 摄像机黄金视差平滑跟随
        this.updateCamera(dt, player);
    }

    /**
     * 主页面正脸特写视锥 (奶蛙正对玩家，背后是壮丽的砂岩长廊与远景金字塔)
     */
    setLobbyCamera(time = 0) {
        // 微弱呼吸浮动，赋予主页生机感
        const floatX = Math.sin(time * 0.75) * 0.04;
        const floatY = Math.cos(time * 1.1) * 0.025;

        // 位于奶龙正前方 z = -3.6，高度适中，完美露出奶龙全身萌态与壮阔背景
        this.camera.position.set(floatX, 1.25 + floatY, -3.6);
        this.camera.lookAt(0, 0.90, 0);
    }

    /**
     * 从主页面平滑过渡到跑酷越肩视角的运镜
     * progress: 0 (主页) -> 1 (跑酷)
     */
    updateTransitionCamera(progress, player) {
        // 缓动曲线 easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);

        const startCamX = 0;
        const startCamY = 1.25;
        const startCamZ = -3.6;

        const targetCamX = player.x * 0.78;
        const targetCamY = player.y * 0.5 + CONFIG.CAMERA.OFFSET_Y;
        const targetCamZ = player.z + CONFIG.CAMERA.OFFSET_Z;

        const startLookX = 0;
        const startLookY = 0.90;
        const startLookZ = 0;

        const targetLookX = player.x * 0.55;
        const targetLookY = player.y * 0.5 + CONFIG.CAMERA.LOOK_OFFSET_Y;
        const targetLookZ = player.z + CONFIG.CAMERA.LOOK_OFFSET_Z;

        this.camera.position.x = THREE.MathUtils.lerp(startCamX, targetCamX, ease);
        this.camera.position.y = THREE.MathUtils.lerp(startCamY, targetCamY, ease);
        this.camera.position.z = THREE.MathUtils.lerp(startCamZ, targetCamZ, ease);

        const curLookX = THREE.MathUtils.lerp(startLookX, targetLookX, ease);
        const curLookY = THREE.MathUtils.lerp(startLookY, targetLookY, ease);
        const curLookZ = THREE.MathUtils.lerp(startLookZ, targetLookZ, ease);
        this.camera.lookAt(curLookX, curLookY, curLookZ);
    }

    /**
     * 动态切换地图主题光影与天空色 (支持未来多地图扩展)
     */
    applyMapTheme(mapConfig) {
        if (!mapConfig) return;
        if (this.scene) {
            if (mapConfig.skyColor) this.scene.background = new THREE.Color(mapConfig.skyColor);
            if (mapConfig.fogColor && this.scene.fog) {
                this.scene.fog.color = new THREE.Color(mapConfig.fogColor);
                this.scene.fog.near = 150;
                this.scene.fog.far = 320;
            }
        }
        if (this.dirLight && mapConfig.sunColor) {
            this.dirLight.color = new THREE.Color(mapConfig.sunColor);
        }
    }

    /**
     * 摄像机第三人称越肩追随系统 (还原截图)
     */
    updateCamera(dt, player) {
        // 手机竖屏加强横向追随比例 (0.78)，让变道到最左/最右侧赛道时角色稳固居于屏内，绝不穿出屏幕边缘
        const camTargetX = player.x * 0.78;
        const camTargetY = player.y * 0.5 + CONFIG.CAMERA.OFFSET_Y;
        const camTargetZ = player.z + CONFIG.CAMERA.OFFSET_Z;

        // 柔和跟随阻尼
        this.camera.position.x += (camTargetX - this.camera.position.x) * Math.min(1, dt * 14);
        this.camera.position.y += (camTargetY - this.camera.position.y) * Math.min(1, dt * 10);
        this.camera.position.z = camTargetZ;

        // 镜头注视点同步适度跟进
        const lookX = player.x * 0.55;
        const lookY = player.y * 0.5 + CONFIG.CAMERA.LOOK_OFFSET_Y;
        const lookZ = player.z + CONFIG.CAMERA.LOOK_OFFSET_Z;
        this.camera.lookAt(lookX, lookY, lookZ);
    }

    cleanupBehind(cutoffZ) {
        this.trains = this.trains.filter(t => {
            if (t.z + t.length < cutoffZ) { t.destroy(); return false; }
            return true;
        });
        this.ramps = this.ramps.filter(r => {
            if (r.endZ < cutoffZ) { r.destroy(); return false; }
            return true;
        });
        this.barriers = this.barriers.filter(b => {
            if (b.z < cutoffZ) { b.destroy(); return false; }
            return true;
        });
        this.coins = this.coins.filter(c => {
            if (c.z < cutoffZ || c.collected) { c.destroy(); return false; }
            return true;
        });
        this.props = this.props.filter(p => {
            if (p.z < cutoffZ || p.collected) { p.destroy(); return false; }
            return true;
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
