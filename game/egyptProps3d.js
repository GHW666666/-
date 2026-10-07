/**
 * A compact, reusable Egyptian prop library.
 * All models rest on y = 0 and their decorated front faces -Z.
 * Geometry is baked by material so distant repeats can be instanced by the world.
 */
import * as THREE from '../libs/three.module.js';

const matrix = new THREE.Matrix4();
const normalMatrix = new THREE.Matrix3();
const position = new THREE.Vector3();
const normal = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
const scale = new THREE.Vector3();

// These parts are baked once. Factory calls only allocate small scene graphs.
function bake(parts) {
    const positions = [];
    const normals = [];
    for (const part of parts) {
        const geometry = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
        euler.set(...(part.rotation || [0, 0, 0]));
        quaternion.setFromEuler(euler);
        position.set(...(part.position || [0, 0, 0]));
        scale.set(...(part.scale || [1, 1, 1]));
        matrix.compose(position, quaternion, scale);
        normalMatrix.getNormalMatrix(matrix);
        const p = geometry.getAttribute('position');
        const n = geometry.getAttribute('normal');
        const mirrored = matrix.determinant() < 0;
        for (let output = 0; output < p.count; output++) {
            const corner = output % 3;
            const i = mirrored ? output - corner + (corner === 0 ? 0 : 3 - corner) : output;
            position.fromBufferAttribute(p, i).applyMatrix4(matrix);
            normal.fromBufferAttribute(n, i).applyMatrix3(normalMatrix).normalize();
            positions.push(position.x, position.y, position.z);
            normals.push(normal.x, normal.y, normal.z);
        }
        if (geometry !== part.geometry) geometry.dispose();
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    result.computeBoundingBox();
    result.computeBoundingSphere();
    return result;
}

function slab(outline, depth, bevel = 0) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth, steps: 1, bevelEnabled: bevel > 0,
        bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1,
        curveSegments: 8,
    });
    geometry.computeVertexNormals();
    return geometry;
}

