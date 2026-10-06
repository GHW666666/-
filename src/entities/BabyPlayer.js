/**
 * BabyPlayer.js
 * 主角【奶娃】：魔性大头萌娃 3D 模型与物理控制系统
 */

import * as THREE from 'three';
import { Audio } from '../platform/AudioSynth.js';

export const LANES = [-2.4, 0, 2.4]; // 三条轨道的 X 坐标

export class BabyPlayer {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // 状态与属性
    this.lane = 1; // 0: 左, 1: 中, 2: 右
    this.targetX = LANES[1];
    this.currentX = LANES[1];
    this.y = 0;
    this.z = 0;

    // 物理参数
    this.velocityY = 0;
    this.gravity = -48;
    this.jumpForce = 16.5;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideDuration = 0.65;
    this.slideTimer = 0;

    // 动画状态
    this.animTime = 0;
    this.isInvincible = false; // 牛来无敌狂暴形态
    this.isFlying = false;     // 窜天猴飞行形态
    this.isMagnet = false;     // 吸奶器吸铁石

    // 身体部位引用（用于骨骼式摆动）
    this.parts = {};

    this.createModel();
    this.scene.add(this.mesh);
  }

  createModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffd1b3 }); // 嫩白肤色
    const redMat = new THREE.MeshLambertMaterial({ color: 0xff2222 });  // 喜庆红肚兜
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff8888 });
    const pacifierMat = new THREE.MeshLambertMaterial({ color: 0x00e5ff }); // 亮青色奶嘴
    const diaperMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // 尿不湿

    // 1. 身体 (圆滚滚的肚子)
    const bodyGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, redMat);
    bodyMesh.position.y = 0.75;
    bodyMesh.scale.set(1, 1.1, 0.95);
    this.mesh.add(bodyMesh);
    this.parts.body = bodyMesh;

    // 尿不湿
    const diaperGeo = new THREE.CylinderGeometry(0.46, 0.42, 0.35, 16);
    const diaperMesh = new THREE.Mesh(diaperGeo, diaperMat);
    diaperMesh.position.y = 0.58;
    this.mesh.add(diaperMesh);

    // 2. 头部 (魔性大头)
    const headGeo = new THREE.SphereGeometry(0.55, 18, 18);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.48;
    this.mesh.add(headMesh);
    this.parts.head = headMesh;

    // 冲天辫 (经典的中国传统小奶娃发型)
    const hairGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x221111 });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.6, 0);
    hairMesh.rotation.z = 0.2;
    headMesh.add(hairMesh);

    // 眼睛
    const eyeGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.2, 0.08, 0.48);
    const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    leftPupil.position.set(0, 0, 0.06);
    leftEye.add(leftPupil);
    headMesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.2, 0.08, 0.48);
    const rightPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    rightPupil.position.set(0, 0, 0.06);
    rightEye.add(rightPupil);
    headMesh.add(rightEye);

    // 腮红
    const cheekGeo = new THREE.CircleGeometry(0.1, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.32, -0.06, 0.46);
    leftCheek.rotation.y = -0.3;
    headMesh.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.32, -0.06, 0.46);
    rightCheek.rotation.y = 0.3;
    headMesh.add(rightCheek);

    // 嘴里的奶嘴 (咬着奶嘴奔跑)
    const pacifierBase = new THREE.TorusGeometry(0.11, 0.035, 8, 16);
    const pacifierMesh = new THREE.Mesh(pacifierBase, pacifierMat);
    pacifierMesh.position.set(0, -0.2, 0.52);
    headMesh.add(pacifierMesh);

    // 3. 四肢 (肉乎乎的小胳膊和小粗腿)
    const limbMat = skinMat;
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.45, 10);
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.42, 10);

    // 左臂
    const leftArm = new THREE.Mesh(armGeo, limbMat);
    leftArm.position.set(-0.55, 0.82, 0);
    this.mesh.add(leftArm);
    this.parts.leftArm = leftArm;

    // 右臂
    const rightArm = new THREE.Mesh(armGeo, limbMat);
    rightArm.position.set(0.55, 0.82, 0);
    this.mesh.add(rightArm);
    this.parts.rightArm = rightArm;

    // 左腿
    const leftLeg = new THREE.Mesh(legGeo, limbMat);
    leftLeg.position.set(-0.25, 0.25, 0);
    this.mesh.add(leftLeg);
    this.parts.leftLeg = leftLeg;

    // 右腿
    const rightLeg = new THREE.Mesh(legGeo, limbMat);
    rightLeg.position.set(0.25, 0.25, 0);
    this.mesh.add(rightLeg);
    this.parts.rightLeg = rightLeg;

    // 4. 牛来狂暴形态特效光环（初始隐藏）
    const auraGeo = new THREE.RingGeometry(0.8, 1.2, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.rotation.x = Math.PI / 2;
    this.auraMesh.position.y = 0.05;
    this.auraMesh.visible = false;
    this.mesh.add(this.auraMesh);

    // 阴影底盘 (圆形假阴影)
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.mesh.add(this.shadowMesh);
  }

  changeLane(dir) {
    if (this.isSliding) return; // 滑铲中也可以变道，但手感更顺滑
    if (dir === -1 && this.lane > 0) {
      this.lane--;
      this.targetX = LANES[this.lane];
      Audio.playLaneChange();
    } else if (dir === 1 && this.lane < 2) {
      this.lane++;
      this.targetX = LANES[this.lane];
      Audio.playLaneChange();
    }
  }

  jump() {
    if (this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      this.isSliding = false;
      Audio.playJump();
    }
  }

  slide() {
    if (!this.isGrounded) {
      // 空中下滑加速落地
      this.velocityY = -28;
      Audio.playSlide();
    } else if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      Audio.playSlide();
    }
  }

  update(delta, gameSpeed) {
    this.animTime += delta * gameSpeed;

    // 1. 水平变道插值 (平滑变道 + 车身侧倾倾角)
    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, delta * 16);
    this.mesh.position.x = this.currentX;

    // 变道倾斜手感
    const rollAngle = (this.targetX - this.currentX) * -0.22;
    this.mesh.rotation.z = rollAngle;
    this.mesh.rotation.y = (this.targetX - this.currentX) * 0.15;

    // 2. 垂直跳跃物理
    if (!this.isGrounded) {
      this.velocityY += this.gravity * delta;
      this.y += this.velocityY * delta;

      if (this.y <= 0) {
        this.y = 0;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }
    this.mesh.position.y = this.y;

    // 3. 滑铲计时
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 假阴影跟随更新
    if (this.shadowMesh) {
      this.shadowMesh.position.y = -this.y + 0.03;
      const shadowScale = Math.max(0.3, 1 - this.y * 0.15);
      this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    }

    // 4. 骨骼动作动画驱动
    this.animateBones(delta);

    // 5. 狂暴特效更新
    if (this.isInvincible && this.auraMesh) {
      this.auraMesh.visible = true;
      this.auraMesh.rotation.z += delta * 6;
      const s = 1 + Math.sin(this.animTime * 10) * 0.2;
      this.auraMesh.scale.set(s, s, s);
    } else if (this.auraMesh) {
      this.auraMesh.visible = false;
    }
  }

  animateBones(delta) {
    if (this.isSliding) {
      // 滑铲动作：压扁倾斜贴地
      this.mesh.scale.set(1.1, 0.45, 1.4);
      this.parts.head.rotation.x = 0.5;
      this.parts.leftArm.rotation.x = 1.2;
      this.parts.rightArm.rotation.x = 1.2;
      this.parts.leftLeg.rotation.x = -1.4;
      this.parts.rightLeg.rotation.x = -1.4;
    } else if (!this.isGrounded) {
      // 空中跳跃动作：张开双臂、双腿欢快乱蹬
      this.mesh.scale.set(1, 1, 1);
      const kick = Math.sin(this.animTime * 18) * 0.6;
      this.parts.leftLeg.rotation.x = -0.5 + kick;
      this.parts.rightLeg.rotation.x = -0.5 - kick;
      this.parts.leftArm.rotation.z = 0.8;
      this.parts.rightArm.rotation.z = -0.8;
      this.parts.head.rotation.x = -0.2;
    } else {
      // 正常地面奔跑：风火轮般摆动小短腿和小肉手
      this.mesh.scale.set(1, 1, 1);
      const runCycle = Math.sin(this.animTime * 12);
      this.parts.leftLeg.rotation.x = runCycle * 0.85;
      this.parts.rightLeg.rotation.x = -runCycle * 0.85;
      this.parts.leftArm.rotation.x = -runCycle * 0.85;
      this.parts.rightArm.rotation.x = runCycle * 0.85;

      // 脑袋萌萌地左右晃动
      this.parts.head.rotation.y = Math.sin(this.animTime * 6) * 0.15;
      this.parts.head.rotation.z = Math.sin(this.animTime * 6) * 0.08;
    }
  }

  /**
   * 获取玩家当前的真实 3D 碰撞盒（AABB）
   */
  getBoundingBox() {
    const box = new THREE.Box3();
    const pos = this.mesh.position;
    if (this.isSliding) {
      // 滑铲时碰撞箱高度降低
      box.min.set(pos.x - 0.45, pos.y, pos.z - 0.6);
      box.max.set(pos.x + 0.45, pos.y + 0.6, pos.z + 0.6);
    } else {
      box.min.set(pos.x - 0.45, pos.y, pos.z - 0.45);
      box.max.set(pos.x + 0.45, pos.y + 1.85, pos.z + 0.45);
    }
    return box;
  }

  reset() {
    this.lane = 1;
    this.targetX = LANES[1];
    this.currentX = LANES[1];
    this.y = 0;
    this.z = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.isInvincible = false;
    this.isFlying = false;
    this.isMagnet = false;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.scale.set(1, 1, 1);
  }
}
