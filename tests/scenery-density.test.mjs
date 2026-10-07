import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { MAP_CONFIGS } from '../game/maps.js';
import { ThemeEnvironment3D, WORLD_STYLES } from '../game/themeEnvironment3d.js';

const THEMES = ['store', 'tea', 'pond', 'laundry'];
const EPSILON = 1e-5;
const make = (id, seed = 0x83bc97) => new ThemeEnvironment3D(new THREE.Scene(), { theme: MAP_CONFIGS[id], seed });
const round = value => Number(value.toFixed(6));

function route(environment) {
    return environment.chunks.map(chunk => ({
        index: chunk.userData.index,
        architecture: chunk.userData.architecture.map(({ type, side, layer, variant, bounds }) => ({
            type, side, layer, variant,
            min: bounds.min.toArray().map(round), max: bounds.max.toArray().map(round),
        })),
    }));
}

function resourceIds(environment) {
    const geometries = new Set(), materials = new Set();
    const visit = node => {
        if (!node.isMesh) return;
        geometries.add(node.geometry.uuid);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material.uuid);
    };
    environment.scene.traverse(visit);
    environment.chunks.forEach(chunk => chunk.traverse(visit));
    for (const library of [environment.geometries, environment.kit.geometries, environment.kit.unit]) {
        for (const geometry of Object.values(library || {})) geometries.add(geometry.uuid);
    }
    for (const library of [environment.materials, environment.kit.materials]) {
        for (const material of Object.values(library || {})) materials.add(material.uuid);
    }
    return { geometries: [...geometries].sort(), materials: [...materials].sort() };
}

function instanceLayout(buckets) {
    return [...buckets].map(([key, bucket]) => [key, bucket.matrices.map(matrix => matrix.elements)]).sort(([a], [b]) => a.localeCompare(b));
}

function assertRenderedInstances(environment, expected) {
    const rendered = [...environment.instancePool].filter(([, entry]) => entry.mesh.visible);
    assert.deepEqual(rendered.map(([key]) => key).sort(), [...expected.keys()].sort(), 'rendered batches do not match current scenery visibility');
    for (const [key, bucket] of expected) {
        const mesh = environment.instancePool.get(key).mesh;
        assert.equal(mesh.count, bucket.matrices.length, 'rendered scenery count remains at the previous visibility range');
        for (let i = 0; i < bucket.matrices.length; i++) for (let component = 0; component < 16; component++) {
            const actual = mesh.instanceMatrix.array[i * 16 + component], wanted = bucket.matrices[i].elements[component];
            assert.ok(Math.abs(actual - wanted) <= 1e-4, 'an instance still renders the wrong building after a visibility crossing');
        }
    }
}

