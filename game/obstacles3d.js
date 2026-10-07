/**
 * 奶蛙快跑 - 3D 障碍物、引桥斜坡、现代列车、旋转金币与道具系统
 * 核心特色：包含对标图中标志性的「屋顶冲刺引桥（Ramp）」与立体火车车顶跑酷
 * 性能优化：100% 静态几何体与材质单例池复用，全生命周期 0 内存与显存泄漏
 */
import * as THREE from '../libs/three.module.js';
import { createFeatherPickup } from './wings3d.js';
import { CONFIG } from './config.js';

// Shared flat signage keeps the theme legible at running speed without textures or lights.
const EGYPT = { cream: 0xfff0d4, sand: 0xe6ceaa, teal: 0x168f91, indigo: 0x223d6b, gold: 0xe9ad43, coral: 0xf36c52 };
function polygonShape(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    return shape;
}

function arrowShape(scale = 1, offsetY = 0) {
    return polygonShape([[-0.18, -0.68], [0.18, -0.68], [0.18, 0.05], [0.50, 0.05], [0, 0.66], [-0.50, 0.05], [-0.18, 0.05]]
        .map(([x, y]) => [x * scale, y * scale + offsetY]));
}

function wingedSunGeometry() {
    const sun = new THREE.Shape();
    sun.absarc(0, 0, 0.12, 0, Math.PI * 2, false);
    const right = [[0.17, 0.07], [0.65, 0.15], [0.58, -0.01], [0.46, -0.04], [0.39, -0.10], [0.29, -0.08], [0.21, -0.13], [0.16, -0.04]];
    return new THREE.ShapeGeometry([sun, polygonShape(right), polygonShape(right.map(([x, y]) => [-x, y]))], 12);
}

function hazardStripesGeometry(height, width) {
    const shapes = [];
    const halfH = height * 0.38;
    for (const side of [-1, 1]) {
        for (const t of [0.28, 0.42]) {
            const x = side * width * t;
            const tilt = halfH * 0.40;
            shapes.push(polygonShape([[x - 0.075 - tilt, -halfH], [x + 0.075 - tilt, -halfH], [x + 0.075 + tilt, halfH], [x - 0.075 + tilt, halfH]]));
        }
    }
    return new THREE.ShapeGeometry(shapes);
}

function signMaterial(color) {
    return new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
}

// ==================== 全局几何体与材质单例共享池 (零 GPU 显存泄漏) ====================
let COIN_RES = null;
function getCoinResources() {
    if (!COIN_RES) {
        const coinGeom = new THREE.CylinderGeometry(0.52, 0.52, 0.14, 20);
        coinGeom.rotateX(Math.PI / 2);
        const starGeom = new THREE.BoxGeometry(0.36, 0.36, 0.18);
        starGeom.rotateZ(Math.PI / 4);

        COIN_RES = {
            coinGeom,
            coinMat: new THREE.MeshStandardMaterial({
                color: 0xffd32a,
                metalness: 0.35,
                roughness: 0.38,
                emissive: 0xffa502,
                emissiveIntensity: 0.35
            }),
            starGeom,
            starMat: new THREE.MeshStandardMaterial({
                color: 0xfff275,
                metalness: 0.3,
                roughness: 0.35,
            })
        };
    }
    return COIN_RES;
}

let RAMP_RES = null;
function getRampResources(length, height, width) {
    if (!RAMP_RES) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(length, height);
        shape.lineTo(length, 0);
        shape.closePath();

        const extrudeSettings = { steps: 1, depth: width, bevelEnabled: false };
        const rampGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        rampGeom.rotateY(-Math.PI / 2);
        rampGeom.translate(width / 2, 0, 0);

        const handrailGeom = new THREE.CylinderGeometry(0.06, 0.06, length * 1.05, 8);
        handrailGeom.rotateX(Math.PI / 2 - Math.atan2(height, length));
        const slopeLength = Math.hypot(length, height);
        const arrowGeom = new THREE.ShapeGeometry([0.22, 0.50, 0.78].map(t => arrowShape(1.02, slopeLength * t)));
        arrowGeom.rotateX(Math.PI / 2 - Math.atan2(height, length));

        RAMP_RES = {
            rampGeom,
            rampMat: new THREE.MeshStandardMaterial({
                color: EGYPT.teal,
                roughness: 0.72,
                metalness: 0.08,
            }),
            arrowGeom,
            arrowMat: signMaterial(EGYPT.cream),
            handrailGeom,
            postGeom: new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8),
            railMat: new THREE.MeshStandardMaterial({ color: EGYPT.gold, roughness: 0.42, metalness: 0.3 })
        };
    }
    return RAMP_RES;
}

