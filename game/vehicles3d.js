import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';

// Share unit meshes rather than dimensions: short cars and long roof vehicles
// can coexist without one model changing the geometry cached for another.
let GEOMETRIES = null;
const MATERIALS = new Map();
const PALETTES = {
    egypt: { cream: 0xfff0d4, paint: 0x168f91, light: 0x83c7bd, dark: 0x223d6b, accent: 0xe9ad43 },
    store: { cream: 0xf4ebd8, paint: 0x659986, light: 0xb4cfb7, dark: 0x3d5147, accent: 0xe49a68 },
    tea: { cream: 0xffedd2, paint: 0xb67d51, light: 0xe7c596, dark: 0x5a3b2d, accent: 0x83ab8d },
    pond: { cream: 0xffefd8, paint: 0x64855b, light: 0xa5bf83, dark: 0x504459, accent: 0xe8a47c },
    laundry: { cream: 0xf6f0e5, paint: 0x9a8ca8, light: 0xc6d6c8, dark: 0x596170, accent: 0xe3b49f },
};

function roundedProfile() {
    const s = new THREE.Shape(), r = 0.10;
    s.moveTo(-0.5 + r, -0.5);
    s.lineTo(0.5 - r, -0.5);
    s.quadraticCurveTo(0.5, -0.5, 0.5, -0.5 + r);
    s.lineTo(0.5, 0.5 - r);
    s.quadraticCurveTo(0.5, 0.5, 0.5 - r, 0.5);
    s.lineTo(-0.5 + r, 0.5);
    s.quadraticCurveTo(-0.5, 0.5, -0.5, 0.5 - r);
    s.lineTo(-0.5, -0.5 + r);
    s.quadraticCurveTo(-0.5, -0.5, -0.5 + r, -0.5);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, steps: 1, curveSegments: 3, bevelEnabled: false });
    g.translate(0, 0, -0.5);
    return g;
}

function quad(points) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.computeVertexNormals();
    return g;
}

function geometries() {
    if (GEOMETRIES) return GEOMETRIES;
    const cabin = new THREE.BoxGeometry(1, 1, 1);
    const p = cabin.attributes.position;
    for (let i = 0; i < p.count; i++) {
        if (p.getY(i) > 0) { p.setX(i, p.getX(i) * 0.84); p.setZ(i, p.getZ(i) * 0.60); }
    }
    p.needsUpdate = true;
    cabin.computeVertexNormals();
    GEOMETRIES = {
        box: new THREE.BoxGeometry(1, 1, 1),
        soft: roundedProfile(),
        wheel: new THREE.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2),
        cabin,
        carFrontGlass: quad([[-0.438, -0.32, -0.47], [0.438, -0.32, -0.47],
            [0.365, 0.34, -0.334], [-0.365, 0.34, -0.334]]),
        carSideGlass: quad([[0.490, -0.32, -0.39], [0.490, -0.32, 0.40],
            [0.440, 0.32, 0.252], [0.440, 0.32, -0.252]]),
    };
    return GEOMETRIES;
}

function materials(mapId) {
    const id = PALETTES[mapId] ? mapId : 'egypt';
    if (MATERIALS.has(id)) return MATERIALS.get(id);
    const p = PALETTES[id];
    const matte = color => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 });
    const m = {
        cream: matte(p.cream), paint: matte(p.paint), light: matte(p.light), dark: matte(p.dark),
        accent: matte(p.accent), tire: matte(0x20252b), bumper: matte(0x35414a),
        hub: new THREE.MeshStandardMaterial({ color: 0xd9ddd7, roughness: 0.38, metalness: 0.46 }),
        glass: new THREE.MeshStandardMaterial({ color: p.dark, roughness: 0.24, metalness: 0.32, side: THREE.DoubleSide }),
        reflection: new THREE.MeshBasicMaterial({ color: 0xbadfdc }),
        headlight: new THREE.MeshBasicMaterial({ color: 0xfff1bd }),
        tail: new THREE.MeshBasicMaterial({ color: 0xf17866 }),
        indicator: new THREE.MeshBasicMaterial({ color: 0xf1b65d }),
    };
    MATERIALS.set(id, m);
    return m;
}

