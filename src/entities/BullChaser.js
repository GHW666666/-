/**
 * BullChaser.js
 * 追击者【牛来】：紧追身后的暴走红眼神牛
 */

import * as THREE from 'three';
import { Audio } from '../platform/AudioSynth.js';

export class BullChaser {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // 跟随与距离机制
    this.normalDistance = -6.5; // 正常保持距离(在玩家后方)
    this.closeDistance = -2.0;  // 警告逼近距离
    this.currentDistance = this.normalDistance;
    this.targetDistance = this.normalDistance;
    this.isEnraged = false; // 逼近狂暴警戒中
    this.enrageTimer = 0;

    this.animTime = 0;
    this.parts = {};

    this.createModel();
    this.scene.add(this.mesh);
  }

  createModel() {
    const bullBodyMat = new THREE.MeshLambertMaterial({ color: 0x4a180d }); // 深红棕色肌肉野牛
    const hornMat = new THREE.MeshLambertMaterial({ color: 0xf5d77f });     // 金色弯角
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });     // 亮金鼻环
    const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });    // 猩红血眼
    const hoofMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    // 1. 强壮身躯
    const bodyGeo = new THREE.BoxGeometry(1.3, 1.2, 2.0);
    const bodyMesh = new THREE.Mesh(bodyGeo, bullBodyMat);
    bodyMesh.position.y = 1.2;
    this.mesh.add(bodyMesh);

    // 肌肉隆起背脊
    const humpGeo = new THREE.ConeGeometry(0.7, 0.6, 6);
    const humpMesh = new THREE.Mesh(humpGeo, bullBodyMat);
    humpMesh.position.set(0, 1.85, 0.2);
    humpMesh.rotation.x = -0.3;
    this.mesh.add(humpMesh);

    // 2. 硕大牛头
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 1.1);

    const headGeo = new THREE.BoxGeometry(0.9, 0.95, 1.1);
    const headMesh = new THREE.Mesh(headGeo, bullBodyMat);
    headGroup.add(headMesh);
    this.parts.head = headGroup;

    // 弯曲巨角 (左 & 右)
    const hornGeo = new THREE.ConeGeometry(0.18, 1.0, 8);

    const leftHorn = new THREE.Mesh(hornGeo, hornMat);
    leftHorn.position.set(-0.55, 0.55, 0.1);
    leftHorn.rotation.z = 0.8;
    leftHorn.rotation.x = -0.4;
    headGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, hornMat);
    rightHorn.position.set(0.55, 0.55, 0.1);
    rightHorn.rotation.z = -0.8;
    rightHorn.rotation.x = -0.4;
    headGroup.add(rightHorn);

    // 猩红大眼 (冒着红光)
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    leftEye.position.set(-0.46, 0.15, 0.45);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    rightEye.position.set(0.46, 0.15, 0.45);
    headGroup.add(rightEye);

    // 标志性大金鼻环
    const ringGeo = new THREE.TorusGeometry(0.16, 0.04, 8, 16);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, -0.32, 0.58);
    ringMesh.rotation.x = 0.4;
    headGroup.add(ringMesh);

    this.mesh.add(headGroup);

    // 3. 四蹄奔跑腿
    const legGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.9, 8);

    this.parts.flLeg = new THREE.Mesh(legGeo, bullBodyMat);
    this.parts.flLeg.position.set(-0.5, 0.45, 0.7);
    this.mesh.add(this.parts.flLeg);

    this.parts.frLeg = new THREE.Mesh(legGeo, bullBodyMat);
    this.parts.frLeg.position.set(0.5, 0.45, 0.7);
    this.mesh.add(this.parts.frLeg);

    this.parts.blLeg = new THREE.Mesh(legGeo, bullBodyMat);
    this.parts.blLeg.position.set(-0.5, 0.45, -0.7);
    this.mesh.add(this.parts.blLeg);

    this.parts.brLeg = new THREE.Mesh(legGeo, bullBodyMat);
    this.parts.brLeg.position.set(0.5, 0.45, -0.7);
    this.mesh.add(this.parts.brLeg);
  }

  /**
   * 玩家磕碰失误，神牛瞬间逼近并在身后狂顶咆哮！
   */
  triggerStumbleEnrage() {
    this.isEnraged = true;
    this.enrageTimer = 4.5; // 持续紧逼 4.5 秒，期间再失误直接挂
    this.targetDistance = this.closeDistance;
    Audio.playBullRoar();
    Audio.playStumble();
  }

  update(delta, player, gameSpeed) {
    this.animTime += delta * gameSpeed;

    // 倒计时恢复安全距离
    if (this.isEnraged) {
      this.enrageTimer -= delta;
      if (this.enrageTimer <= 0) {
        this.isEnraged = false;
        this.targetDistance = this.normalDistance;
      }
    }

    // 插值更新与玩家的相对距离与轨道 X 轴
    this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, this.targetDistance, delta * 3.5);
    this.mesh.position.z = player.mesh.position.z + this.currentDistance;

    // 牛跟随玩家的换轨，但有稍微的滞后感更逼真
    this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, player.mesh.position.x, delta * 10);

    // 奔跑动作（四足狂暴交替摆动 + 头部上下怒拱）
    const gallop = Math.sin(this.animTime * 14);
    this.parts.flLeg.rotation.x = gallop * 0.9;
    this.parts.brLeg.rotation.x = gallop * 0.9;
    this.parts.frLeg.rotation.x = -gallop * 0.9;
    this.parts.blLeg.rotation.x = -gallop * 0.9;

    // 头低下来怒冲的姿态
    this.parts.head.rotation.x = 0.25 + Math.sin(this.animTime * 14) * 0.15;
  }

  reset() {
    this.isEnraged = false;
    this.enrageTimer = 0;
    this.targetDistance = this.normalDistance;
    this.currentDistance = this.normalDistance;
    this.mesh.position.set(0, 0, this.normalDistance);
  }
}