let TRAIN_RES = null;
function getTrainResources(width, height, length) {
    if (!TRAIN_RES) {
        const cabWindowMat = new THREE.MeshStandardMaterial({
            color: EGYPT.indigo,
            roughness: 0.24,
            metalness: 0.35,
            side: THREE.DoubleSide,
        });
        const roofArrowsGeom = new THREE.ShapeGeometry([0.24, 0.50, 0.76].map(t => arrowShape(0.82, length * t)));
        roofArrowsGeom.rotateX(Math.PI / 2);

        TRAIN_RES = {
            bodyGeom: new THREE.BoxGeometry(width, height, length),
            bodyMat: new THREE.MeshStandardMaterial({
                color: EGYPT.cream,
                roughness: 0.58,
                metalness: 0.1,
            }),
            stripeGeom: new THREE.BoxGeometry(width + 0.04, 0.45, length + 0.04),
            stripeMat: new THREE.MeshStandardMaterial({ color: EGYPT.teal, roughness: 0.62 }),
            skirtGeom: new THREE.BoxGeometry(width + 0.05, 0.15, length + 0.05),
            skirtMat: new THREE.MeshStandardMaterial({ color: EGYPT.indigo, roughness: 0.7 }),
            roofGeom: new THREE.BoxGeometry(width * 0.88, 0.12, length * 0.96),
            roofMat: new THREE.MeshStandardMaterial({ color: EGYPT.teal, roughness: 0.8 }),
            roofArrowsGeom,
            routeMat: signMaterial(EGYPT.cream),
            crestGeom: wingedSunGeometry(),
            crestMat: signMaterial(EGYPT.gold),
            cabWindowGeom: new THREE.PlaneGeometry(width * 0.75, height * 0.38),
            cabWindowMat,
            lightGeom: new THREE.SphereGeometry(0.18, 12, 12),
            lightMat: new THREE.MeshBasicMaterial({ color: 0xffefc1 }),
            sideWinGeom: new THREE.PlaneGeometry(1.4, 0.75),
        };
    }
    return TRAIN_RES;
}

let HIGH_BARRIER_RES = null;
function getHighBarrierResources(width, height) {
    if (!HIGH_BARRIER_RES) {
        HIGH_BARRIER_RES = {
            poleGeom: new THREE.CylinderGeometry(0.1, 0.1, height, 12),
            poleMat: new THREE.MeshStandardMaterial({ color: EGYPT.sand, roughness: 0.88 }),
            barGeom: new THREE.BoxGeometry(width, 0.42, 0.14),
            barMat: new THREE.MeshStandardMaterial({ color: EGYPT.coral, roughness: 0.6 }),
            signGeom: new THREE.BoxGeometry(0.48, 0.48, 0.16),
            signMat: new THREE.MeshStandardMaterial({ color: EGYPT.indigo, roughness: 0.68 }),
            footGeom: new THREE.BoxGeometry(0.24, 0.20, 0.20),
            arrowGeom: new THREE.ShapeGeometry(arrowShape(0.26)),
            stripesGeom: hazardStripesGeometry(0.42, width),
            markingMat: signMaterial(EGYPT.cream),
        };
    }
    return HIGH_BARRIER_RES;
}

