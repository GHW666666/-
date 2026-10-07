/**
 * 奶蛙快跑 - 3D 玩家物理控制器、赛道变道、车顶与引桥攀爬判定
 */
import * as THREE from '../libs/three.module.js';
import { CONFIG } from './config.js';
import { NailongCharacter } from './character3d.js';
import { audio } from './audio.js';
import { platform } from './adapter.js';

export class Player3D {
    constructor(scene) {
        this.scene = scene;
        this.character = new NailongCharacter();
        this.scene.add(this.character.group);

        this.reset();
    }

    reset() {
        this.lane = 0;              // -1 (左), 0 (中), 1 (右)
        this.targetLane = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vy = 0;

        this.isGrounded = true;
        this.isOnRoof = false;      // 是否在火车车顶 (屋顶冲刺)
        this.isSliding = false;
        this.slideTimer = 0;
        this.pendingJumpCompletion = false;
        this.pendingSlideCompletion = false;

        this.targetTilt = 0;
        this.invincibleTimer = 0;
        this.dead = false;
        this.mapFeatureLabel = '';
        this.mapChallengeLabel = '';
        this.flightLandingTimer = 0;
        this.flightBlend = 0;

        // 道具状态
        this.props = {
            milk: 0,
            magnet: 0,
            shoe: 0,
            shield: false,
            flight: 0,
        };

        this.updateMeshPosition();
    }

