/**
 * 奶蛙快跑 - 3D 埃及·砂岩集市 (Egyptian Sandstone Bazaar) 跑道与场景系统
 * 100% 还原对标图：托勒密风砂岩回廊石柱、蓝白条纹集市遮阳棚、陶盆绿植棕榈树、横跨拱门、三道金属铁轨与远景金字塔
 */
import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';

export class Environment3D {
    constructor(scene) {
        this.scene = scene;
        this.chunks = [];
        this.chunkLength = CONFIG.WORLD.CHUNK_LENGTH; // 48 米
        this.chunkCount = CONFIG.WORLD.VISIBLE_CHUNKS; // 5 块
        this.nextChunkZ = -this.chunkLength; // 从玩家身后 48 米开始铺设，消除脚底镜头穿透

        // 共享材质库 (极高性能复用，零冗余 DrawCall)
        this.materials = this.initMaterials();

        // 共享几何体库
        this.geometries = this.initGeometries();

        // 天空盒与远景金字塔群
        this.distantHorizonGroup = new THREE.Group();
        this.scene.add(this.distantHorizonGroup);
        this.buildDistantScenery();

        // 初始化前置跑道地块
        for (let i = 0; i < this.chunkCount; i++) {
            this.spawnChunk();
        }
    }

    /**
     * 重置环境与跑道地块 (玩家重生或重新开始时立即重构脚下地块，绝无蓝屏空洞)
     */
    reset() {
        // 1. 移除场景内所有既有旧地块
        for (const chunk of this.chunks) {
            this.scene.remove(chunk);
        }
        this.chunks = [];

        // 2. 重置地块锚点至玩家身后 48 米
        this.nextChunkZ = -this.chunkLength;

        // 3. 重置远景金字塔群位移
        this.distantHorizonGroup.position.z = 0;

        // 4. 立即重新铺满脚下及前方 5 块跑道 (全长 240 米)
        for (let i = 0; i < this.chunkCount; i++) {
            this.spawnChunk();
        }
    }

