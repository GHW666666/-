/** Low-poly street fronts. All pieces use the environment's shared unit meshes. */
import * as THREE from '../libs/three.module.js';

const TYPES = { store: 'storeShop', tea: 'teaHouse', pond: 'festivalPavilion', laundry: 'laundryLoft' };

export function createThemeArchitecture(environment, { side, layer, width, depth, height, variant }) {
    const group = new THREE.Group(), { themeId, geometries: g, materials: m } = environment;
    group.name = `${TYPES[themeId]}-${layer}`;
    group.userData = { architecture: true, type: TYPES[themeId], variant, layer };
    const front = -depth / 2, accent = variant % 2 ? m.accent : m.edge;
    const part = (name, material, position, scale, rotation) => {
        const mesh = environment.mesh(group, g.box, material, position, scale);
        mesh.name = name;
        if (rotation) mesh.rotation.set(...rotation);
        return mesh;
    };
    const body = themeId === 'pond' ? m.edge : variant % 3 === 0 ? m.ink : m.cream;
    part('plinth', m.dark, [0, .12, 0], [depth + .12, .24, width]);
    part('buildingBody', body, [.15, height / 2, 0], [depth - .3, height, width - .35]);
    // Opaque inset glazing avoids transparent layers and overdraw.
    const floorCount = layer === 'middle' ? 3 : 2;
    const floorHeight = (height - 1.2) / floorCount;
    for (let floor = 0; floor < floorCount; floor++) {
        const y = .85 + floorHeight * (floor + .5);
        part('glazedFront', m.dark, [front - .025, y, 0], [.07, floorHeight * .64, width - 1.1]);
        for (const z of [-width * .26, 0, width * .26])
            part('windowMullion', m.ink, [front - .08, y, z], [.10, floorHeight * .65, .07]);
        part('floorTrim', accent, [front - .085, y - floorHeight * .36, 0], [.12, .10, width - .35]);
    }
    // The camera also sees each shop's leading face while approaching it.
    part('streetEndWindow', m.dark, [0, height * .56, -width / 2 + .145], [depth * .65, height * .50, .07]);
    part('doorFrame', m.ink, [front - .10, 1.2, -width * .25], [.13, 2.3, .95]);
    part('door', m.dark, [front - .18, 1.15, -width * .25], [.045, 2.05, .74]);
    part('signBoard', accent, [front - .17, height - .5, 0], [.28, .72, width - .5]);
    // Printed-style abstract glyphs remain legible at game distance.
    for (let i = 0; i < 3; i++)
        part('signGlyph', m.cream, [front - .322, height - .5, (i - 1) * width * .18], [.025, .26, width * .115]);

    if (themeId === 'store') {
        part('flatRoof', m.edge, [0, height + .13, 0], [depth + .25, .28, width + .15]);
        part('stripedAwning', accent, [front - .43, 2.8, 0], [1.15, .16, width + .25]);
        for (let i = -2; i <= 2; i++)
            part('awningStripe', m.cream, [front - .43, 2.897, i * width / 5], [1.14, .022, width / 11]);
        part('pricePylon', m.dark, [depth * .25, height + 1.0, -width * .22], [.10, 1.6, .10]);
        part('priceLabel', accent, [depth * .25, height + 1.45, -width * .22], [.30, .65, width * .45]);
        part('priceLabelInk', m.cream, [depth * .25 - .173, height + 1.45, -width * .22], [.035, .20, width * .28]);
    } else if (themeId === 'tea') {
        part('teaCanopy', accent, [front - .4, 2.85, 0], [1.12, .14, width + .3]);
        for (const end of [-1, 1]) {
            part('roofSlope', m.edge, [0, height + .30, end * width * .245], [depth + .45, .15, width * .55], [end * -.12, 0, 0]);
            part('verandaPost', m.ink, [front - .77, 1.43, end * (width / 2 - .30)], [.11, 2.86, .11]);
        }
        part('cupSign', m.cream, [depth * .15, height + 1.0, 0], [1.0, 1.35, 1.0]);
        part('cupBand', accent, [depth * .15, height + .96, 0], [1.03, .4, 1.03]);
        part('cupStraw', m.dark, [depth * .15, height + 2.05, .12], [.12, 1.15, .12], [.16, 0, 0]);
    } else if (themeId === 'pond') {
        for (const end of [-1, 1]) {
            part('festivalRoof', accent, [0, height + .24, end * width * .245], [depth + .6, .14, width * .57], [end * -.23, 0, 0]);
            part('timberPost', m.dark, [front - .34, height / 2, end * (width / 2 - .30)], [.18, height, .18]);
        }
        part('stageBanner', m.cream, [front - .36, height - .48, 0], [.06, 1.0, width * .44]);
        part('bannerStripe', accent, [front - .40, height - .48, 0], [.025, .13, width * .31]);
        for (const z of [-width * .32, width * .32]) {
            part('speakerCase', m.dark, [front - .44, .95, z], [.56, 1.35, .65]);
            part('speakerCone', m.ink, [front - .735, 1.0, z], [.025, .42, .42]);
        }
    } else {
        part('loftRoof', m.edge, [0, height + .17, 0], [depth + .3, .35, width + .28]);
        for (const z of [-width * .27, width * .27]) {
            part('balconySlab', m.ink, [front - .3, height * .55, z], [.75, .12, width * .32]);
            part('balconyRail', m.dark, [front - .65, height * .55 + .48, z], [.08, .10, width * .32]);
            part('dryingCloth', accent, [front - .68, height * .55 + .25, z], [.03, .7, width * .18]);
        }
        part('dryerSign', m.cream, [depth * .15, height + 1.02, 0], [.90, 1.45, 1.3]);
        part('dryerDoor', m.dark, [depth * .15 - .485, height + 1.02, 0], [.06, .83, .83]);
        part('dryerDoorInset', accent, [depth * .15 - .53, height + 1.02, 0], [.025, .49, .49]);
    }
    // Local -X is the street front; mirror the other bank with a rigid rotation.
    if (side < 0) group.rotation.y = Math.PI;
    group.updateMatrixWorld(true);
    return group;
}
