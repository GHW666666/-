/** Open Egyptian landscape with seeded scenery and pooled static instances. */
import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';
import { EgyptPropKit } from './egyptProps3d.js';

export function randomFor(seed, index) {
    let state = (seed ^ Math.imul(index, 0x45d9f3b)) >>> 0;
    return () => {
        state += 0x6d2b79f5;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Sparse printed motifs stay beneath rails and gameplay objects.
function createTrackTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 2048;
    const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    c.fillStyle = '#f7ead1'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#deceb3'; c.lineWidth = 2;
    for (let y = 0; y <= h; y += 128) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
        for (let x = 0; x < w; x += 128) {
            const dx = x + (y % 256 ? 64 : 0);
            c.beginPath(); c.moveTo(dx, y); c.lineTo(dx, y + 128); c.stroke();
        }
    }
    for (const x of [10, 502]) {
        c.fillStyle = '#247f88'; c.fillRect(x - 3, 0, 6, h);
        c.fillStyle = '#ddae55'; c.fillRect(x + (x < 256 ? 8 : -10), 0, 3, h);
    }
    const lanes = [w * .215, w * .5, w * .785];
    c.lineWidth = 3;
    for (let i = 0; i < 4; i++) for (const x of lanes) {
        c.save(); c.translate(x, 190 + i * 512); c.globalAlpha = .38;
        c.strokeStyle = i % 2 ? '#398a8a' : '#b89248';
        if (i % 2 === 0) {
            c.beginPath(); c.arc(0, 0, 13, 0, Math.PI * 2); c.stroke();
            for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
                c.beginPath(); c.moveTo(side * 17, -7 + k * 7);
                c.lineTo(side * 49, -20 + k * 7); c.lineTo(side * 35, 9 + k * 4); c.stroke();
            }
        } else {
            c.beginPath();
            for (let k = -2; k <= 2; k++) {
                c.moveTo(0, 22); c.quadraticCurveTo(k * 22, -4, k * 13, -25);
                c.quadraticCurveTo(k * 5, 0, 0, 22);
            }
            c.stroke();
        }
        c.restore();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

function createBannerTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
    const c = canvas.getContext('2d');
    c.fillStyle = '#fff3da'; c.fillRect(10, 10, 108, 3); c.fillRect(10, 239, 108, 3);
    c.strokeStyle = '#fff3da'; c.lineWidth = 3;
    c.beginPath(); c.arc(64, 87, 21, 0, Math.PI * 2); c.stroke();
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
        c.beginPath(); c.moveTo(64 + side * 26, 78 + i * 8);
        c.lineTo(64 + side * 48, 66 + i * 8); c.stroke();
    }
    for (let i = 0; i < 3; i++) {
        c.beginPath(); c.moveTo(32, 156 + i * 16); c.lineTo(48, 145 + i * 16);
        c.lineTo(64, 156 + i * 16); c.lineTo(80, 145 + i * 16); c.lineTo(96, 156 + i * 16); c.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    return texture;
}

