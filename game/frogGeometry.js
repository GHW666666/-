import * as THREE from '../libs/three.module.js';

const smoothUnion = (a, b, width) => {
    const h = Math.max(width - Math.abs(a - b), 0) / width;
    return Math.min(a, b) - h * h * width * .25;
};

export function bodyCenterOffset(y) {
    const head = .135 * THREE.MathUtils.smoothstep(y, 1.58, 1.93);
    const neck = .045 * Math.exp(-(((y - 1.75) / .13) ** 2));
    return head - neck;
}

// Surface and weights use the same section lookup. This also lets the belly
// follow the skin, rather than intersecting a second independently moving mesh.
export function createFrogSurface(profile) {
    const minY = profile.points[0].y;
    const maxY = profile.points[profile.points.length - 1].y;
    const height = maxY - minY;
    // Exact caps match the rounded crown and pelvis in the 0-second reference.
    // A radial section field pinches at its zero-radius pole during meshing.
    const headCap = { centerY: 1.93, radiusY: .27, radiusX: .295, radiusZ: .265 };
    const hipCap = { centerY: 1.075, radiusY: .44, radiusX: .605, radiusZ: .455 };
    const capSection = (cap, y) => {
        const factor = Math.sqrt(Math.max(0, 1 - ((y - cap.centerY) / cap.radiusY) ** 2));
        return [Math.max(.001, cap.radiusX * factor), Math.max(.001, cap.radiusZ * factor)];
    };
    const capDistance = (cap, x, y, z) => {
        const dy = y - cap.centerY;
        const k0 = Math.hypot(x / cap.radiusX, dy / cap.radiusY, z / cap.radiusZ);
        const k1 = Math.hypot(x / cap.radiusX ** 2, dy / cap.radiusY ** 2, z / cap.radiusZ ** 2);
        return k1 > 1e-8 ? k0 * (k0 - 1) / k1 : -Math.min(cap.radiusX, cap.radiusY, cap.radiusZ);
    };
    const snout = (x, y) => .008 * Math.exp(-((x / .14) ** 4) - ((y - 1.955) / .075) ** 2);
    const sections = [];
    for (let i = 0; i <= 256; i++) {
        const y = minY + height * i / 256;
        let lo = 0, hi = 1;
        for (let j = 0; j < 18; j++) {
            const mid = (lo + hi) / 2;
            if (profile.getPoint(mid).y < y) lo = mid; else hi = mid;
        }
        const p = profile.getPoint((lo + hi) / 2);
        sections.push([Math.max(p.x, .001), Math.max(p.z, .001)]);
    }
    const sectionAt = y => {
        if (y >= headCap.centerY) return capSection(headCap, y);
        if (y <= hipCap.centerY) return capSection(hipCap, y);
        const t = THREE.MathUtils.clamp((y - minY) / height * 256, 0, 256);
        const i = Math.min(255, Math.floor(t)), f = t - i;
        return [THREE.MathUtils.lerp(sections[i][0], sections[i + 1][0], f),
            THREE.MathUtils.lerp(sections[i][1], sections[i + 1][1], f)];
    };
    const bodyDistance = (x, y, z) => {
        const offset = bodyCenterOffset(y);
        const shiftedZ = z - offset - (z > offset ? snout(x, y) : 0);
        if (y >= headCap.centerY + .04) return capDistance(headCap, x, y, shiftedZ);
        if (y <= hipCap.centerY - .04) return capDistance(hipCap, x, y, shiftedZ);
        const [rx, rz] = sectionAt(y);
        const radial = (Math.hypot(x / rx, shiftedZ / rz) - 1) * Math.min(rx, rz);
        if (y > headCap.centerY - .07) {
            return THREE.MathUtils.lerp(radial, capDistance(headCap, x, y, shiftedZ),
                THREE.MathUtils.smoothstep(y, headCap.centerY - .07, headCap.centerY + .04));
        }
        if (y < hipCap.centerY + .04) {
            return THREE.MathUtils.lerp(capDistance(hipCap, x, y, shiftedZ), radial,
                THREE.MathUtils.smoothstep(y, hipCap.centerY - .04, hipCap.centerY + .04));
        }
        return radial;
    };
    // One bent fleshy arm per side, seated well inside the torso at the shoulder.
    const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(.275, 1.54, .015),
        new THREE.Vector3(.46, 1.38, .31),
        new THREE.Vector3(.475, 1.23, .47),
        new THREE.Vector3(.42, 1.16, .54),
        new THREE.Vector3(.31, 1.16, .58)
    ]);
    const samples = path.getPoints(20);
    const radiusAt = t => .112 + .004 * Math.sin(Math.PI * t) - .040 * t * t - .010 * t ** 4 - .019 * t ** 6;
    const armDistance = (x, y, z) => {
        x = Math.abs(x);
        let nearest = Infinity;
        for (let i = 0; i < samples.length - 1; i++) {
            const a = samples[i], b = samples[i + 1];
            const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
            const length = Math.hypot(dx, dy, dz);
            const px = x - a.x, py = y - a.y, pz = z - a.z;
            const along = (px * dx + py * dy + pz * dz) / length;
            const radial = Math.sqrt(Math.max(0, px * px + py * py + pz * pz - along * along));
            const startRadius = radiusAt(i / 20);
            const slope = (radiusAt((i + 1) / 20) - startRadius) / length;
            const closest = THREE.MathUtils.clamp(along + slope * radial / Math.sqrt(1 - slope * slope), 0, length);
            const field = Math.hypot(radial, along - closest) - startRadius - slope * closest;
            // A minimum preserves the intended radius. Repeated smooth unions
            // of overlapping capsules inflate a densely sampled arm.
            nearest = Math.min(nearest, field);
        }
        // Keep the lower arm free of the abdomen. Only the shoulder joins the
        // torso; contact between forearm and belly must not weld them together.
        const clearance = .045 * (1 - THREE.MathUtils.smoothstep(y, 1.36, 1.48));
        const cut = smoothUnion(clearance - bodyDistance(x, y, z), 1.48 - y, .025);
        nearest = -smoothUnion(-nearest, -cut, .012);
        return nearest;
    };
    const distance = (x, y, z) => {
        const body = bodyDistance(x, y, z), arm = armDistance(x, y, z);
        const blend = .075 * THREE.MathUtils.smoothstep(y, 1.38, 1.50);
        return blend > 1e-6 ? smoothUnion(body, arm, blend) : Math.min(body, arm);
    };
    const armWeight = (x, y, z) => {
        const blend = .025 + .05 * THREE.MathUtils.smoothstep(y, 1.38, 1.50);
        const ownership = THREE.MathUtils.smoothstep(bodyDistance(x, y, z) - armDistance(x, y, z), -blend, blend);
        // Blend through the fleshy shoulder, including its outer torso vertices.
        // Pinning that entire seam to the torso stretches it into a thin web.
        const shoulder = 1 - THREE.MathUtils.smoothstep(y, 1.43, 1.59);
        return ownership * shoulder;
    };
    const front = (x, y) => {
        const [rx, rz] = sectionAt(y);
        return bodyCenterOffset(y) + rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)) + snout(x, y);
    };
    return { distance, armWeight, front, armWrist: samples[samples.length - 1], yBounds: [minY, maxY], headCap };
}

