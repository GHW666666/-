/**
 * 奶蛙快跑 - 角色控制与魔性动画系统
 */
import { CONFIG } from './config.js';
import { audio } from './audio.js';
import { platform } from './adapter.js';

export class Player {
    constructor() {
        this.reset();
        this.frogImg = null;
        this.loadAssets();
    }

    loadAssets() {
        if (typeof Image !== 'undefined') {
            this.frogImg = new Image();
            this.frogImg.src = './assets/frog_player.png';
        }
    }

    reset() {
        this.lane = 0;              // -1, 0, 1
        this.targetLane = 0;
        this.worldX = 0;            // 当前X位置 (插值)
        this.worldY = 0;            // 跳跃高度 (0为地面，>0在空中)
        this.vy = 0;                // 垂直速度

        this.isGrounded = true;
        this.isSliding = false;
        this.slideTimer = 0;

        this.tilt = 0;              // 变道侧倾角度
        this.runCycle = 0;          // 奔跑步态相位
        this.squash = 1.0;          // 弹性挤压拉伸系数

        // 道具状态表
        this.props = {
            milk: 0,
            magnet: 0,
            shoe: 0,
            shield: false
        };

        this.invincibleTimer = 0;
        this.dead = false;
    }

    /**
     * 变道控制
     */
    moveLeft() {
        if (this.dead) return;
        if (this.targetLane > -1) {
            this.targetLane -= 1;
            this.tilt = -0.22;
            audio.playSwitch();
            platform.vibrate(true);
        } else {
            // 撞墙反弹感
            this.tilt = -0.08;
        }
    }

    moveRight() {
        if (this.dead) return;
        if (this.targetLane < 1) {
            this.targetLane += 1;
            this.tilt = 0.22;
            audio.playSwitch();
            platform.vibrate(true);
        } else {
            this.tilt = 0.08;
        }
    }

    /**
     * 跳跃
     */
    jump() {
        if (this.dead) return;
        // 如果在滑铲中，提前取消滑铲起跳
        this.isSliding = false;
        this.slideTimer = 0;

        if (this.isGrounded) {
            const hasShoe = this.props.shoe > 0;
            this.vy = hasShoe ? CONFIG.PLAYER.SUPER_JUMP_FORCE : CONFIG.PLAYER.JUMP_FORCE;
            this.isGrounded = false;
            this.squash = 1.35; // 起跳拉伸
            audio.playJump();
            platform.vibrate(true);
        }
    }

    /**
     * 滑铲 / 快速下压下落
     */
    slide() {
        if (this.dead) return;
        if (!this.isGrounded) {
            // 在空中下划：快速下砸砸地！
            this.vy = -CONFIG.PLAYER.GRAVITY * 0.7;
        }
        this.isSliding = true;
        this.slideTimer = CONFIG.PLAYER.SLIDE_DURATION;
        this.squash = 0.65; // 贴地压扁
        audio.playSlide();
        platform.vibrate(true);
    }

    /**
     * 获得道具
     */
    addProp(type) {
        if (type === 'shield') {
            this.props.shield = true;
        } else if (CONFIG.PROP_DURATION[type.toUpperCase()]) {
            this.props[type] = CONFIG.PROP_DURATION[type.toUpperCase()];
        }
        audio.playProp();
        platform.vibrate(false);
    }

    /**
     * 受到碰撞伤害
     */
    takeHit() {
        // 如果处于暴走冲刺状态，直接无视并撞毁一切
        if (this.props.milk > 0) {
            return false;
        }
        // 如果有护盾，消耗护盾抵消伤害
        if (this.props.shield) {
            this.props.shield = false;
            this.invincibleTimer = 1.5;
            audio.playLaugh();
            platform.vibrate(false);
            return false;
        }
        // 如果在受击短暂无敌中
        if (this.invincibleTimer > 0) {
            return false;
        }

        // 判定死亡
        this.dead = true;
        audio.playCrash();
        audio.playLaugh();
        platform.vibrate(false);
        return true;
    }

    /**
     * 物理与状态更新
     */
    update(dt, speed) {
        // 1. X轴轨道平滑跟随
        const targetX = this.targetLane * CONFIG.LANE_WIDTH;
        this.worldX += (targetX - this.worldX) * Math.min(1, dt * CONFIG.LANE_SWITCH_SPEED);

        // 侧倾回正
        this.tilt += (0 - this.tilt) * Math.min(1, dt * 8);

        // 2. Y轴跳跃重力物理
        if (!this.isGrounded) {
            this.worldY += this.vy * dt;
            this.vy -= CONFIG.PLAYER.GRAVITY * dt;

            if (this.worldY <= 0) {
                this.worldY = 0;
                this.vy = 0;
                this.isGrounded = true;
                this.squash = 0.8; // 落地微震压扁
            }
        }

        // 3. 弹性形变系数回弹 (Squash & Stretch 回归 1.0)
        this.squash += (1.0 - this.squash) * Math.min(1, dt * 10);

        // 4. 滑铲计时
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }

