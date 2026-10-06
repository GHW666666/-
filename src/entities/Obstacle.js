/**
 * Obstacle.js
 * 地铁跑酷风格 3D 障碍物生成与碰撞盒系统
 */

import * as THREE from 'three';

export const OBSTACLE_TYPES = {
  LOW: 'low',       // 低障：必须跳跃跳过
  HIGH: 'high',     // 高障：必须滑铲穿过
  BLOCK: 'block',   // 全阻挡车厢：必须左右变道换轨
  RAMP: 'ramp'      // 带有斜坡的车厢：可以跳上车顶
};

export class Obstacle {
  constructor(type, laneX, zPos) {
    this.type = type;
    this.laneX = laneX;
    this.z = zPos;
    this.mesh = new THREE.Group();
    this.isDestroyed = false;

    this.createModel();
    this.mesh.position.set(laneX, 0, zPos);
  }

  createModel() {
    switch (this.type) {
      case OBSTACLE_TYPES.LOW:
        this.createLowBarrier();
        break;
      case OBSTACLE_TYPES.HIGH:
        this.createHighBarrier();
        break;
      case OBSTACLE_TYPES.BLOCK:
        this.createBlockTrain();
        break;
      case OBSTACLE_TYPES.RAMP:
        this.createRampTrain();
        break;
    }
  }

  // 1. 低矮路障（黄黑相间警示栅栏，高 0.8 米）
  createLowBarrier() {
    const barGeo = new THREE.BoxGeometry(1.8, 0.45, 0.25);
    const barMat = new THREE.MeshLambertMaterial({ color: 0xffbb00 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = 0.55;
    this.mesh.add(bar);

    const legMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.75, 0.4, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.75, 0.4, 0);
    this.mesh.add(rightLeg);
  }

  // 2. 高架横障（必须下滑滑铲穿过，离地 0.8 - 1.8 米）
  createHighBarrier() {
    const postMat = new THREE.MeshLambertMaterial({ color: 0x444455 });
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);

    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-0.9, 1.1, 0);
    this.mesh.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(0.9, 1.1, 0);
    this.mesh.add(rightPost);

    // 顶部横幅横梁
    const beamGeo = new THREE.BoxGeometry(2.0, 0.7, 0.25);
    const beamMat = new THREE.MeshLambertMaterial({ color: 0xee2222 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 1.85, 0);
    this.mesh.add(beam);
  }

  // 3. 全阻挡车厢（类似地铁火车，高 2.4 米，宽 1.9 米）
  createBlockTrain() {
    const trainMat = new THREE.MeshLambertMaterial({ color: 0x1e88e5 }); // 亮蓝色车厢
    const trainGeo = new THREE.BoxGeometry(1.9, 2.2, 5.0);
    const train = new THREE.Mesh(trainGeo, trainMat);
    train.position.y = 1.1;
    this.mesh.add(train);

    // 车顶警示顶
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
    const roofGeo = new THREE.BoxGeometry(1.95, 0.2, 5.1);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.25;
    this.mesh.add(roof);

    // 车窗
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const winGeo = new THREE.BoxGeometry(1.92, 0.5, 1.2);
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(0, 1.4, 0.5);
    this.mesh.add(win);
  }

  // 4. 带斜坡的列车（可以从斜坡跑上车顶）
  createRampTrain() {
    this.createBlockTrain();

    // 前端斜坡
    const rampMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
    const rampGeo = new THREE.BoxGeometry(1.8, 0.1, 2.8);
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(0, 1.1, -3.2);
    ramp.rotation.x = 0.55;
    this.mesh.add(ramp);
  }

  getBoundingBox() {
    const box = new THREE.Box3();
    const pos = this.mesh.position;

    switch (this.type) {
      case OBSTACLE_TYPES.LOW:
        // 低障碍：离地 0 到 0.8
        box.min.set(pos.x - 0.9, 0, pos.z - 0.3);
        box.max.set(pos.x + 0.9, 0.85, pos.z + 0.3);
        break;

      case OBSTACLE_TYPES.HIGH:
        // 高障碍：只有离地 0.85 到 2.2 米才是碰撞区（贴地滑铲可通过！）
        box.min.set(pos.x - 0.9, 0.85, pos.z - 0.3);
        box.max.set(pos.x + 0.9, 2.3, pos.z + 0.3);
        break;

      case OBSTACLE_TYPES.BLOCK:
        box.min.set(pos.x - 0.95, 0, pos.z - 2.5);
        box.max.set(pos.x + 0.95, 2.4, pos.z + 2.5);
        break;

      case OBSTACLE_TYPES.RAMP:
        box.min.set(pos.x - 0.95, 0, pos.z - 2.5);
        box.max.set(pos.x + 0.95, 2.4, pos.z + 2.5);
        break;
    }

    return box;
  }
}
