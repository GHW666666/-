/**
 * 奶娃快跑 - 三渲二 (Cel-Shaded) 障碍物与道具系统
 * 视觉呈现强烈的日漫/国漫三渲二卡通体量感与硬朗描边，玩起来是利落干净的2D赛道判定
 */
import { CONFIG } from './config.js';

/**
 * 三渲二旋转金币
 */
export class Coin {
    constructor(lane, z, y = 35) {
        this.lane = lane;
        this.worldX = lane * CONFIG.LANE_WIDTH;
        this.worldY = y;
        this.z = z;
        this.collected = false;
        this.spinPhase = Math.random() * Math.PI * 2;
        this.width = 60;
        this.height = 60;
        this.depth = 40;
    }

    update(dt) {
        this.spinPhase += dt * 5.5;
    }

    getBounds() {
        return {
            x: this.worldX,
            y: this.worldY,
            z: this.z,
            width: this.width,
            height: this.height,
            depth: this.depth
        };
    }

    draw(ctx, screenX, screenY, scale) {
        if (this.collected) return;
        ctx.save();
        ctx.translate(screenX, screenY - this.worldY * scale);

        // 旋转透视
        const cosW = Math.cos(this.spinPhase);
        const w = (this.width / 2) * Math.abs(cosW) * scale;
        const h = (this.height / 2) * scale;

        // 1. 三渲二硬朗黑色描边 (Cel Outline)
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(3, w + 3 * scale), h + 3 * scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2D3436';
        ctx.fill();

        // 2. 金币主体（明亮金色）
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(2, w), h, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFC000';
        ctx.fill();

        // 3. 赛璐璐两段式明暗切面 (Cel Shading)
        if (w > 6 * scale) {
            // 暗部阴影半月
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.85, h * 0.85, 0, 0, Math.PI);
            ctx.fillStyle = '#FFA000';
            ctx.fill();

            // 亮部高光半月
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.85, h * 0.85, 0, Math.PI, Math.PI * 2);
            ctx.fillStyle = '#FFF275';
            ctx.fill();

            // 核心卡通方孔/星星
            ctx.fillStyle = '#E67E22';
            ctx.fillRect(-w * 0.3, -h * 0.3, w * 0.6, h * 0.6);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-w * 0.15, -h * 0.25, w * 0.3, h * 0.25);
        }

        ctx.restore();
    }
}

/**
 * 道具拾取物实体 (三渲二发光胶囊)
 */
export class PropItem {
    constructor(lane, z, type, img = null) {
        this.lane = lane;
        this.worldX = lane * CONFIG.LANE_WIDTH;
        this.worldY = 45;
        this.z = z;
        this.type = type; // 'milk', 'magnet', 'shoe', 'shield'
        this.img = img;
        this.collected = false;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.width = 75;
        this.height = 75;
        this.depth = 50;
    }

    update(dt) {
        this.floatPhase += dt * 3.8;
    }

    getBounds() {
        return {
            x: this.worldX,
            y: this.worldY,
            z: this.z,
            width: this.width,
            height: this.height,
            depth: this.depth
        };
    }

    draw(ctx, screenX, screenY, scale) {
        if (this.collected) return;
        ctx.save();
        const floatY = Math.sin(this.floatPhase) * 16;
        ctx.translate(screenX, screenY - (this.worldY + floatY) * scale);

        const size = this.width * scale;

        // 黑色卡通描边光圈
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.68, 0, Math.PI * 2);
        ctx.fillStyle = '#2D3436';
        ctx.fill();

        // 亮彩色卡通光环
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
        ctx.fillStyle = '#FDCB6E';
        ctx.fill();

