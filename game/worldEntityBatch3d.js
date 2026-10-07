import * as THREE from '../libs/three.module.js';

/** Source groups keep movement/collision ownership while shared meshes do the drawing. */
export class WorldEntityBatch3D {
    constructor(scene) { this.scene=scene; this.pool=new Map(); this.matrix=new THREE.Matrix4(); this.inverse=new THREE.Matrix4(); }
    sync(entities) {
        for (const record of this.pool.values()) record.sources.length=0;
        this.scene.updateWorldMatrix(true,false); this.inverse.copy(this.scene.matrixWorld).invert();
        for(const entity of entities) {
            const group=entity.mesh;
            if(!group?.parent || !group.visible) continue;
            group.updateWorldMatrix(true,true);
            group.traverse(source=>{
                if(!source.isMesh) return;
                source.visible=false;
                const key=[source.geometry.uuid,source.material.uuid,+source.castShadow,+source.receiveShadow].join(':');
                if(!this.pool.has(key)) this.pool.set(key,{ geometry:source.geometry,material:source.material,castShadow:source.castShadow,receiveShadow:source.receiveShadow,sources:[],mesh:null,capacity:0 });
                this.pool.get(key).sources.push(source);
            });
        }
        for(const record of this.pool.values()) {
            const count=record.sources.length;
            if(!count) { if(record.mesh) record.mesh.count=0; continue; }
            if(count>record.capacity) {
                if(record.mesh) { this.scene.remove(record.mesh); record.mesh.dispose(); }
                record.capacity=2**Math.ceil(Math.log2(Math.max(16,count)));
                record.mesh=new THREE.InstancedMesh(record.geometry,record.material,record.capacity);
                record.mesh.name='worldEntityInstances'; record.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                record.mesh.castShadow=record.castShadow; record.mesh.receiveShadow=record.receiveShadow;
                this.scene.add(record.mesh);
            }
            record.sources.forEach((source,i)=>record.mesh.setMatrixAt(i,this.matrix.multiplyMatrices(this.inverse,source.matrixWorld)));
            record.mesh.count=count; record.mesh.instanceMatrix.needsUpdate=true; record.mesh.computeBoundingSphere();
        }
    }
    clear() { for(const r of this.pool.values()) {r.sources.length=0;if(r.mesh) r.mesh.count=0;} }
    dispose() {for(const r of this.pool.values()) if(r.mesh) { this.scene.remove(r.mesh);r.mesh.dispose(); } this.pool.clear();}
}
