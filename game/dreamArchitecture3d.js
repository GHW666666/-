/** Theme-shaped street buildings. Geometry and material ownership stays with the environment. */
import * as THREE from '../libs/three.module.js';

const TYPES = {
    pond: ['lilyPavilion', 'speakerStageHouse', 'lotusExhibitionHall'],
    laundry: ['washerHouse', 'basketHouse', 'skyLaundryLoft'],
};

export function createDreamArchitecture(environment, { side, layer, width, depth, height, variant = 0 }) {
    const group = new THREE.Group(), { themeId, materials: m } = environment;
    // Keep the rear street's outline while budgeting its smaller on-screen curves.
    const shared = environment.geometries;
    const g = layer === 'middle' ? { ...shared, sphere: shared.sphereLow,
        cylinder: shared.cylinderLow, taper: shared.taperLow, ringWall: shared.ringWallLow } : shared;
    const shape = ((Math.floor(variant) % 3) + 3) % 3;
    const type = TYPES[themeId]?.[shape];
    if (!type) throw new Error(`Unsupported dream architecture theme: ${themeId}`);
    group.name = `${type}-${layer}`;
    group.userData = { architecture: true, type, variant: shape, layer, signature: true };
    const part = (name, geometry, material, position, scale, rotation) => {
        const mesh = environment.mesh(group, g[geometry], material, position, scale);
        mesh.name = name;
        if (rotation) mesh.rotation.set(...rotation);
        return mesh;
    };
    const box = (name, material, position, scale) => part(name, 'box', material, position, scale);
    const cylinder = (name, material, position, scale, rotation) => part(name, 'cylinder', material, position, scale, rotation);
    const sphere = (name, material, position, scale) => part(name, 'sphere', material, position, scale);
    // The shared torus starts in XY. Rotate it into XZ for a horizontal basket rim.
    const horizontalRing = (name, material, y, radiusX, radiusZ, halfThickness) =>
        part(name, 'ringWall', material, [0, y, 0], [radiusX, radiusZ, halfThickness / .065], [Math.PI / 2, 0, 0]);

    if (themeId === 'pond' && shape === 0) {
        // An open pavilion supports a broad, overlapping lily-pad roof.
        cylinder('roundBoardwalk', m.road, [0, height * .05, 0], [depth * .46, height * .10, width * .46]);
        for (const x of [-1, 1]) for (const z of [-1, 1])
            cylinder('lilyStemColumn', m.edge, [x * depth * .29, height * .44, z * width * .29], [depth * .032, height * .68, width * .022]);
        sphere('mainLilyRoof', m.edge, [0, height * .87, 0], [depth * .47, height * .13, width * .46]);
        for (const z of [-1, 1])
            sphere('overlappingLilyRoof', z < 0 ? m.edge : m.ink, [depth * .03, height * .85, z * width * .16], [depth * .44, height * .12, width * .27]);
        box('frontStep', m.ink, [-depth * .39, height * .03, 0], [depth * .22, height * .06, width * .43]);
        for (const z of [-1, 1]) {
            box('pavilionRail', m.dark, [0, height * .23, z * width * .32], [depth * .55, height * .035, width * .025]);
            box('leafVein', m.ink, [-depth * .10, height * .975, z * width * .13], [depth * .50, height * .012, width * .018]);
        }
    } else if (themeId === 'pond' && shape === 1) {
        // Tall twin speaker stacks give this music hall its entire silhouette.
        box('stagePlinth', m.road, [0, height * .035, 0], [depth * .96, height * .07, width * .96]);
        box('stageRearWall', m.edge, [depth * .12, height * .34, 0], [depth * .65, height * .54, width * .43]);
        box('stageDeck', m.cream, [-depth * .17, height * .13, 0], [depth * .60, height * .12, width * .55]);
        box('stageCanopy', m.accent, [0, height * .65, 0], [depth * .90, height * .08, width * .45]);
        for (const z of [-1, 1]) {
            const centerZ = z * width * .34;
            box('giantSpeakerTower', m.dark, [-depth * .12, height * .49, centerZ], [depth * .60, height * .84, width * .25]);
            box('speakerTowerCrown', m.accent, [-depth * .12, height * .95, centerZ], [depth * .66, height * .10, width * .28]);
            for (const y of [.27, .65]) {
                cylinder('speakerDriver', m.ink, [-depth * .445, height * y, centerZ], [height * .125, depth * .045, width * .068], [0, 0, Math.PI / 2]);
                part('speakerDriverRim', 'ringWall', m.cream, [-depth * .480, height * y, centerZ], [width * .071, height * .13, depth * .21], [0, Math.PI / 2, 0]);
            }
            box('stageLight', m.light, [-depth * .46, height * .88, centerZ], [depth * .05, height * .025, width * .09]);
        }
    } else if (themeId === 'pond') {
        // Three large upright petals crown an oval lotus hall rather than a box roof.
        cylinder('lotusHallPlinth', m.road, [0, height * .045, 0], [depth * .47, height * .09, width * .46]);
        part('lotusHallShell', 'taper', m.ink, [0, height * .38, 0], [depth * .44, height * .63, width * .41]);
        sphere('centralLotusPetal', m.accent, [0, height * .78, 0], [depth * .43, height * .22, width * .21]);
        for (const z of [-1, 1]) {
            sphere('outerLotusPetal', z < 0 ? m.cream : m.accent, [depth * .025, height * .74, z * width * .23], [depth * .39, height * .18, width * .21]);
            cylinder('lotusStem', m.edge, [depth * .16, height * .49, z * width * .32], [depth * .022, height * .67, width * .022]);
            cylinder('lotusHallPorthole', m.dark, [-depth * .43, height * .48, z * width * .19], [height * .065, depth * .025, width * .07], [0, 0, Math.PI / 2]);
        }
        box('lotusHallEntrance', m.dark, [-depth * .445, height * .20, 0], [depth * .025, height * .24, width * .17]);
    } else if (shape === 0) {
        // The building itself is an oversized front-loading washing machine.
        box('washerPlinth', m.edge, [0, height * .04, 0], [depth * .94, height * .08, width * .94]);
        box('washerShell', m.cream, [0, height * .46, 0], [depth * .85, height * .78, width * .89]);
        box('washerControlStrip', m.edge, [-depth * .455, height * .80, 0], [depth * .08, height * .11, width * .88]);
        box('washerTop', m.ink, [0, height * .875, 0], [depth * .92, height * .055, width * .94]);
        const radius = Math.min(width * .31, height * .28), doorY = height * .43;
        cylinder('washerDarkDrum', m.dark, [-depth * .446, doorY, 0], [radius * .87, depth * .045, radius * .87], [0, 0, Math.PI / 2]);
        part('washerDoorRim', 'ringWall', m.edge, [-depth * .483, doorY, 0], [radius, radius, depth * .23], [0, Math.PI / 2, 0]);
        sphere('washerDoorGlass', m.dark, [-depth * .497, doorY, 0], [depth * .035, radius * .74, radius * .74]);
        box('washerDoorReflection', m.ink, [-depth * .536, doorY + radius * .23, -radius * .25], [depth * .012, radius * .50, radius * .10]);
        for (const z of [-.30, .25])
            cylinder('washerControlDial', z < 0 ? m.dark : m.accent, [-depth * .505, height * .80, width * z], [height * .025, depth * .025, width * .035], [0, 0, Math.PI / 2]);
        part('detergentBottle', 'taper', m.accent, [depth * .10, height * .945, width * .20], [depth * .08, height * .09, width * .07]);
        cylinder('detergentCap', m.dark, [depth * .10, height * .993, width * .20], [depth * .06, height * .014, width * .05]);
        box('detergentLabel', m.cream, [depth * .017, height * .945, width * .20], [depth * .009, height * .035, width * .09]);
    } else if (shape === 1) {
        // A tapered laundry basket is the facade; woven ribs and fabric break its rim.
        part('basketHouseBody', 'taper', m.ink, [0, height * .34, 0], [depth * .44, height * .64, width * .44]);
        for (const y of [.18, .43, .67])
            horizontalRing('basketWeaveBand', m.edge, height * y, depth * (.36 + y * .12), width * (.36 + y * .12), height * .018);
        for (const z of [-.29, -.10, .10, .29])
            box('basketVerticalWeave', m.cream, [-depth * .405, height * .35, width * z], [depth * .035, height * .54, width * .025]);
        for (const z of [-1, 1])
            sphere('basketClothPile', z < 0 ? m.accent : m.cloud, [depth * .03, height * .82, z * width * .14], [depth * .34, height * .18, width * .23]);
        box('drapedLaundry', m.accent, [-depth * .42, height * .61, width * .19], [depth * .035, height * .26, width * .16]);
        box('basketHouseDoor', m.dark, [-depth * .38, height * .17, 0], [depth * .04, height * .25, width * .16]);
        box('basketDoorLintel', m.edge, [-depth * .408, height * .31, 0], [depth * .045, height * .04, width * .20]);
    } else {
        // An elevated open drying loft carries huge hanging shirts as its street front.
        box('laundryLoftDeck', m.road, [0, height * .14, 0], [depth * .94, height * .10, width * .94]);
        for (const x of [-1, 1]) for (const z of [-1, 1])
            box('dryingFramePost', m.edge, [x * depth * .38, height * .50, z * width * .40], [depth * .06, height, width * .045]);
        for (const z of [-1, 1])
            box('dryingRoofBeam', m.edge, [0, height * .965, z * width * .40], [depth * .84, height * .07, width * .065]);
        for (const x of [-1, 1])
            cylinder('longClothesline', m.dark, [x * depth * .28, height * .86, 0], [depth * .016, width * .75, depth * .016], [Math.PI / 2, 0, 0]);
        for (const z of [-1, 1]) {
            const centerZ = z * width * .21, cloth = z < 0 ? m.accent : m.cloud;
            box('giantHangingShirtBody', cloth, [-depth * .28, height * .61, centerZ], [depth * .045, height * .36, width * .20]);
            box('giantHangingShirtSleeves', cloth, [-depth * .28, height * .745, centerZ], [depth * .045, height * .09, width * .35]);
            for (const end of [-1, 1])
                box('oversizedClothespin', m.cream, [-depth * .29, height * .845, centerZ + end * width * .075], [depth * .07, height * .075, width * .025]);
        }
        sphere('loftCloudFoundation', m.cloud, [depth * .03, height * .055, 0], [depth * .49, height * .055, width * .46]);
    }

    // All authored Z extents fit inside the requested street slot. Mirror only rigidly.
    if (side < 0) group.rotation.y = Math.PI;
    group.updateMatrixWorld(true);
    return group;
}