export function addFrogSkinWeights(geometry, surface) {
    const position = geometry.attributes.position;
    const indices = [], weights = [];
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
        const arm = surface.armWeight(x, y, z);
        indices.push(0, x > 0 ? 1 : 2, 0, 0);
        weights.push(1 - arm, arm, 0, 0);
    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
}

// Marching tetrahedra produces a welded surface across torso and shoulders.
// Cached edge vertices share smooth normals and cannot open a seam when posed.
export function createFrogSkinGeometry(surface) {
    const step = .023;
    const min = [-.759, surface.yBounds[0] - .06, -.644];
    const size = [67, Math.ceil((surface.yBounds[1] - min[1] + .06) / step) + 1, 67];
    const [nx, ny, nz] = size, count = nx * ny * nz;
    const values = new Float32Array(count);
    const indexOf = (x, y, z) => (y * nz + z) * nx + x;
    for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
        values[indexOf(x, y, z)] = surface.distance(min[0] + x * step, min[1] + y * step, min[2] + z * step);
    }
    const positionOf = id => {
        const x = id % nx, yz = Math.floor(id / nx), z = yz % nz, y = Math.floor(yz / nz);
        return [min[0] + x * step, min[1] + y * step, min[2] + z * step];
    };
    const positions = [], normals = [], indices = [], edges = new Map();
    const vertexOn = (a, b) => {
        if (a > b) [a, b] = [b, a];
        const key = a * count + b;
        if (edges.has(key)) return edges.get(key);
        const pa = positionOf(a), pb = positionOf(b), t = values[a] / (values[a] - values[b]);
        const p = pa.map((v, i) => THREE.MathUtils.lerp(v, pb[i], t));
        const e = .002;
        const n = new THREE.Vector3(
            surface.distance(p[0] + e, p[1], p[2]) - surface.distance(p[0] - e, p[1], p[2]),
            surface.distance(p[0], p[1] + e, p[2]) - surface.distance(p[0], p[1] - e, p[2]),
            surface.distance(p[0], p[1], p[2] + e) - surface.distance(p[0], p[1], p[2] - e)
        ).normalize();
        const id = positions.length / 3;
        positions.push(...p); normals.push(n.x, n.y, n.z); edges.set(key, id);
        return id;
    };
    const triangle = (a, b, c) => {
        const pa = new THREE.Vector3().fromArray(positions, a * 3);
        const pb = new THREE.Vector3().fromArray(positions, b * 3);
        const pc = new THREE.Vector3().fromArray(positions, c * 3);
        const cross = pb.sub(pa).cross(pc.sub(pa));
        const normal = new THREE.Vector3().fromArray(normals, a * 3);
        if (cross.dot(normal) < 0) indices.push(a, c, b); else indices.push(a, b, c);
    };
    const tetrahedra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6],
        [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
    for (let y = 0; y < ny - 1; y++) for (let z = 0; z < nz - 1; z++) for (let x = 0; x < nx - 1; x++) {
        const cube = [indexOf(x, y, z), indexOf(x + 1, y, z), indexOf(x + 1, y + 1, z), indexOf(x, y + 1, z),
            indexOf(x, y, z + 1), indexOf(x + 1, y, z + 1), indexOf(x + 1, y + 1, z + 1), indexOf(x, y + 1, z + 1)];
        if (cube.every(i => values[i] >= 0) || cube.every(i => values[i] < 0)) continue;
        for (const tetra of tetrahedra) {
            const inside = [], outside = [];
            for (const j of tetra) (values[cube[j]] < 0 ? inside : outside).push(cube[j]);
            if (inside.length === 1 || inside.length === 3) {
                const single = inside.length === 1 ? inside[0] : outside[0];
                const others = inside.length === 1 ? outside : inside;
                triangle(...others.map(i => vertexOn(single, i)));
            } else if (inside.length === 2) {
                const a = vertexOn(inside[0], outside[0]), b = vertexOn(inside[0], outside[1]);
                const c = vertexOn(inside[1], outside[0]), d = vertexOn(inside[1], outside[1]);
                triangle(a, b, c); triangle(b, d, c);
            }
        }
    }
    // The carved armpit can produce sub-grid closed pockets at the join.
    // Discard only tiny isolated pockets, while preserving every face of the
    // main watertight skin. A disconnected limb is too large to pass this limit.
    const parents = Array.from({ length: positions.length / 3 }, (_, i) => i);
    const root = i => {
        while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; }
        return i;
    };
    for (let i = 0; i < indices.length; i += 3) {
        parents[root(indices[i])] = root(indices[i + 1]);
        parents[root(indices[i + 1])] = root(indices[i + 2]);
    }
    const components = new Map();
    for (let i = 0; i < parents.length; i++) {
        const key = root(i);
        components.set(key, (components.get(key) || 0) + 1);
    }
    const largest = [...components].sort((a, b) => b[1] - a[1])[0];
    let finalPositions = positions, finalNormals = normals, finalIndices = indices;
    if (components.size > 1 && largest[1] > parents.length * .995) {
        finalPositions = []; finalNormals = []; finalIndices = [];
        const remap = new Map();
        for (let i = 0; i < parents.length; i++) if (root(i) === largest[0]) {
            remap.set(i, finalPositions.length / 3);
            finalPositions.push(...positions.slice(i * 3, i * 3 + 3));
            finalNormals.push(...normals.slice(i * 3, i * 3 + 3));
        }
        for (let i = 0; i < indices.length; i += 3) if (remap.has(indices[i])) {
            finalIndices.push(remap.get(indices[i]), remap.get(indices[i + 1]), remap.get(indices[i + 2]));
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(finalPositions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(finalNormals, 3));
    geometry.setIndex(finalIndices);
    addFrogSkinWeights(geometry, surface);
    return geometry;
}
