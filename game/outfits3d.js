import * as THREE from '../libs/three.module.js';

export const OUTFIT_SKINS = {
    none: { id: 'none', price: 0, name: '原味奶蛙', description: '暖黄色原装，软乎乎的大肚皮', icon: '🐸', color: '#ffd247', colors: { primary: 0xffd247, secondary: 0xffedc2, accent: 0xddb773 } },
    nurse: { id: 'nurse', price: 800, name: '桃桃护理员', description: '桃粉制服、奶油围裙与软帽', icon: '🩺', color: '#efb6c6', colors: { primary: 0xefb6c6, secondary: 0xfff7ea, accent: 0xcc597d } },
    bandit: { id: 'bandit', price: 1200, name: '午夜小偷', description: '条纹衫、针织帽与迷你战利品袋', icon: '🦹', color: '#424651', colors: { primary: 0x343940, secondary: 0xefeee7, accent: 0xa28bad } },
    street: { id: 'street', price: 1500, name: '薄荷校队', description: '薄荷棒球衫、奶白袖口与鸭舌帽', icon: '🧢', color: '#8faf9a', colors: { primary: 0x8faf9a, secondary: 0xfff5df, accent: 0x406755 } },
    ufo: { id: 'ufo', price: 3600, name: 'UFO临时工', description: '荧光工服、飞碟帽与接收天线', icon: '🛸', color: '#b6d66f', colors: { primary: 0xb6d66f, secondary: 0x665789, accent: 0xeffbc1 } },
    tv: { id: 'tv', price: 4500, name: '雪花电视怪', description: '复古开放电视框、兔耳天线与调台钮', icon: '📺', color: '#bc9274', colors: { primary: 0x475e68, secondary: 0xe9d8b7, accent: 0xc98567 } },
    jellyfish: { id: 'jellyfish', price: 6000, name: '深海果冻', description: '透亮水母伞、卷曲触须与气泡制服', icon: '🪼', color: '#a99bcf', colors: { primary: 0xa99bcf, secondary: 0x99cfd5, accent: 0xe4d6f4 } },
    mushroom: { id: 'mushroom', price: 2800, name: '孢子观察员', description: '珊瑚菌帽、奶白斑点与森林工作服', icon: '🍄', color: '#df877a', colors: { primary: 0x607e68, secondary: 0xffead8, accent: 0xdf877a } },
    zipper: { id: 'zipper', price: 8000, name: '肚皮吞金兽', description: '酒红软帽、卡通拉链大嘴与小奶牙', icon: '🦷', color: '#874658', colors: { primary: 0x874658, secondary: 0xffe4b8, accent: 0x302d3f } },
    dumpling: { id: 'dumpling', price: 2200, name: '逃跑小笼包', description: '褶皱包子帽、轻轻蒸汽与竹编制服', icon: '🥟', color: '#dfc396', colors: { primary: 0xdfc396, secondary: 0xfff5de, accent: 0x6b947a } },
};

const OUTFIT_IDS = { none: 0, nurse: 1, bandit: 2, street: 3, ufo: 4, tv: 5, jellyfish: 6, mushroom: 7, zipper: 8, dumpling: 9 };
for (const [id, skin] of Object.entries(OUTFIT_SKINS)) skin.category = OUTFIT_IDS[id] >= 4 ? 'weird' : 'daily';