function assertDensity(environment) {
    for (const chunk of environment.chunks) {
        chunk.updateWorldMatrix(true, true);
        const buildings = chunk.userData.architecture;
        const landmarks = chunk.userData.decorations.filter(item => item.side);
        assert.ok(landmarks.length >= 4, `${environment.themeId}: a 48 m chunk lost its theme landmarks`);
        assert.ok(landmarks.every(item => WORLD_STYLES[environment.themeId].props.includes(item.type)), 'landmarks no longer match the map');
        for (const side of [-1, 1]) {
            const sideBuildings = buildings.filter(item => item.side === side);
            assert.ok(sideBuildings.length >= 10, `${environment.themeId}: side ${side} has only ${sideBuildings.length} buildings per 48 m`);
            assert.ok(sideBuildings.some(item => item.layer === 'near') && sideBuildings.some(item => item.layer === 'middle'), 'building depth is missing');
            const signatureBuildings = sideBuildings.filter(item => item.signature);
            assert.ok(signatureBuildings.length >= 6, `${environment.themeId}: side ${side} still lacks large theme-shaped buildings`);
            assert.ok(new Set(signatureBuildings.map(item => item.type)).size >= 2, 'theme architecture repeats a single silhouette');
            assert.ok(signatureBuildings.some(item => item.layer === 'near') && signatureBuildings.some(item => item.layer === 'middle'), 'theme-shaped buildings only appear in one scenery layer');
            const near = [...sideBuildings.filter(item => item.layer === 'near'), ...landmarks.filter(item => item.side === side)]
                .map(item => item.bounds.getCenter(new THREE.Vector3()).z - chunk.userData.startZ).sort((a, b) => a - b);
            assert.ok(near.length >= 8, 'near scenery still has too few silhouettes');
            const gaps = near.map((z, i) => (i ? z - near[i - 1] : z + 48 - near.at(-1)));
            assert.ok(Math.max(...gaps) <= 6.5, `${environment.themeId}: near scenery has a ${Math.max(...gaps).toFixed(2)} m empty interval`);
        }
        const groups = chunk.children.filter(child => child.isGroup);
        const actual = groups.map(child => ({ group: child, bounds: new THREE.Box3().setFromObject(child) }));
        for (const item of [...buildings, ...landmarks]) {
            const bounds = item.bounds;
            assert.ok(!bounds.isEmpty() && [...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite), 'invalid authored bounds');
            assert.ok(actual.some(({ bounds: box }) => box.min.distanceTo(bounds.min) < EPSILON && box.max.distanceTo(bounds.max) < EPSILON), 'metadata does not describe a real scene object');
            const inner = item.side < 0 ? -bounds.max.x : bounds.min.x;
            assert.ok(inner >= 6.9 - EPSILON, `${item.type} enters the side safety strip at ${inner}`);
            assert.ok(bounds.min.z >= chunk.userData.startZ - EPSILON && bounds.max.z <= chunk.userData.endZ + EPSILON, `${item.type} overlaps an adjacent chunk`);
        }
        for (const item of buildings) {
            const size = item.bounds.getSize(new THREE.Vector3());
            assert.ok(size.y >= 2.5 && size.x >= 2 && size.z >= 2, `${item.type} is too small to read as architecture`);
            assert.ok(size.z <= 12, `${item.type} exceeds its allocated street slot`);
            if (item.signature) {
                assert.ok(size.y >= 4 && size.z >= 3 && size.x * size.y * size.z >= 24,
                    `${item.type} is only a small sign instead of a theme-shaped building`);
                const source = actual.find(({ bounds: box }) => box.min.distanceTo(item.bounds.min) < EPSILON && box.max.distanceTo(item.bounds.max) < EPSILON)?.group;
                assert.ok(source.userData.architecture && source.userData.signature && source.userData.type === item.type, 'signature metadata does not belong to the real building');
                const parts = [];
                source.traverse(node => {
                    if (node.isMesh && node.visible) parts.push(new THREE.Box3().setFromObject(node).getSize(new THREE.Vector3()));
                });
                assert.ok(parts.some(part => part.y >= size.y * .5 || (part.x >= size.x * .6 && part.z >= size.z * .6)),
                    `${item.type} lacks a substantial architectural body, frame or roof`);
            }
        }
        assert.ok(actual.some(({ group }) => {
            if (!group.userData.signature) return false;
            let largeShapedPart = false;
            group.traverse(node => {
                if (!node.isMesh || !node.visible || node.geometry.type === 'BoxGeometry') return;
                const size = new THREE.Box3().setFromObject(node).getSize(new THREE.Vector3());
                if ([size.x, size.y, size.z].filter(value => value >= 2).length >= 2) largeShapedPart = true;
            });
            return largeShapedPart;
        }), `${environment.themeId}: theme buildings have reverted to generic boxes with small roof icons`);
        const silhouettes = [...buildings, ...landmarks];
        for (let i = 0; i < silhouettes.length; i++) for (let j = i + 1; j < silhouettes.length; j++) {
            assert.ok(!silhouettes[i].bounds.intersectsBox(silhouettes[j].bounds),
                `${silhouettes[i].type} and ${silhouettes[j].type} occupy the same street space`);
        }
        for (const gate of chunk.userData.decorations.filter(item => item.type === 'gate')) {
            for (const item of silhouettes) assert.ok(!gate.bounds.intersectsBox(item.bounds),
                `${item.type} blocks the themed gate beside the track`);
        }
    }
}

