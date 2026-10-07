/** Shared oversized grocery and milk-tea scenery. Decorated fronts face -Z. */
import * as THREE from '../libs/three.module.js';

const matrix = new THREE.Matrix4();
const normalMatrix = new THREE.Matrix3();
const vertex = new THREE.Vector3();
const normal = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
const position = new THREE.Vector3();
const scale = new THREE.Vector3();

function bake(parts) {
    const positions = [], normals = [];
    for (const part of parts) {
        const source = part.geometry;
        const geometry = source.index ? source.toNonIndexed() : source;
        position.set(...(part.position || [0, 0, 0]));
        scale.set(...(part.scale || [1, 1, 1]));
        euler.set(...(part.rotation || [0, 0, 0]));
        quaternion.setFromEuler(euler);
        matrix.compose(position, quaternion, scale);
        normalMatrix.getNormalMatrix(matrix);
        const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal');
        for (let i = 0; i < p.count; i++) {
            vertex.fromBufferAttribute(p, i).applyMatrix4(matrix);
            normal.fromBufferAttribute(n, i).applyMatrix3(normalMatrix).normalize();
            positions.push(vertex.x, vertex.y, vertex.z);
            normals.push(normal.x, normal.y, normal.z);
        }
        if (geometry !== source) geometry.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
}

function profile(outline, depth, bevel = 0) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: bevel > 0, bevelThickness: bevel,
        bevelSize: bevel, bevelSegments: 1, steps: 1, curveSegments: 6,
    });
    geometry.computeVertexNormals();
    return geometry;
}

function lathe(points) {
    return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 20);
}

export class EverydayPropKit {
    constructor() {
        const material = (color, roughness = .8, metalness = 0) =>
            new THREE.MeshStandardMaterial({ color, roughness, metalness });
        this.materials = {
            cream: material(0xfff4db), white: material(0xfafbf2),
            mint: material(0x78bfab), coral: material(0xef876f),
            butter: material(0xeccb71), matcha: material(0x7e9c61),
            caramel: material(0xc8925f), tea: material(0xa97248),
            cocoa: material(0x59463b), ink: material(0x3b534d),
            silver: material(0xcbd4cc, .52, .15),
            glass: material(0xb6d5c0, .35), berry: material(0xb76e74),
        };
        this.unit = {
            box: new THREE.BoxGeometry(1, 1, 1),
            sphere: new THREE.SphereGeometry(1, 12, 8),
            cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
            ring: new THREE.TorusGeometry(1, .095, 5, 20),
        };
        this.geometries = {};
        this.buildStore();
        this.buildTea();
    }

    part(kind, position0, scale0, rotation0) {
        return { geometry: this.unit[kind], position: position0, scale: scale0, rotation: rotation0 };
    }

    cache(name, parts) {
        this.geometries[name] = bake(parts);
        const units = new Set(Object.values(this.unit));
        for (const geometry of new Set(parts.map(part => part.geometry))) {
            if (!units.has(geometry)) geometry.dispose();
        }
    }

    mesh(group, geometry, material, position0, scale0, rotation0) {
        const mesh = new THREE.Mesh(typeof geometry === 'string' ? this.unit[geometry] : geometry,
            typeof material === 'string' ? this.materials[material] : material);
        if (position0) mesh.position.set(...position0);
        if (scale0) mesh.scale.set(...scale0);
        if (rotation0) mesh.rotation.set(...rotation0);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        group.add(mesh);
        return mesh;
    }

    accent(type, variant) {
        const i = ((Math.floor(variant) % 3) + 3) % 3;
        return this.materials[(type.startsWith('tea') || ['pearlIsland', 'strawGate'].includes(type)) ?
            ['matcha', 'caramel', 'berry'][i] : ['mint', 'coral', 'butter'][i]];
    }