let LOW_BARRIER_RES = null;
function getLowBarrierResources(width, height, clearanceY) {
    if (!LOW_BARRIER_RES) {
        const beamH = height - clearanceY;
        LOW_BARRIER_RES = {
            poleGeom: new THREE.CylinderGeometry(0.12, 0.12, height, 12),
            poleMat: new THREE.MeshStandardMaterial({ color: EGYPT.indigo, roughness: 0.75 }),
            beamGeom: new THREE.BoxGeometry(width, beamH, 0.22),
            beamMat: new THREE.MeshStandardMaterial({ color: EGYPT.gold, roughness: 0.68 }),
            footGeom: new THREE.BoxGeometry(0.24, 0.20, 0.24),
            footMat: new THREE.MeshStandardMaterial({ color: EGYPT.sand, roughness: 0.88 }),
            arrowGeom: new THREE.ShapeGeometry(arrowShape(0.46)),
            stripesGeom: hazardStripesGeometry(beamH, width),
            markingMat: signMaterial(EGYPT.indigo),
        };
    }
    return LOW_BARRIER_RES;
}

// The frame segment must overlap the same time interval on all three axes.
// This keeps a thin roof beam solid even at 65 m/s on a slow frame.
function sweepInterval(start, end, low, high) {
    if (Math.abs(end - start) < 1e-8) return start > low && start < high ? [0, 1] : null;
    const a = (low - start) / (end - start), b = (high - start) / (end - start);
    const enter = Math.max(0, Math.min(a, b)), leave = Math.min(1, Math.max(a, b));
    return enter < leave ? [enter, leave] : null;
}

let PROP_RES = null;
function getPropResources() {
    if (!PROP_RES) {
        const colorMap = {
            milk: 0xff3838,
            magnet: 0x0984e3,
            shoe: 0x00b894,
            shield: 0x00d2d3,
        };
        const mats = {};
        for (const [k, color] of Object.entries(colorMap)) {
            mats[k] = new THREE.MeshStandardMaterial({
                color,
                roughness: 0.2,
                metalness: 0.4,
                emissive: color,
                emissiveIntensity: 0.35,
            });
        }

        PROP_RES = {
            ballGeom: new THREE.SphereGeometry(0.52, 16, 16),
            ringGeom: new THREE.TorusGeometry(0.72, 0.05, 8, 24),
            ringMat: new THREE.MeshBasicMaterial({ color: 0xffffff }),
            mats
        };
    }
    return PROP_RES;
}

/**
 * 3D 旋转立体五角星金币
 */
