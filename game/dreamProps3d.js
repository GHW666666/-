/** Authored, instanceable scenery for the pond festival and cloud laundry maps.
 * All props rest at y = 0; decorated fronts face -Z. Factories reuse every
 * geometry/material, so the environment can pool them by material identity.
 */
import * as THREE from '../libs/three.module.js';

const matrix = new THREE.Matrix4();
const normalMatrix = new THREE.Matrix3();
const rotation = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const position = new THREE.Vector3();
const scale = new THREE.Vector3();
const normal = new THREE.Vector3();

function bake(parts) {
    const positions = [], normals = [];
    for (const part of parts) {
        const source = part.geometry;
        const geometry = source.index ? source.toNonIndexed() : source;
        rotation.set(...(part.rotation || [0, 0, 0]));
        quaternion.setFromEuler(rotation);
        position.set(...(part.position || [0, 0, 0]));
        scale.set(...(part.scale || [1, 1, 1]));
        matrix.compose(position, quaternion, scale);
        normalMatrix.getNormalMatrix(matrix);
        const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal');
        const mirrored = matrix.determinant() < 0;
        for (let j = 0; j < p.count; j++) {
            const corner = j % 3;
            const i = mirrored ? j - corner + (corner === 0 ? 0 : 3 - corner) : j;
            position.fromBufferAttribute(p, i).applyMatrix4(matrix);
            normal.fromBufferAttribute(n, i).applyMatrix3(normalMatrix).normalize();
            positions.push(position.x, position.y, position.z);
            normals.push(normal.x, normal.y, normal.z);
        }
        if (geometry !== source) geometry.dispose();
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    result.computeBoundingBox(); result.computeBoundingSphere();
    return result;
}

function outlineGeometry(points, depth = .16, bevel = .02) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: bevel > 0, bevelSize: bevel,
        bevelThickness: bevel, bevelSegments: 1, steps: 1, curveSegments: 12,
    });
}

