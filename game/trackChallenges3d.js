import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';
import { Coin3D } from './obstacles3d.js';

export const CHALLENGE_RULES = {
    store: { title: '夜宵订单', instruction: '沿中间道收集 3 枚金币', hit: '金币收好', length: 205 },
    tea: { title: '泡泡航线', instruction: '回到中间道，踩珍珠垫穿过 3 个空中泡泡', hit: '泡泡命中', length: 140 },
    pond: { title: '荷塘三连拍', instruction: '跟着地板提示：左 → 中 → 右，踩中 3 个节拍', hit: '踩中节拍', length: 205 },
    laundry: { title: '云上收袜子', instruction: '中间道踩暖风口，或沿坡登台，收齐 3 只袜子', hit: '袜子收好', length: 140 },
};

export function crossedCheckpoint(previousZ, z, checkpointZ) {
    return z >= previousZ && previousZ < checkpointZ && z >= checkpointZ;
}

/** A support surface, rather than a damage collider: its two side lanes remain clear. */
export class ChallengeSupport3D {
    constructor(scene, kit) {
        this.scene = scene; this.lane = 0; this.height = CONFIG.WORLD.RAMP_HEIGHT;
        this.safeSupport = true;
        this.rampLength = CONFIG.WORLD.RAMP_LENGTH; this.length = 91.5;
        this.width = CONFIG.WORLD.TRAIN_WIDTH * .95;
        this.mesh = new THREE.Group(); this.mesh.name = 'safeLaundryDryingDeck';
        this.mesh.add(kit.create('ramp', { width: this.width, height: this.height, length: this.rampLength }));
        const platform = kit.create('platform', { width: this.width, height: this.height, length: 80 });
        platform.position.z = this.rampLength; this.mesh.add(platform);
        this.startZ = 0; this.endZ = this.length;
    }
    reset(startZ) {
        this.startZ = startZ; this.endZ = startZ + this.length;
        this.mesh.position.set(0, 0, startZ); this.scene.add(this.mesh);
    }
    getHeightAtZ(z) {
        if (z < this.startZ || z > this.endZ) return null;
        return Math.min(1, (z - this.startZ) / this.rampLength) * this.height;
    }
    destroy() { this.scene.remove(this.mesh); }
}

/** Reuses the theme's low-poly geometry and materials; detached segments are pooled. */
export class TrackChallengeKit {
    constructor(scene, visualKit) { this.scene = scene; this.visualKit = visualKit; this.pool = []; }
    acquire(startZ) {
        let challenge = this.pool.find(segment => !segment.inUse);
        if (!challenge) { challenge = new TrackChallenge3D(this.scene, this.visualKit); this.pool.push(challenge); }
        challenge.reset(startZ); return challenge;
    }
    clear() { for (const segment of this.pool) segment.destroy(); }
    dispose() { this.clear(); this.pool.length = 0; }
}

