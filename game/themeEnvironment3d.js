import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';
import { Environment3D, randomFor } from './environment3d.js';
import { EverydayPropKit } from './everydayProps3d.js';
import { DreamPropKit } from './dreamProps3d.js';
import { createThemeArchitecture } from './themeArchitecture3d.js';
import { createEverydayArchitecture } from './everydayArchitecture3d.js';
import { createDreamArchitecture } from './dreamArchitecture3d.js';

export const WORLD_STYLES = {
    store: { ground: '#ede9dd', road: '#526660', edge: '#d1e5d8', ink: '#e2e8da', accent: '#e97e65', props: ['milkCarton', 'fridge', 'storeShelf', 'snackBag'], gate: 'receiptGate' },
    tea: { ground: '#ad7652', road: '#9ebc9d', edge: '#f4e3bd', ink: '#d8e1c6', accent: '#c87250', props: ['teaCup', 'teapot', 'pearlIsland', 'teaBoat'], gate: 'strawGate' },
    pond: { ground: '#3d7363', road: '#c2a783', edge: '#426e52', ink: '#e5d2ad', accent: '#d3857a', props: ['speakerStage', 'lotus', 'festivalTent', 'reedCluster'], gate: 'leafGate' },
    laundry: { ground: '#e1ded5', road: '#a8b8a4', edge: '#f3eee0', ink: '#e1e6d9', accent: '#d48170', props: ['washer', 'hangingClothes', 'laundryBasket', 'cloudIsland'], gate: 'clothGate' },
};

