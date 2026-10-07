import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { MAP_CONFIGS } from '../game/maps.js';
import { ThemeEnvironment3D, WORLD_STYLES } from '../game/themeEnvironment3d.js';
import { ThemeObstacleKit, MapFeature3D } from '../game/themeObstacles3d.js';
import { Ramp3D, Train3D, HighBarrier3D, LowBarrier3D } from '../game/obstacles3d.js';
import { WorldEntityBatch3D } from '../game/worldEntityBatch3d.js';

const THEMES = ['store', 'tea', 'pond', 'laundry'];
const SEED = 0x435d79ba;
const EPSILON = 1e-5;
const makeEnvironment = (id, seed = SEED) => new ThemeEnvironment3D(new THREE.Scene(), { theme: MAP_CONFIGS[id], seed });
const rounded = value => Number(value.toFixed(7));

function layout(environment) {
    return environment.chunks.map(chunk => ({
        index: chunk.userData.index,
        start: chunk.userData.startZ,
        end: chunk.userData.endZ,
        decorations: chunk.userData.decorations.map(({ type, side, bounds }) => ({
            type, side, min: bounds.min.toArray().map(rounded), max: bounds.max.toArray().map(rounded),
        })),
        variants: chunk.children.filter(child => child.isGroup).map(group => group.userData.variant),
    }));
}

function resources(environment) {
    const geometries = new Set(), materials = new Set();
    for (const library of [environment.geometries, environment.kit.geometries, environment.kit.unit]) {
        for (const geometry of Object.values(library || {})) geometries.add(geometry.uuid);
    }
    for (const library of [environment.materials, environment.kit.materials]) {
        for (const material of Object.values(library || {})) materials.add(material.uuid);
    }
    const visit = node => {
        if (!node.isMesh) return;
        geometries.add(node.geometry.uuid);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material.uuid);
    };
    environment.scene.traverse(visit);
    for (const chunk of environment.chunks) chunk.traverse(visit);
    return { geometries: [...geometries].sort(), materials: [...materials].sort() };
}

function assertCoverage(environment, playerZ) {
    const chunks = environment.chunks;
    assert.ok(chunks.length > 0 && chunks.length <= 9, `${environment.themeId}: ${chunks.length} active chunks at Z=${playerZ}`);
    assert.ok(chunks[0].userData.startZ <= playerZ - 35 + EPSILON, 'rear ground is missing');
    assert.ok(chunks[0].userData.endZ >= playerZ - 35 - EPSILON, 'stale chunks remain behind the visible window');
    assert.ok(chunks.at(-1).userData.endZ >= playerZ + 320 - EPSILON, 'forward ground is missing');
    for (let i = 0; i < chunks.length; i++) {
        assert.equal(chunks[i].userData.endZ - chunks[i].userData.startZ, CONFIG.WORLD.CHUNK_LENGTH);
        if (i) assert.equal(chunks[i - 1].userData.endZ, chunks[i].userData.startZ, 'road has a gap or overlap');
    }
}

function assertGateClear(gate, id) {
    gate.updateWorldMatrix(true, true);
    let overhead = 0, pillars = 0;
    const vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    gate.traverse(mesh => {
        if (!mesh.isMesh) return;
        const geometry = mesh.geometry, positions = geometry.attributes.position;
        const count = geometry.index?.count ?? positions.count;
        for (let i = 0; i < count; i += 3) {
            for (let corner = 0; corner < 3; corner++) {
                const index = geometry.index ? geometry.index.getX(i + corner) : i + corner;
                vertices[corner].fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld);
            }
            // Check triangle bounds: a merged gate mesh's box also encloses its empty opening.
            const bounds = new THREE.Box3().setFromPoints(vertices);
            const crossesCorridor = bounds.min.x < 6.3 - EPSILON && bounds.max.x > -6.3 + EPSILON;
            if (crossesCorridor) {
                overhead++;
                assert.ok(bounds.min.y >= 8 - EPSILON, `${id} gate enters the running corridor at y=${bounds.min.y}`);
            } else if (bounds.min.y < 8) pillars++;
        }
    });
    assert.ok(overhead > 0 && pillars > 0, `${id}: lintel and pillar triangles were not both checked`);
}