        // 5. 道具时间消耗
        for (const key of ['milk', 'magnet', 'shoe']) {
            if (this.props[key] > 0) {
                this.props[key] -= dt;
                if (this.props[key] < 0) this.props[key] = 0;
            }
        }

        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // 6. 步态相位动画 (奔跑速度越快，摆动越魔性)
        if (this.isGrounded && !this.isSliding) {
            const stepFreq = Math.min(speed / 45, 24);
            this.runCycle += dt * stepFreq;
        } else {
            this.runCycle += dt * 4;
        }
    }

    /**
     * 获取当前用于碰撞检测的包围盒 (世界坐标系)
     */
    getBounds() {
        const height = this.isSliding ? CONFIG.PLAYER.SLIDE_HEIGHT : CONFIG.PLAYER.HEIGHT;
        return {
            x: this.worldX,
            y: this.worldY,
            z: 0, // 玩家固定在透视观察点前方近处
            width: CONFIG.PLAYER.WIDTH * 0.75,
            height: height,
            depth: 80
        };
    }

    /**
     * 绘制奶蛙主角 (在给定的屏幕投影坐标绘制魔性奔跑姿态)
     */
    draw(ctx, screenX, screenY, scale) {
        ctx.save();
        ctx.translate(screenX, screenY);

        // 无敌受击微闪烁
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // 角色影子 (随跳跃高度放大透明变淡)
        const shadowScale = Math.max(0.3, 1.0 - this.worldY / 450);
        ctx.beginPath();
        ctx.ellipse(0, 0, 52 * scale * shadowScale, 18 * scale * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 20, 35, ${0.45 * shadowScale})`;
        ctx.fill();

        // 施加侧倾、弹性拉伸变换
        ctx.rotate(this.tilt);

        // 如果是滑铲状态
        let scaleX = scale;
        let scaleY = scale;
        if (this.isSliding) {
            scaleX = scale * 1.35;
            scaleY = scale * 0.58;
        } else {
            scaleX = scale / Math.sqrt(this.squash);
            scaleY = scale * this.squash;
        }

        // 奔跑步态 duang duang 上下起伏与左右摆臀
        const bobY = this.isGrounded && !this.isSliding ? Math.sin(this.runCycle * 2) * 8 * scale : 0;
        const wiggleX = this.isGrounded && !this.isSliding ? Math.cos(this.runCycle) * 6 * scale : 0;

        ctx.translate(wiggleX, -this.worldY * scale + bobY);

        // 奶瓶火箭喷射烈焰特效
        if (this.props.milk > 0) {
            this.drawRocketThrust(ctx, scale);
        }

        // 弹簧鞋特效
        if (this.props.shoe > 0 && !this.isGrounded) {
            this.drawSpringShoe(ctx, scale);
        }

        // 核心：魔性奶蛙实体渲染
        this.drawFrogBody(ctx, scaleX, scaleY);

        // 滑铲地面火花
        if (this.isSliding) {
            this.drawSlideSparks(ctx, scale);
        }

        // 磁铁特效
        if (this.props.magnet > 0) {
            this.drawMagnetAura(ctx, scale);
        }

        // 护盾特效
        if (this.props.shield) {
            this.drawShieldBubble(ctx, scale);
        }

        ctx.restore();
    }

    /**
     * 绘制魔性奶蛙身体
     */
    drawFrogBody(ctx, sx, sy) {
        const w = CONFIG.PLAYER.WIDTH * sx;
        const h = CONFIG.PLAYER.HEIGHT * sy;

        // 如果已加载奶蛙高清立绘素材，结合三渲二动漫描边与动态奔跑渲染
        if (this.frogImg && this.frogImg.complete && this.frogImg.naturalWidth > 0) {
            ctx.save();
            const drawW = w * 1.40;
            const drawH = h * 1.30;
            const posX = -drawW / 2;
            const posY = -drawH + 10 * sy;

            // 1. 三渲二动漫黑色硬朗外描边 (Cel-Shaded Outline)
            ctx.save();
            ctx.shadowColor = 'rgba(20, 25, 35, 0.85)';
            ctx.shadowBlur = 6 * sx;
            ctx.drawImage(this.frogImg, posX, posY, drawW, drawH);
            ctx.restore();

            // 2. 奶蛙二次元主体
            ctx.drawImage(this.frogImg, posX, posY, drawW, drawH);

            // 3. 奔跑时的动漫白色圆环烟雾圈 (Anime Dust Puffs)
            if (this.isGrounded && !this.isSliding) {
                const puffPhase = this.runCycle % (Math.PI);
                const puffR = (12 + puffPhase * 16) * sx;
                const puffAlpha = Math.max(0, 0.7 - puffPhase / Math.PI);
                ctx.fillStyle = `rgba(255, 255, 255, ${puffAlpha})`;
                ctx.beginPath();
                ctx.arc(-24 * sx, -4 * sy, puffR * 0.7, 0, Math.PI * 2);
                ctx.arc(24 * sx, -4 * sy, puffR * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            return;
        }

        // 备用纯原生高品质矢量渲染 (保证任何时候素材未就绪或低端环境零崩溃)
        ctx.save();
        // 1. 脚蹼
        const footWiggle = Math.sin(this.runCycle) * 16 * sx;
        ctx.fillStyle = '#443A2A';
        // 左脚蹼
        ctx.beginPath();
        ctx.ellipse(-32 * sx + footWiggle, -4 * sy, 22 * sx, 10 * sy, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // 右脚蹼
        ctx.beginPath();
        ctx.ellipse(32 * sx - footWiggle, -4 * sy, 22 * sx, 10 * sy, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 2. 黄色光滑胖身躯
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.48, w * 0.52, h * 0.44, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-10 * sx, -h * 0.6, 10, 0, -h * 0.45, w * 0.6);
        grad.addColorStop(0, '#FFE838');
        grad.addColorStop(0.7, '#FFCC00');
        grad.addColorStop(1, '#E6A800');
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. 浅色大肚子 (duang duang)
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.42, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDE8';
        ctx.fill();

        // 4. 魔性大头
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.82, w * 0.34, h * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 5. 标志性绿色大眼球
        const eyeOffset = 22 * sx;
        const eyeY = -h * 0.88;
        // 左绿眼
        ctx.beginPath();
        ctx.arc(-eyeOffset, eyeY, 12 * sx, 0, Math.PI * 2);
        ctx.fillStyle = '#10AC84';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-eyeOffset + 2 * sx, eyeY, 6 * sx, 0, Math.PI * 2);
        ctx.fillStyle = '#051914';
        ctx.fill();

        // 右绿眼
        ctx.beginPath();
        ctx.arc(eyeOffset, eyeY, 12 * sx, 0, Math.PI * 2);
        ctx.fillStyle = '#10AC84';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOffset - 2 * sx, eyeY, 6 * sx, 0, Math.PI * 2);
        ctx.fillStyle = '#051914';
        ctx.fill();

        // 6. 肉嘟嘟小手手臂
        const armSwing = Math.cos(this.runCycle) * 20 * sx;
        ctx.fillStyle = '#3E3424';
        ctx.beginPath();
        ctx.ellipse(-w * 0.52, -h * 0.45 + armSwing, 12 * sx, 16 * sy, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.52, -h * 0.45 - armSwing, 12 * sx, 16 * sy, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 奶瓶超级火箭喷射尾焰特效
     */
    drawRocketThrust(ctx, scale) {
        ctx.save();
        const flicker = (Math.random() - 0.5) * 8 * scale;
        // 尾流粒子/火焰
        ctx.beginPath();
        ctx.moveTo(-20 * scale, -20 * scale);
        ctx.lineTo(20 * scale, -20 * scale);
        ctx.lineTo(flicker, 90 * scale + Math.random() * 40 * scale);
        ctx.closePath();
        const fireGrad = ctx.createLinearGradient(0, -20 * scale, 0, 110 * scale);
        fireGrad.addColorStop(0, '#FFFFFF');
        fireGrad.addColorStop(0.3, '#FFD32A');
        fireGrad.addColorStop(0.7, '#FF3F34');
        fireGrad.addColorStop(1, 'rgba(255, 63, 52, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fill();
        ctx.restore();
    }

    /**
     * 弹簧鞋特效
     */
    drawSpringShoe(ctx, scale) {
        ctx.save();
        ctx.strokeStyle = '#FFA801';
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const sy = 5 * scale + i * 10 * scale;
            ctx.ellipse(0, sy, 22 * scale, 6 * scale, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 滑铲摩擦火花
     */
    drawSlideSparks(ctx, scale) {
        ctx.save();
        for (let i = 0; i < 4; i++) {
            const sparkX = (Math.random() - 0.5) * 80 * scale;
            const sparkY = Math.random() * 10 * scale;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 3 * scale, 0, Math.PI * 2);
            ctx.fillStyle = Math.random() > 0.5 ? '#FFD32A' : '#FF5E57';
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * 磁铁光环
     */
    drawMagnetAura(ctx, scale) {
        ctx.save();
        const pulse = 1.0 + Math.sin(Date.now() / 150) * 0.12;
        ctx.beginPath();
        ctx.arc(0, -CONFIG.PLAYER.HEIGHT * scale * 0.5, 95 * scale * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(72, 219, 251, 0.65)';
        ctx.lineWidth = 4 * scale;
        ctx.setLineDash([12 * scale, 8 * scale]);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 护盾魔性气泡
     */
    drawShieldBubble(ctx, scale) {
        ctx.save();
        const pulse = 1.0 + Math.sin(Date.now() / 200) * 0.06;
        ctx.beginPath();
        ctx.arc(0, -CONFIG.PLAYER.HEIGHT * scale * 0.55, 105 * scale * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 121, 121, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#FF6B81';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        ctx.restore();
    }
}