    buildStore() {
        const shelfBody = [
            this.part('box', [0, .2, 0], [5, .4, 3]),
            this.part('box', [0, 4.4, 1.3], [4.5, 8.3, .18]),
            this.part('box', [-2.3, 4.5, 0], [.4, 8.6, 3]),
            this.part('box', [2.3, 4.5, 0], [.4, 8.6, 3]),
            this.part('box', [0, 8.75, 0], [5, .5, 3]),
        ];
        const shelfTrim = [this.part('box', [0, 8.72, -1.54], [4.2, .29, .08])];
        for (let i = 0; i < 4; i++) {
            const y = .52 + i * 1.92;
            shelfBody.push(this.part('box', [0, y, 0], [4.3, .16, 2.8]));
            shelfTrim.push(this.part('box', [0, y, -1.48], [4.3, .14, .10]));
        }
        this.cache('storeShelfBody', shelfBody);
        this.cache('storeShelfTrim', shelfTrim);

        this.cache('milkCartonBody', [{ geometry: profile([
            [-1.95, .04], [1.95, .04], [1.95, 6.5], [.82, 7.72],
            [.82, 7.96], [-.82, 7.96], [-.82, 7.72], [-1.95, 6.5],
        ], 2.9, .04), position: [0, 0, -1.45] }]);
        const milkTrim = [this.part('box', [0, .65, -.015], [4.02, .85, 3.03]),
            this.part('box', [0, 7.90, 0], [1.72, .16, 2.98]),
            this.part('box', [0, 4.15, -1.54], [2.95, 3.8, .055])];
        this.cache('milkCartonTrim', milkTrim);

        this.cache('snackBagBody', [{ geometry: profile([
            [-1.50, .025], [1.50, .025], [1.84, .45], [1.98, 1.45],
            [1.84, 4.87], [1.98, 5.83], [1.52, 5.98], [-1.52, 5.98],
            [-1.98, 5.83], [-1.84, 4.87], [-1.98, 1.45], [-1.84, .45],
        ], 1.66, .025), position: [0, 0, -.83] }]);
        const snackTrim = [this.part('box', [0, 3.22, -.886], [2.80, 2.25, .075]),
            this.part('box', [0, .24, 0], [3.12, .24, 1.76]),
            this.part('box', [0, 5.85, 0], [3.85, .18, 1.76])];
        for (let i = -6; i <= 6; i++) snackTrim.push(this.part('box', [i * .26, 5.83, -.905], [.035, .26, .035]));
        this.cache('snackBagTrim', snackTrim);

        this.cache('fridgeBody', [
            this.part('box', [0, .3, 0], [5, .6, 3.25]),
            this.part('box', [0, 5, 1.35], [4.8, 9.6, .4]),
            this.part('box', [-2.35, 5.0, 0], [.3, 9.7, 3.25]),
            this.part('box', [2.35, 5.0, 0], [.3, 9.7, 3.25]),
            this.part('box', [0, 9.6, 0], [5, .8, 3.25]),
        ]);
        const fridgeTrim = [this.part('box', [0, 9.58, -1.68], [4.5, .45, .08]),
            this.part('box', [0, 4.8, -1.65], [.09, 8.5, .10])];
        for (const x of [-2.18, 2.18]) fridgeTrim.push(this.part('box', [x, 4.8, -1.65], [.10, 8.5, .10]));
        for (const y of [.66, 8.95]) fridgeTrim.push(this.part('box', [0, y, -1.65], [4.46, .10, .10]));
        this.cache('fridgeTrim', fridgeTrim);

        // Tall receipt pillars are outside the playable corridor; the crossbar starts above y=8.
        this.cache('receiptGateBody', [
            this.part('box', [-7.0, 4.65, 0], [1.1, 9.3, 1.5]),
            this.part('box', [7.0, 4.65, 0], [1.1, 9.3, 1.5]),
            this.part('box', [0, 9.36, 0], [15.1, 1.02, 1.5]),
        ]);
        const receiptTrim = [];
        for (const side of [-1, 1]) {
            receiptTrim.push(this.part('box', [side * 7, .35, 0], [1.15, .7, 1.55]));
            for (let i = 0; i < 12; i++) receiptTrim.push(this.part('box', [side * 7, 1.2 + i * .55, -.77], [.58 - (i % 3) * .10, .045, .04]));
        }
        receiptTrim.push(this.part('box', [0, 9.35, -.78], [9.4, .64, .06]));
        this.cache('receiptGateTrim', receiptTrim);
    }