function frustum(width, topWidth, height, depth = width, topDepth = topWidth) {
    const b = width / 2, t = topWidth / 2, d = depth / 2, s = topDepth / 2;
    const points = [
        [-b, 0, -d], [b, 0, -d], [b, 0, d], [-b, 0, d],
        [-t, height, -s], [t, height, -s], [t, height, s], [-t, height, s],
    ];
    const faces = [[0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0], [4, 7, 6, 5], [0, 1, 2, 3]];
    const data = [];
    for (const [a, b0, c, d0] of faces) {
        for (const index of [a, b0, c, a, c, d0]) data.push(...points[index]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
    geometry.computeVertexNormals();
    return geometry;
}

export class EgyptPropKit {
    constructor() {
        const material = (color, roughness = 0.82, metalness = 0) =>
            new THREE.MeshStandardMaterial({ color, roughness, metalness });
        this.materials = {
            stone: material(0xe5c18b), cream: material(0xffeacd),
            shade: material(0xae794b), dark: material(0x233e50),
            gold: material(0xe9b545, 0.42, 0.30),
            turquoise: material(0x29aaa2, 0.62),
            indigo: material(0x354b75, 0.72), coral: material(0xee896b, 0.74),
            trunk: material(0x8b684b), leaf: material(0x398d75, 0.84),
            leafLight: material(0x60ac88, 0.84),
        };
        this.geometries = {};
        this.unit = {
            box: new THREE.BoxGeometry(1, 1, 1),
            sphere: new THREE.SphereGeometry(1, 12, 8),
            cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
            ring: new THREE.TorusGeometry(1, 0.085, 5, 20),
        };
        this.buildPyramid();
        this.buildPharaoh();
        this.buildObelisk();
        this.buildPalm();
        this.buildTempleGate();
    }

    part(kind, position0, scale0, rotation0) {
        return { geometry: this.unit[kind], position: position0, scale: scale0, rotation: rotation0 };
    }

    addGeometry(name, parts) {
        this.geometries[name] = bake(parts);
    }

    accent(variant) {
        const index = ((Math.floor(variant) % 3) + 3) % 3;
        return [this.materials.turquoise, this.materials.indigo, this.materials.coral][index];
    }

    model(name, specification, variant) {
        const group = new THREE.Group();
        group.name = `egypt-${name}`;
        group.userData.egyptProp = name;
        group.userData.variant = variant;
        for (const [geometryName, materialName, meshName] of specification) {
            const mesh = new THREE.Mesh(this.geometries[geometryName],
                materialName === 'accent' ? this.accent(variant) : this.materials[materialName]);
            mesh.name = meshName || geometryName;
            mesh.castShadow = name !== 'palm' || materialName === 'trunk';
            mesh.receiveShadow = true;
            group.add(mesh);
        }
        return group;
    }

    buildPyramid() {
        this.addGeometry('pyramidBase', [this.part('box', [0, 0.14, 0], [12.5, 0.28, 12.5])]);
        this.addGeometry('pyramidBody', [{ geometry: frustum(12, 1.08, 9), position: [0, 0.28, 0] }]);
        this.addGeometry('pyramidCap', [{ geometry: frustum(1.08, 0, 0.89), position: [0, 9.28, 0] }]);
        const courses = [];
        for (let i = 1; i <= 8; i++) {
            const y = 0.28 + i * 0.98;
            const half = 6 - (y - 0.28) * (5.46 / 9);
            courses.push(this.part('box', [0, y, -half - 0.012], [half * 2, 0.032, 0.03]));
            courses.push(this.part('box', [0, y, half + 0.012], [half * 2, 0.032, 0.03]));
            courses.push(this.part('box', [-half - 0.012, y, 0], [0.03, 0.032, half * 2]));
            courses.push(this.part('box', [half + 0.012, y, 0], [0.03, 0.032, half * 2]));
        }
        this.addGeometry('pyramidCourses', courses);
        // Project the entrance onto the inclined face rather than burying it in the pyramid.
        const portal = slab([[-0.47, 0.28], [0.47, 0.28], [0.47, 1.05], [0.27, 1.27], [-0.27, 1.27], [-0.47, 1.05]], 0.02);
        const portalPositions = portal.getAttribute('position');
        for (let i = 0; i < portalPositions.count; i++) {
            portalPositions.setZ(i, -6 + (portalPositions.getY(i) - 0.28) * (5.46 / 9) - 0.033 + portalPositions.getZ(i));
        }
        portal.computeVertexNormals();
        this.addGeometry('pyramidPortal', [{ geometry: portal }]);
        const pitch = Math.atan(5.46 / 9);
        this.addGeometry('pyramidPortalTrim', [
            this.part('box', [-0.54, 0.66, -5.798], [0.10, 0.90, 0.032], [pitch, 0, 0]),
            this.part('box', [0.54, 0.66, -5.798], [0.10, 0.90, 0.032], [pitch, 0, 0]),
            this.part('box', [0, 1.04, -5.566], [1.14, 0.10, 0.032], [pitch, 0, 0]),
        ]);
    }

    createPyramid(variant = 0) {
        return this.model('pyramid', [
            ['pyramidBase', 'cream'], ['pyramidBody', variant % 2 ? 'cream' : 'stone'],
            ['pyramidCourses', 'shade'], ['pyramidCap', 'gold'],
            ['pyramidPortal', 'dark'], ['pyramidPortalTrim', 'accent'],
        ], variant);
    }

    buildPharaoh() {
        const hood = slab([[-0.95, 3.11], [-0.79, 4.22], [-0.55, 4.66], [-0.28, 4.85], [0.28, 4.85], [0.55, 4.66], [0.79, 4.22], [0.95, 3.11], [0.48, 3.07], [0.36, 3.59], [-0.36, 3.59], [-0.48, 3.07]], 0.50, 0.03);
        this.addGeometry('pharaohHood', [{ geometry: hood, position: [0, 0, -0.30] }]);
        const stripes = [];
        for (const side of [-1, 1]) {
            for (let i = 0; i < 6; i++) {
                const y = 3.17 + i * 0.185;
                const inner = i < 3 ? 0.48 : 0.42;
                const outer = 0.92 - i * 0.034;
                const vertices = [[side * inner, y], [side * outer, y], [side * (outer - 0.025), y + 0.080], [side * inner, y + 0.080]];
                // Maintain positive outline winding on both sides.
                if (side < 0) vertices.reverse();
                stripes.push({ geometry: slab(vertices, 0.025), position: [0, 0, -0.355] });
            }
        }
        stripes.push(this.part('box', [0, 4.57, -0.35], [0.72, 0.075, 0.055]));
        stripes.push(this.part('box', [0, 4.75, -0.28], [0.42, 0.065, 0.050]));
        this.addGeometry('pharaohHoodStripes', stripes);
        const face = slab([[-0.31, 3.45], [-0.42, 3.75], [-0.42, 4.18], [-0.27, 4.35], [0.27, 4.35], [0.42, 4.18], [0.42, 3.75], [0.31, 3.45], [0, 3.30]], 0.34, 0.035);
        this.addGeometry('pharaohFace', [{ geometry: face, position: [0, 0, -0.65] }]);
        this.addGeometry('pharaohNose', [{ geometry: frustum(0.15, 0.09, 0.29, 0.17, 0.09), position: [0, 3.76, -0.74] }]);
        this.addGeometry('pharaohFeatures', [
            this.part('box', [-0.215, 4.065, -0.706], [0.205, 0.045, 0.024], [0, 0, -0.045]),
            this.part('box', [0.215, 4.065, -0.706], [0.205, 0.045, 0.024], [0, 0, 0.045]),
            this.part('box', [0, 3.63, -0.710], [0.25, 0.032, 0.025]),
        ]);
        this.addGeometry('pharaohBeard', [{ geometry: frustum(0.16, 0.22, 0.43, 0.16, 0.19), position: [0, 2.98, -0.53] }]);
        const torso = slab([[-0.48, 1.90], [-0.69, 2.48], [-0.65, 2.87], [-0.31, 3.16], [0.31, 3.16], [0.65, 2.87], [0.69, 2.48], [0.48, 1.90]], 0.68, 0.045);
        const armParts = [{ geometry: torso, position: [0, 0, -0.24] }];
        for (const side of [-1, 1]) {
            armParts.push(this.part('cylinder', [side * 0.76, 2.45, 0.09], [0.22, 0.90, 0.22], [0, 0, side * 0.22]));
            armParts.push(this.part('sphere', [side * 0.68, 2.87, 0.07], [0.26, 0.27, 0.26]));
            armParts.push(this.part('cylinder', [side * 0.68, 2.04, -0.35], [0.19, 0.74, 0.19], [Math.PI / 2, 0, side * 0.54]));
            armParts.push(this.part('sphere', [side * 0.45, 2.00, -0.64], [0.22, 0.14, 0.12]));
            armParts.push(this.part('box', [side * 0.36, 0.86, 0.02], [0.42, 0.93, 0.49]));
            armParts.push(this.part('box', [side * 0.36, 0.43, -0.16], [0.48, 0.24, 0.77]));
        }
        this.addGeometry('pharaohBody', armParts);
        const skirt = frustum(1.48, 1.03, 0.95, 0.95, 0.74);
        this.addGeometry('pharaohSkirt', [{ geometry: skirt, position: [0, 1.12, 0.04] }]);
        this.addGeometry('pharaohBelt', [this.part('box', [0, 2.06, -0.04], [1.08, 0.18, 0.86])]);
        const collar = slab([[-0.64, 2.84], [-0.35, 3.10], [-0.25, 2.88], [0, 2.80], [0.25, 2.88], [0.35, 3.10], [0.64, 2.84], [0.44, 2.60], [0, 2.46], [-0.44, 2.60]], 0.065, 0.010);
        this.addGeometry('pharaohCollar', [{ geometry: collar, position: [0, 0, -0.335] }]);
        const jewels = [];
        for (let i = -2; i <= 2; i++) jewels.push(this.part('sphere', [i * 0.15, 2.60 + 0.11 * Math.abs(i), -0.37], [0.052, 0.073, 0.027]));
        for (const side of [-1, 1]) jewels.push(this.part('cylinder', [side * 0.59, 2.03, -0.48], [0.207, 0.14, 0.207], [Math.PI / 2, 0, side * 0.54]));
        this.addGeometry('pharaohJewels', jewels);
        const pleats = [];
        for (let i = -3; i <= 3; i++) pleats.push(this.part('box', [i * 0.15, 1.54, -0.423], [0.024, 0.72, 0.028], [0, 0, -i * 0.040]));
        this.addGeometry('pharaohPleats', pleats);
        this.addGeometry('pharaohPlinth', [
            this.part('box', [0, 0.11, 0], [2.5, 0.22, 2.0]),
            this.part('box', [0, 0.28, 0], [2.2, 0.12, 1.76]),
        ]);
        const cobra = slab([[-0.065, 4.34], [-0.065, 4.57], [-0.13, 4.68], [-0.10, 4.80], [0, 4.88], [0.10, 4.80], [0.13, 4.68], [0.065, 4.57], [0.065, 4.34]], 0.07);
        this.addGeometry('pharaohCobra', [{ geometry: cobra, position: [0, 0, -0.46] }]);
    }

    createPharaoh(variant = 0) {
        return this.model('pharaoh', [
            ['pharaohPlinth', 'shade'], ['pharaohBody', 'stone'], ['pharaohHood', 'gold'],
            ['pharaohHoodStripes', 'accent'], ['pharaohFace', 'cream'], ['pharaohNose', 'cream'],
            ['pharaohFeatures', 'dark'], ['pharaohBeard', 'indigo'], ['pharaohCobra', 'gold'],
            ['pharaohSkirt', 'cream'], ['pharaohBelt', 'gold'], ['pharaohCollar', 'gold'],
            ['pharaohJewels', 'accent'], ['pharaohPleats', 'shade'],
        ], variant);
    }

    buildObelisk() {
        this.addGeometry('obeliskBase', [
            this.part('box', [0, 0.16, 0], [1.80, 0.32, 1.80]),
            this.part('box', [0, 0.42, 0], [1.46, 0.20, 1.46]),
        ]);
        this.addGeometry('obeliskShaft', [{ geometry: frustum(1.13, 0.82, 5.70), position: [0, 0.52, 0] }]);
        this.addGeometry('obeliskCrown', [{ geometry: frustum(0.82, 0, 0.85), position: [0, 6.22, 0] }]);
        const cartouche = [
            this.part('ring', [0, 4.92, -0.478], [0.20, 0.35, 0.06]),
            this.part('box', [0, 4.02, -0.5], [0.043, 0.38, 0.04]),
            this.part('box', [0, 4.07, -0.5], [0.23, 0.04, 0.04]),
            this.part('ring', [0, 4.27, -0.5], [0.085, 0.11, 0.05]),
            this.part('box', [0, 3.36, -0.52], [0.22, 0.04, 0.04]),
            this.part('box', [0, 3.22, -0.52], [0.15, 0.04, 0.04]),
            this.part('box', [0, 3.08, -0.52], [0.22, 0.04, 0.04]),
            this.part('sphere', [0, 2.55, -0.53], [0.12, 0.12, 0.025]),
            this.part('box', [0, 2.02, -0.55], [0.19, 0.045, 0.045]),
            this.part('box', [0, 1.86, -0.55], [0.13, 0.045, 0.045]),
        ];
        this.addGeometry('obeliskGlyphs', cartouche);
        this.addGeometry('obeliskBorders', [
            this.part('box', [-0.31, 3.18, -0.52], [0.025, 4.0, 0.025]),
            this.part('box', [0.31, 3.18, -0.52], [0.025, 4.0, 0.025]),
        ]);
    }

    createObelisk(variant = 0) {
        return this.model('obelisk', [
            ['obeliskBase', 'shade'], ['obeliskShaft', 'cream'], ['obeliskCrown', 'gold'],
            ['obeliskGlyphs', 'accent'], ['obeliskBorders', 'gold'],
        ], variant);
    }

    buildPalm() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.10, 0), new THREE.Vector3(0.12, 1.45, 0.04),
            new THREE.Vector3(0.27, 3.10, 0.07), new THREE.Vector3(0.21, 4.70, 0),
        ]);
        const trunk = new THREE.TubeGeometry(curve, 10, 0.17, 7, false);
        this.addGeometry('palmTrunk', [{ geometry: trunk }]);
        this.addGeometry('palmRoot', [
            this.part('cylinder', [0, 0.065, 0], [0.37, 0.13, 0.37]),
        ]);
        const positions = [];
        for (let i = 0; i < 7; i++) {
            const t = i / 6;
            const x = t * 2.18;
            const y = 0.30 * Math.sin(t * Math.PI) - 0.95 * t * t;
            const width = 0.31 * Math.sin(Math.PI * (0.08 + t * 0.92));
            positions.push([x, y, -width], [x, y + width * 0.16, 0], [x, y, width]);
        }
        const data = [];
        for (let i = 0; i < 6; i++) {
            for (const side of [0, 1]) {
                const a = i * 3 + side, b = (i + 1) * 3 + side;
                for (const index of [a, b, b + 1, a, b + 1, a + 1]) data.push(...positions[index]);
                // A folded leaf has a real underside, requiring no double-sided material.
                for (const index of [a + 1, b + 1, b, a + 1, b, a]) data.push(...positions[index]);
            }
        }
        const leaf = new THREE.BufferGeometry();
        leaf.setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
        leaf.computeVertexNormals();
        const leaves = [[], []];
        for (let i = 0; i < 9; i++) leaves[i % 2].push({
            geometry: leaf, position: [0.21, 4.66 + (i % 2) * 0.11, 0],
            rotation: [0, i * Math.PI * 2 / 9, 0], scale: [0.93 + (i % 3) * 0.065, 1, 1],
        });
        this.addGeometry('palmLeavesA', leaves[0]);
        this.addGeometry('palmLeavesB', leaves[1]);
        const fruit = [];
        for (let i = 0; i < 3; i++) fruit.push(this.part('sphere', [0.21 + Math.cos(i * 2.1) * 0.17, 4.50, Math.sin(i * 2.1) * 0.17], [0.11, 0.14, 0.11]));
        this.addGeometry('palmFruit', fruit);
    }

    createPalm(variant = 0) {
        return this.model('palm', [
            ['palmRoot', 'shade'], ['palmTrunk', 'trunk'], ['palmLeavesA', 'leaf'],
            ['palmLeavesB', 'leafLight'], ['palmFruit', 'gold'],
        ], variant);
    }

    buildTempleGate() {
        const pier = slab([[-1.0, 0.35], [1.0, 0.35], [0.80, 8.65], [-0.80, 8.65]], 2.00, 0.025);
        this.addGeometry('gateStone', [
            { geometry: pier, position: [-7.5, 0, -1] },
            { geometry: pier, position: [7.5, 0, -1] },
            this.part('box', [-7.5, 0.17, 0], [2.35, 0.34, 2.5]),
            this.part('box', [7.5, 0.17, 0], [2.35, 0.34, 2.5]),
            this.part('box', [0, 8.93, 0], [17.0, 1.36, 2.04]),
        ]);
        this.addGeometry('gateCornice', [
            this.part('box', [0, 9.75, 0], [17.60, 0.34, 2.42]),
            this.part('box', [0, 10.00, 0], [17.84, 0.16, 2.62]),
            this.part('box', [0, 8.40, -1.075], [17.10, 0.10, 0.12]),
        ]);
        this.addGeometry('gatePanels', [
            this.part('box', [-7.5, 4.15, -1.055], [0.74, 5.70, 0.08]),
            this.part('box', [7.5, 4.15, -1.055], [0.74, 5.70, 0.08]),
            this.part('box', [0, 9.31, -1.074], [15.40, 0.10, 0.07]),
        ]);
        const wing = slab([[0.33, 9.04], [1.03, 9.21], [2.55, 9.29], [3.84, 9.38], [3.34, 9.00], [2.60, 8.88], [1.25, 8.84]], 0.065);
        this.addGeometry('gateWings', [
            { geometry: wing, position: [0, 0, -1.18] },
            { geometry: wing, position: [0, 0, -1.18], scale: [-1, 1, 1] },
        ]);
        this.addGeometry('gateSunRing', [
            this.part('ring', [0, 9.15, -1.23], [0.49, 0.49, 0.49]),
        ]);
        this.addGeometry('gateSun', [
            this.part('sphere', [0, 9.15, -1.25], [0.405, 0.405, 0.095]),
        ]);
        const feathers = [];
        const glyphs = [];
        for (const side of [-1, 1]) {
            for (let i = 0; i < 6; i++) feathers.push(this.part('box', [side * (1.22 + i * 0.37), 9.04 + i * 0.025, -1.23], [0.042, 0.30 - i * 0.023, 0.033], [0, 0, side * 0.40]));
            const x = side * 7.5;
            glyphs.push(this.part('ring', [x, 5.42, -1.11], [0.17, 0.24, 0.07]));
            glyphs.push(this.part('box', [x, 4.95, -1.12], [0.075, 0.63, 0.045]));
            glyphs.push(this.part('box', [x, 5.13, -1.12], [0.40, 0.075, 0.045]));
            for (let i = 0; i < 3; i++) glyphs.push(this.part('box', [x, 3.4 + i * 0.19, -1.12], [0.40 - (i % 2) * 0.10, 0.055, 0.04]));
            glyphs.push(this.part('sphere', [x, 2.21, -1.12], [0.17, 0.17, 0.032]));
        }
        this.addGeometry('gateFeathers', feathers);
        this.addGeometry('gateGlyphs', glyphs);
    }

    createTempleGate(variant = 0) {
        return this.model('temple-gate', [
            ['gateStone', 'cream'], ['gateCornice', 'stone'], ['gatePanels', 'accent'],
            ['gateWings', 'gold'], ['gateSunRing', 'gold'], ['gateSun', 'accent'],
            ['gateFeathers', 'indigo'], ['gateGlyphs', 'cream'],
        ], variant);
    }
}