// The garment is a color layer on the original skinned surface. In particular,
// it cannot introduce another torso or leave a seam between a sleeve and arm.
const GARMENT_FRAGMENT = `
                float outfitHeight = smoothstep(.71, .75, vFrogRestPosition.y) *
                    (1.0 - smoothstep(1.565, 1.605, vFrogRestPosition.y));
                float outfitFront = smoothstep(.15, .25, vFrogRestPosition.z);
                if (frogOutfitId > .5 && frogOutfitId < 1.5) {
                    vec2 apronCoord = (vFrogRestPosition.xy - vec2(0.0, 1.17)) / vec2(.455, .365);
                    float apron = (1.0 - smoothstep(.97, 1.03, dot(apronCoord, apronCoord))) * vFrogBellyMask;
                    vec3 nurseCloth = mix(frogOutfitPrimary, frogOutfitSecondary, apron);
                    float cuff = smoothstep(.65, .9, vOutfitArmWeight) *
                        smoothstep(1.14, 1.16, vFrogRestPosition.y) *
                        (1.0 - smoothstep(1.20, 1.23, vFrogRestPosition.y));
                    nurseCloth = mix(nurseCloth, frogOutfitAccent, cuff);
                    diffuseColor.rgb = mix(diffuseColor.rgb, nurseCloth, outfitHeight);
                } else if (frogOutfitId > 1.5 && frogOutfitId < 2.5) {
                    float stripeWave = sin((vFrogRestPosition.y - .73) * 35.0);
                    float stripe = smoothstep(-.07, .07, stripeWave);
                    vec3 banditCloth = mix(frogOutfitPrimary, frogOutfitSecondary, stripe);
                    diffuseColor.rgb = mix(diffuseColor.rgb, banditCloth, outfitHeight);
                    float mask = smoothstep(1.998, 2.015, vFrogRestPosition.y) *
                        (1.0 - smoothstep(2.122, 2.144, vFrogRestPosition.y)) * outfitFront;
                    diffuseColor.rgb = mix(diffuseColor.rgb, frogOutfitPrimary, mask);
                } else if (frogOutfitId > 2.5 && frogOutfitId < 3.5) {
                    float sleeve = smoothstep(.18, .63, vOutfitArmWeight);
                    float placket = (1.0 - smoothstep(.014, .025, abs(vFrogRestPosition.x))) *
                        outfitFront * (1.0 - smoothstep(.12, .32, vOutfitArmWeight));
                    float collar = smoothstep(1.505, 1.52, vFrogRestPosition.y);
                    vec3 streetCloth = mix(frogOutfitPrimary, frogOutfitSecondary, max(sleeve, max(placket, collar)));
                    diffuseColor.rgb = mix(diffuseColor.rgb, streetCloth, outfitHeight);
                } else if (frogOutfitId > 3.5 && frogOutfitId < 4.5) {
                    float spaceSeam = smoothstep(1.33, 1.35, vFrogRestPosition.y) *
                        (1.0 - smoothstep(1.40, 1.42, vFrogRestPosition.y));
                    float spaceBelt = 1.0 - smoothstep(.017, .031, abs(vFrogRestPosition.y - .865));
                    vec3 spaceCloth = mix(frogOutfitPrimary, frogOutfitSecondary, max(spaceSeam, spaceBelt));
                    vec2 patchCoord = (vFrogRestPosition.xy - vec2(-.18, 1.47)) / vec2(.080, .048);
                    float spacePatch = (1.0 - smoothstep(.91, 1.05, dot(patchCoord, patchCoord))) * vFrogBellyMask;
                    spaceCloth = mix(spaceCloth, frogOutfitAccent, spacePatch);
                    diffuseColor.rgb = mix(diffuseColor.rgb, spaceCloth, outfitHeight);
                } else if (frogOutfitId > 4.5 && frogOutfitId < 5.5) {
                    float signal = 1.0 - smoothstep(.037, .055, abs(vFrogRestPosition.y - 1.17));
                    float tuning = smoothstep(-.015, .015, sin(vFrogRestPosition.x * 31.0));
                    vec3 tvCloth = mix(frogOutfitPrimary, mix(frogOutfitSecondary, frogOutfitAccent, tuning), signal);
                    float staticNoise = step(.86, fract(sin(dot(floor(vFrogRestPosition.xy * 51.0), vec2(12.9898, 78.233))) * 43758.5453));
                    tvCloth = mix(tvCloth, frogOutfitSecondary, staticNoise * .10);
                    diffuseColor.rgb = mix(diffuseColor.rgb, tvCloth, outfitHeight);
                } else if (frogOutfitId > 5.5 && frogOutfitId < 6.5) {
                    float oceanWave = smoothstep(-.16, .16, sin(vFrogRestPosition.y * 19.0 + vFrogRestPosition.x * 7.0));
                    vec3 jellyCloth = mix(frogOutfitPrimary, frogOutfitSecondary, oceanWave * .48);
                    vec2 bubbleCell = fract(vFrogRestPosition.xy * vec2(5.0, 7.0)) - .5;
                    float bubbleDistance = length(bubbleCell);
                    float bubble = smoothstep(.21, .24, bubbleDistance) * (1.0 - smoothstep(.27, .30, bubbleDistance));
                    jellyCloth = mix(jellyCloth, frogOutfitAccent, bubble * .65 * vFrogBellyMask);
                    diffuseColor.rgb = mix(diffuseColor.rgb, jellyCloth, outfitHeight);
                } else if (frogOutfitId > 6.5 && frogOutfitId < 7.5) {
                    float gardenBib = (1.0 - smoothstep(.36, .405, abs(vFrogRestPosition.x))) *
                        smoothstep(.87, .90, vFrogRestPosition.y) * (1.0 - smoothstep(1.43, 1.47, vFrogRestPosition.y)) * vFrogBellyMask;
                    vec3 gardenCloth = mix(frogOutfitPrimary, frogOutfitSecondary, gardenBib * .17);
                    vec2 mushroomCoord = vFrogRestPosition.xy - vec2(-.19, 1.455);
                    float pinCap = (1.0 - smoothstep(.93, 1.06, dot(mushroomCoord / vec2(.061, .030), mushroomCoord / vec2(.061, .030)))) *
                        smoothstep(-.008, -.001, mushroomCoord.y) * vFrogBellyMask;
                    float pinStem = (1.0 - smoothstep(.009, .015, abs(mushroomCoord.x))) *
                        smoothstep(-.047, -.042, mushroomCoord.y) * (1.0 - smoothstep(-.005, .0, mushroomCoord.y)) * vFrogBellyMask;
                    gardenCloth = mix(gardenCloth, frogOutfitSecondary, pinStem);
                    gardenCloth = mix(gardenCloth, frogOutfitAccent, pinCap);
                    diffuseColor.rgb = mix(diffuseColor.rgb, gardenCloth, outfitHeight);
                } else if (frogOutfitId > 7.5 && frogOutfitId < 8.5) {
                    vec2 mouthCoord = vFrogRestPosition.xy - vec2(0.0, 1.055);
                    float mouthOval = dot(mouthCoord / vec2(.365, .135), mouthCoord / vec2(.365, .135));
                    float bellyMouth = (1.0 - smoothstep(.95, 1.02, mouthOval)) * vFrogBellyMask;
                    float toothPhase = abs(fract((mouthCoord.x + .41) * 15.5) - .5) * 2.0;
                    float tooth = smoothstep(.052 + .045 * toothPhase, .058 + .045 * toothPhase, abs(mouthCoord.y));
                    vec3 mouthCloth = mix(frogOutfitAccent, frogOutfitSecondary, tooth);
                    vec3 zipperCloth = mix(frogOutfitPrimary, mouthCloth, bellyMouth);
                    float teethTrack = (1.0 - smoothstep(.025, .047, abs(mouthOval - 1.19))) * vFrogBellyMask;
                    zipperCloth = mix(zipperCloth, frogOutfitSecondary, teethTrack * .50);
                    diffuseColor.rgb = mix(diffuseColor.rgb, zipperCloth, outfitHeight);
                } else if (frogOutfitId > 8.5 && frogOutfitId < 9.5) {
                    float bamboo = smoothstep(.48, .56, fract((vFrogRestPosition.x + vFrogRestPosition.y) * 26.0)) *
                        smoothstep(.48, .56, fract((vFrogRestPosition.y - vFrogRestPosition.x) * 26.0));
                    vec3 dumplingCloth = mix(frogOutfitPrimary, frogOutfitSecondary, .22 + bamboo * .16);
                    float flourBib = smoothstep(1.24, 1.27, vFrogRestPosition.y) * vFrogBellyMask;
                    dumplingCloth = mix(dumplingCloth, frogOutfitSecondary, flourBib);
                    float scallion = (1.0 - smoothstep(.015, .023, abs(vFrogRestPosition.x + .17))) *
                        smoothstep(1.375, 1.39, vFrogRestPosition.y) * (1.0 - smoothstep(1.465, 1.48, vFrogRestPosition.y)) * vFrogBellyMask;
                    dumplingCloth = mix(dumplingCloth, frogOutfitAccent, scallion);
                    diffuseColor.rgb = mix(diffuseColor.rgb, dumplingCloth, outfitHeight);
                }
`;