    setLobbyMode(enable) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.lane = 0;
        this.targetLane = 0;
        this.character.setLobbyMode(enable);
        this.updateMeshPosition();
    }

    updateLobby(dt) {
        this.character.updateLobby(dt);
    }

    triggerInteract() {
        this.character.triggerInteract();
    }

    updateStartTransition(p) {
        this.character.updateStartTransition(p);
    }

    /**
     * 变道控制
     */
    moveLeft() {
        if (this.dead) return;
        if (this.targetLane > -1) {
            this.targetLane -= 1;
            this.targetTilt = -1.0;
            audio.playSwitch();
            platform.vibrate(true);
        } else {
            this.targetTilt = -0.3; // 边界反弹感
        }
    }

    moveRight() {
        if (this.dead) return;
        if (this.targetLane < 1) {
            this.targetLane += 1;
            this.targetTilt = 1.0;
            audio.playSwitch();
            platform.vibrate(true);
        } else {
            this.targetTilt = 0.3;
        }
    }

    /**
     * 跳跃
     */
    jump() {
        if (this.dead || this.isFlying) return;
        this.isSliding = false;
        this.slideTimer = 0;
        this.pendingSlideCompletion = false;

        if (this.isGrounded) {
            const hasShoe = this.props.shoe > 0;
            this.vy = hasShoe ? CONFIG.PLAYER.SUPER_JUMP_FORCE : CONFIG.PLAYER.JUMP_FORCE;
            this.isGrounded = false;
            this.pendingJumpCompletion = true;
            audio.playJump();
            platform.vibrate(true);
        }
    }

    /**
     * 滑铲 / 空中速降
     */
    slide() {
        if (this.dead || this.isFlying) return;
        if (!this.isGrounded) {
            // 空中下划：急速下砸落回地面
            this.vy = -CONFIG.PLAYER.GRAVITY * 1.2;
        }
        this.isSliding = true;
        this.pendingSlideCompletion = true;
        this.slideTimer = CONFIG.PLAYER.SLIDE_DURATION;
        audio.playSlide();
        platform.vibrate(true);
    }

    /**
     * 获得道具
     */
    addProp(type) {
        if (type === 'shield') {
            this.props.shield = true;
        } else if (CONFIG.PROP_DURATION[type.toUpperCase()]) {
            this.props[type] = CONFIG.PROP_DURATION[type.toUpperCase()];
        }
        if (type === 'flight') {
            this.flightLandingTimer = 0;
            this.isSliding = false; this.slideTimer = 0;
            this.isGrounded = false; this.isOnRoof = false; this.vy = 0;
            this.pendingJumpCompletion = this.pendingSlideCompletion = false;
        }
        audio.playProp();
        platform.vibrate(false);
    }

    /**
     * 受击判定
     */
    takeHit() {
        if (this.isFlying) return false;
        // 奶瓶暴走状态：无敌撞飞一切
        if (this.props.milk > 0) {
            return false;
        }
        // 护盾抵消伤害
        if (this.props.shield) {
            this.props.shield = false;
            this.invincibleTimer = 1.5;
            audio.playLaugh();
            platform.vibrate(false);
            return false;
        }
        if (this.invincibleTimer > 0) {
            return false;
        }

        // 判定死亡
        this.dead = true;
        this.pendingJumpCompletion = this.pendingSlideCompletion = false;
        this.character.animateCrash();
        audio.playCrash();
        audio.playLaugh();
        platform.vibrate(false);
        return true;
    }

    /**
     * 物理与状态更新 (结合斜坡与车顶高度场)
     */
    update(dt, speed, obstacles) {
        if (this.dead) return;

        // 1. Z轴前进
        const previousZ = this.z;
        const previousLane = Math.round(-this.x / CONFIG.LANE_WIDTH);
        this.z += speed * dt;

        // 2. X轴平滑变道插值 (注：摄像机朝向+Z，屏幕左侧为+X，屏幕右侧为-X)
        const targetX = -this.targetLane * CONFIG.LANE_WIDTH;
        this.x += (targetX - this.x) * Math.min(1, dt * CONFIG.LANE_SWITCH_SPEED);
        this.targetTilt += (0 - this.targetTilt) * Math.min(1, dt * 6);

        if (this.isFlying) {
            if (this.props.flight > 0) {
                this.props.flight = Math.max(0, this.props.flight - dt);
                this.y += (CONFIG.FLIGHT.HEIGHT - this.y) * (1 - Math.exp(-dt * 7));
                if (this.props.flight === 0) this.flightLandingTimer = CONFIG.FLIGHT.LANDING_DURATION;
            } else {
                const previous = this.flightLandingTimer;
                this.flightLandingTimer = Math.max(0, previous - dt);
                const lane = Math.round(-this.x / CONFIG.LANE_WIDTH);
                let landingHeight = 0;
                for (const ramp of obstacles?.ramps || []) if (ramp.safeSupport && ramp.lane === lane) {
                    landingHeight = Math.max(landingHeight, ramp.getHeightAtZ(this.z) ?? 0);
                }
                this.y = landingHeight + Math.max(0, this.y - landingHeight) * (previous > 0 ? this.flightLandingTimer / previous : 0);
                if (this.flightLandingTimer === 0) {
                    this.y = landingHeight; this.isGrounded = true;
                    this.invincibleTimer = CONFIG.FLIGHT.LANDING_GRACE;
                }
            }
            this.vy = 0; this.isOnRoof = false; this.isSliding = false;
            if (this.props.flight > 0) this.flightBlend += (1 - this.flightBlend) * (1 - Math.exp(-dt * 9));
            else this.flightBlend = Math.min(this.flightBlend, this.flightLandingTimer / (CONFIG.FLIGHT.LANDING_DURATION * .5));
            this.tickProps(dt);
            this.updateMeshPosition();
            this.character.update(dt, speed, { isGrounded: this.isGrounded, isSliding: false, props: this.props,
                targetTilt: this.targetTilt, vy: 0, isFlying: this.isFlying, flightBlend: this.flightBlend });
            return;
        }
        this.flightBlend *= Math.exp(-dt * 12);

        // 3. 计算当前脚下的支撑面高度 (地面 0 / 斜坡 / 火车车顶)
        let groundHeight = 0;
        let onRoof = false;

        const currentLane = Math.round(-this.x / CONFIG.LANE_WIDTH);

        if (obstacles) {
            // 检查斜坡引桥 (Ramp)
            if (obstacles.ramps) {
                for (const ramp of obstacles.ramps) {
                    if (ramp.lane === currentLane) {
                        const h = ramp.getHeightAtZ(this.z);
                        if (h !== null && h > groundHeight) {
                            groundHeight = h;
                            if (h >= ramp.height * 0.8) {
                                onRoof = true;
                            }
                        }
                    }
                }
            }

            // 检查火车车顶 (Train Roof)
            if (obstacles.trains) {
                for (const train of obstacles.trains) {
                    if (train.isRideable === false) continue;
                    if (train.lane === currentLane) {
                        if (this.z >= train.z && this.z <= train.z + train.length) {
                            // 只要玩家高度在接近车顶或车顶以上，即可平稳站立在车顶
                            // A fast frame can cross the ramp's final metres and
                            // miss both its end sample and the roof-height threshold.
                            // Carry only grounded players already on that connected ramp.
                            const crossedRampExit = this.isGrounded && previousLane === currentLane &&
                                (obstacles.ramps || []).some(ramp => {
                                    if (ramp.lane !== currentLane || Math.abs(ramp.endZ - train.z) > 0.01 ||
                                        Math.abs(ramp.height - train.height) > 0.01 || previousZ > ramp.endZ || this.z < ramp.endZ) return false;
                                    const previousHeight = ramp.getHeightAtZ(previousZ);
                                    return previousHeight !== null && this.y >= previousHeight - 0.08;
                                });
                            if (this.y >= train.height - 0.45 || crossedRampExit) {
                                groundHeight = Math.max(groundHeight, train.height);
                                onRoof = true;
                            }
                        }
                    }
                }
            }
        }

        this.isOnRoof = onRoof;

        // 4. Y轴跳跃与重力
        if (!this.isGrounded) {
            this.y += this.vy * dt;
            this.vy -= CONFIG.PLAYER.GRAVITY * dt;

            // 落在地面或车顶
            if (this.y <= groundHeight) {
                this.y = groundHeight;
                this.vy = 0;
                this.isGrounded = true;
                if (this.pendingJumpCompletion) {
                    this.pendingJumpCompletion = false;
                    this.onActionCompleted?.('jump');
                }
            }
        } else {
            // 如果在地面奔跑中遇到坡度上升（顺着引桥跑上去）
            if (groundHeight > this.y) {
                this.y = groundHeight;
            } else if (groundHeight < this.y) {
                // 如果从车顶边缘跑下悬空（开始下落）
                this.isGrounded = false;
            }
        }

        // 5. 滑铲计时
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                if (this.pendingSlideCompletion) {
                    this.pendingSlideCompletion = false;
                    this.onActionCompleted?.('slide');
                }
            }
        }

        // 6. 道具时间消耗
        this.tickProps(dt);

        // 7. 更新 3D 模型与骨骼动画
        this.updateMeshPosition();
        this.character.update(dt, speed, {
            isGrounded: this.isGrounded,
            isSliding: this.isSliding,
            props: this.props,
            targetTilt: this.targetTilt,
            vy: this.vy,
            isFlying: false,
            flightBlend: this.flightBlend,
        });
    }

    get isFlying() { return this.props.flight > 0 || this.flightLandingTimer > 0; }

    tickProps(dt) {
        for (const k of ['milk', 'magnet', 'shoe']) {
            if (this.props[k] > 0) {
                this.props[k] -= dt;
                if (this.props[k] < 0) this.props[k] = 0;
            }
        }

        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

    }

    updateMeshPosition() {
        this.character.group.position.set(this.x, this.y, this.z);
    }

    /**
     * 获取玩家 3D 碰撞球/盒
     */
    getBounds() {
        const height = this.isSliding ? CONFIG.PLAYER.SLIDE_HEIGHT : CONFIG.PLAYER.COLLIDER_HEIGHT;
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            width: CONFIG.PLAYER.COLLIDER_WIDTH,
            height: height,
            depth: CONFIG.PLAYER.COLLIDER_DEPTH,
            isSliding: this.isSliding,
        };
    }
}
