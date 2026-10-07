import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { CONFIG } from '../game/config.js';
import { Environment3D } from '../game/environment3d.js';

const SEED = 0x5ea1a7df;
const MAX_CHUNKS = 9;
const SIDE_CLEARANCE = 6.5;
const LANE_EDGE = 4.8;
const EPSILON = 1e-5;
const makeEnvironment = (seed = SEED) => new Environment3D(new THREE.Scene(), { seed });
const rounded = value => Number(value.toFixed(7));

function boxesMatch(a, b) {
    return a.min.distanceTo(b.min) < EPSILON && a.max.distanceTo(b.max) < EPSILON;
}

function sampleChunks(environment, count = 24) {
    const chunks = new Map();
    for (let index = 0; index < count; index++) {
        environment.update(index * CONFIG.WORLD.CHUNK_LENGTH);
        for (const chunk of environment.chunks) chunks.set(chunk.userData.index, chunk);
    }
    return [...chunks.values()];
}

function layout(environment) {
    return environment.chunks.map(chunk => ({
        index: chunk.userData.index,
        start: chunk.userData.startZ,
        end: chunk.userData.endZ,
        decorations: chunk.userData.decorations.map(decoration => ({
            type: decoration.type,
            side: decoration.side,
            min: decoration.bounds.min.toArray().map(rounded),
            max: decoration.bounds.max.toArray().map(rounded)
        })),
        groups: chunk.children.filter(child => child.isGroup).map(group => {
            const colors = [];
            group.traverse(node => {
                if (node.isMesh) colors.push(node.material.color?.getHex());
            });
            return { name: group.name, variant: group.userData.variant, colors };
        })
    }));
}

function resourceIds(environment) {
    const geometries = new Set();
    const materials = new Set();
    const addMaterial = material => {
        for (const item of Array.isArray(material) ? material : [material]) materials.add(item.id);
    };
    for (const library of [environment.geometries, environment.kit.geometries, environment.kit.unit]) {
        for (const geometry of Object.values(library)) geometries.add(geometry.id);
    }
    for (const library of [environment.materials, environment.kit.materials]) {
        for (const material of Object.values(library)) addMaterial(material);
    }
    environment.scene.traverse(node => {
        if (node.isMesh) {
            geometries.add(node.geometry.id);
            addMaterial(node.material);
        }
    });
    for (const chunk of environment.chunks) chunk.traverse(node => {
        if (node.isMesh) {
            geometries.add(node.geometry.id);
            addMaterial(node.material);
        }
    });
    return {
        geometries: [...geometries].sort((a, b) => a - b),
        materials: [...materials].sort((a, b) => a - b)
    };
}

function assertCoverage(environment, playerZ) {
    const chunks = environment.chunks;
    assert.ok(chunks.length > 0 && chunks.length <= MAX_CHUNKS,
        `at Z=${playerZ}: ${chunks.length} chunks exceed the bounded visible window`);
    const cutoff = playerZ - 35;
    assert.ok(chunks[0].userData.startZ <= cutoff + EPSILON, `missing rear ground at Z=${playerZ}`);
    assert.ok(chunks[0].userData.endZ >= cutoff - EPSILON, `stale rear chunk at Z=${playerZ}`);
    assert.ok(chunks.at(-1).userData.endZ >= playerZ + 320 - EPSILON,
        `less than 320 m of forward coverage at Z=${playerZ}`);
    for (let index = 0; index < chunks.length; index++) {
        const { startZ, endZ } = chunks[index].userData;
        assert.equal(endZ - startZ, CONFIG.WORLD.CHUNK_LENGTH);
        if (index) assert.equal(chunks[index - 1].userData.endZ, startZ,
            `ground gap or overlapping chunk at Z=${startZ}`);
    }
}

test('seeded Egyptian scenery works without document and offers varied landmarks', () => {
    assert.equal(typeof document, 'undefined');
    const environment = makeEnvironment();
    assert.equal(environment.materials.road.map, null, 'headless construction must not require a canvas');
    const chunks = sampleChunks(environment);
    // Exclude the deliberately composed opening chunk when judging random variety.
    const types = new Set(chunks.filter(chunk => chunk.userData.index !== 0)
        .flatMap(chunk => chunk.userData.decorations.map(decoration => decoration.type))
        .filter(type => type !== 'gate'));
    assert.ok(types.size >= 3, `only ${[...types].join(', ')} appeared in the seeded route`);
    assert.ok(types.has('pyramid') && types.has('pharaoh'), 'the requested landmark families are missing');
});

test('decoration metadata uses world bounds and side props leave 6.5 m of clearance', () => {
    const environment = makeEnvironment();
    const failures = [];
    for (const chunk of sampleChunks(environment)) {
        chunk.updateMatrixWorld(true);
        const groups = chunk.children.filter(child => child.isGroup).map(group => ({
            group, bounds: new THREE.Box3().setFromObject(group)
        }));
        for (const decoration of chunk.userData.decorations) {
            const { bounds, type, side } = decoration;
            assert.ok(!bounds.isEmpty(), `${type} has empty bounds in chunk ${chunk.userData.index}`);
            assert.ok([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite));
            const source = groups.find(item => boxesMatch(item.bounds, bounds));
            assert.ok(source, `${type} metadata does not match any world-space prop in chunk ${chunk.userData.index}`);
            const worldZ = source.group.getWorldPosition(new THREE.Vector3()).z;
            assert.ok(Math.abs(worldZ - (chunk.userData.startZ + source.group.position.z)) < EPSILON,
                `${type} lost the chunk's world translation`);
            if (type === 'gate') continue;
            assert.ok(side === -1 || side === 1, `${type} lacks a side designation`);
            const innerEdge = side < 0 ? -bounds.max.x : bounds.min.x;
            if (innerEdge < SIDE_CLEARANCE - EPSILON) failures.push({
                chunk: chunk.userData.index, type, side, innerEdge: rounded(innerEdge)
            });
        }
    }
    assert.equal(failures.length, 0, `decorations intrude into the clearance zone: ${JSON.stringify(failures.slice(0, 12))}`);
});