function positive(value, fallback) { return Number.isFinite(value) && value > 0 ? value : fallback; }

/** Road vehicles own the same scene/movement interface as Train3D. */
export class RoadVehicle3D {
    constructor(scene, lane, z, { kind = 'bus', mapId = 'egypt', length, height, width, movingSpeed = 0 } = {}) {
        this.scene = scene;
        this.lane = lane;
        this.z = z;
        this.kind = ['hatchback', 'bus', 'truck'].includes(kind) ? kind : 'bus';
        this.mapId = mapId;
        this.speed = Number.isFinite(movingSpeed) ? movingSpeed : 0;
        const car = this.kind === 'hatchback';
        this.width = positive(width, car ? 2.35 : 2.65);
        this.height = positive(height, car ? 1.4 : 2.45);
        this.length = positive(length, car ? 6 : 160);
        this.isRideable = !car;
        this.roofWidth = this.width;
        this.roofTopOffset = car ? 0 : 0.10;
        this.wheels = [];
        this.mesh = this.buildMesh();
        this.mesh.position.set(-lane * CONFIG.LANE_WIDTH, 0, z);
        scene.add(this.mesh);
    }

    part(parent, geometry, material, name, position, scale, rotation = [0, 0, 0], shadow = true) {
        const mesh = new THREE.Mesh(geometries()[geometry], materials(this.mapId)[material]);
        mesh.name = name;
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        mesh.rotation.set(...rotation);
        mesh.castShadow = shadow;
        mesh.receiveShadow = shadow;
        parent.add(mesh);
        return mesh;
    }

    addWheels(group, axles, radius) {
        const w = this.width, wheelY = radius + 0.025;
        for (const z of axles) for (const side of [-1, 1]) {
            const wheel = new THREE.Group();
            wheel.name = 'roadWheel';
            wheel.position.set(side * (w / 2 - 0.025), wheelY, z);
            this.part(wheel, 'wheel', 'tire', 'blackTire', [0, 0, 0], [0.24, radius, radius]);
            this.part(wheel, 'wheel', 'hub', 'wheelRim', [side * 0.132, 0, 0], [0.035, radius * 0.55, radius * 0.55]);
            this.part(wheel, 'wheel', 'dark', 'rimCenter', [side * 0.155, 0, 0], [0.014, radius * 0.23, radius * 0.23]);
            group.add(wheel);
            this.wheels.push(wheel);
        }
        this.wheelRadius = radius;
    }

    addMirrors(group, y, z) {
        for (const side of [-1, 1]) {
            this.part(group, 'box', 'bumper', 'mirrorArm', [side * (this.width / 2 + 0.06), y, z], [0.25, 0.065, 0.08]);
            this.part(group, 'soft', 'paint', 'sideMirror', [side * (this.width / 2 + 0.19), y + 0.045, z - 0.03], [0.18, 0.23, 0.21]);
            this.part(group, 'box', 'glass', 'mirrorGlass', [side * (this.width / 2 + 0.19), y + 0.045, z + 0.078], [0.13, 0.15, 0.014], [0, 0, 0], false);
        }
    }

    addFront(group, car = false) {
        const w = this.width, h = this.height;
        const lightY = h * (car ? 0.43 : 0.30);
        this.part(group, 'soft', 'bumper', 'frontBumper', [0, h * 0.22, 0.10], [w * 0.92, h * 0.11, 0.25]);
        this.part(group, 'soft', 'dark', 'frontGrille', [0, h * (car ? 0.38 : 0.37), -0.015], [w * 0.45, h * 0.12, 0.035]);
        this.part(group, 'soft', 'cream', 'frontPlate', [0, h * 0.23, -0.033], [w * 0.22, h * 0.07, 0.026], [0, 0, 0], false);
        for (const side of [-1, 1]) {
            this.part(group, 'soft', 'headlight', 'headlight', [side * w * 0.335, lightY, -0.024], [w * 0.19, h * 0.09, 0.045], [0, 0, 0], false);
            this.part(group, 'soft', 'indicator', 'turnIndicator', [side * w * 0.424, lightY, -0.026], [w * 0.038, h * 0.068, 0.048], [0, 0, 0], false);
        }
    }

