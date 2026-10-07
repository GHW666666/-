import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { NailongCharacter } from '../game/character3d.js';
import { OUTFIT_SKINS, OutfitSystem3D } from '../game/outfits3d.js';
import { WING_SKINS } from '../game/wings3d.js';

function fixture() {
    const bodyGroup = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial();
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), bodyMaterial);
    bodyGroup.add(bodyMesh);
    const character = { bodyGroup, bodyMesh, surface: { front: (x, y) => .42 - Math.abs(x) * .25 + (1.3 - y) * .15 } };
    return { character, system: new OutfitSystem3D(character) };
}

function resources(system) {
    return {
        geometry: Object.values(system.geometries).map(resource => resource.uuid),
        material: Object.values(system.materials).map(resource => resource.uuid),
        children: system.group.children.map(group => group.children.map(mesh => mesh.uuid)),
    };
}

test('the garment catalog supplies the requested nurse and thief sets plus a street outfit', () => {
    assert.deepEqual(Object.keys(OUTFIT_SKINS), ['none', 'nurse', 'bandit', 'street', 'ufo', 'tv', 'jellyfish', 'mushroom', 'zipper', 'dumpling']);
    for (const [id, skin] of Object.entries(OUTFIT_SKINS)) {
        assert.equal(skin.id, id);
        assert.ok(skin.name && skin.description && skin.icon);
        assert.ok(/^#[0-9a-f]{6}$/i.test(skin.color));
        assert.ok(Number.isSafeInteger(skin.price) && skin.price >= 0, `${id} has an invalid coin price`);
        if (id !== 'none') assert.ok(skin.price > 0, `${id} must be unlocked with coins`);
        assert.equal(skin.category, ['none', 'nurse', 'bandit', 'street'].includes(id) ? 'daily' : 'weird');
        for (const role of ['primary', 'secondary', 'accent']) assert.ok(Number.isInteger(skin.colors[role]));
    }
    assert.equal(OUTFIT_SKINS.none.price, 0);
    assert.ok(Number.isSafeInteger(WING_SKINS.cream.price) && WING_SKINS.cream.price > 0);
    assert.ok(Math.max(...Object.values(OUTFIT_SKINS).map(skin => skin.price)) < WING_SKINS.cream.price,
        'the cloud wings should cost more than any garment');
    assert.ok(WING_SKINS.cream.description);
});

test('accessories stay finite, low cost, and follow the same body group through a flight pose', () => {
    const { character, system } = fixture();
    assert.equal(system.group.parent, character.bodyGroup);
    for (const id of Object.keys(OUTFIT_SKINS).filter(id => id !== 'none')) {
        system.equip(id);
        const group = system.accessories[id];
        let triangles = 0;
        assert.ok(group.children.length <= 10, `${id} has too many accessory draw calls`);
        for (const mesh of group.children) {
            assert.ok(mesh.position.toArray().every(Number.isFinite));
            assert.ok(mesh.scale.toArray().every(value => Number.isFinite(value) && value > 0));
            assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
            assert.ok([...mesh.geometry.attributes.normal.array].every(Number.isFinite));
            if (mesh.isInstancedMesh) assert.ok([...mesh.instanceMatrix.array].every(Number.isFinite));
            triangles += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3 * (mesh.isInstancedMesh ? mesh.count : 1);
            assert.equal(mesh.castShadow, false);
        }
        assert.ok(triangles < 2500, `${id} accessory triangles: ${triangles}`);
        for (const angle of [0, Math.PI / 2, Math.PI]) {
            character.bodyGroup.rotation.x = angle;
            character.bodyGroup.updateMatrixWorld(true);
            const bounds = new THREE.Box3().setFromObject(group);
            assert.ok([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite));
        }
    }
    character.bodyGroup.rotation.x = 0;
    character.bodyGroup.updateMatrixWorld(true);
    const sack = system.accessories.bandit.children.find(mesh => mesh.name === 'banditLootSack');
    assert.ok(new THREE.Box3().setFromObject(sack).max.y < 1.3, 'loot sack interferes with the wing roots');
    const headgear = ['nurseSoftHat', 'banditBeanie', 'streetBaseballCap', 'streetCapBrim', 'ufoSaucerHat', 'jellyfishTranslucentBell', 'mushroomCoralCap', 'zipperPlushBeanie', 'dumplingPleatedHat'];
    for (const group of Object.values(system.accessories)) for (const mesh of group.children) {
        if (headgear.includes(mesh.name)) assert.ok(new THREE.Box3().setFromObject(mesh).min.y > 2.135,
            `${mesh.name} covers the original green eye rings`);
    }
    system.dispose();
});

test('equipping repeatedly preserves geometry, materials and one reusable numeric uniform', () => {
    const { character, system } = fixture();
    const baseline = resources(system), uniform = system.uniform;
    const paletteValues = Object.values(system.uniforms).map(value => value.value);
    const materialVersion = character.bodyMesh.material.version;
    for (let cycle = 0; cycle < 50; cycle++) for (const [id, value] of Object.entries({ none: 0, nurse: 1, bandit: 2, street: 3, ufo: 4, tv: 5, jellyfish: 6, mushroom: 7, zipper: 8, dumpling: 9 })) {
        assert.equal(system.equip(id), id);
        assert.equal(system.uniform, uniform);
        assert.equal(uniform.value, value);
        assert.equal(system.group.visible, id !== 'none');
        for (const [key, group] of Object.entries(system.accessories)) assert.equal(group.visible, key === id);
        assert.deepEqual(resources(system), baseline);
        Object.values(system.uniforms).slice(1).forEach((uniformValue, i) => assert.equal(uniformValue.value, paletteValues[i + 1]));
        assert.equal(character.bodyMesh.material.version, materialVersion, 'switching a skin recompiles the body material');
    }
    assert.equal(system.equip('invalid'), 'none');
    assert.equal(system.uniform.value, 0);
    system.dispose();
});

test('the actual frog shader applies clothing before eyes and uses original skinned arm weights', () => {
    const character = new NailongCharacter();
    const system = character.outfits ?? new OutfitSystem3D(character);
    const shader = {
        uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib.standard.uniforms),
        vertexShader: THREE.ShaderLib.standard.vertexShader,
        fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    };
    character.bodyMesh.material.onBeforeCompile(shader);
    system.patchShader(shader);
    assert.equal(shader.uniforms.frogOutfitId, system.uniform);
    assert.ok(shader.vertexShader.includes('vOutfitArmWeight = skinWeight.y;'));
    assert.ok(shader.vertexShader.includes('vFrogRestPosition = position;'));
    assert.ok(shader.fragmentShader.includes('diffuseColor.rgb = mix(diffuseColor.rgb, frogEyeGreen, eye);'));
    assert.ok(shader.fragmentShader.includes('diffuseColor.rgb = mix(diffuseColor.rgb, frogPupil, pupil);'));
    assert.ok(shader.fragmentShader.indexOf('float outfitHeight') < shader.fragmentShader.indexOf('vec2 eyeCoord'));
    assert.ok(shader.fragmentShader.indexOf('float mask =') < shader.fragmentShader.indexOf('vec2 eyeCoord'));
    system.equip('bandit');
    assert.equal(shader.uniforms.frogOutfitId.value, 2, 'compiled shader cannot see a newly equipped outfit');
    const firstVertex = shader.vertexShader, firstFragment = shader.fragmentShader;
    system.patchShader(shader);
    assert.equal(shader.vertexShader, firstVertex);
    assert.equal(shader.fragmentShader, firstFragment);
    assert.ok(shader.fragmentShader.includes('(1.0 - smoothstep(1.565, 1.605, vFrogRestPosition.y))'),
        'the garment paints over the head or neck');
    assert.ok(shader.fragmentShader.includes('frogOutfitId > 2.5 && frogOutfitId < 3.5'), 'the street branch swallows the weird outfits');
    for (const id of ['ufo', 'tv', 'jellyfish', 'mushroom', 'zipper', 'dumpling']) {
        system.equip(id);
        assert.ok(shader.uniforms.frogOutfitId.value >= 4);
    }
    system.dispose();
});

