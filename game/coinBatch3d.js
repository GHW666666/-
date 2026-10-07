import * as THREE from '../libs/three.module.js';

/**
 * Render the existing Coin3D groups in shared batches. The groups remain the
 * gameplay authority for rotation, magnet attraction, collision and collection.
 */
export class CoinBatch3D {
    constructor(scene) {
        this.scene = scene;
        this._records = [];
        this._byGeometry = new Map();
        this._inverseSceneWorld = new THREE.Matrix4();
        this._instanceMatrix = new THREE.Matrix4();
    }

    _recordFor(source) {
        let byMaterial = this._byGeometry.get(source.geometry);
        if (!byMaterial) {
            byMaterial = new Map();
            this._byGeometry.set(source.geometry, byMaterial);
        }
        let record = byMaterial.get(source.material);
        if (!record) {
            record = { geometry: source.geometry, material: source.material, sources: [], mesh: null, capacity: 0 };
            byMaterial.set(source.material, record);
            this._records.push(record);
        }
        return record;
    }

    _ensureCapacity(record, required) {
        if (record.capacity >= required) return;
        let capacity = record.capacity || 32;
        while (capacity < required) capacity *= 2;

        // InstancedMesh owns its instance buffer; its shared source resources do
        // not belong to this batch and must survive capacity changes and resets.
        if (record.mesh) {
            this.scene.remove(record.mesh);
            record.mesh.dispose();
        }
        const source = record.sources[0];
        const mesh = new THREE.InstancedMesh(record.geometry, record.material, capacity);
        mesh.name = `coinBatch${this._records.indexOf(record)}`;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.count = 0;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        // Coins span several chunks and move under magnet attraction. Avoid a
        // stale aggregate bounding sphere hiding a freshly moved instance.
        mesh.frustumCulled = false;
        mesh.castShadow = source.castShadow;
        mesh.receiveShadow = source.receiveShadow;
        mesh.layers.mask = source.layers.mask;
        mesh.renderOrder = source.renderOrder;
        record.mesh = mesh;
        record.capacity = capacity;
        this.scene.add(mesh);
    }

    sync(coins) {
        for (const record of this._records) record.sources.length = 0;
        this.scene.updateWorldMatrix(true, false);
        this._inverseSceneWorld.copy(this.scene.matrixWorld).invert();

        for (const coin of coins || []) {
            const group = coin.mesh;
            if (!group) continue;
            for (const child of group.children) {
                if (child.isMesh) child.visible = false;
            }
            if (coin.collected || !group.parent || !group.visible) continue;

            // A destroyed coin can remain in the caller's array until cleanup.
            // Batch only groups still attached to the supplied scene/container.
            let ancestor = group.parent;
            let attached = false;
            let visible = true;
            while (ancestor) {
                if (!ancestor.visible) visible = false;
                if (ancestor === this.scene) { attached = true; break; }
                ancestor = ancestor.parent;
            }
            if (!attached || !visible) continue;

            // Three.js updates invisible children here as well. Hiding only
            // those meshes leaves the original group position and API intact.
            group.updateWorldMatrix(true, true);
            for (const child of group.children) {
                if (!child.isMesh) continue;
                this._recordFor(child).sources.push(child);
            }
        }

        for (const record of this._records) {
            const count = record.sources.length;
            if (count === 0) {
                if (record.mesh) record.mesh.count = 0;
                continue;
            }
            this._ensureCapacity(record, count);
            for (let i = 0; i < count; i++) {
                this._instanceMatrix.multiplyMatrices(this._inverseSceneWorld, record.sources[i].matrixWorld);
                record.mesh.setMatrixAt(i, this._instanceMatrix);
            }
            record.mesh.count = count;
            record.mesh.matrixWorldNeedsUpdate = true;
            record.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    clear() {
        for (const record of this._records) {
            record.sources.length = 0;
            if (record.mesh) record.mesh.count = 0;
        }
    }
}
