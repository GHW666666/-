/**
 * 奶蛙快跑 - 3D透视世界、场景视差、障碍物生成与粒子特效系统
 */
import { CONFIG } from './config.js';
import { Coin, PropItem, Train, HighBarrier, LowBarrier } from './obstacles.js';

export class World {
    constructor() {
        this.distance = 0;       // 玩家奔跑总里程
        this.nextSpawnZ = 300;   // 下一个生成点的Z坐标
        this.entities = [];      // 场景中的活动实体
        this.particles = [];     // 粒子特效池
        this.propImages = {};
        this.loadAssets();
    }

    loadAssets() {
        if (typeof Image !== 'undefined') {
            const types = ['milk', 'magnet', 'shoe', 'shield'];
            for (const t of types) {
                const img = new Image();
                img.src = `./assets/prop_${t}.png`;
                this.propImages[t] = img;
            }
        }
    }

    reset() {
        this.distance = 0;
        this.entities = [];
        this.particles = [];
        this.nextSpawnZ = 220;

        // 开局立即预先铺满前方赛道障碍物与金币
        const maxSpawnZ = CONFIG.PERSPECTIVE.DRAW_DISTANCE + 400;
        while (this.nextSpawnZ < maxSpawnZ) {
            this.generatePattern(this.nextSpawnZ);
            this.nextSpawnZ += 260;
        }
    }

    /**
     * 3D 透视投影变换核心算法 (三渲二视觉投影)
     */
    project(worldX, worldY, worldZ, canvasW, canvasH) {
        const { HORIZON_Y, CAMERA_HEIGHT, FOV } = CONFIG.PERSPECTIVE;

        if (worldZ < -FOV + 10) {
            return { visible: false, screenX: 0, screenY: 0, scale: 0 };
        }

        const scale = FOV / (worldZ + FOV);
        const centerX = canvasW / 2;

        const screenX = centerX + worldX * scale;
        const screenY = HORIZON_Y + CAMERA_HEIGHT * scale - worldY * scale;

        return {
            visible: true,
            screenX,
            screenY,
            scale
        };
    }

    /**
     * 更新场景逻辑与持续生成
     */
    update(dt, speed, player) {
        this.distance += speed * dt;
        const moveDist = speed * dt;

        // 关键修复：刷新锚点随世界移动同步前进，保证障碍与金币无穷无尽生成！
        this.nextSpawnZ -= moveDist;

        // 1. 更新场景内所有实体世界Z坐标
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            ent.z -= moveDist;
            ent.update(dt);

            // 磁铁吸附金币判定
            if (ent instanceof Coin && !ent.collected) {
                const hasMagnet = player.props.magnet > 0 || player.props.milk > 0;
                if (hasMagnet) {
                    const distToPlayer = Math.hypot(ent.worldX - player.worldX, ent.z);
                    if (distToPlayer < CONFIG.MAGNET_RANGE) {
                        ent.worldX += (player.worldX - ent.worldX) * Math.min(1, dt * 14);
                        ent.z += (0 - ent.z) * Math.min(1, dt * 12);
                        ent.worldY += (player.worldY + 50 - ent.worldY) * Math.min(1, dt * 14);
                    }
                }
            }

            // 超出视距身后的实体回收
            if (ent.z < -250 || (ent.hit && ent.flyY < -200)) {
                this.entities.splice(i, 1);
            }
        }

        // 2. 障碍物与金币序列持续程序化补充生成
        this.spawnObstaclesAndCollectibles(speed);

        // 3. 粒子系统更新
        this.updateParticles(dt);