test('baked temple gates keep the lane corridor clear below seven metres', () => {
    const environment = makeEnvironment();
    const gates = sampleChunks(environment, 12).flatMap(chunk => chunk.children)
        .filter(group => group.userData.egyptProp === 'temple-gate');
    assert.ok(gates.length > 0, 'no gates were tested');
    let overheadTriangles = 0;
    let pillarTriangles = 0;
    for (const gate of gates) {
        gate.updateWorldMatrix(true, true);
        gate.traverse(mesh => {
            if (!mesh.isMesh) return;
            const geometry = mesh.geometry;
            const positions = geometry.attributes.position;
            const count = geometry.index?.count ?? positions.count;
            const vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
            for (let index = 0; index < count; index += 3) {
                for (let corner = 0; corner < 3; corner++) {
                    const vertexIndex = geometry.index ? geometry.index.getX(index + corner) : index + corner;
                    vertices[corner].fromBufferAttribute(positions, vertexIndex).applyMatrix4(mesh.matrixWorld);
                }
                // Whole-mesh bounds are insufficient: gateStone contains both pillars
                // and the lintel, and its merged box spans the empty opening.
                const triangleBounds = new THREE.Box3().setFromPoints(vertices);
                const crossesLanes = triangleBounds.min.x < LANE_EDGE && triangleBounds.max.x > -LANE_EDGE;
                if (crossesLanes) {
                    overheadTriangles++;
                    assert.ok(triangleBounds.min.y >= 7 - EPSILON,
                        `${mesh.name} enters the overhead corridor at y=${triangleBounds.min.y}`);
                } else if (triangleBounds.min.y < 7) {
                    pillarTriangles++;
                    assert.ok(triangleBounds.min.x >= LANE_EDGE - EPSILON || triangleBounds.max.x <= -LANE_EDGE + EPSILON,
                        `${mesh.name} enters a playable lane`);
                }
            }
        });
    }
    assert.ok(overheadTriangles > 0 && pillarTriangles > 0, 'both lintels and side pillars must be covered');
});

test('forward seeks preserve continuous ground and a bounded visible window', () => {
    const environment = makeEnvironment();
    for (const playerZ of [0, 96, 500, 1000, 100000]) {
        environment.update(playerZ);
        assertCoverage(environment, playerZ);
        assert.equal(environment.distantHorizonGroup.position.z, playerZ);
    }
    environment.reset();
    environment.update(0);
    assertCoverage(environment, 0);
});

test('reset and seeks reuse resource identities and keep instance allocation bounded', () => {
    const environment = makeEnvironment();
    const baseline = resourceIds(environment);
    const route = [0, 96, 500, 1000, 2000, 4000];
    for (const z of route) environment.update(z);
    const warmedPool = [...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort();
    const maxBucketCapacity = 2 ** Math.ceil(Math.log2(3 * Math.ceil(CONFIG.WORLD.CHUNK_LENGTH / 2) * MAX_CHUNKS));
    for (let cycle = 0; cycle < 12; cycle++) {
        environment.reset();
        for (const playerZ of route) {
            environment.update(playerZ);
            assertCoverage(environment, playerZ);
            assert.deepEqual(resourceIds(environment), baseline, `geometry/material allocations grew in reset cycle ${cycle}`);
            let totalCapacity = 0;
            assert.ok(environment.instancePool.size <= 96, 'the static batching budget grew without bound');
            for (const { mesh, capacity } of environment.instancePool.values()) {
                totalCapacity += capacity;
                assert.ok(capacity > 0 && capacity <= maxBucketCapacity, `oversized instance bucket: ${capacity}`);
                assert.ok(mesh.count <= capacity, 'live instances exceed their allocated capacity');
            }
            assert.ok(totalCapacity <= 4096, `static instance allocation exceeded 4096 matrices: ${totalCapacity}`);
        }
        assert.deepEqual([...environment.instancePool].map(([key, entry]) => [key, entry.capacity]).sort(), warmedPool,
            'repeating the same route should not keep growing instance buffers');
    }
});

test('the same seed reproduces layouts and a different seed changes them', () => {
    const a = makeEnvironment();
    const b = makeEnvironment();
    const different = makeEnvironment(SEED + 1);
    assert.deepEqual(layout(a), layout(b));
    assert.notDeepEqual(layout(a), layout(different));
    for (const playerZ of [0, 96, 500, 1000]) {
        a.update(playerZ);
        b.update(playerZ);
        assert.deepEqual(layout(a), layout(b), `same-seed layouts diverged at Z=${playerZ}`);
    }
    a.reset();
    b.reset();
    assert.deepEqual(layout(a), layout(b), 'reset changed a fixed-seed layout');
});