export class Coin3D {
    constructor(scene, lane, z, y = 1.0) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.y = y;
        this.collected = false;
        this.mesh = this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, y, z);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        const res = getCoinResources();
        const group = new THREE.Group();

        const disk = new THREE.Mesh(res.coinGeom, res.coinMat);
        group.add(disk);

        const star = new THREE.Mesh(res.starGeom, res.starMat);
        group.add(star);

        return group;
    }

    update(dt) {
        if (this.collected) return;
        this.mesh.rotation.y += dt * 4.2;
        this.mesh.position.y = this.y + Math.sin(this.mesh.rotation.y * 1.5) * 0.1;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/**
 * 3D 屋顶冲刺引桥斜坡 (Ramp) - 100% 还原对标图左/中轨引桥
 * 玩家可顺着斜坡直接跑上火车车顶或站台
 */
export class Ramp3D {
    constructor(scene, lane, startZ, visualKit = null) {
        this.scene = scene;
        this.lane = lane;
        this.startZ = startZ;
        this.length = CONFIG.WORLD.RAMP_LENGTH; // 11.5米
        this.endZ = startZ + this.length;
        this.height = CONFIG.WORLD.RAMP_HEIGHT; // 2.45米
        this.width = CONFIG.WORLD.TRAIN_WIDTH * 0.95; // 2.5米
        this.mesh = visualKit ? visualKit.create('ramp', this) : this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, 0, startZ);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        const res = getRampResources(this.length, this.height, this.width);
        const group = new THREE.Group();

        // 1. 楔形斜坡主体
        const rampMesh = new THREE.Mesh(res.rampGeom, res.rampMat);
        rampMesh.castShadow = true;
        rampMesh.receiveShadow = true;
        group.add(rampMesh);

        // Three large forward arrows follow the sloped plane, pointing toward the roof.
        const arrows = new THREE.Mesh(res.arrowGeom, res.arrowMat);
        arrows.name = 'rampForwardArrows';
        arrows.position.y = 0.018;
        group.add(arrows);

        // 3. 两侧金色安全护栏
        for (const side of [-1, 1]) {
            const sideX = side * (this.width / 2 - 0.08);

            const handrail = new THREE.Mesh(res.handrailGeom, res.railMat);
            handrail.position.set(sideX, this.height / 2 + 0.65, this.length / 2);
            group.add(handrail);

            for (let j = 0; j <= 5; j++) {
                const postZ = (j / 5) * this.length;
                const postY = (j / 5) * this.height;
                const post = new THREE.Mesh(res.postGeom, res.railMat);
                post.position.set(sideX, postY + 0.45, postZ);
                group.add(post);
            }
        }

        return group;
    }

    getHeightAtZ(worldZ) {
        if (worldZ < this.startZ || worldZ > this.endZ) return null;
        const t = (worldZ - this.startZ) / this.length;
        return t * this.height;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/**
 * 3D 现代流线型通勤列车 (Train)
 * 支持在车顶行走奔跑与从车头撞击判定
 */
export class Train3D {
    constructor(scene, lane, startZ, movingSpeed = 0, visualKit = null) {
        this.scene = scene;
        this.lane = lane;
        this.z = startZ;
        this.speed = movingSpeed;
        this.width = CONFIG.WORLD.TRAIN_WIDTH;
        this.height = CONFIG.WORLD.TRAIN_HEIGHT;
        this.length = CONFIG.WORLD.TRAIN_LENGTH;

        this.mesh = visualKit ? visualKit.create('platform', this) : this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, 0, startZ);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        const res = getTrainResources(this.width, this.height, this.length);
        const group = new THREE.Group();

        // 1. 车身主体
        const bodyMesh = new THREE.Mesh(res.bodyGeom, res.bodyMat);
        bodyMesh.position.set(0, this.height / 2, this.length / 2);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // 2. 腰线色带
        const stripe = new THREE.Mesh(res.stripeGeom, res.stripeMat);
        stripe.position.set(0, this.height * 0.42, this.length / 2);
        group.add(stripe);

        // 橙红裙边
        const skirt = new THREE.Mesh(res.skirtGeom, res.skirtMat);
        skirt.position.set(0, 0.18, this.length / 2);
        group.add(skirt);

        // 3. 车顶步道
        const roof = new THREE.Mesh(res.roofGeom, res.roofMat);
        roof.position.set(0, this.height + 0.06, this.length / 2);
        roof.receiveShadow = true;
        group.add(roof);

        const roofArrows = new THREE.Mesh(res.roofArrowsGeom, res.routeMat);
        roofArrows.name = 'roofForwardArrows';
        roofArrows.position.y = this.height + 0.124;
        group.add(roofArrows);

        // A compact winged sun links the train to the Egyptian setting.
        const frontCrest = new THREE.Mesh(res.crestGeom, res.crestMat);
        frontCrest.name = 'trainWingedSun';
        frontCrest.position.set(0, this.height * 0.42, -0.027);
        group.add(frontCrest);
        for (const side of [-1, 1]) {
            const sideCrest = new THREE.Mesh(res.crestGeom, res.crestMat);
            sideCrest.position.set(side * (this.width / 2 + 0.025), this.height * 0.42, this.length * 0.5);
            sideCrest.rotation.y = side * Math.PI / 2;
            group.add(sideCrest);
        }

        // 4. 车头大窗与车灯
        const frontWindow = new THREE.Mesh(res.cabWindowGeom, res.cabWindowMat);
        frontWindow.position.set(0, this.height * 0.65, -0.029);
        group.add(frontWindow);

        for (const side of [-1, 1]) {
            const headLight = new THREE.Mesh(res.lightGeom, res.lightMat);
            headLight.position.set(side * 0.95, this.height * 0.32, -0.04);
            group.add(headLight);
        }

        // 5. 侧面车窗阵列
        const winSpacing = 2.4;
        const winCount = Math.floor(this.length / winSpacing) - 1;
        for (let i = 0; i < winCount; i++) {
            const wZ = 2.0 + i * winSpacing;
            for (const side of [-1, 1]) {
                const sideWin = new THREE.Mesh(res.sideWinGeom, res.cabWindowMat);
                sideWin.position.set(side * (this.width / 2 + 0.02), this.height * 0.62, wZ);
                sideWin.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
                group.add(sideWin);
            }
        }

        return group;
    }

    update(dt) {
        if (this.speed > 0) {
            this.z -= this.speed * dt;
            this.mesh.position.z = this.z;
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/** A roof-relative copy of one existing ground obstacle: jump or slide. */
export class RoofBarrier3D {
    constructor(scene, train, visualKit = null, type = Math.random() < 0.5 ? 'jump' : 'slide', offsetZ = 10) {
        this.scene = scene;
        this.train = train;
        this.lane = train.lane;
        this.offsetZ = Math.max(0, Math.min(offsetZ, train.length - 3));
        this.type = type === 'slide' ? 'slide' : 'jump';
        const groundWidth = CONFIG.LANE_WIDTH * (this.type === 'jump' ? 0.88 : 0.90);
        this.deckWidth = train.roofWidth ?? train.width * (visualKit ? 1 : 0.88);
        // Themed slide feet extend .07 m past their beam; leave .10 m per side.
        this.width = Math.min(groundWidth, this.deckWidth - 0.20);
        this.height = this.type === 'jump' ? 1.35 : 2.15;
        this.clearanceY = this.type === 'slide' ? 1.15 : 0;
        // Some themed jump obstacles are .92 m deep; match their visible volume.
        this.depth = this.type === 'jump' && visualKit ? 0.92 : this.type === 'jump' ? 0.20 : 0.24;
        this.deckTopOffset = train.roofTopOffset ?? (visualKit ? 0.09 : 0.12);
        if (visualKit) this.mesh = visualKit.create(this.type, this);
        else {
            // Keep the shared ground resources at their authored dimensions;
            // scale this instance instead of poisoning the single-size cache.
            this.mesh = (this.type === 'jump' ? HighBarrier3D : LowBarrier3D).prototype.buildMesh.call({
                width: groundWidth, height: this.height, clearanceY: this.clearanceY,
            });
            this.mesh.scale.x = this.width / groundWidth;
        }
        this.mesh.name = `roof-${this.type}-barrier`;
        this.mesh.position.set(-this.lane * CONFIG.LANE_WIDTH, this.baseY, this.z);
        this.previousZ = this.z;
        scene.add(this.mesh);
    }

    get z() { return this.train.z + this.offsetZ; }
    get baseY() { return this.train.height + this.deckTopOffset; }

    update() {
        this.previousZ = this.mesh.position.z;
        this.mesh.position.set(-this.lane * CONFIG.LANE_WIDTH, this.baseY, this.z);
    }

    collidesWith(player, previous = {}) {
        const height = player.isSliding ? CONFIG.PLAYER.SLIDE_HEIGHT : CONFIG.PLAYER.COLLIDER_HEIGHT;
        const radiusZ = CONFIG.PLAYER.COLLIDER_DEPTH / 2 + this.depth / 2;
        const radiusX = CONFIG.PLAYER.COLLIDER_WIDTH / 2 + this.width / 2;
        const intervals = [
            sweepInterval((previous.z ?? player.z) - this.previousZ, player.z - this.z, -radiusZ, radiusZ),
            sweepInterval((previous.x ?? player.x) + this.lane * CONFIG.LANE_WIDTH,
                player.x + this.lane * CONFIG.LANE_WIDTH, -radiusX, radiusX),
            sweepInterval(previous.y ?? player.y, player.y, this.baseY + this.clearanceY - height,
                this.baseY + this.height - (this.type === 'jump' ? 0.15 : 0)),
        ];
        return intervals.every(Boolean) && Math.max(...intervals.map(interval => interval[0])) < Math.min(...intervals.map(interval => interval[1]));
    }

    destroy() { this.scene.remove(this.mesh); }
}

/**
 * 3D 高跨栏 (High Barrier) - 红白警戒条纹，跳跃翻越
 */
export class HighBarrier3D {
    constructor(scene, lane, z, visualKit = null) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.88;
        this.height = 1.35;
        this.mesh = visualKit ? visualKit.create('jump', this) : this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, 0, z);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        const res = getHighBarrierResources(this.width, this.height);
        const group = new THREE.Group();

        for (const side of [-1, 1]) {
            const pole = new THREE.Mesh(res.poleGeom, res.poleMat);
            pole.position.set(side * (this.width / 2 - 0.12), this.height / 2, 0);
            pole.castShadow = true;
            group.add(pole);

            const foot = new THREE.Mesh(res.footGeom, res.poleMat);
            foot.position.set(side * (this.width / 2 - 0.12), 0.1, 0);
            group.add(foot);
        }

        const bar = new THREE.Mesh(res.barGeom, res.barMat);
        bar.position.set(0, this.height - 0.25, 0);
        bar.castShadow = true;
        group.add(bar);

        const sign = new THREE.Mesh(res.signGeom, res.signMat);
        sign.position.set(0, this.height - 0.25, -0.015);
        group.add(sign);

        const arrow = new THREE.Mesh(res.arrowGeom, res.markingMat);
        arrow.name = 'jumpArrow';
        arrow.position.set(0, this.height - 0.25, -0.099);
        group.add(arrow);

        const stripes = new THREE.Mesh(res.stripesGeom, res.markingMat);
        stripes.position.set(0, this.height - 0.25, -0.074);
        group.add(stripes);

        return group;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/**
 * 3D 限高杆 (Low Barrier) - 黄黑警示悬空横梁，滑铲钻过
 */
export class LowBarrier3D {
    constructor(scene, lane, z, visualKit = null) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.90;
        this.clearanceY = 1.15;
        this.height = 2.15;
        this.mesh = visualKit ? visualKit.create('slide', this) : this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, 0, z);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        const res = getLowBarrierResources(this.width, this.height, this.clearanceY);
        const group = new THREE.Group();

        for (const side of [-1, 1]) {
            const pole = new THREE.Mesh(res.poleGeom, res.poleMat);
            pole.position.set(side * (this.width / 2 - 0.12), this.height / 2, 0);
            pole.castShadow = true;
            group.add(pole);

            const foot = new THREE.Mesh(res.footGeom, res.footMat);
            foot.position.set(side * (this.width / 2 - 0.12), 0.1, 0);
            group.add(foot);
        }

        const beamH = this.height - this.clearanceY;
        const beam = new THREE.Mesh(res.beamGeom, res.beamMat);
        beam.position.set(0, this.clearanceY + beamH / 2, 0);
        beam.castShadow = true;
        group.add(beam);

        const arrow = new THREE.Mesh(res.arrowGeom, res.markingMat);
        arrow.name = 'slideArrow';
        arrow.position.set(0, this.clearanceY + beamH / 2, -0.116);
        arrow.rotation.z = Math.PI;
        group.add(arrow);

        const stripes = new THREE.Mesh(res.stripesGeom, res.markingMat);
        stripes.position.set(0, this.clearanceY + beamH / 2, -0.116);
        group.add(stripes);

        return group;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

/**
 * 3D 道具悬浮胶囊
 */
export class PropItem3D {
    constructor(scene, lane, z, type, y = 1.2) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.y = y;
        this.type = type; // 'milk', 'magnet', 'shoe', 'shield', 'flight'
        this.collected = false;
        this.mesh = this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, y, z);
        this.scene.add(this.mesh);
    }

    buildMesh() {
        if (this.type === 'flight') return createFeatherPickup();
        const res = getPropResources();
        const group = new THREE.Group();

        const mat = res.mats[this.type] || res.mats.milk;
        const ball = new THREE.Mesh(res.ballGeom, mat);
        group.add(ball);

        const ring = new THREE.Mesh(res.ringGeom, res.ringMat);
        group.add(ring);

        return group;
    }

    update(dt) {
        if (this.collected) return;
        this.mesh.rotation.y += dt * 3.5;
        if (this.type !== 'flight') this.mesh.rotation.z += dt * 2.0;
        this.mesh.position.y = this.y + Math.sin(this.mesh.rotation.y) * 0.15;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}