for (const id of THEMES) {
    test(`${id}: no-DOM construction and deterministic, varied scenery`, () => {
        assert.equal(typeof document, 'undefined');
        const a = makeEnvironment(id), b = makeEnvironment(id), other = makeEnvironment(id, SEED + 1);
        try {
            assert.equal(a.materials.road.map, null);
            assert.equal(a.materials.ground.map, null);
            assert.deepEqual(layout(a), layout(b));
            assert.notDeepEqual(layout(a), layout(other), 'a different seed produced the same route');
            const types = new Set(), variants = new Set();
            for (const z of [0, 144, 500, 1000]) {
                a.update(z); b.update(z);
                assert.deepEqual(layout(a), layout(b), `matching seeds diverged at Z=${z}`);
                for (const chunk of a.chunks) {
                    for (const decoration of chunk.userData.decorations) if (decoration.side) types.add(decoration.type);
                    for (const child of chunk.children) if (child.userData.variant !== undefined) variants.add(child.userData.variant);
                }
            }
            assert.deepEqual([...types].sort(), [...WORLD_STYLES[id].props].sort(), 'one or more landmark families never appeared');
            assert.ok(variants.size >= 2, 'all repeated props use the same color variant');
            a.reset(); b.reset();
            assert.deepEqual(layout(a), layout(b), 'reset changed the fixed-seed route');
        } finally { a.dispose(); b.dispose(); other.dispose(); }
    });

    test(`${id}: side decorations and gate triangles preserve lane clearance`, () => {
        const environment = makeEnvironment(id);
        try {
            for (const z of [0, 96, 288, 768, 1440]) {
                environment.update(z);
                for (const chunk of environment.chunks) {
                    chunk.updateWorldMatrix(true, true);
                    const sourceBounds = chunk.children.filter(child => child.isGroup)
                        .map(group => new THREE.Box3().setFromObject(group));
                    for (const decoration of chunk.userData.decorations) {
                        const { bounds, type, side } = decoration;
                        assert.ok([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite));
                        assert.ok(!bounds.isEmpty(), `${type} has empty bounds`);
                        assert.ok(sourceBounds.some(box => box.min.distanceTo(bounds.min) < EPSILON && box.max.distanceTo(bounds.max) < EPSILON),
                            `${type} metadata lost the chunk's world transform`);
                        if (!side) continue;
                        const innerEdge = side < 0 ? -bounds.max.x : bounds.min.x;
                        assert.ok(innerEdge >= 6.5 - EPSILON, `${type} intrudes at x=${innerEdge}`);
                    }
                }
            }
            assertGateClear(environment.kit.create(WORLD_STYLES[id].gate, 1), id);
        } finally { environment.dispose(); }
    });

    test(`${id}: long seeks, resets, and disposal keep resources bounded`, () => {
        const environment = makeEnvironment(id), scene = environment.scene;
        const baseline = resources(environment), route = [0, 96, 500, 1000, 4000, 100000];
        try {
            for (const z of route) { environment.update(z); assertCoverage(environment, z); }
            // Warm every prop/variant bucket before checking that repeated routes stop growing.
            const warmed = [...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort();
            const warmChildren = environment.renderGroup.children.length;
            for (let cycle = 0; cycle < 4; cycle++) {
                environment.reset();
                for (const z of route) {
                    environment.update(z); assertCoverage(environment, z);
                    assert.deepEqual(resources(environment), baseline, `geometry/material identities grew in reset ${cycle}`);
                    assert.ok(environment.instancePool.size <= 128, 'static instance buckets exceeded the theme budget');
                    for (const { mesh, capacity } of environment.instancePool.values()) assert.ok(mesh.count <= capacity);
                }
                assert.deepEqual([...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort(), warmed,
                    'replaying the same fixed-seed route kept growing instance buffers');
                assert.equal(environment.renderGroup.children.length, warmChildren, 'stale render meshes accumulated');
            }
        } finally { environment.dispose(); }
        assert.equal(scene.children.length, 0, 'environment disposal left render nodes in the scene');
        assert.equal(environment.instancePool.size, 0);
        assert.equal(environment.chunks.length, 0);
    });

    test(`${id}: themed obstacles retain collision sizes, roof support, and action arrows`, () => {
        const scene = new THREE.Scene(), kit = new ThemeObstacleKit(id);
        const baselineScene = new THREE.Scene();
        const themed = [new Ramp3D(scene, -1, 30, kit), new Train3D(scene, 1, 42, 7, kit),
            new HighBarrier3D(scene, 0, 75, kit), new LowBarrier3D(scene, 0, 95, kit)];
        const baseline = [new Ramp3D(baselineScene, -1, 30), new Train3D(baselineScene, 1, 42, 7),
            new HighBarrier3D(baselineScene, 0, 75), new LowBarrier3D(baselineScene, 0, 95)];
        try {
            for (let i = 0; i < themed.length; i++) {
                for (const field of ['lane', 'z', 'startZ', 'endZ', 'width', 'height', 'length', 'clearanceY', 'speed']) {
                    assert.equal(themed[i][field], baseline[i][field], `${id}: ${field} changed when applying visuals`);
                }
                assert.deepEqual(themed[i].mesh.position.toArray(), baseline[i].mesh.position.toArray());
            }
            for (const t of [-.1, 0, .25, .5, .75, 1, 1.1]) {
                const z = themed[0].startZ + t * themed[0].length;
                assert.equal(themed[0].getHeightAtZ(z), baseline[0].getHeightAtZ(z), 'ramp support changed');
            }
            assert.equal(themed[1].height, CONFIG.WORLD.TRAIN_HEIGHT);
            assert.equal(themed[0].getHeightAtZ(themed[0].endZ), themed[1].height);
            assert.ok(themed[2].mesh.getObjectByName('jumpArrow'), 'jump instructions are missing');
            assert.ok(themed[3].mesh.getObjectByName('slideArrow'), 'slide instructions are missing');
            themed[1].update(.5); baseline[1].update(.5);
            assert.equal(themed[1].z, baseline[1].z);
            assert.equal(themed[1].mesh.position.z, themed[1].z);
            for (const entity of themed) entity.mesh.traverse(mesh => {
                if (!mesh.isMesh) return;
                assert.ok(Object.values(kit.geometries).includes(mesh.geometry), 'an obstacle allocated private geometry');
                assert.ok(Object.values(kit.materials).includes(mesh.material), 'an obstacle allocated a private material');
            });
        } finally {
            themed.forEach(entity => entity.destroy()); baseline.forEach(entity => entity.destroy()); kit.dispose();
        }
        assert.equal(scene.children.length, 0);
    });

    test(`${id}: destroying map features removes nodes without disposing shared assets`, () => {
        const scene = new THREE.Scene(), kit = new ThemeObstacleKit(id);
        const a = new MapFeature3D(scene, kit, -1, 90), b = new MapFeature3D(scene, kit, 1, 105);
        let disposalEvents = 0;
        for (const resource of [...Object.values(kit.geometries), ...Object.values(kit.materials)]) {
            resource.addEventListener('dispose', () => disposalEvents++);
        }
        assert.equal(a.length, 7);
        assert.equal(a.triggered, false);
        assert.equal(a.mesh.position.x, CONFIG.LANE_WIDTH);
        assert.equal(a.mesh.position.z, 90);
        assert.equal(a.mesh.children[0].geometry, b.mesh.children[0].geometry);
        assert.equal(a.mesh.children[0].material, b.mesh.children[0].material);
        a.destroy();
        assert.equal(a.mesh.parent, null);
        assert.equal(b.mesh.parent, scene);
        assert.equal(disposalEvents, 0, 'destroying one feature disposed its neighbor assets');
        b.destroy();
        assert.equal(scene.children.length, 0);
        kit.dispose();
        assert.equal(disposalEvents, Object.keys(kit.geometries).length + Object.keys(kit.materials).length);
    });
}

test('entity instances follow moving platforms and scene transforms, then clear destroyed sources', () => {
    const scene = new THREE.Scene(); scene.position.set(5, 2, -17); scene.rotation.y = .23;
    const kit = new ThemeObstacleKit('store'), batch = new WorldEntityBatch3D(scene);
    const trains = [new Train3D(scene, -1, 40, 8, kit), new Train3D(scene, 1, 55, 4, kit)];
    const features = [new MapFeature3D(scene, kit, 0, 120)];
    const inverse = new THREE.Matrix4(), expected = new THREE.Matrix4(), actual = new THREE.Matrix4();
    let disposedAssets = 0;
    for (const resource of [...Object.values(kit.geometries), ...Object.values(kit.materials)]) {
        resource.addEventListener('dispose', () => disposedAssets++);
    }
    const assertMatrices = () => {
        scene.updateWorldMatrix(true, true); inverse.copy(scene.matrixWorld).invert();
        for (const record of batch.pool.values()) {
            assert.equal(record.mesh.count, record.sources.length);
            record.sources.forEach((source, index) => {
                expected.multiplyMatrices(inverse, source.matrixWorld); record.mesh.getMatrixAt(index, actual);
                for (let i = 0; i < 16; i++) assert.ok(Math.abs(expected.elements[i] - actual.elements[i]) < EPSILON,
                    `instance matrix diverged from the collision-owned source at element ${i}`);
            });
        }
    };
    try {
        batch.sync([...trains, ...features]); assertMatrices();
        const nodes = new Set([...batch.pool.values()].map(record => record.mesh));
        trains.forEach(train => train.update(.375));
        features[0].mesh.position.x += .45;
        batch.sync([...trains, ...features]); assertMatrices();
        assert.deepEqual(new Set([...batch.pool.values()].map(record => record.mesh)), nodes, 'movement reallocated render buffers');
        trains[0].destroy(); batch.sync([...trains, ...features]); assertMatrices();
        assert.ok([...batch.pool.values()].every(record => record.sources.every(source => !trains[0].mesh.children.includes(source))),
            'destroyed platform remains in an instance bucket');
        batch.clear();
        assert.ok([...batch.pool.values()].every(record => record.mesh.count === 0 && record.sources.length === 0));
    } finally {
        trains.forEach(train => train.destroy()); features.forEach(feature => feature.destroy()); batch.dispose();
    }
    assert.equal(batch.pool.size, 0);
    assert.equal(scene.children.length, 0);
    assert.equal(disposedAssets, 0, 'instance-buffer disposal destroyed shared source resources');
    kit.dispose();
});