for (const id of THEMES) {
    test(`${id}: dense street architecture fills both sides without entering the track`, () => {
        for (const seed of [0x83bc97, 0x4f6102, 0xabcddc]) {
            const environment = make(id, seed);
            try {
                for (const z of [0, 96, 500, 1536, 100000]) {
                    environment.update(z);
                    assertDensity(environment);
                }
            } finally { environment.dispose(); }
        }
    });

    test(`${id}: architecture is seeded and recycling shares finite render resources`, () => {
        const environment = make(id), matching = make(id), other = make(id, 0x83bc98);
        try {
            assert.deepEqual(route(environment), route(matching));
            assert.notDeepEqual(route(environment), route(other));
            const resources = resourceIds(environment);
            const positions = [0, 96, 500, 4000, 100000];
            for (const z of positions) { environment.update(z); matching.update(z); }
            assert.deepEqual(route(environment), route(matching), 'fixed-seed buildings diverged after recycling');
            const warmed = [...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort();
            const renderNodes = environment.renderGroup.children.length;
            for (let repeat = 0; repeat < 2; repeat++) {
                environment.reset();
                for (const z of positions) {
                    environment.update(z);
                    assert.deepEqual(resourceIds(environment), resources, 'new chunks allocated private geometry or materials');
                    assert.ok(environment.chunks.length <= 9, 'more than the visible chunk window remains alive');
                    assert.ok(environment.instancePool.size <= 128, 'building batches exceeded the shared resource budget');
                    for (const entry of environment.instancePool.values()) assert.ok(entry.mesh.count <= entry.capacity);
                }
                assert.deepEqual([...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort(), warmed, 'replaying a route keeps growing instance buffers');
                assert.equal(environment.renderGroup.children.length, renderNodes, 'recycling accumulates render nodes');
            }
        } finally { environment.dispose(); matching.dispose(); other.dispose(); }
        assert.equal(environment.scene.children.length, 0, 'disposal leaves dense scenery in the scene');
    });

    test(`${id}: crossing scenery visibility updates real matrices before the next chunk`, () => {
        const environment = make(id);
        let rebuilds = 0;
        const rebuild = environment.rebuildInstances.bind(environment);
        environment.rebuildInstances = () => { rebuilds++; rebuild(); };
        try {
            environment.update(0);
            assert.equal(rebuilds, 1, 'spawning a chunk caused duplicate instance rebuilding');
            const chunks = [...environment.chunks], resources = resourceIds(environment);
            let previousLayout = instanceLayout(environment.collectInstances(chunks)), crossings = 0;
            for (let z = .5; z <= 6; z += .5) {
                const before = rebuilds;
                environment.update(z);
                assert.ok(environment.chunks.length === chunks.length && chunks.every((chunk, i) => chunk === environment.chunks[i]), 'test movement recycled a chunk');
                const expected = environment.collectInstances(chunks), layout = instanceLayout(expected);
                const changed = JSON.stringify(layout) !== JSON.stringify(previousLayout);
                assert.equal(rebuilds - before, Number(changed), 'instance matrices should refresh only when a scenery source enters or leaves visibility');
                assertRenderedInstances(environment, expected);
                assert.deepEqual(resourceIds(environment), resources, 'visibility refreshing allocated private geometry or materials');
                if (changed) crossings++;
                previousLayout = layout;
                environment.update(z);
                assert.equal(rebuilds - before, Number(changed), 'a stationary player rebuilds unchanged scenery');
            }
            assert.ok(crossings > 0, 'test route never crossed a scenery visibility boundary');
            const before = rebuilds;
            environment.update(18);
            assert.ok(environment.chunks.length !== chunks.length || chunks.some((chunk, i) => chunk !== environment.chunks[i]), 'test route failed to spawn the next chunk');
            assert.equal(rebuilds - before, 1, 'chunk rebuilding was followed by a redundant visibility rebuild');
            assertRenderedInstances(environment, environment.collectInstances(environment.chunks));
        } finally { environment.dispose(); }
    });
}