export class TrackChallenge3D {
    constructor(scene, kit) {
        this.scene = scene; this.kit = kit; this.type = kit.id; this.rule = CHALLENGE_RULES[this.type];
        this.mesh = new THREE.Group(); this.mesh.name = `${this.type}-trackChallenge`;
        this.targets = []; this.inUse = false;
        this.state = { id: '', title: this.rule.title, instruction: this.rule.instruction, total: 3,
            completed: 0, combo: 0, feedback: '', active: true, progress: 0, remaining: 3, reward: 0 };
        this.support = this.type === 'laundry' ? new ChallengeSupport3D(scene, kit) : null;
        this.build();
    }
    build() {
        const kit = this.kit;
        // A wide flat start line announces the reward segment without blocking movement.
        kit.part(this.mesh, 'box', 'trim', [0, .014, 0], [CONFIG.LANE_WIDTH * 2.9, .022, .8], [0, 0, 0], false);
        for (const side of [-1, 1]) {
            kit.part(this.mesh, 'box', 'dark', [side * 5.6, .9, 4], [.16, 1.8, .16]);
            kit.part(this.mesh, 'box', 'trim', [side * 5.6, 1.8, 4], [.95, .8, .1]);
            kit.part(this.mesh, 'arrow', 'mark', [side * 5.6, 1.8, 3.93], [.7, .7, .7], [0, 0, Math.PI / 2], false);
        }
        if (this.type === 'tea' || this.type === 'laundry') {
            this.launchMesh = kit.create('feature', {}); this.launchMesh.position.z = 30;
            this.mesh.add(this.launchMesh);
        }
        for (let index = 0; index < 3; index++) {
            const visual = new THREE.Group(); visual.name = `${this.type}-checkpoint-${index + 1}`;
            const target = { index, lane: this.type === 'pond' ? index - 1 : 0, z: 0, y: 0,
                processed: false, hit: false, visual, markers: [] };
            if (this.type === 'store') {
                // Reuse the familiar gold pickup instead of a harmless beam
                // that looks like the real slide obstacles elsewhere on the track.
                target.coin = new Coin3D(this.scene, 0, 0, 0);
                target.coin.mesh.name = 'store-orderCoin';
                visual.add(target.coin.mesh);
            } else if (this.type === 'tea') {
                target.markers.push(kit.part(visual, 'ring', 'trim', [0, 0, 0], [1.55, 1.55, 1.55], [0, 0, 0], false));
                kit.part(visual, 'ring', 'cream', [0, 0, -.04], [1.36, 1.36, 1.36], [0, 0, 0], false);
                kit.part(visual, 'sphere', 'cream', [-.72, .72, -.03], [.16, .16, .16], [0, 0, 0], false);
            } else if (this.type === 'pond') {
                target.markers.push(kit.part(visual, 'cylinder', 'trim', [0, .03, 0], [1.18, .065, 1.18], [0, 0, 0], false));
                kit.part(visual, 'ring', 'cream', [0, .08, 0], [1.01, 1.01, 1.01], [Math.PI / 2, 0, 0], false);
                kit.part(visual, 'box', 'cream', [-.17, .085, .08], [.14, .018, .95], [0, 0, 0], false);
                kit.part(visual, 'box', 'cream', [.17, .085, .08], [.14, .018, .95], [0, 0, 0], false);
                kit.part(visual, 'arrow', 'mark', [0, .095, -3], [1.35, 1.35, 1.35], [Math.PI / 2, 0, index === 0 ? -Math.PI / 2 : index === 2 ? Math.PI / 2 : 0], false);
            } else {
                target.markers.push(kit.part(visual, 'box', 'trim', [.04, .17, 0], [.43, .75, .15], [0, 0, .12], false));
                target.markers.push(kit.part(visual, 'box', 'trim', [-.2, -.19, 0], [.8, .3, .17], [0, 0, .12], false));
                kit.part(visual, 'box', 'cream', [.09, .51, -.025], [.44, .12, .18], [0, 0, .12], false);
                kit.part(visual, 'ring', 'cream', [0, 0, .06], [1.04, 1.04, 1.04], [0, 0, 0], false);
            }
            // Three floor dots and chevrons let players see the sequence before reaching it.
            if (this.type !== 'store') for (let dot = 0; dot <= index; dot++) kit.part(visual, 'box', 'cream', [(dot - index / 2) * .3, this.type === 'pond' ? .092 : -.65, -.45], [.15, .022, .15], [0, 0, 0], false);
            this.mesh.add(visual); this.targets.push(target);
        }
    }
    reset(startZ) {
        this.startZ = startZ; this.endZ = startZ + this.rule.length; this.length = this.rule.length;
        this.launchZ = startZ + 30; this.launched = false; this.launchAttempted = false; this.inUse = true;
        this.pendingReward = 0; this.feedbackTime = 0;
        Object.assign(this.state, { id: `${this.type}:${startZ}`, completed: 0, combo: 0, feedback: '',
            active: true, progress: 0, remaining: 3, reward: 0, instruction: this.rule.instruction });
        this.mesh.position.set(0, 0, startZ); this.scene.add(this.mesh);
        for (const target of this.targets) {
            target.z = this.type === 'store' || this.type === 'pond'
                ? startZ + 55 + target.index * 55 : this.launchZ + 36 + target.index * 19;
            target.y = this.type === 'tea' ? 3.9 : this.type === 'laundry' ? 3.25 : this.type === 'store' ? .9 : 0;
            target.processed = false; target.hit = false; target.visual.scale.setScalar(1);
            if (target.coin) {
                target.coin.collected = false;
                target.coin.mesh.rotation.set(0, 0, 0);
                target.coin.mesh.position.set(0, 0, 0);
            }
            for (const marker of target.markers) marker.material = this.kit.materials.trim;
            this.positionTarget(target);
        }
        this.support?.reset(this.launchZ + 1);
    }
    positionTarget(target) {
        target.visual.position.set(-target.lane * CONFIG.LANE_WIDTH, target.y, target.z - this.startZ);
    }
    launch(speed, player) {
        this.launched = true; player.jump();
        const force = this.type === 'tea' ? 19 : 17.5;
        const launchHeight = player.y;
        player.vy = force; player.isGrounded = false;
        for (const target of this.targets) {
            const t = [.30, .55, .80][target.index];
            target.z = player.z + speed * t;
            const ballisticHeight = launchHeight + force * t - .5 * CONFIG.PLAYER.GRAVITY * t * t;
            const supportHeight = this.support?.getHeightAtZ(target.z) ?? 0;
            target.y = Math.max(ballisticHeight, supportHeight) + .8;
            this.positionTarget(target);
        }
        this.state.instruction = this.type === 'tea' ? '保持中间道，穿过空中的 3 个泡泡' : '保持中间道，收袜子后落在晾衣台';
        this.state.feedback = this.type === 'tea' ? '珍珠起飞！' : '暖风托举！'; this.feedbackTime = .9;
    }
    update(dt, speed, player, previous) {
        if (!this.inUse || player.z < this.startZ - 30 || player.z > this.endZ + 16) return 0;
        if (player.props.flight > 0) {
            for (const target of this.targets) if (!target.processed && target.z <= player.z) {
                target.processed = true; this.state.remaining--; this.state.combo = 0;
            }
            if (player.z >= this.launchZ) this.launchAttempted = true;
            this.state.active = this.state.remaining > 0; this.state.feedback = ''; this.feedbackTime = 0;
            return 0;
        }
        this.feedbackTime -= dt;
        if (this.feedbackTime <= 0) this.state.feedback = '';
        for (const target of this.targets) target.coin?.update(dt);
        this.state.progress = Math.max(0, Math.min(1, (player.z - this.startZ) / this.length));
        if ((this.type === 'tea' || this.type === 'laundry') && !this.launchAttempted &&
            crossedCheckpoint(previous.z, player.z, this.launchZ)) {
            this.launchAttempted = true;
            const portion = (this.launchZ - previous.z) / Math.max(.0001, player.z - previous.z);
            const x = previous.x + (player.x - previous.x) * portion;
            const y = previous.y + (player.y - previous.y) * portion;
            // At high speed a frame can finish on the following ramp; evaluate the pad itself.
            if (Math.abs(x) < 1.12 && y < .28 && player.isGrounded) this.launch(speed, player);
        }
        for (const target of this.targets) {
            if (target.processed || !crossedCheckpoint(previous.z, player.z, target.z)) continue;
            target.processed = true;
            const portion = (target.z - previous.z) / Math.max(.0001, player.z - previous.z);
            const x = previous.x + (player.x - previous.x) * portion;
            const y = previous.y + (player.y - previous.y) * portion;
            const inLane = Math.abs(x + target.lane * CONFIG.LANE_WIDTH) < 1.12;
            const hit = inLane && (this.type === 'pond' ? y < .28 : Math.abs(y + .8 - target.y) < 1.25);
            target.hit = hit;
            if (hit) {
                this.state.completed++; this.state.combo++; this.pendingReward += 2; this.state.reward += 2;
                this.state.feedback = `${this.rule.hit} ${this.state.completed}/3 · +2 金币`;
                for (const marker of target.markers) marker.material = this.kit.materials.feature;
                if (target.coin) { target.coin.collected = true; target.visual.scale.setScalar(0); }
                if (this.type === 'tea' || this.type === 'laundry') target.visual.scale.setScalar(.32);
                if (this.state.completed === 3) {
                    this.pendingReward += 12; this.state.reward += 12;
                    this.state.feedback = '三连完成！额外 +12 金币';
                }
            } else { this.state.combo = 0; this.state.feedback = '错过这一点，继续试下一点'; }
            this.feedbackTime = 1.6;
            this.state.remaining = this.targets.filter(point => !point.processed).length;
        }
        this.state.active = this.state.remaining > 0;
        const reward = this.pendingReward; this.pendingReward = 0; return reward;
    }
    destroy() { this.inUse = false; this.scene.remove(this.mesh); this.support?.destroy(); }
}