    /**
     * 埃及沙漠主题材质调色盘
     */
    initMaterials() {
        return {
            // 阳光沐浴下的象牙米黄砂岩 (立柱、建筑基座)
            sandstone: new THREE.MeshStandardMaterial({
                color: 0xfff3dc,
                roughness: 0.42,
                metalness: 0.02,
            }),
            sandstoneDark: new THREE.MeshStandardMaterial({
                color: 0xf5deb3,
                roughness: 0.5,
            }),
            sandstoneTrim: new THREE.MeshStandardMaterial({
                color: 0xf1dfbb,
                roughness: 0.4,
            }),
            // 亮丽奶油色沙石道基地面
            groundBallast: new THREE.MeshStandardMaterial({
                color: 0xf6ead4,
                roughness: 0.62,
            }),
            // 温暖栗色木质枕木
            woodTie: new THREE.MeshStandardMaterial({
                color: 0x8d6e63,
                roughness: 0.55,
            }),
            // 耀眼高反光银白钢轨 (在阳光下熠熠生辉)
            steelRail: new THREE.MeshStandardMaterial({
                color: 0xf5f8fa,
                metalness: 0.95,
                roughness: 0.12,
            }),
            // 月台边沿高亮柠檬黄线
            cautionYellow: new THREE.MeshStandardMaterial({
                color: 0xffd32a,
                roughness: 0.3,
            }),
            // 鲜亮地中海宝石蓝遮阳棚
            awningBlue: new THREE.MeshStandardMaterial({
                color: 0x0984e3,
                roughness: 0.38,
                side: THREE.DoubleSide
            }),
            awningWhite: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.38,
                side: THREE.DoubleSide
            }),
            // 棕榈树干与葱翠热带绿叶
            palmTrunk: new THREE.MeshStandardMaterial({
                color: 0x795548,
                roughness: 0.7,
            }),
            palmLeaf: new THREE.MeshStandardMaterial({
                color: 0x2ed573,
                roughness: 0.32,
                side: THREE.DoubleSide
            }),
            terracottaPot: new THREE.MeshStandardMaterial({
                color: 0xff6348,
                roughness: 0.6,
            }),
            // 远景金字塔晨光暖金剪影
            pyramidMat: new THREE.MeshBasicMaterial({
                color: 0xffeaa7,
            }),
            archBannerMat: new THREE.MeshStandardMaterial({
                color: 0x00cec9,
                roughness: 0.3,
            })
        };
    }

    /**
     * 预生成几何体 (GPU 共享复用，全生命周期 0 内存泄漏与 0 重复 VBO 分配)
     */
    initGeometries() {
        const stripeLen = 7.5 / 8; // 遮阳棚每道条纹长度

        // 地面
        const groundGeom = new THREE.PlaneGeometry(36, this.chunkLength);
        groundGeom.rotateX(-Math.PI / 2);

        // 棕榈树叶 (扇形垂挂预设)
        const leafGeom = new THREE.PlaneGeometry(0.65, 2.3);
        leafGeom.translate(0, 1.15, 0);
        leafGeom.rotateX(Math.PI / 2.8);

        // 遮阳棚蓝白条纹 (左右倾角预设)
        const stripeGeomLeft = new THREE.PlaneGeometry(2.4, stripeLen);
        stripeGeomLeft.rotateY(Math.PI / 2);
        stripeGeomLeft.rotateZ(Math.PI / 4.5);

        const stripeGeomRight = new THREE.PlaneGeometry(2.4, stripeLen);
        stripeGeomRight.rotateY(Math.PI / 2);
        stripeGeomRight.rotateZ(-Math.PI / 4.5);

        return {
            groundGeom,
            tieGeom: new THREE.BoxGeometry(2.3, 0.12, 0.32),
            railGeom: new THREE.BoxGeometry(0.08, 0.16, this.chunkLength),
            curbGeom: new THREE.BoxGeometry(0.35, 0.22, this.chunkLength),
            columnGeom: new THREE.CylinderGeometry(0.48, 0.52, 9.5, 16),
            capitalGeom: new THREE.CylinderGeometry(0.72, 0.45, 0.8, 16),
            colBeamGeom: new THREE.BoxGeometry(1.2, 0.8, this.chunkLength),
            potGeom: new THREE.CylinderGeometry(0.38, 0.28, 0.65, 12),
            trunkGeom: new THREE.CylinderGeometry(0.12, 0.18, 4.2, 8),
            leafGeom,
            buildingGeom: new THREE.BoxGeometry(7.0, 12, this.chunkLength),
            parapetGeom: new THREE.BoxGeometry(7.4, 1.2, this.chunkLength),
            stripeGeomLeft,
            stripeGeomRight,
            archPierGeom: new THREE.BoxGeometry(1.6, 9.5, 1.8),
            archBeamGeom: new THREE.BoxGeometry(14.2, 1.8, 2.2),
            archBannerGeom: new THREE.BoxGeometry(7.5, 0.9, 2.3),
        };
    }

    /**
     * 远景沙丘与古埃及金字塔群
     */
    buildDistantScenery() {
        // 主金字塔 (左侧深处)
        const p1Geom = new THREE.ConeGeometry(55, 65, 4);
        p1Geom.rotateY(Math.PI / 4);
        const p1 = new THREE.Mesh(p1Geom, this.materials.pyramidMat);
        p1.position.set(-90, 25, 210);
        this.distantHorizonGroup.add(p1);

        // 次金字塔 (右侧深处)
        const p2Geom = new THREE.ConeGeometry(38, 48, 4);
        p2Geom.rotateY(Math.PI / 4);
        const p2 = new THREE.Mesh(p2Geom, this.materials.pyramidMat);
        p2.position.set(75, 18, 240);
        this.distantHorizonGroup.add(p2);

        // 狮身人面像剪影小丘
        const hillGeom = new THREE.ConeGeometry(25, 20, 6);
        const hill = new THREE.Mesh(hillGeom, this.materials.pyramidMat);
        hill.position.set(20, 5, 260);
        this.distantHorizonGroup.add(hill);
    }

    /**
     * 生成单个地块 (Chunk) - 100% 几何体与材质零冗余复用
     */
    spawnChunk() {
        const chunkGroup = new THREE.Group();
        const startZ = this.nextChunkZ;
        const centerZ = startZ + this.chunkLength / 2;

        // 1. 铺设砂石道砟地面
        const ground = new THREE.Mesh(this.geometries.groundGeom, this.materials.groundBallast);
        ground.position.set(0, -0.02, centerZ);
        ground.receiveShadow = true;
        chunkGroup.add(ground);

        // 2. 铺设三条赛道的铁轨与枕木 (Lanes = -3.2, 0, 3.2)
        const lanes = [-CONFIG.LANE_WIDTH, 0, CONFIG.LANE_WIDTH];
        const halfGauge = 0.72; // 轨距一半 1.44米

        lanes.forEach(laneX => {
            // 两条银色钢轨
            [-halfGauge, halfGauge].forEach(offset => {
                const rail = new THREE.Mesh(this.geometries.railGeom, this.materials.steelRail);
                rail.position.set(laneX + offset, 0.08, centerZ);
                chunkGroup.add(rail);
            });

            // 间隔铺设木质枕木 (每隔 1.3米 一根)
            const tieCount = Math.floor(this.chunkLength / 1.3);
            for (let i = 0; i < tieCount; i++) {
                const z = startZ + i * 1.3 + 0.65;
                const tie = new THREE.Mesh(this.geometries.tieGeom, this.materials.woodTie);
                tie.position.set(laneX, 0.02, z);
                chunkGroup.add(tie);
            }
        });

        // 3. 两侧月台警戒隔离边沿与黄线
        for (const side of [-1, 1]) {
            const curbX = side * 5.6;
            const curb = new THREE.Mesh(this.geometries.curbGeom, this.materials.cautionYellow);
            curb.position.set(curbX, 0.1, centerZ);
            chunkGroup.add(curb);
        }

        // 4. 两侧古典埃及托勒密风格砂岩长廊与立柱
        this.buildColonnades(chunkGroup, startZ);

        // 5. 两侧砂岩集市商铺与经典蓝白波浪遮阳雨棚
        this.buildMarketBuildings(chunkGroup, startZ);

        // 6. 周期性横跨轨道的巨型石雕拱门 (每两块地块生成一座)
        if (Math.round(startZ / this.chunkLength) % 2 === 0) {
            this.buildGrandArch(chunkGroup, centerZ);
        }

        chunkGroup.userData = { startZ, endZ: startZ + this.chunkLength };
        this.scene.add(chunkGroup);
        this.chunks.push(chunkGroup);

        this.nextChunkZ += this.chunkLength;
    }

    /**
     * 建造两侧埃及立柱长廊 (Colonnades) 与陶盆棕榈树
     */
    buildColonnades(parent, startZ) {
        const colSpacing = 6.0;
        const count = Math.floor(this.chunkLength / colSpacing);

        for (let i = 0; i < count; i++) {
            const z = startZ + i * colSpacing + 3.0;

            for (const side of [-1, 1]) {
                const x = side * 6.5;

                // A. 砂岩柱础 + 柱身 + 柱头 (托勒密式石柱)
                const colGroup = new THREE.Group();
                colGroup.position.set(x, 0, z);

                // 柱身
                const col = new THREE.Mesh(this.geometries.columnGeom, this.materials.sandstone);
                col.position.y = 4.75;
                col.castShadow = true;
                col.receiveShadow = true;
                colGroup.add(col);

                // 雕花柱头
                const cap = new THREE.Mesh(this.geometries.capitalGeom, this.materials.sandstoneTrim);
                cap.position.y = 9.8;
                cap.castShadow = true;
                colGroup.add(cap);

                parent.add(colGroup);

                // B. 柱间陶盆热带棕榈树 (每隔两根立柱点缀一棵)
                if (i % 2 === 1) {
                    this.buildPalmTree(parent, side * 7.5, z);
                }
            }
        }

        // 柱廊顶部长梁过梁
        for (const side of [-1, 1]) {
            const beam = new THREE.Mesh(this.geometries.colBeamGeom, this.materials.sandstoneTrim);
            beam.position.set(side * 6.5, 10.3, startZ + this.chunkLength / 2);
            parent.add(beam);
        }
    }

    /**
     * 建造两侧砂岩集市商铺楼阁与蓝白相间遮阳雨棚 (Striped Awnings)
     */
    buildMarketBuildings(parent, startZ) {
        for (const side of [-1, 1]) {
            const bX = side * 11.0;
            const centerZ = startZ + this.chunkLength / 2;

            // 主体建筑群 (砂岩两层楼宇，立于柱廊外侧)
            const bMesh = new THREE.Mesh(this.geometries.buildingGeom, this.materials.sandstone);
            bMesh.position.set(bX, 6.0, centerZ);
            bMesh.receiveShadow = true;
            parent.add(bMesh);

            // 顶层女儿墙装饰
            const parapet = new THREE.Mesh(this.geometries.parapetGeom, this.materials.sandstoneDark);
            parapet.position.set(bX, 12.5, centerZ);
            parent.add(parapet);

            // 经典蓝白集市遮阳棚 (每段 10 米一组，向赛道柱廊伸展)
            const awningCount = 4;
            for (let a = 0; a < awningCount; a++) {
                const aZ = startZ + 4.0 + a * 11.0;
                this.buildStripedAwning(parent, side * 7.6, aZ, side);
            }
        }
    }

    /**
     * 蓝白相间多边形波浪遮阳棚 (朝赛道倾斜)
     */
    buildStripedAwning(parent, x, z, side) {
        const awningGroup = new THREE.Group();
        awningGroup.position.set(x, 3.8, z);

        const awningLength = 7.5; // 沿赛道长
        const stripeCount = 8;
        const stripeLen = awningLength / stripeCount;
        const geom = side > 0 ? this.geometries.stripeGeomRight : this.geometries.stripeGeomLeft;

        for (let s = 0; s < stripeCount; s++) {
            const mat = s % 2 === 0 ? this.materials.awningBlue : this.materials.awningWhite;
            const stripe = new THREE.Mesh(geom, mat);
            stripe.position.set(0, 0, (s - (stripeCount - 1) / 2) * stripeLen);
            awningGroup.add(stripe);
        }

        parent.add(awningGroup);
    }

    /**
     * 陶盆绿植棕榈树 (Potted Palm Tree)
     */
    buildPalmTree(parent, x, z) {
        const palmGroup = new THREE.Group();
        palmGroup.position.set(x, 0, z);

        // 陶土花盆
        const pot = new THREE.Mesh(this.geometries.potGeom, this.materials.terracottaPot);
        pot.position.y = 0.35;
        pot.castShadow = true;
        palmGroup.add(pot);

        // 弯曲节状树干
        const trunk = new THREE.Mesh(this.geometries.trunkGeom, this.materials.palmTrunk);
        trunk.position.set(0, 2.4, 0);
        trunk.castShadow = true;
        palmGroup.add(trunk);

        // 放射状下垂棕榈绿叶 (8 片扇形叶面)
        const leafCount = 8;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const leaf = new THREE.Mesh(this.geometries.leafGeom, this.materials.palmLeaf);
            leaf.position.set(0, 4.4, 0);
            leaf.rotation.y = angle;
            palmGroup.add(leaf);
        }

        parent.add(palmGroup);
    }

    /**
     * 横跨三道的古埃及砂岩拱门 (Grand Sandstone Arch)
     */
    buildGrandArch(parent, z) {
        const archGroup = new THREE.Group();
        archGroup.position.set(0, 0, z);

        // 左右两大基石墩
        for (const side of [-1, 1]) {
            const pX = side * 5.8;
            const pier = new THREE.Mesh(this.geometries.archPierGeom, this.materials.sandstone);
            pier.position.set(pX, 4.75, 0);
            pier.castShadow = true;
            archGroup.add(pier);
        }

        // 横向巨型过梁
        const beam = new THREE.Mesh(this.geometries.archBeamGeom, this.materials.sandstoneTrim);
        beam.position.set(0, 9.6, 0);
        beam.castShadow = true;
        archGroup.add(beam);

        // 拱门顶部题额饰板
        const banner = new THREE.Mesh(this.geometries.archBannerGeom, this.materials.archBannerMat);
        banner.position.set(0, 10.6, 0);
        archGroup.add(banner);

        parent.add(archGroup);
    }

    /**
     * 随着玩家向前奔跑，回收并推进远近地块 (保持无限赛道)
     * 严谨 while 循环双向缓冲，绝无断层空洞与卡顿掉块
     */
    update(playerZ) {
        // 远景跟随玩家Z轴同步推进，制造无限开阔纵深
        this.distantHorizonGroup.position.z = playerZ;

        // 1. 回收身后超过 35 米的废弃地块
        while (this.chunks.length > 0 && this.chunks[0].userData.endZ < playerZ - 35) {
            const oldChunk = this.chunks.shift();
            this.scene.remove(oldChunk);
        }

        // 2. 保证前方跑道始终延伸至玩家前方至少 320 米，彻底消除尽头空洞与断层
        while (this.nextChunkZ < playerZ + 320) {
            this.spawnChunk();
        }
    }
}
