/**
 * 奶娃快跑 - 3D 障碍物、引桥斜坡、现代列车、旋转金币与道具系统
 * 核心特色：包含对标图中标志性的「屋顶冲刺引桥（Ramp）」与立体火车车顶跑酷
 * 性能优化：100% 静态几何体与材质单例池复用，全生命周期 0 内存与显存泄漏
 */
import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';

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
                metalness: 0.92,
                roughness: 0.18,
                emissive: 0xffa502,
                emissiveIntensity: 0.35
            }),
            starGeom,
            starMat: new THREE.MeshStandardMaterial({
                color: 0xfff275,
                metalness: 0.9,
                roughness: 0.15,
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

        RAMP_RES = {
            rampGeom,
            rampMat: new THREE.MeshStandardMaterial({
                color: 0xdfe6e9,
                roughness: 0.45,
                metalness: 0.2,
            }),
            plankGeom: new THREE.BoxGeometry(width * 0.88, 0.08, 0.4),
            plankMat: new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 }),
            handrailGeom,
            postGeom: new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8),
            railMat: new THREE.MeshStandardMaterial({ color: 0xffd32a, roughness: 0.25 })
        };
    }
    return RAMP_RES;
}

let TRAIN_RES = null;
function getTrainResources(width, height, length) {
    if (!TRAIN_RES) {
        const cabWindowMat = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.1,
            metalness: 0.9,
        });

        TRAIN_RES = {
            bodyGeom: new THREE.BoxGeometry(width, height, length),
            bodyMat: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.25,
                metalness: 0.1,
            }),
            stripeGeom: new THREE.BoxGeometry(width + 0.04, 0.45, length + 0.04),
            stripeMat: new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.3 }),
            skirtGeom: new THREE.BoxGeometry(width + 0.05, 0.15, length + 0.05),
            skirtMat: new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3 }),
            roofGeom: new THREE.BoxGeometry(width * 0.88, 0.12, length * 0.96),
            roofMat: new THREE.MeshStandardMaterial({ color: 0xb2bec3, roughness: 0.7 }),
            cabWindowGeom: new THREE.PlaneGeometry(width * 0.75, height * 0.38),
            cabWindowMat,
            lightGeom: new THREE.SphereGeometry(0.18, 12, 12),
            lightMat: new THREE.MeshBasicMaterial({ color: 0xfffa65 }),
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
            poleMat: new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.6 }),
            barGeom: new THREE.BoxGeometry(width, 0.42, 0.14),
            barMat: new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3 }),
            signGeom: new THREE.BoxGeometry(0.48, 0.48, 0.16),
            signMat: new THREE.MeshStandardMaterial({ color: 0xf1c40f }),
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
            poleMat: new THREE.MeshStandardMaterial({ color: 0x2c3e50 }),
            beamGeom: new THREE.BoxGeometry(width, beamH, 0.22),
            beamMat: new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.3 }),
        };
    }
    return LOW_BARRIER_RES;
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
    constructor(scene, lane, startZ) {
        this.scene = scene;
        this.lane = lane;
        this.startZ = startZ;
        this.length = CONFIG.WORLD.RAMP_LENGTH; // 11.5米
        this.endZ = startZ + this.length;
        this.height = CONFIG.WORLD.RAMP_HEIGHT; // 2.45米
        this.width = CONFIG.WORLD.TRAIN_WIDTH * 0.95; // 2.5米
        this.mesh = this.buildMesh();
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

        // 2. 坡面木质踏板
        const plankCount = 12;
        for (let i = 0; i < plankCount; i++) {
            const pZ = (i / plankCount) * this.length;
            const pY = (i / plankCount) * this.height;
            const plank = new THREE.Mesh(res.plankGeom, res.plankMat);
            plank.position.set(0, pY + 0.04, pZ);
            group.add(plank);
        }

        // 3. 两侧醒目的黄色安全警戒护栏
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
    constructor(scene, lane, startZ, movingSpeed = 0) {
        this.scene = scene;
        this.lane = lane;
        this.z = startZ;
        this.speed = movingSpeed;
        this.width = CONFIG.WORLD.TRAIN_WIDTH;
        this.height = CONFIG.WORLD.TRAIN_HEIGHT;
        this.length = CONFIG.WORLD.TRAIN_LENGTH;

        this.mesh = this.buildMesh();
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

        // 4. 车头大窗与车灯
        const frontWindow = new THREE.Mesh(res.cabWindowGeom, res.cabWindowMat);
        frontWindow.position.set(0, this.height * 0.65, -0.02);
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

/**
 * 3D 高跨栏 (High Barrier) - 红白警戒条纹，跳跃翻越
 */
export class HighBarrier3D {
    constructor(scene, lane, z) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.88;
        this.height = 1.35;
        this.mesh = this.buildMesh();
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
        }

        const bar = new THREE.Mesh(res.barGeom, res.barMat);
        bar.position.set(0, this.height - 0.25, 0);
        bar.castShadow = true;
        group.add(bar);

        const sign = new THREE.Mesh(res.signGeom, res.signMat);
        sign.position.set(0, this.height - 0.25, 0.02);
        group.add(sign);

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
    constructor(scene, lane, z) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.width = CONFIG.LANE_WIDTH * 0.90;
        this.clearanceY = 1.15;
        this.height = 2.15;
        this.mesh = this.buildMesh();
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
        }

        const beamH = this.height - this.clearanceY;
        const beam = new THREE.Mesh(res.beamGeom, res.beamMat);
        beam.position.set(0, this.clearanceY + beamH / 2, 0);
        beam.castShadow = true;
        group.add(beam);

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
        this.type = type; // 'milk', 'magnet', 'shoe', 'shield'
        this.collected = false;
        this.mesh = this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, y, z);
        this.scene.add(this.mesh);
    }

    buildMesh() {
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
        this.mesh.rotation.z += dt * 2.0;
        this.mesh.position.y = this.y + Math.sin(this.mesh.rotation.y) * 0.15;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}