    buildTea() {
        this.cache('teaCupBody', [{ geometry: lathe([
            [0, 0], [1.88, 0], [2.0, .25], [2.8, 5.70], [2.8, 6.00], [0, 6.00],
        ]) }]);
        const cupTrim = [
            this.part('cylinder', [0, 6.13, 0], [3, .25, 3]),
            this.part('ring', [0, 5.96, 0], [2.79, 2.79, 2.79], [Math.PI / 2, 0, 0]),
            this.part('box', [0, 3.3, -2.46], [2.65, 2.40, .07], [-.145, 0, 0]),
            this.part('cylinder', [.68, 7.10, 0], [.18, 1.80, .18], [0, 0, -.16]),
        ];
        this.cache('teaCupTrim', cupTrim);

        const spout = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.42, 2.42, 0), new THREE.Vector3(2.23, 2.62, 0),
            new THREE.Vector3(2.7, 3.39, 0), new THREE.Vector3(2.72, 4.09, 0),
        ]);
        this.cache('teapotBody', [
            this.part('sphere', [0, 2.68, 0], [1.82, 2.31, 1.57]),
            this.part('cylinder', [0, .30, 0], [1.52, .6, 1.28]),
            { geometry: new THREE.TubeGeometry(spout, 9, .3, 7, false) },
            this.part('ring', [-1.86, 3.0, 0], [.99, 1.56, 1.02]),
        ]);
        this.cache('teapotTrim', [
            this.part('sphere', [0, 4.91, 0], [1.18, .3, 1.01]),
            this.part('sphere', [0, 5.48, 0], [.27, .47, .27]),
            this.part('ring', [0, 4.80, 0], [1.10, .90, 1.10], [Math.PI / 2, 0, 0]),
            this.part('cylinder', [2.73, 4.09, 0], [.32, .10, .32]),
            this.part('sphere', [0, 2.9, -1.565], [.65, .67, .035]),
        ]);

        this.cache('pearlIslandBody', [
            this.part('sphere', [0, .6, 0], [3, .6, 2.55]),
            this.part('cylinder', [0, .7, 0], [2.40, .78, 2.12]),
        ]);
        const pearlTrim = [];
        for (let i = 0; i < 9; i++) {
            const a = i * Math.PI * 2 / 9;
            pearlTrim.push(this.part('sphere', [Math.cos(a) * 2.16, 1.09, Math.sin(a) * 1.70], [.39, .38, .39]));
        }
        pearlTrim.push(this.part('cylinder', [-.78, 1.96, .45], [.11, 1.92, .11], [0, 0, -.13]));
        pearlTrim.push(this.part('box', [-.92, 2.56, .45], [1.66, .55, .11], [0, 0, .04]));
        this.cache('pearlIslandTrim', pearlTrim);

        const strawBody = [], strawTrim = [];
        for (const side of [-1, 1]) {
            strawBody.push(this.part('cylinder', [side * 7.0, 4.6, 0], [.5, 9.2, .5]));
            strawBody.push(this.part('sphere', [side * 7.0, 9.13, 0], [.51, .51, .51]));
            for (let i = 0; i < 8; i++) strawTrim.push(this.part('cylinder', [side * 7, 1.12 + i * 1.02, 0], [.508, .31, .508]));
            strawTrim.push(this.part('cylinder', [side * 7, .18, 0], [.57, .36, .57]));
        }
        strawBody.push(this.part('cylinder', [0, 9.13, 0], [.5, 14.0, .5], [0, 0, Math.PI / 2]));
        for (let i = -6; i <= 6; i++) strawTrim.push(this.part('cylinder', [i * 1.02, 9.13, 0], [.508, .31, .508], [0, 0, Math.PI / 2]));
        this.cache('strawGateBody', strawBody);
        this.cache('strawGateTrim', strawTrim);

        this.cache('teaBoatBody', [{ geometry: lathe([
            [0, 0], [.60, 0], [1.0, .35], [1.45, 1.26], [1.48, 1.44], [0, 1.44],
        ]), scale: [1.69, 1, 2.45] },
        this.part('box', [0, 1.40, 0], [4.25, .14, 5.38])]);
        const boatTrim = [this.part('ring', [0, 1.45, 0], [2.42, 3.50, 1], [Math.PI / 2, 0, 0]),
            this.part('cylinder', [0, 1.94, .45], [.075, 2.08, .075])];
        // A folded napkin makes a small sail, rather than a conventional vehicle cabin.
        boatTrim.push({ geometry: profile([[.12, 1.84], [.12, 2.98], [1.53, 1.91]], .05), position: [0, 0, .43] });
        this.cache('teaBoatTrim', boatTrim);
    }

    create(type, variant = 0) {
        const supported = ['storeShelf', 'milkCarton', 'snackBag', 'fridge', 'receiptGate',
            'teaCup', 'teapot', 'pearlIsland', 'strawGate', 'teaBoat'];
        if (!supported.includes(type)) throw new Error(`Unknown everyday prop: ${type}`);
        const group = new THREE.Group();
        group.name = type;
        group.userData.propType = type;
        group.userData.variant = variant;
        const accent = this.accent(type, variant);
        const bodyMaterial = { snackBag: accent, teaCup: 'cream', teapot: 'cream',
            pearlIsland: 'caramel', strawGate: 'cream', teaBoat: 'tea' }[type] || 'white';
        this.mesh(group, this.geometries[`${type}Body`], bodyMaterial);
        const trimMaterial = { snackBag: 'cream', pearlIsland: 'cocoa', teaBoat: 'cream' }[type] || accent;
        this.mesh(group, this.geometries[`${type}Trim`], trimMaterial);
        if (type === 'storeShelf' || type === 'fridge') this.stock(group, type, variant);
        if (type === 'milkCarton') {
            // The milk drop is an unmistakable label even at a distance.
            this.mesh(group, 'sphere', 'white', [0, 4.4, -1.60], [.61, .78, .035]);
            this.mesh(group, 'sphere', 'white', [0, 5.06, -1.60], [.26, .37, .035]);
            this.mesh(group, 'box', 'white', [0, 2.78, -1.60], [1.58, .16, .035]);
            this.mesh(group, 'box', 'white', [0, 2.40, -1.60], [1.1, .10, .035]);
            this.mesh(group, 'cylinder', 'white', [.77, 7.20, -.25], [.32, .22, .32], [0, 0, -.73]);
        }
        if (type === 'snackBag') {
            for (let i = 0; i < 3; i++) {
                this.mesh(group, 'sphere', 'caramel', [-.76 + i * .69, 3.34 + (i % 2) * .30, -.95], [.41, .53, .03], [0, 0, -.2 + i * .19]);
                this.mesh(group, 'ring', 'white', [-.76 + i * .69, 3.34 + (i % 2) * .30, -.98], [.29, .41, .20], [0, 0, -.2 + i * .19]);
            }
            this.mesh(group, 'box', 'ink', [0, 1.79, -.885], [2.1, .11, .035]);
        }
        if (type === 'receiptGate') {
            for (let i = -4; i <= 4; i++) this.mesh(group, 'box', 'white', [i * .55, 9.34, -.827], [.17 + (i % 2 ? .08 : 0), .34, .025]);
            // Small side barcodes sit on the receipt, outside the running lanes.
            for (const side of [-1, 1]) for (let i = -4; i <= 4; i++) {
                this.mesh(group, 'box', 'ink', [side * 7 + i * .07, 7.85, -.8], [.03 + (i % 2 ? .013 : 0), .45, .025]);
            }
        }
        if (type === 'teaCup') {
            for (let i = 0; i < 5; i++) {
                const a = Math.PI * 1.15 + i * .18;
                this.mesh(group, 'sphere', 'cocoa', [Math.cos(a) * 2.09, .84 + (i % 2) * .28, Math.sin(a) * 2.09], [.25, .26, .11]);
            }
            this.mesh(group, 'sphere', 'cream', [0, 3.45, -2.71], [.67, .67, .035]);
            this.mesh(group, 'sphere', accent, [0, 3.52, -2.755], [.34, .41, .022]);
            this.mesh(group, 'box', 'cream', [0, 2.62, -2.58], [1.55, .13, .045]);
        }
        if (type === 'teapot') {
            this.mesh(group, 'sphere', 'matcha', [0, 2.92, -1.63], [.26, .43, .035], [0, 0, -.4]);
            this.mesh(group, 'sphere', 'matcha', [.28, 2.88, -1.63], [.17, .3, .035], [0, 0, .45]);
            this.mesh(group, 'cylinder', 'cocoa', [2.73, 4.157, 0], [.22, .035, .22]);
        }
        if (type === 'pearlIsland') {
            this.mesh(group, 'cylinder', 'cream', [.3, 1.3, -.18], [1.24, .40, 1.12]);
            this.mesh(group, 'ring', accent, [.3, 1.52, -.18], [1.05, 1.0, 1], [Math.PI / 2, 0, 0]);
            this.mesh(group, 'box', 'cream', [-.91, 2.56, .375], [1.13, .07, .04], [0, 0, .04]);
        }
        if (type === 'teaBoat') {
            for (let i = -1; i <= 1; i++) this.mesh(group, 'sphere', 'cocoa', [i * .80, 1.72, -1.30], [.38, .35, .38]);
            this.mesh(group, 'box', accent, [-.70, 1.72, 1.43], [1.30, .58, 1.04]);
            this.mesh(group, 'box', 'cream', [-.70, 2.07, 1.43], [1.35, .10, 1.08]);
        }
        return group;
    }

    stock(group, type, variant) {
        const refrigerator = type === 'fridge';
        const shelves = refrigerator ? 4 : 4;
        const accents = [this.materials.mint, this.materials.coral, this.materials.butter];
        for (let row = 0; row < shelves; row++) {
            const y = refrigerator ? .93 + row * 1.93 : .75 + row * 1.92;
            if (refrigerator) this.mesh(group, 'box', 'white', [0, y - .18, -.05], [4.35, .10, 2.8]);
            for (let col = 0; col < 4; col++) {
                const x = -1.56 + col * 1.04;
                const color = accents[((row + col + Math.floor(variant)) % 3 + 3) % 3];
                const carton = (row + col) % 2 === 0;
                if (carton) {
                    this.mesh(group, 'box', color, [x, y + .57, -.15], [.70, 1.12, 1.16]);
                    this.mesh(group, 'box', 'white', [x, y + .57, -.745], [.45, .35, .025]);
                    this.mesh(group, 'box', 'cream', [x, y + 1.16, -.15], [.71, .12, 1.15]);
                } else {
                    this.mesh(group, 'cylinder', color, [x, y + .51, -.16], [.34, 1.03, .34]);
                    this.mesh(group, 'cylinder', 'white', [x, y + 1.07, -.16], [.27, .14, .27]);
                    this.mesh(group, 'box', 'cream', [x, y + .52, -.51], [.41, .28, .035]);
                }
            }
        }
        // Door panes are opaque tinted backing strips: no transparent overdraw.
        if (refrigerator) {
            for (const x of [-1.10, 1.10]) {
                this.mesh(group, 'box', 'glass', [x, 4.8, 1.105], [2.01, 7.98, .03]);
                this.mesh(group, 'box', 'silver', [x > 0 ? .26 : -.26, 5.0, -1.78], [.10, 1.15, .17]);
            }
        } else {
            for (let i = -3; i <= 3; i++) this.mesh(group, 'box', 'white', [i * .5, 8.71, -1.596], [.28, .08, .03]);
        }
    }

    dispose() {
        for (const geometry of new Set([...Object.values(this.geometries), ...Object.values(this.unit)])) geometry.dispose();
        for (const material of Object.values(this.materials)) material.dispose();
    }
}
