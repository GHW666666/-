import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../libs/three.module.js';
import { NailongCharacter } from '../game/character3d.js';

const character = new NailongCharacter();
const geometry = character.bodyMesh.geometry;

test('torso and both arms form one closed, connected skin', () => {
    const count = geometry.attributes.position.count;
    const edges = new Map(), parent = Array.from({ length: count }, (_, i) => i);
    const root = i => {
        while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
        return i;
    };
    for (let i = 0; i < geometry.index.count; i += 3) {
        const triangle = [geometry.index.getX(i), geometry.index.getX(i + 1), geometry.index.getX(i + 2)];
        for (let j = 0; j < 3; j++) {
            let a = triangle[j], b = triangle[(j + 1) % 3];
            parent[root(a)] = root(b);
            if (a > b) [a, b] = [b, a];
            const key = a * count + b;
            edges.set(key, (edges.get(key) || 0) + 1);
        }
    }
    assert.ok([...edges.values()].every(uses => uses === 2), 'skin has an open or nonmanifold edge');
    assert.equal(new Set(parent.map((_, i) => root(i))).size, 1, 'shoulder is a separate component');
});

test('skin weights remain normalized and the abdomen stays anchored', () => {
    const weights = geometry.attributes.skinWeight;
    for (let i = 0; i < weights.count; i++) {
        const a = weights.getX(i), b = weights.getY(i);
        assert.ok(a >= 0 && b >= 0 && Math.abs(a + b - 1) < 1e-6);
    }
    assert.equal(character.surface.armWeight(0, 1.06, character.frontSurface(0, 1.06)), 0);
    const wrist = character.surface.armWrist;
    assert.equal(character.surface.armWeight(wrist.x, wrist.y, wrist.z + .06), 1);
});

test('the torso broadens from the shoulders toward the lower abdomen', () => {
    const position = geometry.attributes.position;
    const widthAt = height => {
        let halfWidth = 0;
        for (let i = 0; i < position.count; i++) {
            // A plane through the torso excludes the bent forearms in front.
            if (Math.abs(position.getY(i) - height) < .014 && position.getZ(i) < .10) {
                halfWidth = Math.max(halfWidth, Math.abs(position.getX(i)));
            }
        }
        return halfWidth * 2;
    };
    const widths = [1.54, 1.36, 1.20, 1.075].map(widthAt);
    for (let i = 1; i < widths.length; i++) {
        assert.ok(widths[i] > widths[i - 1], 'upper body is wider than the abdomen below it');
    }
    assert.ok(character.frontSurface(0, 1.075) > character.frontSurface(0, 1.54) * 1.3,
        'the lower abdomen needs more forward volume than the chest');
});

test('the crown stays rounded at the measured reference height', () => {
    const position = geometry.attributes.position;
    const widthAt = y => {
        let halfWidth = 0;
        for (let i = 0; i < geometry.index.count; i += 3) {
            for (let j = 0; j < 3; j++) {
                const a = geometry.index.getX(i + j), b = geometry.index.getX(i + (j + 1) % 3);
                const ay = position.getY(a), by = position.getY(b);
                if ((ay - y) * (by - y) <= 0 && ay !== by) {
                    const x = THREE.MathUtils.lerp(position.getX(a), position.getX(b), (y - ay) / (by - ay));
                    halfWidth = Math.max(halfWidth, Math.abs(x));
                }
            }
        }
        return halfWidth * 2;
    };
    // The reference retains about 58% of its head width just below the crown;
    // the previous pointed cap narrowed to about 38% at the same landmark.
    const ratio = widthAt(2.15) / widthAt(1.93);
    assert.ok(ratio > .54 && ratio < .64, `pointed or flattened crown: ${ratio}`);
});

test('greeting, interaction, running, jumping and sliding keep finite skin vertices', () => {
    const poses = [
        () => { character.setLobbyMode(true); character.lobbyTime = 2.8; character.updateLobby(.016); },
        () => { character.triggerInteract(); character.updateLobby(.45); },
        () => { character.setLobbyMode(false); character.animateRun(.15, 16); },
        () => character.animateJump(.016, 2),
        () => character.animateSlide(.016)
    ];
    const vertex = new THREE.Vector3();
    for (const pose of poses) {
        pose();
        character.group.updateMatrixWorld(true);
        character.skeleton.update();
        for (let i = 0; i < geometry.attributes.position.count; i += 37) {
            character.bodyMesh.getVertexPosition(i, vertex);
            assert.ok(vertex.toArray().every(Number.isFinite));
        }
    }
});

test('running hands visibly counter-swing with the legs while their skinned wrists stay joined', () => {
    const restWrist = new THREE.Vector3(character.surface.armWrist.x, character.surface.armWrist.y, character.surface.armWrist.z);
    let wristIndex = -1, closest = Infinity;
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
        if (v.x <= 0 || geometry.attributes.skinWeight.getY(i) < .95) continue;
        const distance = v.distanceToSquared(restWrist);
        if (distance < closest) { closest = distance; wristIndex = i; }
    }
    assert.ok(wristIndex >= 0);
    for (const speed of [26, 56, 65]) {
        character.setLobbyMode(false); character.resetPoses(); character.runCycle = 0;
        const samples = [], dt = Math.PI * 2 / (Math.min(speed * .38, 18) * 32);
        for (let i = 0; i < 32; i++) {
            character.animateRun(dt, speed); character.group.updateMatrixWorld(true); character.skeleton.update();
            // Around the relaxed running pose, each arm moves opposite its same-side leg.
            assert.ok((character.leftArm.rotation.x - .35) * character.leftLeg.rotation.x <= 0);
            assert.ok((character.rightArm.rotation.x - .35) * character.rightLeg.rotation.x <= 0);
            const left = character.leftArm.children[0].getWorldPosition(new THREE.Vector3());
            const right = character.rightArm.children[0].getWorldPosition(new THREE.Vector3());
            const wrist = character.bodyMesh.getVertexPosition(wristIndex, new THREE.Vector3());
            character.bodyMesh.localToWorld(wrist);
            assert.ok(wrist.distanceTo(left) < .08, 'swing detached the visible hand from its skinned wrist');
            samples.push({ left, right });
        }
        for (const side of ['left', 'right']) {
            const values = axis => samples.map(s => s[side][axis]);
            const travel = axis => Math.max(...values(axis)) - Math.min(...values(axis));
            assert.ok(travel('x') > .07, 'hands remain tucked behind the belly in the rear view');
            assert.ok(travel('y') > .30, 'vertical hand motion is too small to see');
            assert.ok(travel('z') > .20, 'forward/back hand motion is missing');
        }
    }
});
