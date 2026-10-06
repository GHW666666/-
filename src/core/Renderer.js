/**
 * Renderer.js
 * Three.js 场景渲染器、光照、迷雾与第三人称相机追随系统
 */

import * as THREE from 'three';

export class Renderer {
  constructor(container) {
    this.container = container || document.body;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // 晴朗蔚蓝天空
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 160); // 远景自然迷雾消隐

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. 经典地铁跑酷追随相机 (稍后方、偏高仰视前方)
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 300);
    this.cameraOffset = new THREE.Vector3(0, 4.2, -6.8); // 相对主角的相机偏移
    this.cameraLookOffset = new THREE.Vector3(0, 1.4, 8.0); // 相机注视点前方

    // 2. 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (this.container.appendChild) {
      this.container.appendChild(this.renderer.domElement);
    }

    this.setupLighting();
    this.setupResize();
  }

  setupLighting() {
    // 半球光 (天空浅蓝 + 地面浅暖黄)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 主平行阳光
    const dirLight = new THREE.DirectionalLight(0xfff4e6, 1.0);
    dirLight.position.set(15, 35, -20);
    this.scene.add(dirLight);

    // 辅助环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  /**
   * 相机丝滑跟随主角
   */
  updateCamera(player, delta) {
    const targetX = player.currentX * 0.45; // 相机横向跟随幅度稍小，强化变道视觉冲击
    const targetY = player.mesh.position.y + this.cameraOffset.y;
    const targetZ = player.mesh.position.z + this.cameraOffset.z;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, delta * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, delta * 12);
    this.camera.position.z = targetZ;

    // 视线注视玩家正前方道路
    const lookAtPos = new THREE.Vector3(
      this.camera.position.x * 0.6,
      player.mesh.position.y + this.cameraLookOffset.y,
      player.mesh.position.z + this.cameraLookOffset.z
    );
    this.camera.lookAt(lookAtPos);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