        // 白色动漫高光心
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.52, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // 图标
        if (this.img && this.img.complete) {
            ctx.drawImage(this.img, -size * 0.42, -size * 0.42, size * 0.84, size * 0.84);
        } else {
            ctx.font = `bold ${Math.max(12, 28 * scale)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const iconMap = { milk: '🍼', magnet: '🧲', shoe: '🩴', shield: '🛡️' };
            ctx.fillText(iconMap[this.type] || '🎁', 0, 0);
        }

        ctx.restore();
    }
}

/**
 * 三渲二卡通地铁列车 (占据整条赛道，硬朗黑色描边，二次元高光)
 */
export class Train {
    constructor(lane, z, movingSpeed = 280) {
        this.lane = lane;
        this.worldX = lane * CONFIG.LANE_WIDTH;
        this.worldY = 0;
        this.z = z;
        this.relativeSpeed = movingSpeed; // 迎面行驶速度
        this.width = CONFIG.LANE_WIDTH * 0.94;
        this.height = 250;  // 列车高度
        this.depth = 550;   // 列车长度
        this.hit = false;
        this.flyY = 0;
        this.flyVy = 0;
        this.flyRot = 0;
    }

    update(dt) {
        if (this.hit) {
            this.flyY += this.flyVy * dt;
            this.flyVy -= 1800 * dt;
            this.flyRot += dt * 8;
        } else {
            this.z -= this.relativeSpeed * dt;
        }
    }

    getBounds() {
        if (this.hit) return { x: 9999, y: 9999, z: 9999, width: 0, height: 0, depth: 0 };
        return {
            x: this.worldX,
            y: this.worldY,
            z: this.z + this.depth / 2,
            width: this.width,
            height: this.height,
            depth: this.depth,
            isTrain: true
        };
    }

    draw(ctx, screenX, screenY, scale) {
        ctx.save();
        ctx.translate(screenX, screenY - this.flyY * scale);
        if (this.hit) ctx.rotate(this.flyRot);

        const w = this.width * scale;
        const h = this.height * scale;
        const strokeW = Math.max(2, 4 * scale);

        // 1. 三渲二最外层硬朗黑色线稿描边 (Cel Ink Outline)
        ctx.fillStyle = '#1E272E';
        ctx.fillRect(-w / 2 - strokeW, -h - strokeW, w + strokeW * 2, h + strokeW * 2);

        // 2. 车身主体亮蓝色 (Cel Shading 基础亮面)
        ctx.fillStyle = '#0984E3';
        ctx.fillRect(-w / 2, -h, w, h);

        // 3. 车身下半截阴影切面 (Cel 暗面色块)
        ctx.fillStyle = '#005FB8';
        ctx.fillRect(-w / 2, -h * 0.45, w, h * 0.45);

        // 4. 明黄色二次元防撞腰带
        ctx.fillStyle = '#FDCB6E';
        ctx.fillRect(-w / 2, -h * 0.35, w, h * 0.16);
        ctx.fillStyle = '#1E272E';
        ctx.fillRect(-w / 2, -h * 0.35, w, strokeW);
        ctx.fillRect(-w / 2, -h * 0.19, w, strokeW);

        // 5. 动漫大挡风玻璃 (深墨蓝 + 45度斜条纹反光)
        const winW = w * 0.82;
        const winH = h * 0.36;
        const winY = -h * 0.90;

        // 玻璃外黑框
        ctx.fillStyle = '#1E272E';
        ctx.fillRect(-winW / 2 - strokeW, winY - strokeW, winW + strokeW * 2, winH + strokeW * 2);

        // 玻璃底色
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(-winW / 2, winY, winW, winH);

        // 动漫经典白光斜切高光
        ctx.save();
        ctx.beginPath();
        ctx.rect(-winW / 2, winY, winW, winH);
        ctx.clip();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(-winW * 0.4, winY + winH);
        ctx.lineTo(-winW * 0.1, winY);
        ctx.lineTo(winW * 0.1, winY);
        ctx.lineTo(-winW * 0.2, winY + winH);
        ctx.closePath();
        ctx.fill();

        // 6. 车头前脸魔性奶娃头像涂鸦！
        ctx.fillStyle = '#FFDD59';
        ctx.beginPath();
        ctx.arc(0, winY + winH / 2, 22 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E272E';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // 奶娃绿眼
        ctx.fillStyle = '#00B894';
        ctx.beginPath();
        ctx.arc(-8 * scale, winY + winH / 2 - 2 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.arc(8 * scale, winY + winH / 2 - 2 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 7. 两只动漫大车灯 (明黄色亮光)
        const lightY = -h * 0.26;
        const lightR = 14 * scale;

        for (const lx of [-w * 0.32, w * 0.32]) {
            // 车灯黑描边
            ctx.fillStyle = '#1E272E';
            ctx.beginPath();
            ctx.arc(lx, lightY, lightR + strokeW, 0, Math.PI * 2);
            ctx.fill();

            // 车灯黄色
            ctx.fillStyle = '#FFEAA7';
            ctx.beginPath();
            ctx.arc(lx, lightY, lightR, 0, Math.PI * 2);
            ctx.fill();

            // 白色中心高光
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(lx - 3 * scale, lightY - 3 * scale, lightR * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * 三渲二高跨栏 (High Barrier，跳跃翻过)
 */
export class HighBarrier {
    constructor(lane, z) {
        this.lane = lane;
        this.worldX = lane * CONFIG.LANE_WIDTH;
        this.worldY = 0;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.88;
        this.height = 100;
        this.depth = 40;
        this.hit = false;
        this.flyY = 0;
        this.flyVy = 0;
        this.flyRot = 0;
    }

    update(dt) {
        if (this.hit) {
            this.flyY += this.flyVy * dt;
            this.flyVy -= 1800 * dt;
            this.flyRot += dt * 10;
        }
    }

    getBounds() {
        if (this.hit) return { x: 9999, y: 9999, z: 9999, width: 0, height: 0, depth: 0 };
        return {
            x: this.worldX,
            y: this.worldY,
            z: this.z,
            width: this.width,
            height: this.height,
            depth: this.depth,
            type: 'high_barrier'
        };
    }

    draw(ctx, screenX, screenY, scale) {
        ctx.save();
        ctx.translate(screenX, screenY - this.flyY * scale);
        if (this.hit) ctx.rotate(this.flyRot);

        const w = this.width * scale;
        const h = this.height * scale;
        const strokeW = Math.max(2, 3.5 * scale);

        // 左右两个卡通立柱
        const poleW = 16 * scale;
        for (const px of [-w / 2, w / 2 - poleW]) {
            ctx.fillStyle = '#1E272E';
            ctx.fillRect(px - strokeW, -h - strokeW, poleW + strokeW * 2, h + strokeW * 2);
            ctx.fillStyle = '#636E72';
            ctx.fillRect(px, -h, poleW, h);
            // 立柱高光面
            ctx.fillStyle = '#B2BEC3';
            ctx.fillRect(px + 2 * scale, -h, 4 * scale, h);
        }

        // 红白斑马警示横板 (三渲二描边)
        const barH = 38 * scale;
        const barY = -h * 0.88;

        ctx.fillStyle = '#1E272E';
        ctx.fillRect(-w / 2 - strokeW, barY - strokeW, w + strokeW * 2, barH + strokeW * 2);

        ctx.save();
        ctx.beginPath();
        ctx.rect(-w / 2, barY, w, barH);
        ctx.clip();

        ctx.fillStyle = '#D63031';
        ctx.fillRect(-w / 2, barY, w, barH);

        // 白色斜切动漫斑马纹
        ctx.fillStyle = '#FFFFFF';
        const stripeW = 24 * scale;
        for (let sx = -w; sx < w; sx += stripeW * 2) {
            ctx.beginPath();
            ctx.moveTo(sx, barY + barH);
            ctx.lineTo(sx + stripeW, barY + barH);
            ctx.lineTo(sx + stripeW + 14 * scale, barY);
            ctx.lineTo(sx + 14 * scale, barY);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // 向上起跳提示动漫角标 (▲ JUMP)
        ctx.fillStyle = '#FDCB6E';
        ctx.beginPath();
        ctx.arc(0, barY + barH / 2, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E272E';
        ctx.beginPath();
        ctx.moveTo(0, barY + 6 * scale);
        ctx.lineTo(-8 * scale, barY + barH - 8 * scale);
        ctx.lineTo(8 * scale, barY + barH - 8 * scale);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 三渲二限高杆 (Low Barrier，底部悬空，滑铲钻过)
 */
export class LowBarrier {
    constructor(lane, z) {
        this.lane = lane;
        this.worldX = lane * CONFIG.LANE_WIDTH;
        this.worldY = 0;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.90;
        this.clearanceY = 75; // 离地空隙高度（滑铲可通过）
        this.height = 175;    // 顶部最高点
        this.depth = 40;
        this.hit = false;
        this.flyY = 0;
        this.flyVy = 0;
        this.flyRot = 0;
    }

    update(dt) {
        if (this.hit) {
            this.flyY += this.flyVy * dt;
            this.flyVy -= 1800 * dt;
            this.flyRot += dt * 10;
        }
    }

    getBounds() {
        if (this.hit) return { x: 9999, y: 9999, z: 9999, width: 0, height: 0, depth: 0 };
        return {
            x: this.worldX,
            y: this.clearanceY,
            z: this.z,
            width: this.width,
            height: this.height - this.clearanceY,
            depth: this.depth,
            type: 'low_barrier',
            clearanceY: this.clearanceY
        };
    }

    draw(ctx, screenX, screenY, scale) {
        ctx.save();
        ctx.translate(screenX, screenY - this.flyY * scale);
        if (this.hit) ctx.rotate(this.flyRot);

        const w = this.width * scale;
        const h = this.height * scale;
        const clearY = this.clearanceY * scale;
        const strokeW = Math.max(2, 3.5 * scale);

        // 高耸立柱
        const poleW = 16 * scale;
        for (const px of [-w / 2, w / 2 - poleW]) {
            ctx.fillStyle = '#1E272E';
            ctx.fillRect(px - strokeW, -h - strokeW, poleW + strokeW * 2, h + strokeW * 2);
            ctx.fillStyle = '#2D3436';
            ctx.fillRect(px, -h, poleW, h);
        }

        // 悬空横梁
        const barH = 46 * scale;
        const barTop = -clearY - barH;

        ctx.fillStyle = '#1E272E';
        ctx.fillRect(-w / 2 - strokeW, barTop - strokeW, w + strokeW * 2, barH + strokeW * 2);

        ctx.save();
        ctx.beginPath();
        ctx.rect(-w / 2, barTop, w, barH);
        ctx.clip();

        // 动漫明黄黑相间斜纹
        ctx.fillStyle = '#E17055';
        ctx.fillRect(-w / 2, barTop, w, barH);

        ctx.fillStyle = '#FFEAA7';
        for (let sx = -w; sx < w; sx += 28 * scale) {
            ctx.beginPath();
            ctx.moveTo(sx, barTop + barH);
            ctx.lineTo(sx + 14 * scale, barTop + barH);
            ctx.lineTo(sx + 28 * scale, barTop);
            ctx.lineTo(sx + 14 * scale, barTop);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // 动漫向下钻提示大箭头 (▼ SLIDE)
        ctx.fillStyle = '#D63031';
        ctx.beginPath();
        ctx.moveTo(-16 * scale, -clearY + 14 * scale);
        ctx.lineTo(16 * scale, -clearY + 14 * scale);
        ctx.lineTo(0, -clearY + 34 * scale);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.restore();
    }
}