    addRear(group, car = false) {
        const w = this.width, h = this.height, l = this.length;
        this.part(group, 'soft', 'bumper', 'rearBumper', [0, h * 0.22, l - 0.08], [w * 0.92, h * 0.10, 0.22]);
        this.part(group, 'soft', 'cream', 'rearPlate', [0, h * 0.38, l + 0.015], [w * 0.22, h * 0.065, 0.028], [0, 0, 0], false);
        for (const side of [-1, 1]) {
            this.part(group, 'soft', 'tail', 'taillight', [side * w * 0.37, h * 0.44, l + 0.018], [w * (car ? 0.15 : 0.10), h * (car ? 0.09 : 0.18), 0.033], [0, 0, 0], false);
        }
    }

    buildHatchback(group) {
        const w = this.width, h = this.height, l = this.length;
        this.part(group, 'soft', 'paint', 'hatchbackBody', [0, h * 0.405, l / 2], [w, h * 0.45, l]);
        this.part(group, 'soft', 'light', 'shortCarHood', [0, h * 0.62, l * 0.145], [w * 0.94, h * 0.10, l * 0.29]);
        const cabAt = [0, h * 0.752, l * 0.54], cabScale = [w * 0.90, h * 0.36, l * 0.55];
        this.part(group, 'cabin', 'cream', 'hatchbackCabin', cabAt, cabScale);
        this.part(group, 'carFrontGlass', 'glass', 'slopingWindshield', cabAt, cabScale, [0, 0, 0], false);
        this.part(group, 'carFrontGlass', 'glass', 'rearHatchWindow', cabAt, [cabScale[0], cabScale[1], -cabScale[2]], [0, 0, 0], false);
        this.part(group, 'soft', 'cream', 'smallCarRoof', [0, h - h * 0.045, l * 0.54], [w * 0.78, h * 0.09, l * 0.34]);
        for (const side of [-1, 1]) {
            this.part(group, 'carSideGlass', 'glass', 'carSideWindow', cabAt, [side * cabScale[0], cabScale[1], cabScale[2]], [0, 0, 0], false);
            this.part(group, 'box', 'cream', 'carWindowPillar', [side * w * 0.416, h * 0.77, l * 0.545], [0.045, h * 0.25, 0.085]);
            this.part(group, 'box', 'light', 'carDoorSeam', [side * (w / 2 + 0.005), h * 0.43, l * 0.56], [0.018, h * 0.26, 0.025], [0, 0, 0], false);
            this.part(group, 'soft', 'cream', 'carDoorHandle', [side * (w / 2 + 0.012), h * 0.53, l * 0.61], [0.025, h * 0.042, l * 0.06], [0, 0, 0], false);
        }
        this.addWheels(group, [l * 0.21, l * 0.79], h * 0.215);
        this.addMirrors(group, h * 0.71, l * 0.305);
        this.addFront(group, true);
        this.addRear(group, true);
    }

    addTallCabFace(group) {
        const w = this.width, h = this.height;
        this.part(group, 'soft', 'paint', 'paintedRoadNose', [0, h * 0.35, 0.075], [w * 0.96, h * 0.30, 0.19]);
        this.part(group, 'soft', 'glass', 'wideRoadWindshield', [0, h * 0.70, -0.019], [w * 0.84, h * 0.36, 0.034], [0, 0, 0], false);
        this.part(group, 'box', 'cream', 'windshieldCenterPost', [0, h * 0.70, -0.040], [0.055, h * 0.355, 0.025]);
        for (const side of [-1, 1]) {
            this.part(group, 'box', 'reflection', 'windshieldGlint', [side * w * 0.29, h * 0.79, -0.043], [w * 0.13, h * 0.025, 0.012], [0, 0, -0.18], false);
            this.part(group, 'box', 'bumper', 'windshieldWiper', [side * w * 0.19, h * 0.54, -0.045], [w * 0.21, 0.025, 0.016], [0, 0, side * 0.13], false);
        }
        this.addMirrors(group, h * 0.70, 0.80);
        this.addFront(group);
    }