const lathe = (profile, segments = 24) => new THREE.LatheGeometry(profile.map(point => new THREE.Vector2(...point)), segments);
const tube = (points, radius, segments = 12) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), segments, radius, 4, false);

function roundedRectangle(width, height, radius, ShapeType = THREE.Shape) {
    const shape = new ShapeType(), x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
}

function televisionFrame() {
    const shape = roundedRectangle(.79, .63, .075);
    shape.holes.push(roundedRectangle(.625, .495, .055, THREE.Path));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .39, steps: 1, bevelEnabled: true, bevelThickness: .013, bevelSize: .010, bevelSegments: 2, curveSegments: 4 });
    geometry.translate(0, 0, -.195);
    return geometry;
}

function pleatedBun() {
    const geometry = lathe([[0, -.035], [.23, -.035], [.34, -.010], [.35, .055], [.30, .15], [.205, .235], [.08, .265], [0, .275]], 40);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), z = position.getZ(i), y = position.getY(i);
        const folds = 1 + .055 * Math.cos(Math.atan2(z, x) * 10) * Math.sin(THREE.MathUtils.clamp((y + .035) / .31, 0, 1) * Math.PI);
        position.setXYZ(i, x * folds, y, z * folds);
    }
    geometry.computeVertexNormals();
    return geometry;
}