        // 4. 奶蛙奔跑脚步烟尘与冲刺粒子
        if (player.isGrounded && !player.isSliding) {
            if (Math.random() < 0.4) {
                this.addDustParticle(player.worldX + (Math.random() - 0.5) * 40, 0, 0);
            }
        }
    }

    /**
     * 生成模式波次 (Patterns) - 源源不断地在前方地平线处生成
     */
    spawnObstaclesAndCollectibles(speed) {
        const maxSpawnZ = CONFIG.PERSPECTIVE.DRAW_DISTANCE + 400;
        const SPAWN_INTERVAL = 240 + Math.random() * 60;

        while (this.nextSpawnZ < maxSpawnZ) {
            this.generatePattern(this.nextSpawnZ);
            this.nextSpawnZ += SPAWN_INTERVAL;
        }
    }

    generatePattern(z) {
        const rand = Math.random();
        const lanes = [-1, 0, 1];

        // 5% 概率生成随机道具
        if (Math.random() < 0.08) {
            const propTypes = ['milk', 'magnet', 'shoe', 'shield'];
            const chosenType = propTypes[Math.floor(Math.random() * propTypes.length)];
            const propLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.entities.push(new PropItem(propLane, z, chosenType, this.propImages[chosenType]));
        }

        if (rand < 0.28) {
            // 模式 A：单赛道列车 + 其余赛道金币
            const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.entities.push(new Train(trainLane, z, 260));

            // 在另外两道铺金币
            const coinLane = lanes.find(l => l !== trainLane);
            this.spawnCoinLine(coinLane, z - 80, 5);

        } else if (rand < 0.52) {
            // 模式 B：连续高跨栏 + 弧形跳跃金币
            const barrierLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.entities.push(new HighBarrier(barrierLane, z));
            // 引导起跳的抛物线金币
            this.spawnCoinArc(barrierLane, z - 120, 5);

        } else if (rand < 0.72) {
            // 模式 C：限高杆 (必须滑铲通过)
            const lowLane = lanes[Math.floor(Math.random() * lanes.length)];
            this.entities.push(new LowBarrier(lowLane, z));
            // 地面贴地金币引导滑铲
            this.spawnCoinLine(lowLane, z - 100, 4, 15);

        } else if (rand < 0.88) {
            // 模式 D：双路障 / 双列车 (留一条安全生路)
            const safeLane = lanes[Math.floor(Math.random() * lanes.length)];
            const blockLanes = lanes.filter(l => l !== safeLane);

            if (Math.random() > 0.5) {
                // 一列车一高栏
                this.entities.push(new Train(blockLanes[0], z, 200));
                this.entities.push(new HighBarrier(blockLanes[1], z));
            } else {
                this.entities.push(new LowBarrier(blockLanes[0], z));
                this.entities.push(new HighBarrier(blockLanes[1], z));
            }
            // 安全车道铺设奖励金币
            this.spawnCoinLine(safeLane, z - 100, 6);

        } else {
            // 模式 E：纯金币丰收波次 (全轨道金币阵列)
            lanes.forEach(lane => {
                this.spawnCoinLine(lane, z - 100, 4);
            });
        }
    }

    spawnCoinLine(lane, startZ, count, y = 30) {
        for (let i = 0; i < count; i++) {
            this.entities.push(new Coin(lane, startZ + i * 55, y));
        }
    }

    spawnCoinArc(lane, centerZ, count = 5) {
        for (let i = 0; i < count; i++) {
            const t = (i - (count - 1) / 2) / ((count - 1) / 2); // -1 ~ 1
            const arcY = 30 + (1 - t * t) * 110;
            this.entities.push(new Coin(lane, centerZ + i * 55, arcY));
        }
    }

    // ================= 粒子特效 =================

    addDustParticle(x, y, z) {
        this.particles.push({
            type: 'dust',
            x: x + (Math.random() - 0.5) * 20,
            y: y + Math.random() * 5,
            z: z,
            vx: (Math.random() - 0.5) * 50,
            vy: 40 + Math.random() * 40,
            vz: -100,
            radius: 8 + Math.random() * 8,
            alpha: 0.6,
            life: 0.4
        });
    }

    addCoinSparkles(screenX, screenY) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            this.particles.push({
                type: 'screen_spark',
                screenX,
                screenY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.3 ? '#FFD32A' : '#FFA801',
                radius: 4 + Math.random() * 4,
                alpha: 1.0,
                life: 0.5
            });
        }
    }

    addSmashDebris(worldX, worldY, worldZ) {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                type: 'debris',
                x: worldX,
                y: worldY + 50,
                z: worldZ,
                vx: (Math.random() - 0.5) * 600,
                vy: 200 + Math.random() * 600,
                vz: (Math.random() - 0.5) * 400,
                color: ['#EA2027', '#FFC048', '#2C3A47', '#1B9CFC'][Math.floor(Math.random() * 4)],
                size: 10 + Math.random() * 15,
                rot: Math.random() * Math.PI,
                rotV: (Math.random() - 0.5) * 15,
                life: 1.2
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            if (p.type === 'dust') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.z += p.vz * dt;
                p.radius += dt * 15;
                p.alpha -= dt * 1.5;
            } else if (p.type === 'screen_spark') {
                p.screenX += p.vx * dt;
                p.screenY += p.vy * dt;
                p.alpha -= dt * 2.0;
            } else if (p.type === 'debris') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy -= 1600 * dt; // 重力
                p.z += p.vz * dt;
                p.rot += p.rotV * dt;
            }
        }
    }

    // ================= 渲染系统 =================

    /**
     * 绘制跑酷全景环境（天空、远处城市视差、铁轨道床、枕木流动、路灯与棕榈树）
     */
    drawEnvironment(ctx, canvasW, canvasH, speed) {
        const { HORIZON_Y } = CONFIG.PERSPECTIVE;

        // 1. 晴朗夏日天空渐变
        const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
        skyGrad.addColorStop(0, '#2980B9');
        skyGrad.addColorStop(0.5, '#6DD5FA');
        skyGrad.addColorStop(1, '#BFF098');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasW, HORIZON_Y);

        // 2. 灿烂阳光辉光
        const sunX = canvasW * 0.75;
        const sunY = HORIZON_Y * 0.28;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 260);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunGlow.addColorStop(0.2, 'rgba(255, 234, 167, 0.6)');
        sunGlow.addColorStop(1, 'rgba(255, 234, 167, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 260, 0, Math.PI * 2);
        ctx.fill();

        // 3. 远景城市天际线剪影
        this.drawSkyline(ctx, canvasW, HORIZON_Y);

        // 4. 地面铺装与铁轨路基
        const groundGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, canvasH);
        groundGrad.addColorStop(0, '#353B48');
        groundGrad.addColorStop(1, '#1E272E');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, HORIZON_Y, canvasW, canvasH - HORIZON_Y);

        // 5. 绘制透视铁轨与高速滚动枕木
        this.drawTracks(ctx, canvasW, canvasH);

        // 6. 绘制两侧后退的电线杆/棕榈树
        this.drawSideProps(ctx, canvasW, canvasH);
    }

    drawSkyline(ctx, canvasW, horizonY) {
        ctx.save();
        ctx.fillStyle = 'rgba(74, 105, 189, 0.35)';
        // 简易现代建筑块剪影
        const buildings = [
            { x: 0.05, w: 0.12, h: 120 },
            { x: 0.20, w: 0.08, h: 80 },
            { x: 0.32, w: 0.15, h: 150 },
            { x: 0.50, w: 0.10, h: 100 },
            { x: 0.64, w: 0.14, h: 140 },
            { x: 0.82, w: 0.12, h: 90 },
        ];
        buildings.forEach(b => {
            ctx.fillRect(b.x * canvasW, horizonY - b.h, b.w * canvasW, b.h);
        });
        ctx.restore();
    }

    drawTracks(ctx, canvasW, canvasH) {
        const lanes = [-1, 0, 1];
        const halfRail = 52; // 轨距一半

        // 1. 碎石道床 (深色透视梯形路基)
        const pBedFarL = this.project(-CONFIG.LANE_WIDTH * 1.8, 0, 1500, canvasW, canvasH);
        const pBedFarR = this.project(CONFIG.LANE_WIDTH * 1.8, 0, 1500, canvasW, canvasH);
        const pBedNearL = this.project(-CONFIG.LANE_WIDTH * 1.8, 0, -120, canvasW, canvasH);
        const pBedNearR = this.project(CONFIG.LANE_WIDTH * 1.8, 0, -120, canvasW, canvasH);

        if (pBedFarL.visible && pBedNearL.visible) {
            ctx.fillStyle = '#2B2B36';
            ctx.beginPath();
            ctx.moveTo(pBedFarL.screenX, pBedFarL.screenY);
            ctx.lineTo(pBedFarR.screenX, pBedFarR.screenY);
            ctx.lineTo(pBedNearR.screenX, pBedNearR.screenY);
            ctx.lineTo(pBedNearL.screenX, pBedNearL.screenY);
            ctx.closePath();
            ctx.fill();

            // 两侧水泥安全岛边沿
            ctx.strokeStyle = '#F1C40F';
            ctx.lineWidth = 4 * pBedNearL.scale;
            ctx.beginPath();
            ctx.moveTo(pBedFarL.screenX, pBedFarL.screenY);
            ctx.lineTo(pBedNearL.screenX, pBedNearL.screenY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pBedFarR.screenX, pBedFarR.screenY);
            ctx.lineTo(pBedNearR.screenX, pBedNearR.screenY);
            ctx.stroke();
        }

        // 2. 绘制高速移动的枕木 (向近处延伸到屏幕边缘)
        const tieSpacing = 55;
        const offsetZ = (this.distance % tieSpacing);

        ctx.fillStyle = '#4E3629'; // 枕木木质
        for (let z = 1500; z >= -100; z -= tieSpacing) {
            const actualZ = z - offsetZ;
            const p1 = this.project(-CONFIG.LANE_WIDTH * 1.6, 0, actualZ, canvasW, canvasH);
            const p2 = this.project(CONFIG.LANE_WIDTH * 1.6, 0, actualZ, canvasW, canvasH);
            if (!p1.visible || !p2.visible) continue;

            const tieH = Math.max(3, 16 * p1.scale);
            ctx.fillRect(p1.screenX, p1.screenY - tieH, p2.screenX - p1.screenX, tieH);

            // 枕木边缘立体阴影
            ctx.fillStyle = '#271B14';
            ctx.fillRect(p1.screenX, p1.screenY - 2, p2.screenX - p1.screenX, 2);
            ctx.fillStyle = '#4E3629';
        }

        // 3. 绘制三条铁轨钢轨 (每条道左右两条反光钢轨)
        lanes.forEach(lane => {
            const centerTrackX = lane * CONFIG.LANE_WIDTH;

            for (const offset of [-halfRail, halfRail]) {
                const railWorldX = centerTrackX + offset;

                const pFar = this.project(railWorldX, 0, 1500, canvasW, canvasH);
                const pNear = this.project(railWorldX, 0, -120, canvasW, canvasH);

                if (pFar.visible && pNear.visible) {
                    // 钢轨底座暗线
                    ctx.strokeStyle = '#1E1E26';
                    ctx.lineWidth = Math.max(3, 8 * pNear.scale);
                    ctx.beginPath();
                    ctx.moveTo(pFar.screenX, pFar.screenY);
                    ctx.lineTo(pNear.screenX, pNear.screenY);
                    ctx.stroke();

                    // 钢轨高光顶面
                    ctx.strokeStyle = '#E4E7EB';
                    ctx.lineWidth = Math.max(2, 4 * pNear.scale);
                    ctx.beginPath();
                    ctx.moveTo(pFar.screenX, pFar.screenY - 2);
                    ctx.lineTo(pNear.screenX, pNear.screenY - 2);
                    ctx.stroke();
                }
            }
        });
    }

    drawSideProps(ctx, canvasW, canvasH) {
        // 两侧路灯与警示立柱随距离流动
        const propSpacing = 260;
        const offsetZ = (this.distance % propSpacing);

        for (let z = 1500; z >= -60; z -= propSpacing) {
            const actualZ = z - offsetZ;
            // 左右两侧柱子
            for (const side of [-1, 1]) {
                const worldX = side * (CONFIG.LANE_WIDTH * 1.95);
                const pBase = this.project(worldX, 0, actualZ, canvasW, canvasH);
                const pTop = this.project(worldX, 300, actualZ, canvasW, canvasH);

                if (pBase.visible && pTop.visible) {
                    const poleW = Math.max(2, 12 * pBase.scale);
                    ctx.fillStyle = '#57606F';
                    ctx.fillRect(pBase.screenX - poleW / 2, pTop.screenY, poleW, pBase.screenY - pTop.screenY);

                    // 横向挑臂
                    const armLen = 35 * side * pBase.scale;
                    ctx.fillRect(pBase.screenX - poleW / 2, pTop.screenY, armLen, 6 * pBase.scale);

                    // 路灯灯罩与亮光
                    const lampX = pBase.screenX + armLen;
                    ctx.beginPath();
                    ctx.arc(lampX, pTop.screenY + 4 * pBase.scale, Math.max(2, 10 * pTop.scale), 0, Math.PI * 2);
                    ctx.fillStyle = '#FFEAA7';
                    ctx.fill();
                }
            }
        }
    }

    /**
     * 画家算法：按 Z 轴由远及近渲染所有障碍物、金币与主角
     */
    drawEntities(ctx, canvasW, canvasH, player) {
        // 将所有实体以及主角加入同一个排序队列
        const renderList = [...this.entities];

        // 插入主角 (玩家世界Z固定为0)
        renderList.push({
            isPlayer: true,
            z: 0,
            worldX: player.worldX,
            worldY: player.worldY
        });

        // 插入3D世界粒子
        for (const p of this.particles) {
            if (p.type === 'debris' || p.type === 'dust') {
                renderList.push({
                    isParticle: true,
                    z: p.z,
                    particle: p
                });
            }
        }

        // 由远及近排序 (z 从大到小)
        renderList.sort((a, b) => b.z - a.z);

        // 逐一透视投影并绘制
        for (const item of renderList) {
            if (item.isPlayer) {
                const proj = this.project(player.worldX, 0, 0, canvasW, canvasH);
                if (proj.visible) {
                    player.draw(ctx, proj.screenX, proj.screenY, proj.scale);
                }
            } else if (item.isParticle) {
                const p = item.particle;
                const proj = this.project(p.x, p.y, p.z, canvasW, canvasH);
                if (proj.visible) {
                    if (p.type === 'dust') {
                        ctx.beginPath();
                        ctx.arc(proj.screenX, proj.screenY, p.radius * proj.scale, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(230, 230, 230, ${p.alpha})`;
                        ctx.fill();
                    } else if (p.type === 'debris') {
                        ctx.save();
                        ctx.translate(proj.screenX, proj.screenY);
                        ctx.rotate(p.rot);
                        ctx.fillStyle = p.color;
                        const sz = p.size * proj.scale;
                        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
                        ctx.restore();
                    }
                }
            } else {
                // 普通障碍物/金币/道具
                const proj = this.project(item.worldX, 0, item.z, canvasW, canvasH);
                if (proj.visible) {
                    item.draw(ctx, proj.screenX, proj.screenY, proj.scale);
                }
            }
        }

        // 绘制屏幕空间2D闪烁粒子 (如金币拾取)
        for (const p of this.particles) {
            if (p.type === 'screen_spark') {
                ctx.beginPath();
                ctx.arc(p.screenX, p.screenY, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }
}