    buildBus(group) {
        const w = this.width, h = this.height, l = this.length;
        const base = h * 0.15;
        this.part(group, 'soft', 'cream', 'busCoachBody', [0, (h + base) / 2, l / 2], [w, h - base, l]);
        this.part(group, 'soft', 'paint', 'busLowerBody', [0, h * 0.31, l / 2], [w * 1.006, h * 0.27, l * 0.995]);
        this.part(group, 'box', 'light', 'busColorStripe', [0, h * 0.47, l / 2], [w * 1.009, h * 0.055, l * 0.996]);
        this.part(group, 'box', 'accent', 'busFineStripe', [0, h * 0.415, l / 2], [w * 1.011, h * 0.027, l * 0.997]);
        this.part(group, 'box', 'bumper', 'busUndercarriage', [0, h * 0.16, l / 2], [w * 0.86, h * 0.10, l * 0.985]);
        // Keep near windows human-sized and cap repetition on very long bodies.
        const count = Math.min(12, Math.max(2, Math.floor(l / 2.5)));
        const nearCount = Math.min(4, count), windowSlots = [];
        for (let i = 0; i < nearCount; i++) {
            const center = 3.35 + i * 2.5;
            if (center < l - 1.8) windowSlots.push([center, Math.min(1.88, l * 0.18)]);
        }
        const remaining = count - windowSlots.length;
        const start = Math.min(13.2, l * 0.60), end = l - 2.1;
        if (remaining > 0 && end > start) for (let i = 0; i < remaining; i++) {
            const step = (end - start) / Math.max(1, remaining - 1);
            windowSlots.push([start + step * i, Math.min(4.2, Math.max(1.5, step * 0.68))]);
        }
        for (const side of [-1, 1]) {
            for (const [z, span] of windowSlots) {
                this.part(group, 'soft', 'glass', 'busSideWindow', [side * (w / 2 + 0.013), h * 0.73, z], [0.028, h * 0.29, span], [0, 0, 0], false);
            }
            this.part(group, 'soft', 'glass', 'busDriverSideWindow', [side * (w / 2 + 0.015), h * 0.72, 0.82], [0.030, h * 0.31, 1.24], [0, 0, 0], false);
        }
        for (const z of [1.97, l - 1.18]) {
            this.part(group, 'soft', 'dark', 'busDoorFrame', [w / 2 + 0.019, h * 0.56, z], [0.035, h * 0.71, 1.01]);
            this.part(group, 'box', 'glass', 'busDoorGlass', [w / 2 + 0.041, h * 0.64, z], [0.012, h * 0.46, 0.84], [0, 0, 0], false);
            this.part(group, 'box', 'cream', 'busDoorDivider', [w / 2 + 0.050, h * 0.57, z], [0.018, h * 0.66, 0.045]);
            this.part(group, 'box', 'accent', 'busDoorStep', [w / 2 + 0.035, h * 0.24, z], [0.08, 0.065, 0.86]);
        }
        this.addTallCabFace(group);
        this.part(group, 'soft', 'dark', 'busDestinationPanel', [0, h * 0.935, -0.017], [w * 0.68, h * 0.068, 0.031], [0, 0, 0], false);
        for (const x of [-0.25, 0, 0.25]) this.part(group, 'box', 'headlight', 'busRouteMark', [x * w, h * 0.935, -0.035], [w * 0.12, h * 0.021, 0.01], [0, 0, 0], false);
        const axles = l > 12 ? [1.50, 5.25, l - 3.10, l - 1.55] : [l * 0.20, l * 0.79];
        this.addWheels(group, axles, h * 0.16);
        this.addRear(group);
    }