export class Environment3D {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = options;
        this.chunkLength = CONFIG.WORLD.CHUNK_LENGTH;
        this.chunkCount = CONFIG.WORLD.VISIBLE_CHUNKS;
        this.fixedSeed = options.seed;
        this.seed = this.fixedSeed ?? Math.floor(Math.random() * 0xffffffff);
        this.chunks = [];
        this.nextChunkZ = -this.chunkLength;
        this.kit = this.createKit();
        this.geometries = this.initGeometries();
        this.materials = this.initMaterials();
        this.instancePool = new Map();
        this.renderGroup = new THREE.Group();
        this.renderGroup.name = `${options.theme?.id || 'egypt'}StaticInstances`;
        this.scene.add(this.renderGroup);
        this.distantHorizonGroup = new THREE.Group();
        this.scene.add(this.distantHorizonGroup);
        this.buildDistantScenery();
        for (let i = 0; i < this.chunkCount; i++) this.spawnChunk();
        this.rebuildInstances();
    }

    createKit() {
        return new EgyptPropKit();
    }

    initMaterials() {
        const matte = color => new THREE.MeshStandardMaterial({ color, roughness: .86 });
        const bannerMap = createBannerTexture();
        const banner = color => {
            const material = new THREE.MeshStandardMaterial({ color, roughness: .92, side: THREE.DoubleSide });
            if (bannerMap) {
                // White motif ink over a colored textile, with no extra surface.
                material.map = bannerMap;
                material.onBeforeCompile = shader => {
                    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
                        `vec4 ink = texture2D(map, vMapUv);
                        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.96, .90, .78), ink.a);`);
                };
                material.customProgramCacheKey = () => 'egypt-textile-ink';
            }
            return material;
        };
        return {
            sand: matte(0xeecfa1), dune: matte(0xe5be86),
            road: new THREE.MeshStandardMaterial({ color: 0xffffff, map: createTrackTexture(), roughness: .84 }),
            pavement: matte(0xf5e4c2), sleeper: matte(0xb8bbad),
            rail: new THREE.MeshStandardMaterial({ color: 0x32656b, roughness: .50, metalness: .28 }),
            teal: matte(0x168f91), navy: matte(0x223d6b), gold: matte(0xe4b359),
            coral: matte(0xf07858), stone: matte(0xf2d8ac),
            tealBanner: banner(0x168f91), coralBanner: banner(0xef8264)
        };
    }

    initGeometries() {
        const plane = width => new THREE.PlaneGeometry(width, this.chunkLength).rotateX(-Math.PI / 2);
        return {
            sand: plane(180), road: plane(11.2), pavement: plane(3.2),
            rail: new THREE.BoxGeometry(.085, .14, this.chunkLength),
            sleeper: new THREE.BoxGeometry(2.1, .08, .24),
            curb: new THREE.BoxGeometry(.24, .20, this.chunkLength),
            stripe: new THREE.BoxGeometry(.045, .025, this.chunkLength),
            box: new THREE.BoxGeometry(1, 1, 1),
            banner: new THREE.PlaneGeometry(1.0, 1.9, 1, 4),
            sphere: new THREE.SphereGeometry(1, 16, 8)
        };
    }

    mesh(parent, geometry, material, position, scale = [1, 1, 1], shadow = false) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position); mesh.scale.set(...scale);
        mesh.castShadow = shadow; mesh.receiveShadow = shadow;
        parent.add(mesh); return mesh;
    }

    buildDistantScenery() {
        const skyGeometry = new THREE.SphereGeometry(250, 24, 16);
        const colors = [], p = skyGeometry.attributes.position;
        const horizon = new THREE.Color(0xf5e4c7), blue = new THREE.Color(0x91d1df);
        for (let i = 0; i < p.count; i++) {
            const color = horizon.clone().lerp(blue, THREE.MathUtils.smoothstep(p.getY(i) / 250, 0, .5));
            colors.push(color.r, color.g, color.b);
        }
        skyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const sky = new THREE.Mesh(skyGeometry, new THREE.MeshBasicMaterial({
            vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false
        }));
        sky.renderOrder = -20;
        this.distantHorizonGroup.add(sky);
        const distant = new THREE.Group();
        for (const [x, z, scale] of [[-53, 182, 3.2], [64, 211, 4], [-96, 224, 2.5]]) {
            const pyramid = this.kit.createPyramid(0);
            pyramid.position.set(x, -.4, z); pyramid.scale.setScalar(scale);
            pyramid.traverse(node => { if (node.isMesh) node.castShadow = false; });
            distant.add(pyramid);
        }
        distant.updateMatrixWorld(true);
        for (const bucket of this.collectInstances([distant]).values()) {
            const mesh = new THREE.InstancedMesh(bucket.geometry, bucket.material, bucket.matrices.length);
            bucket.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
            mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
            this.distantHorizonGroup.add(mesh);
        }
    }

    addProp(chunk, type, side, z, random, options = {}) {
        const factory = {
            pyramid: 'createPyramid', pharaoh: 'createPharaoh',
            obelisk: 'createObelisk', palm: 'createPalm', gate: 'createTempleGate'
        }[type];
        const prop = this.kit[factory](options.variant ?? Math.floor(random() * 2));
        const x = options.x ?? side * (type === 'pyramid' ? 17 + random() * 7 : type === 'palm' ? 10.5 + random() * 2 : 8.4 + random() * 2);
        prop.position.set(x, 0, z);
        const scale = options.scale ?? (type === 'pyramid' ? .75 + random() * .4 : .85 + random() * .2);
        prop.scale.setScalar(scale);
        prop.rotation.y = options.rotation ?? (type === 'pyramid' ? (random() - .5) * .28 : side * -.12);
        prop.traverse(node => {
            if (node.isMesh) {
                // Grounding comes from the sculpted plinth. Reserve dynamic
                // shadows for the player, hazards and the overhead gate.
                node.castShadow = type === 'gate';
                node.receiveShadow = false;
            }
        });
        chunk.add(prop);
        prop.updateWorldMatrix(true, true);
        chunk.userData.decorations.push({ type, side, bounds: new THREE.Box3().setFromObject(prop) });
    }

    buildKiosk(parent, side, z, random) {
        const kiosk = new THREE.Group(); kiosk.position.set(side * 10.4, 0, z);
        const box = this.geometries.box, m = this.materials;
        this.mesh(kiosk, box, m.stone, [0, .30, 0], [3.2, .60, 3]);
        for (const x of [-1.25, 1.25]) for (const dz of [-1.0, 1.0]) {
            this.mesh(kiosk, box, m.gold, [x, 1.7, dz], [.13, 2.8, .13]);
        }
        const cloth = random() < .5 ? m.teal : m.coral;
        this.mesh(kiosk, box, cloth, [0, 3.1, 0], [3.8, .16, 3.5]);
        for (let i = 0; i < 5; i++) this.mesh(kiosk, box, m.pavement, [0, 3.19, (i - 2) * .65], [3.75, .018, .16]);
        this.mesh(kiosk, box, m.navy, [0, .95, -1.05], [2.8, .5, .2]);
        parent.add(kiosk);
        kiosk.updateWorldMatrix(true, true);
        parent.userData.decorations.push({ type: 'market', side, bounds: new THREE.Box3().setFromObject(kiosk) });
    }

    spawnChunk() {
        const startZ = this.nextChunkZ, index = Math.round(startZ / this.chunkLength);
        const random = randomFor(this.seed, index);
        const chunk = new THREE.Group(); chunk.position.z = startZ;
        chunk.userData = { startZ, endZ: startZ + this.chunkLength, index, decorations: [] };
        const m = this.materials, g = this.geometries, center = this.chunkLength / 2;
        this.mesh(chunk, g.sand, m.sand, [0, -.07, center]);
        const road = this.mesh(chunk, g.road, m.road, [0, -.005, center]); road.receiveShadow = true;
        for (const laneX of [-CONFIG.LANE_WIDTH, 0, CONFIG.LANE_WIDTH]) {
            for (const offset of [-.72, .72]) this.mesh(chunk, g.rail, m.rail, [laneX + offset, .075, center]);
            for (let i = 0; i < this.chunkLength / 2; i++) this.mesh(chunk, g.sleeper, m.sleeper, [laneX, .012, i * 2 + 1]);
        }
        for (const side of [-1, 1]) {
            this.mesh(chunk, g.curb, m.stone, [side * 5.7, .08, center]);
            this.mesh(chunk, g.stripe, m.teal, [side * 5.55, .10, center]);
            this.mesh(chunk, g.pavement, m.pavement, [side * 7.5, .04, center]);
            this.mesh(chunk, g.stripe, m.gold, [side * 9.05, .055, center]);
            for (let i = 0; i < 4; i++) {
                const z = 4 + i * 12;
                this.mesh(chunk, g.box, m.navy, [side * 6.1, .37, z], [.18, .72, .18]);
                this.mesh(chunk, g.box, m.gold, [side * 6.1, .77, z], [.24, .12, .24]);
            }
            const bannerZ = side < 0 ? 11 : 36;
            this.mesh(chunk, g.box, m.navy, [side * 7.25, 1.95, bannerZ], [.07, 3.9, .07]);
            this.mesh(chunk, g.box, m.gold, [side * 7.25, 3.92, bannerZ], [1.25, .07, .07]);
            this.mesh(chunk, g.banner, index % 2 ? m.coralBanner : m.tealBanner,
                [side * 7.25, 2.91, bannerZ]);
            const sceneType = index === 0 ? (side < 0 ? 0 : 1) : Math.floor(random() * 4);
            const offset = side < 0 ? 0 : 7;
            if (sceneType === 0) {
                this.addProp(chunk, 'pyramid', side, 26 + offset + random() * 6, random);
                this.addProp(chunk, 'pharaoh', side, 16 + offset, random, { x: side * 8.1 });
                this.addProp(chunk, 'palm', side, 4 + offset, random, { x: side * 10 });
            } else if (sceneType === 1) {
                this.addProp(chunk, 'pharaoh', side, 22 + offset, random, { x: side * 8.1, scale: 1.12 });
                this.addProp(chunk, 'obelisk', side, 8 + offset, random, { x: side * 9.6 });
                this.addProp(chunk, 'pyramid', side, 37, random, { x: side * 21, scale: .7 });
            } else if (sceneType === 2) {
                this.buildKiosk(chunk, side, 24 + offset, random);
                this.addProp(chunk, 'palm', side, 6 + offset, random);
                this.addProp(chunk, 'palm', side, 37 + random() * 5, random, { x: side * 12.5 });
            } else {
                this.addProp(chunk, 'obelisk', side, 27 + offset, random);
                this.addProp(chunk, 'pyramid', side, 21 + offset, random, { x: side * 25, scale: 1.05 });
            }
            for (let i = 0; i < 2; i++) this.mesh(chunk, g.sphere, i ? m.dune : m.sand,
                [side * (26 + random() * 24), -.35, random() * 48],
                [6 + random() * 7, .7 + random(), 7 + random() * 8]);
        }
        if (index % 4 === 2) this.addProp(chunk, 'gate', 0, 20, random, { x: 0, scale: 1, rotation: 0, variant: 0 });
        this.chunks.push(chunk);
        this.nextChunkZ += this.chunkLength;
    }

    collectInstances(groups) {
        const buckets = new Map();
        for (const group of groups) {
            group.updateMatrixWorld(true);
            group.traverse(node => {
                if (!node.isMesh) return;
                if (!this.shouldInstance(node, group)) return;
                const key = [node.geometry.uuid, node.material.uuid, +node.castShadow, +node.receiveShadow].join(':');
                if (!buckets.has(key)) buckets.set(key, {
                    geometry: node.geometry, material: node.material,
                    castShadow: node.castShadow, receiveShadow: node.receiveShadow, matrices: []
                });
                buckets.get(key).matrices.push(node.matrixWorld.clone());
            });
        }
        return buckets;
    }

    shouldInstance() { return true; }

    rebuildInstances() {
        for (const entry of this.instancePool.values()) entry.mesh.visible = false;
        for (const [key, bucket] of this.collectInstances(this.chunks)) {
            let entry = this.instancePool.get(key);
            if (!entry || entry.capacity < bucket.matrices.length) {
                if (entry) { this.renderGroup.remove(entry.mesh); entry.mesh.dispose(); }
                const capacity = 2 ** Math.ceil(Math.log2(Math.max(bucket.matrices.length, 1)));
                const mesh = new THREE.InstancedMesh(bucket.geometry, bucket.material, capacity);
                mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                mesh.castShadow = bucket.castShadow; mesh.receiveShadow = bucket.receiveShadow;
                entry = { mesh, capacity }; this.instancePool.set(key, entry); this.renderGroup.add(mesh);
            }
            const mesh = entry.mesh;
            mesh.visible = true; mesh.count = bucket.matrices.length;
            bucket.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
            mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
        }
    }

    reset() {
        this.chunks = []; this.nextChunkZ = -this.chunkLength;
        this.seed = this.fixedSeed ?? Math.floor(Math.random() * 0xffffffff);
        this.distantHorizonGroup.position.z = 0;
        for (let i = 0; i < this.chunkCount; i++) this.spawnChunk();
        this.rebuildInstances();
    }

    update(playerZ) {
        this.distantHorizonGroup.position.z = playerZ;
        let changed = false;
        while (this.chunks.length && this.chunks[0].userData.endZ < playerZ - 35) {
            this.chunks.shift(); changed = true;
        }
        if (!this.chunks.length) this.nextChunkZ = Math.floor((playerZ - 35) / this.chunkLength) * this.chunkLength;
        while (this.nextChunkZ < playerZ + 320) { this.spawnChunk(); changed = true; }
        if (changed) this.rebuildInstances();
    }

    dispose() {
        const geometries = new Set(), materials = new Set(), textures = new Set();
        const visit = node => {
            if (!node.isMesh) return;
            geometries.add(node.geometry);
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
                materials.add(material);
                for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
            }
            if (node.isInstancedMesh) node.dispose();
        };
        this.renderGroup.traverse(visit);
        this.distantHorizonGroup.traverse(visit);
        for (const library of [this.geometries]) {
            for (const geometry of Object.values(library || {})) geometries.add(geometry);
        }
        for (const material of Object.values(this.materials)) {
            materials.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        }
        const kitGeometries = new Set([...Object.values(this.kit.geometries || {}), ...Object.values(this.kit.unit || {})]);
        const kitMaterials = new Set(Object.values(this.kit.materials || {}));
        geometries.forEach(geometry => { if (!kitGeometries.has(geometry)) geometry.dispose(); });
        materials.forEach(material => { if (!kitMaterials.has(material)) material.dispose(); });
        textures.forEach(texture => texture.dispose());
        this.kit.dispose?.();
        // Egypt's older kit exposes shared resources rather than a disposer.
        if (!this.kit.dispose) {
            kitGeometries.forEach(geometry => geometry.dispose());
            kitMaterials.forEach(material => material.dispose());
        }
        this.scene.remove(this.renderGroup, this.distantHorizonGroup);
        this.instancePool.clear();
        this.chunks = [];
    }
}
