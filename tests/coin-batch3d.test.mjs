import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { Coin3D } from '../game/obstacles3d.js';
import { CoinBatch3D } from '../game/coinBatch3d.js';

const batchesIn = container => container.children.filter(object => object.isInstancedMesh);

function assertCoinTransform(container, coin, index = 0) {
    coin.mesh.updateWorldMatrix(true, true);
    for (const source of coin.mesh.children) {
        const batchMesh = batchesIn(container).find(mesh => mesh.geometry === source.geometry && mesh.material === source.material);
        assert.ok(batchMesh, 'Each original coin part has a batch using its shared geometry and material.');
        batchMesh.updateWorldMatrix(true, false);
        const renderedWorld = new THREE.Matrix4();
        batchMesh.getMatrixAt(index, renderedWorld);
        renderedWorld.premultiply(batchMesh.matrixWorld);
        for (let element = 0; element < 16; element++) {
            assert.ok(Math.abs(renderedWorld.elements[element] - source.matrixWorld.elements[element]) < 1e-5,
                `Rendered transform element ${element} matches the source part.`);
        }
    }
}

test('batch rendering follows rotation and magnet movement under a transformed parent', () => {
    const scene = new THREE.Scene();
    const container = new THREE.Group();
    container.position.set(3, 2, -4);
    container.rotation.set(0.12, 0.27, -0.08);
    container.scale.set(1.1, 0.9, 1.2);
    scene.add(container);
    const batch = new CoinBatch3D(container);
    const coin = new Coin3D(container, 0, 10);
    // Verify child transforms as well as the coin group's gameplay transform.
    coin.mesh.children[1].position.set(0.03, 0.06, 0.02);
    coin.update(0.3);
    const originalPosition = coin.mesh.position.clone();
    const originalRotation = coin.mesh.quaternion.clone();

    batch.sync([coin]);
    assert.equal(batchesIn(container).length, 2);
    assert.ok(coin.mesh.visible, 'The gameplay group stays visible.');
    assert.ok(coin.mesh.children.every(child => !child.visible), 'Only original meshes are hidden.');
    assert.ok(coin.mesh.position.equals(originalPosition), 'Sync preserves the position used by collision and magnet logic.');
    assert.ok(coin.mesh.quaternion.equals(originalRotation), 'Sync preserves the source animation.');
    assertCoinTransform(container, coin);

    coin.update(0.2);
    coin.mesh.position.lerp(new THREE.Vector3(-0.4, 2.5, 8), 0.7);
    container.position.z += 7;
    container.rotation.y += 0.1;
    batch.sync([coin]);
    assertCoinTransform(container, coin);
    assert.ok(batchesIn(container).every(mesh => mesh.count === 1));
});

test('collection, destruction, clear and reset remove stale instances without changing coin groups', () => {
    const scene = new THREE.Scene();
    const batch = new CoinBatch3D(scene);
    const coins = [new Coin3D(scene, 0, 10), new Coin3D(scene, 1, 12), new Coin3D(scene, -1, 14)];
    coins[0].collected = true;
    batch.sync(coins);
    assert.ok(coins[0].mesh.visible);
    assert.ok(coins[0].mesh.children.every(child => !child.visible), 'A coin collected before the first sync cannot remain visible.');
    assert.ok(batchesIn(scene).every(mesh => mesh.count === 2));

    const allocatedBatches = batchesIn(scene);
    coins[1].destroy();
    batch.sync(coins);
    assert.ok(batchesIn(scene).every(mesh => mesh.count === 1), 'A destroyed group is excluded even before array cleanup.');
    assertCoinTransform(scene, coins[2]);

    coins[2].collected = true;
    batch.sync(coins);
    assert.ok(batchesIn(scene).every(mesh => mesh.count === 0));
    batch.clear();
    assert.deepEqual(batchesIn(scene), allocatedBatches, 'Clear keeps the reusable instance buffers.');

    for (const coin of coins) coin.destroy();
    const resetCoins = [new Coin3D(scene, 1, 90), new Coin3D(scene, 0, 92)];
    batch.sync(resetCoins);
    assert.deepEqual(batchesIn(scene), allocatedBatches, 'A new run reuses the existing batches.');
    assert.ok(batchesIn(scene).every(mesh => mesh.count === 2));
    assertCoinTransform(scene, resetCoins[0], 0);
    assertCoinTransform(scene, resetCoins[1], 1);
});

test('capacity doubles and releases old instance buffers while keeping shared coin resources', t => {
    const scene = new THREE.Scene();
    const batch = new CoinBatch3D(scene);
    const coins = [new Coin3D(scene, 0, 10)];
    batch.sync(coins);
    const initialBatches = batchesIn(scene);
    const capacity = initialBatches[0].instanceMatrix.count;
    let disposedBatches = 0;
    let disposedGeometry = 0;
    let disposedMaterials = 0;
    const onGeometryDispose = () => disposedGeometry++;
    const onMaterialDispose = () => disposedMaterials++;
    const geometries = new Set(initialBatches.map(mesh => mesh.geometry));
    const materials = new Set(initialBatches.map(mesh => mesh.material));
    for (const mesh of initialBatches) mesh.addEventListener('dispose', () => disposedBatches++);
    for (const geometry of geometries) geometry.addEventListener('dispose', onGeometryDispose);
    for (const material of materials) material.addEventListener('dispose', onMaterialDispose);
    t.after(() => {
        for (const geometry of geometries) geometry.removeEventListener('dispose', onGeometryDispose);
        for (const material of materials) material.removeEventListener('dispose', onMaterialDispose);
    });

    for (let index = 1; index <= capacity; index++) coins.push(new Coin3D(scene, (index % 3) - 1, 10 + index));
    batch.sync(coins);
    const grownBatches = batchesIn(scene);
    assert.equal(disposedBatches, initialBatches.length, 'Each obsolete instance buffer is disposed.');
    assert.ok(initialBatches.every(mesh => mesh.parent === null), 'Old batches leave the scene.');
    assert.ok(grownBatches.every(mesh => mesh.count === coins.length && mesh.instanceMatrix.count === capacity * 2));
    assert.ok(grownBatches.every(mesh => geometries.has(mesh.geometry) && materials.has(mesh.material)), 'Growing creates no new source geometry or material.');

    batch.sync(coins);
    batch.clear();
    assert.deepEqual(batchesIn(scene), grownBatches, 'Repeated frames and clear reuse the grown buffers.');
    assert.ok(grownBatches.every(mesh => mesh.count === 0));
    assert.equal(disposedGeometry, 0);
    assert.equal(disposedMaterials, 0);
    assert.equal(disposedBatches, initialBatches.length, 'Clear does not dispose reusable buffers.');
});