    buildTruck(group) {
        const w = this.width, h = this.height, l = this.length;
        const cabLength = Math.min(4.9, l * 0.38), cargoStart = cabLength + Math.min(0.18, l * 0.015);
        const cargoLength = l - cargoStart, base = h * 0.20;
        this.part(group, 'box', 'bumper', 'truckChassis', [0, h * 0.22, l / 2], [w * 0.82, h * 0.12, l * 0.995]);
        this.part(group, 'soft', 'paint', 'truckDriverCab', [0, h * 0.575, cabLength / 2], [w, h * 0.85, cabLength]);
        this.part(group, 'soft', 'cream', 'truckCargoBox', [0, (base + h) / 2, cargoStart + cargoLength / 2], [w, h - base, cargoLength]);
        this.part(group, 'box', 'light', 'truckCargoBelt', [0, h * 0.44, cargoStart + cargoLength / 2], [w * 1.012, h * 0.12, cargoLength * 0.997]);
        for (const side of [-1, 1]) {
            this.part(group, 'soft', 'glass', 'truckCabSideWindow', [side * (w / 2 + 0.017), h * 0.72, 1.49], [0.035, h * 0.31, Math.min(2.2, cabLength * 0.53)], [0, 0, 0], false);
            this.part(group, 'box', 'light', 'truckCabDoorSeam', [side * (w / 2 + 0.022), h * 0.53, cabLength * 0.69], [0.020, h * 0.61, 0.035], [0, 0, 0], false);
            this.part(group, 'soft', 'cream', 'truckDoorHandle', [side * (w / 2 + 0.028), h * 0.53, cabLength * 0.58], [0.027, 0.072, 0.36], [0, 0, 0], false);
            this.part(group, 'box', 'bumper', 'truckCabStep', [side * (w / 2 - 0.02), h * 0.21, cabLength * 0.62], [0.18, 0.10, cabLength * 0.46]);
            this.part(group, 'box', 'light', 'cargoUpperTrim', [side * (w / 2 + 0.013), h * 0.92, cargoStart + cargoLength / 2], [0.026, h * 0.055, cargoLength]);
            for (const t of [0.02, 0.34, 0.67, 0.98]) {
                this.part(group, 'box', 'light', 'cargoPanelRib', [side * (w / 2 + 0.017), h * 0.64, cargoStart + cargoLength * t], [0.032, h * 0.56, 0.065]);
            }
        }
        this.part(group, 'box', 'light', 'rearCargoDoorFrame', [0, h * 0.63, l + 0.016], [w * 0.93, h * 0.64, 0.025]);
        this.part(group, 'box', 'cream', 'rearCargoDoors', [0, h * 0.63, l + 0.033], [w * 0.85, h * 0.58, 0.020]);
        this.part(group, 'box', 'dark', 'cargoDoorJoin', [0, h * 0.63, l + 0.047], [0.035, h * 0.58, 0.010], [0, 0, 0], false);
        for (const side of [-1, 1]) this.part(group, 'box', 'hub', 'cargoDoorLatch', [side * w * 0.12, h * 0.56, l + 0.058], [0.025, h * 0.30, 0.018]);
        this.addTallCabFace(group);
        const axles = l > 12 ? [1.55, cabLength + 0.75, l - 3.05, l - 1.50] : [l * 0.18, l * 0.75, l * 0.88];
        this.addWheels(group, axles, h * 0.16);
        this.addRear(group);
    }

    buildMesh() {
        const group = new THREE.Group();
        group.name = `${this.mapId}-${this.kind}`;
        group.userData.vehicleKind = this.kind;
        if (this.kind === 'hatchback') this.buildHatchback(group);
        else {
            if (this.kind === 'truck') this.buildTruck(group);
            else this.buildBus(group);
            // An unbroken roof at collision height. No raised decorative parts
            // obstruct the player's route or introduce unmodelled collision.
            this.part(group, 'box', 'light', 'roadVehicleFlatRoof',
                [0, this.height + this.roofTopOffset / 2, this.length / 2],
                [this.roofWidth, this.roofTopOffset, this.length]);
        }
        return group;
    }

    update(dt) {
        if (!Number.isFinite(dt) || dt <= 0 || this.speed === 0) return;
        const distance = this.speed * dt;
        this.z -= distance;
        this.mesh.position.z = this.z;
        for (const wheel of this.wheels) wheel.rotation.x -= distance / this.wheelRadius;
    }

    destroy() {
        // Shared resources remain owned by the world batcher and other vehicles.
        this.scene.remove(this.mesh);
    }
}
