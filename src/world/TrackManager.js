/**
 * TrackManager.js
 * 三轨道无限跑酷跑道生成与地形分块循环系统
 */

import * as THREE from 'three';
import { LANES } from '../entities/BabyPlayer.js';
import { Obstacle, OBSTACLE_TYPES } from '../entities/Obstacle.js';
import { Collectible, ITEM_TYPES } from '../entities/Collectible.js';

export class TrackManager {
  constructor(scene) {
    this.scene = scene;

    this.segmentLength = 60;
    this.segmentCount = 5;
    this.segments = [];

    this.obstacles = [];
    this.collectibles = [];

    this.nextSpawnZ = 30; // 下一个障碍物生成的 Z 坐标
    this.currentTrackZ = 0; // 当前最高跑道铺设位置

    this.createMaterials();
    this.initTracks();
  }

  createMaterials() {
    this.roadMat = new THREE.MeshLambertMaterial({ color: 0x2c3437 });     // 柏油/轨道地面
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });       // 车道虚线
    this.railMat = new THREE.MeshLambertMaterial({ color: 0x78909c });     // 铁轨金属色
    this.sideWallMat = new THREE.MeshLambertMaterial({ color: 0x37474f }); // 两侧护栏墙
    this.buildingMat1 = new THREE.MeshLambertMaterial({ color: 0xef5350 });// 背景卡通积木红
    this.buildingMat2 = new THREE.MeshLambertMaterial({ color: 0x42a5f5 });// 背景卡通积木蓝
    this.buildingMat3 = new THREE.MeshLambertMaterial({ color: 0x66bb6a });// 背景卡通积木绿
  }

  initTracks() {
    for (let i = 0; i < this.segmentCount; i++) {
      const zPos = i * this.segmentLength;
      const segment = this.createSegment(zPos);
      this.segments.push(segment);
      this.scene.add(segment);
      this.currentTrackZ = zPos;
    }
  }

  createSegment(zOffset) {
    const group = new THREE.Group();
    group.position.z = zOffset;

    // 1. 地面主跑道 (宽 8.6 米，长 60 米)
    const roadGeo = new THREE.PlaneGeometry(8.6, this.segmentLength);
    const road = new THREE.Mesh(roadGeo, this.roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, this.segmentLength / 2);
    group.add(road);

    // 2. 铁轨 / 轨道分隔线
    [-1.2, 1.2].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(0.12, this.segmentLength);
      const line = new THREE.Mesh(lineGeo, this.lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.01, this.segmentLength / 2);
      group.add(line);
    });

    // 左右护栏边缘
    [-4.3, 4.3].forEach(x => {
      const wallGeo = new THREE.BoxGeometry(0.3, 1.2, this.segmentLength);
      const wall = new THREE.Mesh(wallGeo, this.sideWallMat);
      wall.position.set(x, 0.6, this.segmentLength / 2);
      group.add(wall);
    });

    // 3. 两侧卡通建筑与路灯剪影（营造繁华跑酷都市感）
    for (let b = 0; b < 6; b++) {
      const bZ = b * 10 + 5;
      const bHeight = 4 + (b % 4) * 3;
      const mat = [this.buildingMat1, this.buildingMat2, this.buildingMat3][b % 3];

      // 左侧建筑
      const bGeoL = new THREE.BoxGeometry(3, bHeight, 8);
      const bL = new THREE.Mesh(bGeoL, mat);
      bL.position.set(-6.5, bHeight / 2, bZ);
      group.add(bL);

      // 右侧建筑
      const bGeoR = new THREE.BoxGeometry(3, bHeight + 1, 8);
      const bR = new THREE.Mesh(bGeoR, mat);
      bR.position.set(6.5, (bHeight + 1) / 2, bZ);
      group.add(bR);
    }

    return group;
  }

  update(playerZ, delta, isInvincible) {
    // 1. 无限跑道分块回收与向前铺设
    const recycleThreshold = playerZ - this.segmentLength;
    this.segments.forEach(seg => {
      if (seg.position.z < recycleThreshold) {
        seg.position.z = this.currentTrackZ + this.segmentLength;
        this.currentTrackZ = seg.position.z;
      }
    });

    // 2. 动态生成前方障碍物与收集品（保持前方 150 米都有内容）
    while (this.nextSpawnZ < playerZ + 150) {
      this.spawnPattern(this.nextSpawnZ);
      this.nextSpawnZ += 18 + Math.random() * 8; // 随机间距 18 - 26 米
    }

    // 3. 回收视野后方的障碍物
    const cleanupZ = playerZ - 20;
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.z < cleanupZ || obs.isDestroyed) {
        this.scene.remove(obs.mesh);
        return false;
      }
      return true;
    });

    // 4. 回收视野后方的收集物
    this.collectibles = this.collectibles.filter(item => {
      if (item.mesh.position.z < cleanupZ || item.isCollected) {
        this.scene.remove(item.mesh);
        return false;
      }
      return true;
    });
  }

  /**
   * 经典地铁跑酷模式随机生成器
   */
  spawnPattern(z) {
    const patternType = Math.floor(Math.random() * 6);

    switch (patternType) {
      case 0:
        // 模式 0：某一条道有低障碍，上方带弧形奶瓶，引导玩家跳跃
        this.spawnLowJumpPattern(z);
        break;

      case 1:
        // 模式 1：高障碍，引导玩家滑铲穿过
        this.spawnSlidePattern(z);
        break;

      case 2:
        // 模式 2：双道堵死（全阻挡车厢），留一条生路让玩家紧急换道！
        this.spawnDodgePattern(z);
        break;

      case 3:
        // 模式 3：带斜坡的列车，车顶铺满金币
        this.spawnRampPattern(z);
        break;

      case 4:
        // 模式 4：珍稀道具生成（吸奶器磁铁 / 窜天猴 / “牛来！”神牛令）
        this.spawnPowerupPattern(z);
        break;

      case 5:
        // 模式 5：连串奶瓶阵（S型或整齐排列）
        this.spawnCoinsLine(z);
        break;
    }
  }

  spawnLowJumpPattern(z) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = LANES[laneIdx];

    // 低矮路障
    const obs = new Obstacle(OBSTACLE_TYPES.LOW, laneX, z);
    this.obstacles.push(obs);
    this.scene.add(obs.mesh);

    // 跳跃弧线奶瓶（越过障碍物）
    for (let i = -2; i <= 2; i++) {
      const bottleZ = z + i * 2.2;
      const bottleY = 1.0 + (1 - Math.abs(i) * 0.3) * 1.6;
      const bottle = new Collectible(ITEM_TYPES.MILK, laneX, bottleY, bottleZ);
      this.collectibles.push(bottle);
      this.scene.add(bottle.mesh);
    }
  }

  spawnSlidePattern(z) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = LANES[laneIdx];

    const obs = new Obstacle(OBSTACLE_TYPES.HIGH, laneX, z);
    this.obstacles.push(obs);
    this.scene.add(obs.mesh);

    // 贴地奶瓶，提示玩家滑铲拾取
    for (let i = -1; i <= 1; i++) {
      const bottle = new Collectible(ITEM_TYPES.MILK, laneX, 0.4, z + i * 2.5);
      this.collectibles.push(bottle);
      this.scene.add(bottle.mesh);
    }
  }

  spawnDodgePattern(z) {
    const openLaneIdx = Math.floor(Math.random() * 3); // 唯一安全的通路

    for (let i = 0; i < 3; i++) {
      if (i !== openLaneIdx) {
        const obs = new Obstacle(OBSTACLE_TYPES.BLOCK, LANES[i], z);
        this.obstacles.push(obs);
        this.scene.add(obs.mesh);
      } else {
        // 安全通道放置几个指引奶瓶
        for (let k = -2; k <= 2; k++) {
          const bottle = new Collectible(ITEM_TYPES.MILK, LANES[i], 0.8, z + k * 2.2);
          this.collectibles.push(bottle);
          this.scene.add(bottle.mesh);
        }
      }
    }
  }

  spawnRampPattern(z) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = LANES[laneIdx];

    const obs = new Obstacle(OBSTACLE_TYPES.RAMP, laneX, z);
    this.obstacles.push(obs);
    this.scene.add(obs.mesh);

    // 车顶金币
    for (let i = 0; i < 3; i++) {
      const bottle = new Collectible(ITEM_TYPES.MILK, laneX, 2.7, z + i * 2.0);
      this.collectibles.push(bottle);
      this.scene.add(bottle.mesh);
    }
  }

  spawnPowerupPattern(z) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = LANES[laneIdx];

    const powerTypes = [ITEM_TYPES.BULL, ITEM_TYPES.MAGNET, ITEM_TYPES.JETPACK];
    // 概率上“牛来”神牛令牌占更核心好玩的比例
    const pickedType = powerTypes[Math.floor(Math.random() * powerTypes.length)];

    const item = new Collectible(pickedType, laneX, 1.2, z);
    this.collectibles.push(item);
    this.scene.add(item.mesh);
  }

  spawnCoinsLine(z) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = LANES[laneIdx];

    for (let i = 0; i < 6; i++) {
      const bottle = new Collectible(ITEM_TYPES.MILK, laneX, 0.8, z + i * 2.0);
      this.collectibles.push(bottle);
      this.scene.add(bottle.mesh);
    }
  }

  reset() {
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.collectibles.forEach(c => this.scene.remove(c.mesh));
    this.obstacles = [];
    this.collectibles = [];
    this.nextSpawnZ = 30;
  }
}