// A shallow curved lily pad with a real notch, scalloped rim and thick underside.
function lilyGeometry() {
    const ring = [], vertices = [], indices = [];
    const segments = 28;
    ring.push([.07, .10, -.10]);
    for (let i = 0; i <= segments; i++) {
        const angle = -.98 + i / segments * (Math.PI * 2 - .52);
        const r = 1 + .055 * Math.sin(i * 2.25);
        ring.push([Math.cos(angle) * r, .14 + .035 * Math.sin(i * 1.7), Math.sin(angle) * r]);
    }
    ring.push([-.07, .10, -.10]);
    vertices.push(0, .17, 0, 0, -.09, 0);
    for (const [x, y, z] of ring) vertices.push(x, y, z, x, y - .12, z);
    for (let i = 0; i < ring.length; i++) {
        const a = 2 + i * 2, b = 2 + ((i + 1) % ring.length) * 2;
        indices.push(0, b, a, 1, a + 1, b + 1, a, b, b + 1, a, b + 1, a + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
}

// Raised teardrop forms work as lotus petals and long organic leaves.
function petalGeometry() {
    const points = [[0, 0], [-.28, .25], [-.43, .64], [-.30, 1.04], [0, 1.52], [.30, 1.04], [.43, .64], [.28, .25]];
    const positions = [0, .15, .64, 0, -.07, .64];
    for (const [x, z] of points) positions.push(x, .045 + z * z * .23, z, x, -.075 + z * z * .23, z);
    const indices = [];
    for (let i = 0; i < points.length; i++) {
        const a = 2 + i * 2, b = 2 + ((i + 1) % points.length) * 2;
        indices.push(0, a, b, 1, b + 1, a + 1, a, a + 1, b + 1, a, b + 1, b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
}

// A curved hanging cloth surface, with thickness and scalloped free edge.
function clothGeometry() {
    const vertices = [], indices = [], columns = 10, rows = 5;
    for (let layer = 0; layer < 2; layer++) for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
        const u = x / columns, v = y / rows;
        vertices.push(u - .5, v + (1 - v) * (.04 + .025 * Math.cos(u * Math.PI * 6)),
            Math.sin(u * Math.PI * 6) * .07 * (1 - v * .75) + Math.sin(v * Math.PI) * .05 + layer * .025);
    }
    const count = (columns + 1) * (rows + 1);
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
        const a = y * (columns + 1) + x, b = a + 1, c = a + columns + 1, d = c + 1;
        indices.push(a, c, b, b, c, d, a + count, b + count, c + count, b + count, d + count, c + count);
    }
    const edges = [];
    for (let x = 0; x < columns; x++) edges.push([x, x + 1], [rows * (columns + 1) + x + 1, rows * (columns + 1) + x]);
    for (let y = 0; y < rows; y++) edges.push([(y + 1) * (columns + 1), y * (columns + 1)], [y * (columns + 1) + columns, (y + 1) * (columns + 1) + columns]);
    for (const [a, b] of edges) indices.push(a, b, b + count, a, b + count, a + count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
}

const SPECIFICATIONS = {
    lotus: [['lotusLeaf', 'leaf'], ['lotusFlower', 'flowerAccent']],
    speakerStage: [['stageBody', 'plum'], ['stageDrivers', 'ink'], ['stageTrim', 'apricot']],
    reedCluster: [['reedStalks', 'reed'], ['reedLeaves', 'leafLight']],
    festivalTent: [['tentCloth', 'festivalAccent'], ['tentStructure', 'oat']],
    leafGate: [['leafGateFrame', 'leaf'], ['leafGateLights', 'apricot']],
    washer: [['washerShell', 'oat'], ['washerCavity', 'ink'], ['washerDetails', 'sage']],
    laundryBasket: [['basketWeave', 'wicker'], ['basketClothes', 'laundryAccent']],
    hangingClothes: [['clothesFrame', 'oat'], ['clothesFabric', 'laundryAccent']],
    cloudIsland: [['islandCloud', 'cloud'], ['islandTop', 'sage']],
    clothGate: [['clothGateFrame', 'sage'], ['clothGateFabric', 'laundryAccent']],
};

export class DreamPropKit {
    constructor() {
        const mat = (color, roughness = .84, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        this.materials = {
            leaf: mat(0x29684f), leafLight: mat(0x5c9c69), reed: mat(0x7e8960),
            plum: mat(0x695064), ink: mat(0x343b3c), apricot: mat(0xf4ca8e, .67),
            oat: mat(0xf4efe3, .65), sage: mat(0x92b3a0, .72),
            cloud: mat(0xe0dcd2), wicker: mat(0xb59872),
            coral: mat(0xe89080), rose: mat(0xe8b5b2), cream: mat(0xffe2a8),
        };
        this.geometries = {};
        this.sources = {
            box: new THREE.BoxGeometry(1, 1, 1),
            ball: new THREE.SphereGeometry(1, 12, 8),
            rod: new THREE.CylinderGeometry(1, 1, 1, 10),
            ring: new THREE.TorusGeometry(1, .09, 5, 24),
            petal: petalGeometry(), lily: lilyGeometry(), cloth: clothGeometry(),
            shirt: outlineGeometry([[-.39, 0], [.39, 0], [.41, .86], [.68, .77], [.87, 1.12], [.40, 1.42], [.18, 1.47], [.13, 1.33], [-.13, 1.33], [-.18, 1.47], [-.4, 1.42], [-.87, 1.12], [-.68, .77], [-.41, .86]], .08, .015),
            sock: outlineGeometry([[-.20, 0], [.27, 0], [.39, .12], [.35, .33], [.15, .41], [.13, 1.15], [-.21, 1.15]], .12, .018),
        };
        this.buildLotus(); this.buildStage(); this.buildReeds(); this.buildTent(); this.buildLeafGate();
        this.buildWasher(); this.buildBasket(); this.buildClothes(); this.buildIsland(); this.buildClothGate();
        for (const [type, specification] of Object.entries(SPECIFICATIONS)) {
            const geometries = specification.map(([name]) => this.geometries[name]);
            if (type === 'reedCluster') for (const geometry of geometries) geometry.scale(.66, 1, 1);
            const minimumY = Math.min(...geometries.map(geometry => {
                geometry.computeBoundingBox(); return geometry.boundingBox.min.y;
            }));
            for (const geometry of geometries) {
                geometry.translate(0, -minimumY, 0);
                geometry.computeBoundingBox(); geometry.computeBoundingSphere();
            }
        }
        // Only the 22 baked geometries remain alive after construction.
        for (const geometry of Object.values(this.sources)) geometry.dispose();
        this.sources = {};
    }

    part(kind, position0, scale0 = [1, 1, 1], rotation0 = [0, 0, 0]) {
        return { geometry: this.sources[kind], position: position0, scale: scale0, rotation: rotation0 };
    }

    add(name, parts) { this.geometries[name] = bake(parts); }

    accent(name, variant) {
        const index = ((Math.floor(variant) % 3) + 3) % 3;
        const palettes = {
            flowerAccent: ['rose', 'cream', 'coral'],
            festivalAccent: ['coral', 'rose', 'sage'],
            laundryAccent: ['coral', 'sage', 'rose'],
        };
        return this.materials[palettes[name]?.[index] || name];
    }

    create(type, variant = 0) {
        const specification = SPECIFICATIONS[type];
        if (!specification) throw new Error(`Unknown dream prop: ${type}`);
        const group = new THREE.Group();
        group.name = `dream-${type}`;
        group.userData.dreamProp = type; group.userData.variant = variant;
        for (const [geometry, material] of specification) {
            const mesh = new THREE.Mesh(this.geometries[geometry], this.accent(material, variant));
            mesh.name = geometry; mesh.receiveShadow = true; mesh.castShadow = false;
            group.add(mesh);
        }
        return group;
    }

    buildLotus() {
        const leaves = [this.part('lily', [0, .39, .15], [2.33, 1.2, 2.14]),
            this.part('rod', [.43, .90, -.15], [.11, 1.35, .11], [0, 0, -.13]),
            this.part('lily', [-1.30, .31, .56], [1.05, .8, .86], [0, .6, .14])];
        // Fine raised leaf ribs retain their shape under oblique light.
        for (let i = 0; i < 9; i++) leaves.push(this.part('petal', [0, .64, .16], [.025, .02, 1.32], [0, i * Math.PI * 2 / 9, 0]));
        this.add('lotusLeaf', leaves);
        const petals = [];
        for (let i = 0; i < 9; i++) petals.push(this.part('petal', [.43, 1.42, -.15], [1.06, 1.1, .91], [0, i * Math.PI * 2 / 9, 0]));
        for (let i = 0; i < 6; i++) petals.push(this.part('petal', [.43, 1.58, -.15], [.76, 1.8, .61], [-.27, i * Math.PI / 3 + .22, 0]));
        petals.push(this.part('ball', [.43, 1.85, -.15], [.28, .24, .28]));
        this.add('lotusFlower', petals);
    }

    buildStage() {
        const cabinet = outlineGeometry([[-.5, -.5], [.5, -.5], [.5, .43], [.43, .5], [-.43, .5], [-.5, .43]], 1, .02);
        const body = [this.part('box', [0, .30, 0], [6, .60, 3.30]),
            this.part('box', [0, .71, -.54], [3.2, .22, 1.7])];
        for (const side of [-1, 1]) body.push({ geometry: cabinet, position: [side * 2.15, 3.50, -.85], scale: [1.51, 5.6, 1.67] });
        this.add('stageBody', body); cabinet.dispose();
        const drivers = [], trims = [];
        for (const side of [-1, 1]) {
            const x = side * 2.15;
            for (const [y, r] of [[2.12, .53], [3.54, .53], [5.01, .34]]) {
                drivers.push(this.part('rod', [x, y, -.943], [r, .10, r], [Math.PI / 2, 0, 0]));
                drivers.push(this.part('ball', [x, y, -1.02], [r * .33, r * .33, .12]));
                trims.push(this.part('ring', [x, y, -1.02], [r, r, .60]));
            }
            for (let i = 0; i < 5; i++) drivers.push(this.part('box', [x, 5.64 + i * .085, -.94], [.93, .026, .04]));
            trims.push(this.part('box', [x, 6.33, .15], [1.67, .12, 1.97]));
        }
        trims.push(this.part('box', [0, .67, -1.61], [5.6, .09, .10]));
        trims.push(this.part('rod', [.38, 1.65, -.55], [.045, 1.62, .045], [0, 0, -.17]));
        trims.push(this.part('ball', [.23, 2.47, -.55], [.14, .21, .14]));
        trims.push(this.part('box', [0, 6.65, .15], [5.87, .24, .26]));
        for (let i = 0; i < 11; i++) trims.push(this.part('ball', [-2.6 + i * .52, 6.94 - .2 * Math.sin(i / 10 * Math.PI), .14], [.105, .105, .105]));
        this.add('stageDrivers', drivers); this.add('stageTrim', trims);
    }

    buildReeds() {
        const stalks = [], leaves = [];
        for (let i = 0; i < 9; i++) {
            const x = -1.5 + (i % 4) * .9, z = -.7 + Math.floor(i / 4) * .55;
            const height = 2.95 + (i % 3) * .76, lean = .07 * Math.sin(i * 2.8);
            stalks.push(this.part('rod', [x, height / 2, z], [.045, height, .045], [0, 0, lean]));
            stalks.push(this.part('ball', [x - height / 2 * Math.sin(lean), height + .12, z], [.13, .35, .13]));
            for (let j = 0; j < 2; j++) leaves.push(this.part('petal', [x, .55 + j * .85, z], [.27, 1.7, 1.11], [-.65, i * 1.8 + j * 2.8, .14]));
        }
        this.add('reedStalks', stalks); this.add('reedLeaves', leaves);
    }

    buildTent() {
        const roof = outlineGeometry([[-3, 0], [-2.65, .47], [0, 1.90], [2.65, .47], [3, 0]], 3.7, .02);
        const cloth = [{ geometry: roof, position: [0, 3.8, -1.85] }];
        const structure = [];
        for (const side of [-1, 1]) for (const z of [-1.45, 1.45]) structure.push(this.part('rod', [side * 2.5, 2.05, z], [.11, 4.1, .11]));
        structure.push(this.part('box', [0, 3.84, -1.86], [5.75, .14, .18]));
        structure.push(this.part('box', [0, 1.50, 1.1], [4.9, .14, .85]));
        for (let i = 0; i < 6; i++) {
            cloth.push(this.part('cloth', [-2.5 + i, 3.10, -1.90], [.90, .67, .65]));
            structure.push(this.part('ball', [-2.5 + i, 3.46, -1.91], [.07, .09, .07]));
        }
        structure.push(this.part('rod', [0, 5.52, 0], [.07, .85, .07]));
        cloth.push(this.part('petal', [0, 5.6, 0], [.60, .3, .5], [-Math.PI / 2, 0, -.12]));
        this.add('tentCloth', cloth); this.add('tentStructure', structure); roof.dispose();
    }

    buildLeafGate() {
        const frame = [], lights = [];
        for (const side of [-1, 1]) {
            frame.push(this.part('rod', [side * 7.5, 4.6, 0], [.24, 9.2, .24], [0, 0, -side * .025]));
            frame.push(this.part('lily', [side * 7.5, .15, 0], [1.03, .8, 1.03]));
            for (let i = 0; i < 4; i++) frame.push(this.part('petal', [side * 7.56, 3.0 + i * 1.34, 0], [.77, .45, 1.1], [0, side * (Math.PI / 2 + (i % 2 ? .16 : -.16)), -side * .11]));
        }
        frame.push(this.part('rod', [0, 9.29, 0], [.12, 15.0, .12], [0, 0, Math.PI / 2]));
        for (let i = 0; i < 9; i++) {
            const x = -6.0 + i * 1.5, y = 9.35 + .12 * Math.cos(i * .6);
            frame.push(this.part('petal', [x, y, .25], [1.15, .3, 1.12], [0, i % 2 ? -.65 : .65, .0]));
            lights.push(this.part('rod', [x, 8.86, -.18], [.022, .64, .022]));
            lights.push(this.part('ball', [x, 8.43, -.18], [.15, .18, .15]));
        }
        this.add('leafGateFrame', frame); this.add('leafGateLights', lights);
    }

    buildWasher() {
        const front = new THREE.Shape();
        front.moveTo(-2.68, .60); front.lineTo(2.68, .60); front.lineTo(2.68, 6.20);
        front.lineTo(-2.68, 6.20); front.closePath();
        const hole = new THREE.Path(); hole.absarc(0, 3.24, 1.82, 0, Math.PI * 2, true); front.holes.push(hole);
        const fascia = new THREE.ExtrudeGeometry(front, { depth: .18, bevelEnabled: true, bevelSize: .08, bevelThickness: .05, bevelSegments: 1, curveSegments: 24 });
        const shell = [{ geometry: fascia, position: [0, 0, -1.67] },
            this.part('box', [0, .23, 0], [6, .46, 3.7]),
            this.part('box', [0, 7.45, 0], [5.94, 1.08, 3.68]),
            this.part('box', [0, 6.46, .12], [5.66, .88, 3.28]),
            this.part('box', [-2.84, 3.70, .14], [.27, 6.42, 3.26]),
            this.part('box', [2.84, 3.70, .14], [.27, 6.42, 3.26]),
            this.part('box', [0, 3.56, 1.78], [5.68, 6.52, .17]),
            this.part('ring', [0, 3.24, -1.84], [1.82, 1.82, 1.7])];
        this.add('washerShell', shell); fascia.dispose();
        const cavity = [this.part('rod', [0, 3.24, -.23], [1.82, .20, 1.82], [Math.PI / 2, 0, 0]),
            this.part('ring', [0, 3.24, -1.66], [1.67, 1.67, 1.30]),
            this.part('box', [-.94, 7.45, -1.855], [2.30, .34, .03])];
        for (let i = 0; i < 8; i++) cavity.push(this.part('box', [-2.16 + i * .22, .74, -1.70], [.09, .19, .03]));
        this.add('washerCavity', cavity);
        const details = [this.part('rod', [1.18, 7.43, -1.91], [.38, .20, .38], [Math.PI / 2, 0, 0]),
            this.part('box', [1.18, 7.58, -2.02], [.06, .20, .08]),
            this.part('box', [2.00, 7.44, -1.92], [.28, .17, .10]),
            this.part('box', [0, 6.64, -1.60], [5.56, .24, .17]),
            this.part('box', [1.82, 3.28, -1.92], [.18, .88, .22])];
        for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2;
            details.push(this.part('box', [Math.cos(a) * 1.52, 3.24 + Math.sin(a) * 1.52, -.65], [.11, .35, .66], [0, 0, a - Math.PI / 2]));
        }
        for (let i = 0; i < 8; i++) details.push(this.part('box', [-1.9 + i * .25, 7.44, -1.895], [.11, .085 + (i % 3) * .045, .03]));
        this.add('washerDetails', details);
    }

    buildBasket() {
        const weave = [this.part('box', [0, .15, 0], [4.67, .30, 3.75])];
        // Open slatted sides reveal the contents instead of using a solid cube.
        for (let row = 0; row < 7; row++) {
            const y = .53 + row * .50, halfX = 2.15 + y * .12, halfZ = 1.66 + y * .10;
            for (const side of [-1, 1]) {
                weave.push(this.part('box', [0, y, side * halfZ], [halfX * 2, .13, .13]));
                weave.push(this.part('box', [side * halfX, y, 0], [.13, .13, halfZ * 2]));
            }
        }
        for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
            const x = -2.11 + i * .70;
            weave.push(this.part('rod', [x * 1.08, 1.95, side * 1.93], [.07, 3.6, .07], [side * .10, 0, -x * .035]));
        }
        for (const side of [-1, 1]) {
            weave.push(this.part('ring', [side * 2.62, 3.2, 0], [.64, .54, .64], [0, Math.PI / 2, 0]));
            weave.push(this.part('box', [0, 3.78, side * 2.08], [5.42, .20, .20]));
            weave.push(this.part('box', [side * 2.61, 3.78, 0], [.20, .20, 4.16]));
        }
        this.add('basketWeave', weave);
        this.add('basketClothes', [this.part('ball', [-.76, 3.40, .32], [1.48, .81, 1.40]),
            this.part('ball', [.86, 3.78, .20], [1.18, .76, 1.42]),
            this.part('cloth', [.16, 2.1, -2.16], [1.90, 2.05, 1.0], [0, 0, -.10]),
            this.part('sock', [1.8, 3.34, -.62], [1.32, 1.22, 1], [0, 0, .3])]);
    }

    buildClothes() {
        const frame = [this.part('rod', [-2.75, 4.87, 0], [.13, 9.74, .13]),
            this.part('rod', [2.75, 4.87, 0], [.13, 9.74, .13]),
            this.part('rod', [0, 9.32, 0], [.085, 5.55, .085], [0, 0, Math.PI / 2])];
        for (const side of [-1, 1]) frame.push(this.part('box', [side * 2.75, .11, 0], [.65, .22, 1.60]));
        for (const x of [-1.84, -.45, 1.2, 1.86]) {
            frame.push(this.part('box', [x, 9.24, -.02], [.13, .38, .16], [0, 0, x > 0 ? -.12 : .08]));
            frame.push(this.part('ring', [x, 9.29, -.12], [.075, .075, .40]));
        }
        this.add('clothesFrame', frame);
        this.add('clothesFabric', [this.part('shirt', [-1.1, 6.67, -.03], [1.42, 1.72, .70], [0, 0, -.04]),
            this.part('cloth', [1.50, 5.82, -.05], [1.47, 3.38, 1.3]),
            this.part('sock', [.12, 7.87, -.17], [1.15, 1.18, 1.0], [0, 0, .10])]);
    }

    buildIsland() {
        const cloud = [this.part('ball', [0, 1.25, .15], [3.48, 1.25, 2.36])];
        const lobes = [[-2.30, 1.18, -.73, 1.13], [-1.02, 1.54, -1.17, 1.23], [.60, 1.54, -1.21, 1.37], [2.23, 1.11, -.67, 1.06], [-2.45, 1.13, .75, .95], [2.32, 1.14, .96, .91]];
        for (const [x, y, z, r] of lobes) cloud.push(this.part('ball', [x, y, z], [r, r * .73, r]));
        this.add('islandCloud', cloud);
        this.add('islandTop', [this.part('lily', [0, 2.53, .2], [2.34, .90, 1.33]),
            this.part('ball', [.82, 2.87, .28], [.28, .21, .34]),
            this.part('petal', [-.95, 2.73, .2], [.30, .42, .66], [0, -.9, 0])]);
    }

    buildClothGate() {
        const frame = [];
        for (const side of [-1, 1]) {
            frame.push(this.part('rod', [side * 7.4, 5.33, 0], [.15, 10.66, .15]));
            frame.push(this.part('box', [side * 7.4, .13, 0], [1.6, .26, 2.1]));
            frame.push(this.part('rod', [side * 7.4, 10.61, 0], [.25, .18, .25]));
        }
        frame.push(this.part('rod', [0, 10.15, 0], [.11, 14.8, .11], [0, 0, Math.PI / 2]));
        for (let i = 0; i < 8; i++) frame.push(this.part('box', [-6.15 + i * 1.77, 10.03, -.12], [.16, .40, .24], [0, 0, .12]));
        this.add('clothGateFrame', frame);
        const cloth = [];
        for (let i = 0; i < 4; i++) cloth.push(this.part('cloth', [-5.4 + i * 3.6, 8.43 + (i % 2) * .12, -.15], [3.10, 1.5, 1.05]));
        this.add('clothGateFabric', cloth);
    }

    dispose() {
        for (const geometry of Object.values(this.geometries)) geometry.dispose();
        for (const material of Object.values(this.materials)) material.dispose();
    }
}
