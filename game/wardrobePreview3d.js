import * as THREE from '../libs/three.module.js';

/** A fitting stage using the existing player and WebGL renderer. */
export class WardrobePreview3D {
    constructor(world, player, element) {
        this.world = world; this.player = player; this.element = element;
        this.angle = 0; this.targetAngle = 0; this.active = false;
        this.size = new THREE.Vector2();
        this.accessoryBounds = new THREE.Box3();
        this.paper = new THREE.Color(0xf4eee2);
        this.stand = new THREE.Mesh(new THREE.CylinderGeometry(.85, .89, .05, 40),
            new THREE.MeshStandardMaterial({ color: 0xdedccc, roughness: .88 }));
        this.stand.name = 'wardrobeFittingStand';
        this.stand.position.y = -.03; this.stand.receiveShadow = true;
        this.stand.visible = false; world.scene.add(this.stand);
    }

    open() {
        if (this.active) return;
        const { scene, camera, renderer } = this.world;
        this.original = { background: scene.background, fog: scene.fog,
            clearColor: renderer.getClearColor(new THREE.Color()), clearAlpha: renderer.getClearAlpha(),
            fov: camera.fov, aspect: camera.aspect, position: camera.position.clone(), quaternion: camera.quaternion.clone(),
            visibility: new Map(scene.children.map(node => [node, node.visible])) };
        for (const node of scene.children) node.visible = node.isLight || node === this.player.character.group;
        this.stand.visible = true;
        scene.background = this.paper; scene.fog = null;
        this.angle = this.targetAngle = 0; this.active = true;
    }

    rotate(delta) { if (Number.isFinite(delta)) this.targetAngle += delta; }
    resetAngle() { this.targetAngle = 0; }

    render(dt) {
        if (!this.active) return;
        const { renderer, camera, scene } = this.world;
        const canvas = renderer.domElement.getBoundingClientRect(), rect = this.element.getBoundingClientRect();
        renderer.getSize(this.size);
        const width = Math.max(1, Math.min(this.size.x, rect.width - 24));
        const height = Math.max(1, Math.min(this.size.y, rect.height - 76));
        const x = Math.max(0, rect.left - canvas.left + 12);
        const y = Math.max(0, this.size.y - (rect.top - canvas.top + height));
        this.angle += (this.targetAngle - this.angle) * (1 - Math.exp(-Math.max(0, dt) * 14));
        const character = this.player.character;
        character.group.rotation.set(0, Math.PI + this.angle, 0);
        character.group.scale.setScalar(.84);
        camera.fov = 42; camera.aspect = width / height; camera.updateProjectionMatrix();
        // Include the taller hats and antennae without measuring the skinned torso.
        character.group.updateMatrixWorld(true);
        const accessories = character.outfits.accessories[character.outfits.skinId];
        const top = accessories
            ? Math.max(1.96, this.accessoryBounds.setFromObject(accessories).max.y + .06)
            : 1.96;
        const tan = Math.tan(THREE.MathUtils.degToRad(21));
        const distance = Math.max(3.35, 1.05 / (tan * camera.aspect), top / (2 * tan * .84));
        const center = top / 2;
        camera.position.set(0, center + .06, -distance); camera.lookAt(0, center, 0);
        const autoClear = renderer.autoClear;
        renderer.setScissorTest(false); renderer.setViewport(0, 0, this.size.x, this.size.y);
        renderer.setClearColor(this.paper, 1); renderer.clear();
        renderer.setViewport(x, y, width, height); renderer.setScissor(x, y, width, height); renderer.setScissorTest(true);
        renderer.autoClear = false; renderer.render(scene, camera);
        renderer.autoClear = autoClear; renderer.setScissorTest(false);
        renderer.setViewport(0, 0, this.size.x, this.size.y);
    }

    close() {
        if (!this.active) return;
        const { scene, camera, renderer } = this.world, saved = this.original;
        for (const [node, visible] of saved.visibility) node.visible = visible;
        scene.background = saved.background; scene.fog = saved.fog;
        camera.fov = saved.fov; camera.aspect = saved.aspect;
        camera.position.copy(saved.position); camera.quaternion.copy(saved.quaternion); camera.updateProjectionMatrix();
        renderer.setScissorTest(false); renderer.setClearColor(saved.clearColor, saved.clearAlpha);
        this.active = false; this.original = null;
    }

    dispose() {
        this.close(); this.world.scene.remove(this.stand);
        this.stand.geometry.dispose(); this.stand.material.dispose();
    }
}