function textureFor(style, ground = false) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = ground ? 512 : 2048;
    const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    c.fillStyle = ground ? style.ground : style.road; c.fillRect(0, 0, w, h);
    if (ground) {
        c.strokeStyle = style.ink; c.globalAlpha = .15; c.lineWidth = 2;
        for (let n = 0; n < 4; n++) {
            c.beginPath(); c.moveTo(n * 128, 0); c.lineTo(n * 128, h); c.stroke();
            c.beginPath(); c.moveTo(0, n * 128); c.lineTo(w, n * 128); c.stroke();
        }
    } else {
        c.strokeStyle = style.ink; c.lineWidth = 2;
        if (style === WORLD_STYLES.store) {
            for (let y = 0; y < h; y += 64) { c.globalAlpha = .12; c.fillStyle = style.ink; c.fillRect(0, y, w, 2); }
            c.globalAlpha = .9; c.fillStyle = '#f0e9d8'; c.fillRect(228, 0, 56, h);
            c.fillStyle = '#9ba79b';
            for (let y = 32; y < h; y += 80) {
                c.fillRect(239, y, 34, 2); c.fillRect(239, y + 7, 25, 2); c.fillRect(239, y + 14, 30, 2);
            }
        } else if (style === WORLD_STYLES.tea || style === WORLD_STYLES.pond) {
            for (let y = 0; y < h; y += 96) {
                c.globalAlpha = .28; c.fillStyle = style.ink; c.fillRect(0, y, w, 2);
                for (let x = 24; x < w; x += 92) { c.beginPath(); c.ellipse(x, y + 46, 11, 2, 0, 0, Math.PI * 2); c.stroke(); }
            }
        } else {
            c.globalAlpha = .18;
            for (let y = 0; y < h; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
            for (let x = 0; x < w; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
        }
        c.globalAlpha = .65; c.fillStyle = style.edge;
        for (const x of [12, 500]) c.fillRect(x - 3, 0, 6, h);
        c.globalAlpha = .28;
        for (const x of [180, 332]) for (let y = 0; y < h; y += 128) c.fillRect(x - 1, y, 2, 38);
        // Small floor arrows repeat sparsely; large arrows are reserved for live mechanics.
        c.globalAlpha = .25;
        for (const x of [105, 256, 407]) for (let y = 310; y < h; y += 768) {
            c.beginPath(); c.moveTo(x - 10, y + 12); c.lineTo(x, y); c.lineTo(x + 10, y + 12); c.stroke();
        }
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.wrapT = THREE.RepeatWrapping;
    if (ground) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(12, 3.2); }
    return texture;
}

/** The collision floor is continuous; the themed side kits are pooled static instances. */
export class ThemeEnvironment3D extends Environment3D {
    createKit() {
        this.theme = this.options.theme;
        this.themeId = this.theme.id;
        this.style = WORLD_STYLES[this.themeId];
        return ['store', 'tea'].includes(this.themeId) ? new EverydayPropKit() : new DreamPropKit();
    }

    initGeometries() {
        const plane = width => new THREE.PlaneGeometry(width, this.chunkLength).rotateX(-Math.PI / 2);
        return {
            ground: plane(180), road: plane(11.2), box: new THREE.BoxGeometry(1, 1, 1),
            sphere: new THREE.SphereGeometry(1, 12, 8),
            bulb: new THREE.SphereGeometry(1, 6, 4),
            ring: new THREE.TorusGeometry(1, .035, 3, 20).rotateX(-Math.PI / 2),
            cylinder: new THREE.CylinderGeometry(1, 1, 1, 16),
            taper: new THREE.CylinderGeometry(1, .77, 1, 16),
            ringWall: new THREE.TorusGeometry(1, .065, 4, 16),
            sphereLow: new THREE.SphereGeometry(1, 8, 6),
            cylinderLow: new THREE.CylinderGeometry(1, 1, 1, 10),
            taperLow: new THREE.CylinderGeometry(1, .77, 1, 10),
            ringWallLow: new THREE.TorusGeometry(1, .065, 3, 12),
        };
    }

    initMaterials() {
        const matte = color => new THREE.MeshStandardMaterial({ color, roughness: .86 });
        return {
            ground: new THREE.MeshStandardMaterial({ color: 0xffffff, map: textureFor(this.style, true), roughness: .78 }),
            road: new THREE.MeshStandardMaterial({ color: 0xffffff, map: textureFor(this.style), roughness: .91 }),
            edge: matte(this.style.edge), ink: matte(this.style.ink), accent: matte(this.style.accent),
            dark: matte(0x415348), cream: matte(0xf6eedd), cloud: matte(0xf6f1e5),
            light: new THREE.MeshBasicMaterial({ color: 0xffe8a8 }),
        };
    }

    buildDistantScenery() {
        const g = new THREE.SphereGeometry(250, 24, 16), colors = [], p = g.attributes.position;
        const low = new THREE.Color(this.theme.fogColor), high = new THREE.Color(this.theme.skyColor);
        for (let i = 0; i < p.count; i++) {
            const c = low.clone().lerp(high, THREE.MathUtils.smoothstep(p.getY(i) / 250, .02, .55));
            colors.push(c.r, c.g, c.b);
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }));
        sky.renderOrder = -20; this.distantHorizonGroup.add(sky);
        const far = new THREE.Group();
        if (this.themeId === 'store') {
            this.mesh(far, this.geometries.box, this.materials.cream, [0, 13, 210], [165, 30, 3]);
            for (const x of [-55, -25, 25, 55]) {
                this.mesh(far, this.geometries.box, this.materials.edge, [x, 22, 204], [17, 3, .3]);
                this.mesh(far, this.geometries.box, this.materials.light, [x, 24.5, 196], [13, .18, 4]);
            }
        } else {
            for (const [x, z, scale] of [[-44, 150, 2.7], [57, 205, 3.6], [-82, 228, 3]]) {
                const prop = this.kit.create(this.themeId === 'tea' ? 'teaCup' : this.themeId === 'pond' ? 'reedCluster' : 'cloudIsland');
                prop.position.set(x, this.themeId === 'laundry' ? -4 : -.3, z); prop.scale.setScalar(scale);
                far.add(prop);
            }
            if (this.themeId === 'pond') {
                const sun = this.mesh(far, this.geometries.sphere, this.materials.light, [35, 19, 190], [11, 11, 1]);
                sun.name = 'sunsetDisc';
            }
        }
        for (const bucket of this.collectInstances([far]).values()) {
            const mesh = new THREE.InstancedMesh(bucket.geometry, bucket.material, bucket.matrices.length);
            bucket.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
            mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); this.distantHorizonGroup.add(mesh);
        }
    }

    placeProp(chunk, type, side, z, random, scale = 1, innerEdge = 6.9, slot = 0) {
        const prop = this.kit.create(type, Math.floor(random() * 3));
        prop.scale.setScalar(scale); prop.rotation.y = side * (.08 + random() * .13);
        prop.updateMatrixWorld(true);
        let bounds = new THREE.Box3().setFromObject(prop);
        // A landmark owns a six-metre slot, including handles and leaves.
        const span = bounds.max.z - bounds.min.z;
        if (span > 5.35) { prop.scale.multiplyScalar(5.35 / span); prop.updateMatrixWorld(true); bounds = new THREE.Box3().setFromObject(prop); }
        // Measure each authored silhouette, including handles and leaves, before placing it.
        const x = side > 0 ? innerEdge - bounds.min.x : -innerEdge - bounds.max.x;
        prop.position.set(x, 0, z - (bounds.min.z + bounds.max.z) / 2);
        prop.userData.sceneryLayer = 'near'; prop.userData.slot = slot;
        prop.traverse(node => { if (node.isMesh) { node.castShadow = false; node.receiveShadow = false; } });
        chunk.add(prop); prop.updateWorldMatrix(true, true);
        const placedBounds = new THREE.Box3().setFromObject(prop);
        chunk.userData.decorations.push({ type, side, layer: 'near', slot, bounds: placedBounds });
        return placedBounds;
    }

    placeArchitecture(chunk, side, z, random, layer, slot, innerEdge, signature = true) {
        const middle = layer === 'middle';
        const variant = ((chunk.userData.index + slot + (side > 0 ? 1 : 0) + (middle ? 1 : 0)) % 3 + 3) % 3;
        const height = (middle ? 8.1 : 5.0) + random() * (middle ? 2.8 : 2.0);
        const factory = !signature ? createThemeArchitecture : ['store', 'tea'].includes(this.themeId) ? createEverydayArchitecture : createDreamArchitecture;
        const group = factory(this, {
            side, layer, variant, height, width: middle ? 6.3 : 4.8, depth: middle ? 5.2 : 3.3,
        });
        const local = new THREE.Box3().setFromObject(group);
        const x = side > 0 ? innerEdge - local.min.x : -innerEdge - local.max.x;
        group.position.set(x, 0, z - (local.min.z + local.max.z) / 2);
        group.userData.sceneryLayer = layer; group.userData.slot = slot;
        chunk.add(group); group.updateWorldMatrix(true, true);
        const bounds = new THREE.Box3().setFromObject(group);
        chunk.userData.architecture.push({ type: group.userData.type, side, layer, slot, variant, signature, innerEdge, bounds });
        return bounds;
    }

    spawnChunk() {
        const startZ = this.nextChunkZ, index = Math.round(startZ / this.chunkLength), r = randomFor(this.seed, index);
        const chunk = new THREE.Group(); chunk.position.z = startZ;
        chunk.userData = { startZ, endZ: startZ + this.chunkLength, index, decorations: [], architecture: [] };
        const m = this.materials, g = this.geometries, center = this.chunkLength / 2;
        const ground = this.mesh(chunk, g.ground, m.ground, [0, -.11, center]); ground.name = 'surroundingSurface';
        const road = this.mesh(chunk, g.road, m.road, [0, -.005, center]); road.receiveShadow = true;
        let gate = null, gateBounds = null;
        if (index % 4 === 0) {
            gate = this.kit.create(this.style.gate, index % 3); gate.position.z = 37;
            gate.traverse(node => { if (node.isMesh) { node.castShadow = false; node.receiveShadow = false; } });
            chunk.add(gate); gate.updateWorldMatrix(true, true);
            gateBounds = new THREE.Box3().setFromObject(gate);
        }
        for (const side of [-1, 1]) {
            this.mesh(chunk, g.box, m.edge, [side * 5.66, .07, center], [.16, .15, this.chunkLength]);
            let nearOuterEdge = 0;
            for (let slot = 0; slot < 8; slot++) {
                const z = 3 + slot * 6;
                const overlapsGate = gateBounds && startZ + z + 2.8 >= gateBounds.min.z && startZ + z - 2.8 <= gateBounds.max.z;
                const innerEdge = overlapsGate ? Math.max(6.9, (side < 0 ? -gateBounds.min.x : gateBounds.max.x) + .4) : 6.9;
                let bounds;
                if (slot % 2 === 1) {
                    const family = (side < 0 ? 0 : 2) + Math.floor(slot / 2);
                    const type = this.style.props[(index === 0 ? family : Math.floor(r() * this.style.props.length)) % this.style.props.length];
                    const scale = this.themeId === 'store' ? .95 + r() * .14 : .82 + r() * .16;
                    bounds = this.placeProp(chunk, type, side, z, r, scale, innerEdge, slot);
                } else {
                    bounds = this.placeArchitecture(chunk, side, z, r, 'near', slot, innerEdge);
                }
                nearOuterEdge = Math.max(nearOuterEdge, side < 0 ? -bounds.min.x : bounds.max.x);
            }
            // Keep a physical alley between the rows, then stagger the taller back row.
            const middleEdge = Math.max(14.3, nearOuterEdge + .95);
            for (let slot = 0; slot < 6; slot++) {
                this.placeArchitecture(chunk, side, 4 + slot * 8, r, 'middle', slot, middleEdge, slot % 3 !== 1);
            }
            if (this.themeId === 'pond') {
                // Warm festoon bulbs and their cable are light cards, not shadow lights.
                for (let i = 0; i < 6; i++) {
                    const z = 3 + i * 8, y = 3.5 + Math.sin(i * .7) * .4;
                    this.mesh(chunk, g.box, m.dark, [side * 6.75, 1.7, z], [.055, 3.4, .055]);
                    this.mesh(chunk, g.bulb, m.light, [side * 6.75, y, z], [.14, .2, .14]);
                    this.mesh(chunk, g.box, m.dark, [side * 6.75, 3.5, z + 4], [.025, .025, 8]);
                }
                for (let i = 0; i < 3; i++) this.mesh(chunk, g.ring, m.ink, [side * (15 + r() * 17), -.06, r() * 48], [2 + r() * 3, 1, 1.1]);
            } else if (this.themeId === 'tea') {
                for (let i = 0; i < 4; i++) this.mesh(chunk, g.sphere, m.dark,
                    [side * (16 + r() * 24), -.5, r() * 48], [1 + r(), .75, 1 + r()]);
            } else if (this.themeId === 'laundry') {
                for (let i = 0; i < 3; i++) this.mesh(chunk, g.sphere, m.cloud,
                    [side * (17 + r() * 20), -.8, r() * 48], [4 + r() * 5, 1.8, 4 + r() * 4]);
            }
        }
        if (gate) chunk.userData.decorations.push({ type: 'gate', side: 0, layer: 'overhead', bounds: gateBounds });
        chunk.userData.density = { nearSlotsPerSide: 8, buildingsPerSide: 10, signatureBuildingsPerSide: 8, landmarksPerSide: 4, nearSpacing: 6, middleSpacing: 8, layers: ['near', 'middle'] };
        this.chunks.push(chunk); this.nextChunkZ += this.chunkLength;
    }

    update(playerZ, dt = 0) {
        this.renderPlayerZ = playerZ;
        super.update(playerZ);
        // Chunk recycling already rebuilt at this position. Between chunks, only
        // a changed source visibility needs fresh instance matrices.
        if (this.instancePlayerZ !== playerZ && this.chunks.some(chunk => chunk.children.some(source =>
            source.isGroup && this.isSourceVisible(source, chunk, this.instancePlayerZ) !== this.isSourceVisible(source, chunk, playerZ)))) {
            this.rebuildInstances();
        }
        this.elapsed = (this.elapsed || 0) + dt;
        if (this.themeId === 'store' && this.materials.road.map) {
            this.materials.road.map.offset.y = (this.elapsed * .09) % 1;
        }
    }

    rebuildInstances() {
        super.rebuildInstances();
        this.instancePlayerZ = this.renderPlayerZ ?? 0;
    }

    isSourceVisible(source, chunk, playerZ) {
        const distance = chunk.userData.startZ + source.position.z - playerZ;
        const limit = source.userData.architecture ? (source.userData.layer === 'middle' ? 120 : 100) : 64;
        // Both lobby and running cameras face +Z; a whole side object 14 m
        // behind the player is safely behind them, even with its slot depth.
        return distance >= -14 && distance <= limit;
    }

    shouldInstance(node, chunk) {
        if (chunk.userData.startZ === undefined || node.parent === chunk) return true;
        let source = node;
        while (source.parent && source.parent !== chunk) source = source.parent;
        // Detailed props yield to inexpensive street silhouettes in the distance.
        return this.isSourceVisible(source, chunk, this.renderPlayerZ ?? 0);
    }

    reset() { this.renderPlayerZ = 0; this.elapsed = 0; super.reset(); }
}