test('weird outfits have distinct authored silhouettes and clear face, arms and wing roots', () => {
    const { character, system } = fixture();
    const signatures = {
        ufo: 'ufoSaucerHat', tv: 'televisionOpenFrame', jellyfish: 'jellyfishTranslucentBell',
        mushroom: 'mushroomCoralCap', zipper: 'zipperGoldPull', dumpling: 'dumplingPleatedHat',
    };
    const silhouetteGeometry = new Set();
    for (const [id, name] of Object.entries(signatures)) {
        const group = system.accessories[id], signature = group.children.find(mesh => mesh.name === name);
        assert.ok(signature, `${id} is missing its defining accessory`);
        silhouetteGeometry.add(signature.geometry.uuid);
        group.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(group);
        assert.ok(bounds.max.y < 2.75, `${id} does not fit the wardrobe preview`);
    }
    assert.equal(silhouetteGeometry.size, 6, 'the weird sets reuse one silhouette with only a palette change');
    const frame = system.accessories.tv.children.find(mesh => mesh.name === 'televisionOpenFrame');
    // Looking directly along -Z, the central opening must not occlude either
    // original eye or the smile. Ray testing includes the actual beveled frame.
    frame.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    for (const [x, y] of [[-.147, 2.07], [.147, 2.07], [0, 1.955]]) {
        raycaster.set(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1));
        assert.equal(raycaster.intersectObject(frame).length, 0, 'the television frame covers the original face');
    }
    for (const tendril of system.accessories.jellyfish.children.filter(mesh => mesh.name === 'jellyfishSideTendril')) {
        const bounds = new THREE.Box3().setFromObject(tendril);
        assert.ok(bounds.min.y > 1.70, 'a tendril clips moving arms or wing roots');
        assert.ok(bounds.min.x > .32 || bounds.max.x < -.32, 'a tendril covers the face');
    }
    const mushroom = system.accessories.mushroom;
    const cap = mushroom.children.find(mesh => mesh.name === 'mushroomCoralCap');
    const spots = mushroom.children.find(mesh => mesh.name === 'mushroomMilkSpots');
    let visibleMilkSpots = 0;
    for (let i = 0; i < spots.count; i++) {
        const matrix = new THREE.Matrix4(); spots.getMatrixAt(i, matrix);
        const center = new THREE.Vector3().setFromMatrixPosition(matrix);
        raycaster.set(new THREE.Vector3(center.x, center.y, 2), new THREE.Vector3(0, 0, -1));
        const first = raycaster.intersectObjects([cap, spots])[0];
        if (first?.object === spots && first.instanceId === i) visibleMilkSpots++;
    }
    assert.ok(visibleMilkSpots >= 3, `the mushroom cap reads as a solid-colored beanie: ${visibleMilkSpots} visible milk spots`);
    const zipper = system.accessories.zipper.children.find(mesh => mesh.name === 'zipperGoldPull');
    const zipperBounds = new THREE.Box3().setFromObject(zipper);
    assert.ok(zipperBounds.max.y < 1.15, 'zipper pull reaches the hands');
    assert.equal(system.accessories.jellyfish.children.find(mesh => mesh.name === 'jellyfishTranslucentBell').material.transparent, true);
    assert.equal(system.accessories.dumpling.children.find(mesh => mesh.name === 'dumplingSteamWisps').count, 3);
    assert.equal(character.bodyMesh.parent, character.bodyGroup);
    system.dispose();
});

test('disposal removes only owned resources and remains safe when repeated', () => {
    const { character, system } = fixture();
    const disposed = new Map();
    const ownResources = [...Object.values(system.geometries), ...Object.values(system.materials)];
    for (const resource of ownResources) resource.addEventListener('dispose', () => disposed.set(resource.uuid, (disposed.get(resource.uuid) || 0) + 1));
    let bodyDisposed = false;
    character.bodyMesh.material.addEventListener('dispose', () => { bodyDisposed = true; });
    system.dispose();
    system.dispose();
    assert.equal(system.group.parent, null);
    assert.ok(ownResources.every(resource => disposed.get(resource.uuid) === 1));
    assert.equal(bodyDisposed, false);
    assert.equal(character.bodyMesh.parent, character.bodyGroup);
});
