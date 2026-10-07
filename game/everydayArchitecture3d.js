/** Inhabitable product silhouettes, built only from the environment's shared primitives. */
import * as THREE from '../libs/three.module.js';

export function createEverydayArchitecture(environment, { side, layer, width, depth, height, variant }) {
    const group = new THREE.Group(), { materials: m } = environment;
    // The rear street keeps the same silhouette with fewer curved-surface segments.
    const shared = environment.geometries;
    const g = layer === 'middle' ? { ...shared, sphere: shared.sphereLow,
        cylinder: shared.cylinderLow, taper: shared.taperLow, ringWall: shared.ringWallLow } : shared;
    const choice = ((variant % 3) + 3) % 3, accent = variant % 2 ? m.accent : m.edge;
    const add = (name, geometry, material, position, scale, rotation) => {
        const mesh = environment.mesh(group, geometry, material, position, scale);
        mesh.name = name;
        if (rotation) mesh.rotation.set(...rotation);
        return mesh;
    };
    const box = (name, material, position, scale, rotation) => add(name, g.box, material, position, scale, rotation);
    const cylinder = (name, material, position, scale, rotation) => add(name, g.cylinder, material, position, scale, rotation);
    let type;

    if (environment.themeId === 'store') {
        if (choice === 0) {
            type = 'milkCartonHouse';
            const front = -depth * .46, bodyTop = height * .78;
            box('cartonBody', m.cream, [0, bodyTop / 2, 0], [depth * .90, bodyTop, width * .86]);
            box('milkColorBand', accent, [front - .035, height * .39, 0], [.09, height * .37, width * .87]);
            box('cartonSideBand', accent, [0, height * .39, -width * .435], [depth * .91, height * .37, .06]);
            const foldAngle = Math.atan2(height * .15, width * .43);
            for (const sign of [-1, 1]) {
                box('foldedCartonRoof', m.edge, [0, bodyTop + height * .071, sign * width * .21],
                    [depth * .93, .12, Math.hypot(width * .45, height * .15)], [sign * foldAngle, 0, 0]);
            }
            box('sealedCartonRidge', accent, [0, height * .955, 0], [depth * .97, height * .08, width * .065]);
            box('cartonLabel', m.cream, [front - .11, height * .52, 0], [.065, height * .15, width * .56]);
            box('labelMilkStripe', accent, [front - .148, height * .53, 0], [.02, height * .036, width * .38]);
            box('shopDoor', m.dark, [front - .10, height * .15, 0], [.10, height * .29, width * .19]);
            box('doorGlass', m.ink, [front - .157, height * .17, 0], [.025, height * .16, width * .13]);
            for (const z of [-width * .28, width * .28]) {
                box('cartonWindow', m.dark, [front - .08, height * .32, z], [.10, height * .14, width * .15]);
                box('upperWindow', m.dark, [front - .075, height * .675, z], [.10, height * .12, width * .14]);
            }
            box('milkShopAwning', accent, [front - .38, height * .305, 0], [.86, .14, width * .79]);
            box('awningCenterStripe', m.cream, [front - .38, height * .305 + .081, 0], [.86, .025, width * .12]);
        } else if (choice === 1) {
            type = 'cookieTinHouse';
            // A tall biscuit tin has visibly rounded ends rather than a rectangular facade.
            cylinder('roundedCookieTin', accent, [0, height * .45, 0], [depth * .43, height * .87, width * .43]);
            cylinder('tinBaseRim', m.cream, [0, .16, 0], [depth * .46, .21, width * .46]);
            cylinder('tinLid', m.cream, [0, height * .90, 0], [depth * .47, height * .085, width * .47]);
            box('tinLabelPanel', m.cream, [-depth * .435, height * .48, 0], [.16, height * .41, width * .56]);
            cylinder('cookieEmblem', m.ground, [-depth * .535, height * .565, 0], [width * .13, .045, height * .11], [0, 0, Math.PI / 2]);
            for (const z of [-width * .065, width * .065])
                box('cookieChocolateChip', m.dark, [-depth * .575, height * .57, z], [.025, height * .035, width * .034]);
            box('tinEntrance', m.dark, [-depth * .46, height * .14, 0], [.12, height * .27, width * .20]);
            box('entranceGlass', m.ink, [-depth * .528, height * .165, 0], [.025, height * .14, width * .13]);
            for (const z of [-width * .22, width * .22]) {
                box('tinUpperWindow', m.dark, [-depth * .36, height * .74, z], [.21, height * .12, width * .14]);
                box('tinLowerWindow', m.dark, [-depth * .36, height * .32, z], [.21, height * .12, width * .14]);
            }
            box('cookieShopCanopy', m.edge, [-depth * .52, height * .285, 0], [.82, .12, width * .64]);
            box('leadingFaceWindow', m.dark, [0, height * .49, -width * .427], [depth * .38, height * .28, .11]);
        } else {
            type = 'fridgeHouse';
            const front = -depth * .47;
            box('fridgeCabinet', m.edge, [0, height * .46, 0], [depth * .94, height * .91, width * .90]);
            box('roundedFridgeHeader', accent, [0, height * .938, 0], [depth, height * .11, width * .96]);
            for (const z of [-width * .225, width * .225]) {
                box('fridgeGlassDoor', m.dark, [front - .04, height * .47, z], [.10, height * .75, width * .37]);
                box('mintDoorGlass', m.ink, [front - .097, height * .47, z], [.03, height * .65, width * .30]);
                box('fridgeHandle', m.cream, [front - .175, height * .40, z - Math.sign(z) * width * .10], [.10, height * .18, .09]);
                for (const y of [.30, .54])
                    box('displayShelf', m.cream, [front - .12, height * y, z], [.025, .09, width * .30]);
            }
            box('sideCoolingVent', m.dark, [0, height * .36, -width * .454], [depth * .56, height * .36, .06]);
            box('ventCrossbar', m.edge, [0, height * .36, -width * .49], [depth * .56, .12, .025]);
            box('headerLight', m.light, [front - .055, height * .945, 0], [.05, height * .035, width * .67]);
            box('fridgePorch', m.cream, [front - .24, .10, 0], [.71, .20, width * .75]);
            box('fridgeAwning', accent, [front - .30, height * .265, 0], [.85, .13, width * .88]);
        }
    } else if (choice === 0) {
        type = 'bubbleTeaCupHouse';
        const rx = depth * .43, rz = width * .42, cupHeight = height * .73;
        add('taperedMilkTeaCup', g.taper, m.cream, [0, .19 + cupHeight / 2, 0], [rx, cupHeight, rz]);
        cylinder('teaCupFoot', accent, [0, .16, 0], [rx * .79, .25, rz * .79]);
        cylinder('teaCupLid', accent, [0, cupHeight + .26, 0], [rx * 1.09, .27, rz * 1.09]);
        cylinder('lidRim', m.edge, [0, cupHeight + .425, 0], [rx * 1.055, .08, rz * 1.055]);
        const straw = cylinder('angledDrinkingStraw', m.edge, [depth * .09, height * .875, width * .13],
            [.11, height * .24, .11], [.29, 0, -.16]);
        const strawTip = new THREE.Vector3(0, height * .12, 0).applyQuaternion(straw.quaternion).add(straw.position);
        cylinder('strawOpening', m.dark, strawTip.toArray(), [.073, .025, .073], [.29, 0, -.16]);
        // Pearls sit on the cup's visible lower shell, not hidden inside an opaque cup.
        for (const z of [-width * .19, 0, width * .19]) {
            const x = -rx * (z === 0 ? .79 : .70);
            add('visibleTapiocaPearl', g.sphere, m.dark, [x - .05, cupHeight * .17, z], [.22, .23, .24]);
        }
        box('cupFrontLabel', accent, [-rx * .955, cupHeight * .56, 0], [.13, height * .21, width * .48]);
        box('teaShopDoor', m.dark, [-rx * .875 - .025, height * .25, 0], [.13, height * .23, width * .18]);
        box('doorGlass', m.ink, [-rx * .875 - .099, height * .265, 0], [.025, height * .12, width * .12]);
        for (const z of [-width * .17, width * .17])
            box('cupUpperWindow', m.dark, [-rx * .87, height * .56, z], [.20, height * .10, width * .12]);
        box('cupPorchRoof', m.edge, [-rx - .25, height * .365, 0], [.83, .11, width * .54]);
        box('cupLeadingWindow', m.dark, [0, height * .47, -rz * .945], [depth * .28, height * .16, .17]);
    } else if (choice === 1) {
        type = 'teapotTeaHouse';
        add('roundTeapotBody', g.sphere, m.edge, [0, height * .42, width * .035], [depth * .42, height * .35, width * .30]);
        cylinder('teapotFoot', accent, [0, height * .105, width * .035], [depth * .31, .24, width * .26]);
        cylinder('teapotLid', accent, [0, height * .76, width * .035], [depth * .30, height * .09, width * .24]);
        add('lidKnob', g.sphere, m.cream, [0, height * .84, width * .035], [.24, height * .055, .24]);
        // Handle and spout extend along the street, keeping both silhouettes visible when approaching.
        add('teapotLoopHandle', g.ringWall, accent, [0, height * .47, width * .32],
            [width * .145, height * .215, depth * .33], [0, Math.PI / 2, 0]);
        cylinder('teapotSpout', m.edge, [0, height * .60, -width * .325],
            [width * .075, width * .31, width * .075], [-.91, 0, 0]);
        cylinder('darkSpoutOpening', m.dark, [0, height * .60 + width * .096, -width * .447],
            [width * .047, .032, width * .047], [-.91, 0, 0]);
        box('teapotEntryPorch', m.cream, [-depth * .36, height * .16, width * .035], [depth * .35, height * .32, width * .27]);
        box('teaHouseDoor', m.dark, [-depth * .542, height * .145, width * .035], [.035, height * .275, width * .16]);
        box('teaDoorGlass', m.ink, [-depth * .565, height * .16, width * .035], [.015, height * .14, width * .10]);
        for (const z of [-width * .115, width * .15])
            box('teapotWindow', m.dark, [-depth * .375, height * .47, z], [depth * .095, height * .13, width * .12]);
        box('teapotCanopy', accent, [-depth * .46, height * .32, width * .035], [depth * .50, .12, width * .43]);
        box('teaHouseLabel', m.cream, [-depth * .422, height * .64, width * .035], [.06, height * .09, width * .25]);
    } else {
        type = 'stackedCupLidTower';
        // Alternating cup bodies and broad lids read as a stack of takeaway tea cups.
        for (let floor = 0; floor < 3; floor++) {
            const y = height * (.15 + floor * .27), rx = depth * (.43 - floor * .025), rz = width * (.42 - floor * .025);
            add('stackedCupFloor', g.taper, floor === 1 ? accent : m.cream, [0, y, 0], [rx, height * .255, rz]);
            cylinder('stackedCupLid', m.edge, [0, y + height * .14, 0], [rx * 1.09, height * .055, rz * 1.09]);
            box('towerFrontWindow', m.dark, [-rx * .955, y + height * .015, 0], [.13, height * .12, width * .33]);
            box('towerLeadingWindow', m.dark, [0, y + height * .015, -rz * .945], [depth * .30, height * .10, .14]);
        }
        cylinder('towerRoofStraw', accent, [0, height * .93, width * .10], [.10, height * .13, .10], [.20, 0, .13]);
        box('towerGroundDoor', m.dark, [-depth * .425, height * .10, 0], [.17, height * .19, width * .17]);
        box('towerEntryCanopy', m.edge, [-depth * .46, height * .20, 0], [.80, .12, width * .48]);
        for (const z of [-width * .20, width * .20])
            add('towerBasePearl', g.sphere, m.dark, [-depth * .33, height * .055, z], [.17, .19, .19]);
    }

    group.name = `${type}-${layer}`;
    group.userData = { architecture: true, type, variant, layer, signature: true };
    if (side < 0) group.rotation.y = Math.PI;
    group.updateMatrixWorld(true);
    return group;
}
