import * as THREE from '../libs/three.module.js';

// Each future skin supplies palette and feather dimensions; movement stays shared.
export const WING_SKINS = {
    cream: { id: 'cream', name: '奶油云翼', price: 10000, description: '奶油羽片与浅金饰边，常驻展示，拾羽毛可飞行', feather: 0xfff3d2, trim: 0xddb773, tip: 0xc9dfc3 },
};

export class WingSystem3D {
    constructor(parent) {
        this.group = new THREE.Group(); this.group.name = 'wingSystem';
        this.group.position.set(0, 1.44, -.28);
        parent.add(this.group);
        this.time = 0;
        this.featherGeometry = new THREE.SphereGeometry(1, 12, 8);
        this.materials = {
            feather: new THREE.MeshStandardMaterial({ roughness: .87 }),
            trim: new THREE.MeshStandardMaterial({ roughness: .8 }),
            tip: new THREE.MeshStandardMaterial({ roughness: .82 }),
        };
        this.wings = [];
        for (const side of [-1, 1]) {
            const wing = new THREE.Group(); wing.name = side < 0 ? 'rightWing' : 'leftWing';
            wing.position.x = side * .16;
            const add = (material, position, scale, rotation = 0) => {
                const feather = new THREE.Mesh(this.featherGeometry, material);
                feather.position.set(side * position[0], position[1], position[2]);
                feather.scale.set(...scale); feather.rotation.z = side * rotation;
                feather.castShadow = true; wing.add(feather);
            };
            add(this.materials.trim, [.20, .015, 0], [.25, .15, .075], .27);
            add(this.materials.feather, [.39, .08, -.018], [.31, .20, .08], .18);
            for (let i = 0; i < 6; i++) {
                add(i === 5 ? this.materials.tip : this.materials.feather,
                    [.38 + i * .105, .19 - i * .065, -.03], [.31 - i * .013, .066, .045], .22 - i * .1);
            }
            this.group.add(wing); this.wings.push({ wing, side });
        }
        this.equip('cream'); this.update(0, false);
    }

    equip(id) {
        const skin = Object.prototype.hasOwnProperty.call(WING_SKINS, id) ? WING_SKINS[id] : null;
        this.skinId = skin ? id : 'none'; this.group.visible = Boolean(skin);
        if (skin) for (const role of ['feather', 'trim', 'tip']) this.materials[role].color.setHex(skin[role]);
        return this.skinId;
    }

    update(dt, flying) {
        this.group.visible = this.skinId !== 'none' || flying;
        this.time += dt;
        for (const { wing, side } of this.wings) {
            wing.rotation.y = side * (flying ? .08 + Math.sin(this.time * 9) * .18 : .60 + Math.sin(this.time * 2.4) * .025);
            wing.rotation.z = side * (flying ? .03 : .16);
        }
    }

    dispose() {
        this.group.removeFromParent(); this.featherGeometry.dispose();
        Object.values(this.materials).forEach(material => material.dispose());
    }
}

let pickupResources;
export function createFeatherPickup() {
    if (!pickupResources) {
        pickupResources = {
            feather: new THREE.SphereGeometry(1, 10, 6),
            stem: new THREE.CylinderGeometry(.025, .025, 1.35, 6),
            ring: new THREE.TorusGeometry(.86, .045, 6, 24),
            cream: new THREE.MeshStandardMaterial({ color: 0xfff1cd, roughness: .8 }),
            mint: new THREE.MeshStandardMaterial({ color: 0x74b69b, roughness: .75 }),
            gold: new THREE.MeshBasicMaterial({ color: 0xe4be76 }),
        };
    }
    const r = pickupResources, group = new THREE.Group(); group.name = 'flightFeatherPickup';
    const halo = new THREE.Mesh(r.ring, r.gold); group.add(halo);
    const stem = new THREE.Mesh(r.stem, r.gold); stem.rotation.z = -.35; group.add(stem);
    for (let i = 0; i < 5; i++) for (const side of [-1, 1]) {
        const feather = new THREE.Mesh(r.feather, i === 4 ? r.mint : r.cream);
        feather.scale.set(.28 - i * .035, .09, .065);
        feather.position.set(side * (.16 - i * .02) + (i - 2) * .07, -.45 + i * .23, 0);
        feather.rotation.z = side * .55; group.add(feather);
    }
    return group;
}
