/**
 * Collectible.js
 * 可拾取物：兽奶瓶（金币）、吸奶器（磁铁）、窜天猴（火箭）、“牛来！”神牛令（无敌冲撞）
 */

import * as THREE from 'three';

export const ITEM_TYPES = {
  MILK: 'milk',           // 兽奶瓶
  MAGNET: 'magnet',       // 吸奶器（磁铁）
  JETPACK: 'jetpack',     // 窜天猴（喷气背包）
  BULL: 'bull'            // “牛来”神牛令（无敌冲撞）
};

export class Collectible {
  constructor(type, x, y, z) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.isCollected = false;
    this.originalY = y;
    this.rotSpeed = 2.5;

    this.createModel();
    this.mesh.position.set(x, y, z);
  }

  createModel() {
    switch (this.type) {
      case ITEM_TYPES.MILK:
        this.createMilkBottle();
        break;
      case ITEM_TYPES.MAGNET:
        this.createMagnet();
        break;
      case ITEM_TYPES.JETPACK:
        this.createJetpack();
        break;
      case ITEM_TYPES.BULL:
        this.createBullToken();
        break;
    }
  }

  // 1. 兽奶瓶 (圆润的白色瓶体 + 蓝色奶嘴瓶盖)
  createMilkBottle() {
    const milkMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // 浓郁兽奶
    const capMat = new THREE.MeshLambertMaterial({ color: 0x00d2ff });  // 天蓝瓶盖
    const teatMat = new THREE.MeshLambertMaterial({ color: 0xffccaa }); // 肉色奶嘴

    // 瓶身
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.55, 12);
    const body = new THREE.Mesh(bodyGeo, milkMat);
    this.mesh.add(body);

    // 瓶盖
    const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.32;
    this.mesh.add(cap);

    // 奶嘴
    const teatGeo = new THREE.ConeGeometry(0.1, 0.2, 10);
    const teat = new THREE.Mesh(teatGeo, teatMat);
    teat.position.y = 0.46;
    this.mesh.add(teat);

    this.mesh.scale.set(1.2, 1.2, 1.2);
  }

  // 2. 吸奶器 / 磁铁 (U型吸铁石)
  createMagnet() {
    const redMat = new THREE.MeshLambertMaterial({ color: 0xff2222 });
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });

    // 左右红腿
    const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const leftLeg = new THREE.Mesh(legGeo, redMat);
    leftLeg.position.x = -0.3;
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, redMat);
    rightLeg.position.x = 0.3;
    this.mesh.add(rightLeg);

    // 顶部横梁
    const topGeo = new THREE.BoxGeometry(0.8, 0.2, 0.2);
    const top = new THREE.Mesh(topGeo, redMat);
    top.position.y = 0.3;
    this.mesh.add(top);

    // 银色极性尖端
    const tipGeo = new THREE.BoxGeometry(0.22, 0.15, 0.22);
    const leftTip = new THREE.Mesh(tipGeo, silverMat);
    leftTip.position.set(-0.3, -0.32, 0);
    this.mesh.add(leftTip);

    const rightTip = new THREE.Mesh(tipGeo, silverMat);
    rightTip.position.set(0.3, -0.32, 0);
    this.mesh.add(rightTip);
  }

  // 3. 窜天猴 (双筒火箭推进器)
  createJetpack() {
    const rocketMat = new THREE.MeshLambertMaterial({ color: 0xff5500 });
    const coneMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });

    const barrelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 10);
    const coneGeo = new THREE.ConeGeometry(0.22, 0.3, 10);

    // 左火箭筒
    const leftBarrel = new THREE.Mesh(barrelGeo, rocketMat);
    leftBarrel.position.x = -0.28;
    this.mesh.add(leftBarrel);
    const leftCone = new THREE.Mesh(coneGeo, coneMat);
    leftCone.position.set(-0.28, 0.5, 0);
    this.mesh.add(leftCone);

    // 右火箭筒
    const rightBarrel = new THREE.Mesh(barrelGeo, rocketMat);
    rightBarrel.position.x = 0.28;
    this.mesh.add(rightBarrel);
    const rightCone = new THREE.Mesh(coneGeo, coneMat);
    rightCone.position.set(0.28, 0.5, 0);
    this.mesh.add(rightCone);
  }

  // 4. “牛来！”神牛令牌 (金光闪闪的大金牛头像勋章)
  createBullToken() {
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    // 勋章底盘
    const diskGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
    const disk = new THREE.Mesh(diskGeo, goldMat);
    disk.rotation.x = Math.PI / 2;
    this.mesh.add(disk);

    // 金牛双角
    const hornGeo = new THREE.ConeGeometry(0.12, 0.5, 8);
    const leftHorn = new THREE.Mesh(hornGeo, redMat);
    leftHorn.position.set(-0.3, 0.35, 0.1);
    leftHorn.rotation.z = 0.6;
    this.mesh.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, redMat);
    rightHorn.position.set(0.3, 0.35, 0.1);
    rightHorn.rotation.z = -0.6;
    this.mesh.add(rightHorn);

    this.mesh.scale.set(1.1, 1.1, 1.1);
  }

  update(delta, playerPos, isMagnetActive) {
    if (this.isCollected) return;

    // 自转与轻微上下浮动
    this.mesh.rotation.y += this.rotSpeed * delta;
    this.mesh.position.y = this.originalY + Math.sin(Date.now() * 0.005 + this.mesh.position.z) * 0.12;

    // 磁铁吸附效果：若激活吸奶器且是兽奶瓶，自动被吸引向主角飞去
    if (isMagnetActive && this.type === ITEM_TYPES.MILK && playerPos) {
      const dist = this.mesh.position.distanceTo(playerPos);
      if (dist < 14) {
        // 向玩家飞去
        this.mesh.position.lerp(playerPos, delta * 12);
      }
    }
  }

  getBoundingBox() {
    const box = new THREE.Box3();
    const pos = this.mesh.position;
    box.min.set(pos.x - 0.45, pos.y - 0.45, pos.z - 0.45);
    box.max.set(pos.x + 0.45, pos.y + 0.45, pos.z + 0.45);
    return box;
  }
}