export class OutfitSystem3D {
    constructor(character) {
        this.character = character;
        this.group = new THREE.Group();
        this.group.name = 'outfitAccessories';
        character.bodyGroup.add(this.group);
        this.uniform = { value: 0 };
        this.uniforms = {
            frogOutfitId: this.uniform,
            frogOutfitPrimary: { value: new THREE.Color() },
            frogOutfitSecondary: { value: new THREE.Color() },
            frogOutfitAccent: { value: new THREE.Color() },
        };
        this.geometries = {
            sphere: new THREE.SphereGeometry(1, 12, 8),
            box: new THREE.BoxGeometry(1, 1, 1),
            ring: new THREE.TorusGeometry(1, .035, 4, 24),
            bonnet: new THREE.LatheGeometry([[0, -.04], [.20, -.04], [.22, -.015], [.22, .055], [.16, .10], [0, .12]].map(p => new THREE.Vector2(...p)), 24),
            cap: new THREE.LatheGeometry([[0, -.045], [.178, -.045], [.20, -.020], [.20, .04], [.14, .095], [0, .11]].map(p => new THREE.Vector2(...p)), 24),
            cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
            saucer: lathe([[0, -.035], [.15, -.035], [.36, -.015], [.43, .027], [.43, .050], [.32, .072], [.15, .105], [0, .11]], 32),
            television: televisionFrame(),
            jellyBell: lathe([[0, -.020], [.29, -.020], [.395, .0], [.41, .060], [.37, .18], [.27, .28], [.13, .335], [0, .355]]),
            jellyTendril: tube([[0, 0, 0], [.043, -.11, .007], [.007, -.23, .015], [.050, -.34, -.012], [.030, -.44, .020]], .012),
            mushroom: lathe([[0, -.025], [.34, -.025], [.42, 0], ...Array.from({ length: 7 }, (_, i) => {
                const angle = Math.PI / 2 * (1 - (i + 1) / 7);
                return [.42 * Math.sin(angle), .30 * Math.cos(angle)];
            })]),
            bun: pleatedBun(),
            bunPleat: tube([[.245, .025, 0], [.22, .14, 0], [.12, .235, 0], [.025, .274, 0]], .009, 10),
            steam: tube([[0, 0, 0], [-.024, .06, 0], [.028, .12, .005], [0, .19, .0]], .007, 12),
        };
        this.materials = {
            cream: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.nurse.colors.secondary, roughness: .92 }),
            pink: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.nurse.colors.accent, roughness: .90 }),
            dark: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.bandit.colors.primary, roughness: .98 }),
            lilac: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.bandit.colors.accent, roughness: .95 }),
            mint: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.street.colors.primary, roughness: .92 }),
            ink: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.street.colors.accent, roughness: .92 }),
            violet: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.ufo.colors.secondary, roughness: .62 }),
            lime: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.ufo.colors.primary, roughness: .72 }),
            television: new THREE.MeshStandardMaterial({ color: 0xbc9274, roughness: .86 }),
            jelly: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.jellyfish.colors.primary, transparent: true, opacity: .76, depthWrite: false, roughness: .36 }),
            aqua: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.jellyfish.colors.secondary, roughness: .68 }),
            jellyInk: new THREE.MeshStandardMaterial({ color: 0x8472b1, roughness: .72 }),
            coral: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.mushroom.colors.accent, roughness: .87 }),
            wine: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.zipper.colors.primary, roughness: .96 }),
            gold: new THREE.MeshStandardMaterial({ color: 0xe8bd7a, roughness: .55, metalness: .12 }),
            flour: new THREE.MeshStandardMaterial({ color: OUTFIT_SKINS.dumpling.colors.secondary, roughness: .96 }),
            doughFold: new THREE.MeshStandardMaterial({ color: 0xd8c19e, roughness: .96 }),
            steam: new THREE.MeshStandardMaterial({ color: 0xfff6e7, transparent: true, opacity: .65, depthWrite: false, roughness: 1 }),
        };
        this.accessories = {};
        this.buildNurse();
        this.buildBandit();
        this.buildStreet();
        this.buildUFO();
        this.buildTelevision();
        this.buildJellyfish();
        this.buildMushroom();
        this.buildZipper();
        this.buildDumpling();
        this.equip('none');
    }

    mesh(parent, geometry, material, scale, position) {
        const mesh = new THREE.Mesh(this.geometries[geometry], this.materials[material]);
        mesh.scale.set(...scale);
        mesh.position.set(...position);
        // Small accessories use the body's ground shadow and need no extra
        // shadow-map draw calls or self-shadow acne on the painted garment.
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        parent.add(mesh);
        return mesh;
    }

    makeGroup(id) {
        const group = new THREE.Group();
        group.name = `${id}OutfitAccessories`;
        this.group.add(group);
        this.accessories[id] = group;
        return group;
    }

    instances(parent, geometry, material, transforms, name) {
        const mesh = new THREE.InstancedMesh(this.geometries[geometry], this.materials[material], transforms.length);
        const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion();
        transforms.forEach((transform, index) => {
            if (transform.normal) quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...transform.normal).normalize());
            else quaternion.setFromEuler(new THREE.Euler(...(transform.rotation ?? [0, 0, 0])));
            matrix.compose(new THREE.Vector3(...transform.position), quaternion, new THREE.Vector3(...transform.scale));
            mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingBox(); mesh.computeBoundingSphere();
        mesh.name = name;
        parent.add(mesh);
        return mesh;
    }

    rod(parent, material, start, end, radius) {
        const from = new THREE.Vector3(...start), to = new THREE.Vector3(...end), delta = to.clone().sub(from);
        const mesh = this.mesh(parent, 'cylinder', material, [radius, delta.length(), radius], from.clone().add(to).multiplyScalar(.5).toArray());
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
        return mesh;
    }

    buildNurse() {
        const parent = this.makeGroup('nurse');
        this.mesh(parent, 'bonnet', 'cream', [1, 1, 1], [0, 2.185, .135]).name = 'nurseSoftHat';
        const band = this.mesh(parent, 'ring', 'pink', [.211, .211, .16], [0, 2.169, .135]);
        band.rotation.x = Math.PI / 2;
        this.mesh(parent, 'box', 'pink', [.080, .020, .015], [0, 2.226, .353]);
        this.mesh(parent, 'box', 'pink', [.022, .075, .015], [0, 2.226, .353]);
        const x = -.16, y = 1.465, z = this.character.surface.front(x, y);
        this.mesh(parent, 'sphere', 'cream', [.047, .047, .012], [x, y, z + .012]).name = 'nurseChestBadge';
        this.mesh(parent, 'box', 'pink', [.040, .011, .012], [x, y, z + .025]);
        this.mesh(parent, 'box', 'pink', [.011, .040, .012], [x, y, z + .025]);
    }

    buildBandit() {
        const parent = this.makeGroup('bandit');
        this.mesh(parent, 'cap', 'dark', [1, 1, 1], [0, 2.19, .135]).name = 'banditBeanie';
        // This pack sits below the wing roots. It never replaces the back,
        // blocks the shoulders, or touches the face during the belly-down pose.
        this.mesh(parent, 'sphere', 'lilac', [.17, .225, .125], [.24, .90, -.525]).name = 'banditLootSack';
        this.mesh(parent, 'sphere', 'dark', [.063, .029, .042], [.24, 1.092, -.525]);
        this.mesh(parent, 'sphere', 'lilac', [.066, .070, .044], [.24, 1.14, -.525]);
    }

    buildStreet() {
        const parent = this.makeGroup('street');
        this.mesh(parent, 'cap', 'mint', [1, .82, .93], [0, 2.195, .135]).name = 'streetBaseballCap';
        this.mesh(parent, 'sphere', 'mint', [.175, .014, .125], [0, 2.175, .302]).name = 'streetCapBrim';
        for (const y of [1.37, 1.19]) {
            this.mesh(parent, 'sphere', 'ink', [.013, .013, .005], [0, y, this.character.surface.front(0, y) + .007]);
        }
        const x = -.18, y = 1.425, z = this.character.surface.front(x, y);
        this.mesh(parent, 'sphere', 'cream', [.052, .055, .009], [x, y, z + .013]).name = 'streetChestPatch';
        for (const dx of [-.017, .017]) this.mesh(parent, 'box', 'ink', [.008, .046, .010], [x + dx, y, z + .024]);
        const diagonal = this.mesh(parent, 'box', 'ink', [.007, .053, .010], [x, y, z + .024]);
        diagonal.rotation.z = .60;
    }

    buildUFO() {
        const parent = this.makeGroup('ufo');
        this.mesh(parent, 'saucer', 'violet', [1, 1, 1], [0, 2.18, .135]).name = 'ufoSaucerHat';
        this.mesh(parent, 'sphere', 'lime', [.19, .13, .17], [0, 2.293, .135]).name = 'ufoCockpit';
        const rim = this.mesh(parent, 'ring', 'gold', [.425, .425, .18], [0, 2.219, .135]);
        rim.rotation.x = Math.PI / 2;
        this.rod(parent, 'violet', [0, 2.37, .135], [.035, 2.54, .135], .012).name = 'ufoAntenna';
        this.mesh(parent, 'sphere', 'lime', [.036, .036, .036], [.035, 2.54, .135]);
        this.instances(parent, 'sphere', 'lime', Array.from({ length: 6 }, (_, i) => {
            const angle = i * Math.PI / 3;
            return { position: [Math.sin(angle) * .377, 2.211, .135 + Math.cos(angle) * .377], scale: [.023, .014, .023] };
        }), 'ufoLandingLights');
    }

    buildTelevision() {
        const parent = this.makeGroup('tv');
        this.mesh(parent, 'television', 'television', [1, 1, 1], [0, 2.08, .145]).name = 'televisionOpenFrame';
        this.mesh(parent, 'box', 'television', [.71, .53, .05], [0, 2.08, -.16]).name = 'televisionBackPanel';
        for (const y of [2.035, 2.14]) {
            const knob = this.mesh(parent, 'sphere', 'dark', [.040, .040, .026], [.413, y, .335]);
            knob.name = 'televisionTuningKnob';
        }
        for (const side of [-1, 1]) {
            const end = [side * .22, 2.64, .095];
            this.rod(parent, 'dark', [side * .095, 2.365, .095], end, .011).name = 'televisionRabbitAntenna';
            this.mesh(parent, 'sphere', 'gold', [.023, .023, .023], end);
        }
    }

    buildJellyfish() {
        const parent = this.makeGroup('jellyfish');
        this.mesh(parent, 'jellyBell', 'jelly', [1, 1, 1], [0, 2.19, .135]).name = 'jellyfishTranslucentBell';
        const rim = this.mesh(parent, 'ring', 'aqua', [.393, .393, .22], [0, 2.202, .135]);
        rim.rotation.x = Math.PI / 2;
        const tips = [];
        for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
            const x = side * (.363 + i * .016), z = -.025 + i * .135;
            const tendril = this.mesh(parent, 'jellyTendril', i === 1 ? 'aqua' : 'jellyInk', [1, 1, 1], [x, 2.19, z]);
            if (side < 0) tendril.rotation.y = Math.PI;
            tendril.name = 'jellyfishSideTendril';
            tips.push({ position: [x + side * .030, 1.75, z + side * .020], scale: [.022, .024, .022] });
        }
        this.instances(parent, 'sphere', 'aqua', tips, 'jellyfishPearlTips');
    }

    buildMushroom() {
        const parent = this.makeGroup('mushroom');
        this.mesh(parent, 'mushroom', 'coral', [1, 1, 1], [0, 2.195, .135]).name = 'mushroomCoralCap';
        const rim = this.mesh(parent, 'ring', 'cream', [.403, .403, .25], [0, 2.197, .135]);
        rim.rotation.x = Math.PI / 2;
        const collar = this.mesh(parent, 'ring', 'cream', [.367, .305, .48], [0, 1.625, -.012]);
        collar.rotation.x = Math.PI / 2; collar.name = 'mushroomSoftCollar';
        const spots = [[.355, -1.05], [.35, -.35], [.35, .45], [.355, 1.15], [.22, .0], [.33, 3.2], [.26, 4.5]].map(([radius, angle], i) => {
            const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
            const y = .30 * Math.sqrt(1 - (radius / .42) ** 2);
            const normal = new THREE.Vector3(x / .42 ** 2, y / .30 ** 2, z / .42 ** 2).normalize();
            return { position: [x + normal.x * .006, 2.195 + y + normal.y * .006, .135 + z + normal.z * .006],
                scale: [.043 + (i % 3) * .008, .043 + (i % 3) * .008, .006], normal: normal.toArray() };
        });
        this.instances(parent, 'sphere', 'cream', spots, 'mushroomMilkSpots');
    }

    buildZipper() {
        const parent = this.makeGroup('zipper');
        this.mesh(parent, 'cap', 'wine', [1, 1, 1], [0, 2.19, .135]).name = 'zipperPlushBeanie';
        for (const side of [-1, 1]) {
            const ear = this.mesh(parent, 'sphere', 'cream', [.034, .070, .034], [side * .135, 2.287, .135]);
            ear.rotation.z = -side * .30; ear.name = 'zipperSoftToothEar';
        }
        const x = .412, y = 1.075, z = this.character.surface.front(x, y);
        const pull = this.mesh(parent, 'ring', 'gold', [.047, .061, .55], [x, y, z + .037]);
        pull.rotation.y = .59; pull.name = 'zipperGoldPull';
        this.mesh(parent, 'box', 'gold', [.031, .058, .025], [x, y + .067, z + .038]).name = 'zipperSlider';
    }

    buildDumpling() {
        const parent = this.makeGroup('dumpling');
        this.mesh(parent, 'bun', 'flour', [1, 1, 1], [0, 2.185, .135]).name = 'dumplingPleatedHat';
        this.instances(parent, 'bunPleat', 'doughFold', Array.from({ length: 6 }, (_, i) => ({
            position: [0, 2.185, .135], scale: [1, 1, 1], rotation: [0, i * Math.PI / 3, 0],
        })), 'dumplingGatheredFolds');
        this.mesh(parent, 'sphere', 'flour', [.074, .035, .074], [0, 2.453, .135]).name = 'dumplingPinchedTop';
        this.instances(parent, 'steam', 'steam', [-1, 0, 1].map((side, i) => ({
            position: [side * .105, 2.48 - (i % 2) * .005, .12 + Math.abs(side) * .017],
            scale: [.85, 1 - Math.abs(side) * .15, .85], rotation: [0, side * .30, 0],
        })), 'dumplingSteamWisps');
    }

    equip(id) {
        this.skinId = Object.prototype.hasOwnProperty.call(OUTFIT_SKINS, id) ? id : 'none';
        const skin = OUTFIT_SKINS[this.skinId];
        this.uniform.value = OUTFIT_IDS[this.skinId];
        for (const role of ['primary', 'secondary', 'accent']) {
            const uniformName = `frogOutfit${role[0].toUpperCase()}${role.slice(1)}`;
            this.uniforms[uniformName].value.setHex(skin.colors[role]);
        }
        this.group.visible = this.skinId !== 'none';
        for (const [key, group] of Object.entries(this.accessories)) group.visible = key === this.skinId;
        return this.skinId;
    }

    patchShader(shader) {
        Object.assign(shader.uniforms, this.uniforms);
        if (shader.fragmentShader.includes('uniform float frogOutfitId;')) return shader;
        // The frog's eye paint must be applied after its thief mask. Keep the
        // same green rings and pupils fully visible instead of adding goggles.
        const faceAnchor = 'vec2 eyeCoord =';
        if (!shader.fragmentShader.includes(faceAnchor)) throw new Error('Outfits require the reference frog surface shader');
        shader.vertexShader = `varying float vOutfitArmWeight;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
                vOutfitArmWeight = 0.0;
                #ifdef USE_SKINNING
                    vOutfitArmWeight = skinWeight.y;
                #endif`);
        shader.fragmentShader = `uniform float frogOutfitId;
            uniform vec3 frogOutfitPrimary;
            uniform vec3 frogOutfitSecondary;
            uniform vec3 frogOutfitAccent;
            varying float vOutfitArmWeight;\n` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(faceAnchor, GARMENT_FRAGMENT + '\n                ' + faceAnchor);
        return shader;
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.group.traverse(object => { if (object.isInstancedMesh) object.dispose(); });
        this.group.removeFromParent();
        Object.values(this.geometries).forEach(geometry => geometry.dispose());
        Object.values(this.materials).forEach(material => material.dispose());
    }
}
