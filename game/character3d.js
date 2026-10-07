/**
 * Reference-derived Milky Frog: smooth continuous torso, conforming cream belly,
 * rounded face and articulated limbs. Geometry faces +Z; gameplay runs +Z.
 */
import * as THREE from '../libs/three.module.js';
import { createFrogSurface, createFrogSkinGeometry } from './frogGeometry.js';
import { WingSystem3D } from './wings3d.js';
import { OutfitSystem3D } from './outfits3d.js';

export class NailongCharacter {
    constructor() {
        this.group = new THREE.Group();
        this.runCycle = 0;
        this.lateralTilt = 0;

        // 核心骨架节点
        this.bodyGroup = null;
        this.bodyMesh = null;
        this.bellyMesh = null;
        this.tailMesh = null;
        this.leftArm = null;
        this.rightArm = null;
        this.leftLeg = null;
        this.rightLeg = null;
        this.leftFoot = null;
        this.rightFoot = null;

        // 特效挂件
        this.rocketMesh = null;
        this.shieldMesh = null;
        this.magnetMesh = null;

        // 主页展示与交互状态
        this.lobbyMode = false;
        this.lobbyTime = 0;
        this.isInteracting = false;
        this.interactTime = 0;

        this.buildCharacter();
        // 手机端舒适黄金比例缩放 (0.72倍，小巧软萌且视线开阔，变道绝不溢出屏幕)
        this.group.scale.set(0.72, 0.72, 0.72);
    }

    // +Z is the face; the lobby camera sits at -Z, so the root turns by PI.
    buildCharacter() {
        const skin = new THREE.MeshStandardMaterial({ color: 0xffd247, roughness: 0.86, metalness: 0 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x62532c, roughness: 0.92 });
        const green = new THREE.MeshStandardMaterial({ color: 0x8ab94d, roughness: 0.7 });
        const black = new THREE.MeshStandardMaterial({ color: 0x080b05, roughness: 0.45 });
        this.bodyGroup = new THREE.Group();
        this.group.add(this.bodyGroup);

        // Authored cross sections: radius, height, front/back depth. Smoothly
        // interpolate the round cranium, narrow throat and broad lower belly.
        this.bodyProfile = new THREE.CatmullRomCurve3([
            [0,.635,0], [.30,.69,.25], [.50,.83,.42], [.59,.99,.50],
            [.605,1.075,.455], [.60,1.12,.46], [.545,1.31,.415],
            [.445,1.49,.345], [.345,1.66,.30], [.315,1.78,.28],
            [.305,1.85,.275], [.295,1.93,.265], [0,2.20,0]
        ].map(p => new THREE.Vector3(...p)), false, 'centripetal');
        this.surface = createFrogSurface(this.bodyProfile);
        this.buildArms(skin, dark);
        const geometry = createFrogSkinGeometry(this.surface);
        const mask = [], position = geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
            const front = z > 0 ? 1 - THREE.MathUtils.smoothstep(z - this.frontSurface(x, y), .025, .09) : 0;
            mask.push(front * (1 - THREE.MathUtils.smoothstep(geometry.attributes.skinWeight.getY(i), .5, .9)));
        }
        geometry.setAttribute('frogBellyMask', new THREE.Float32BufferAttribute(mask, 1));
        // Evaluate the oval per fragment, in rest coordinates. It follows the
        // skin without another surface or resolution-dependent color edges.
        const bodyMaterial = skin.clone();
        bodyMaterial.onBeforeCompile = shader => {
            shader.uniforms.frogCream = { value: new THREE.Color(0xffedc2) };
            shader.uniforms.frogEyeGreen = { value: green.color.clone() };
            shader.uniforms.frogPupil = { value: black.color.clone() };
            shader.vertexShader = `attribute float frogBellyMask;
                varying vec3 vFrogRestPosition;
                varying float vFrogBellyMask;
` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
                `#include <begin_vertex>
                vFrogRestPosition = position;
                vFrogBellyMask = frogBellyMask;`);
            shader.fragmentShader = `uniform vec3 frogCream;
                uniform vec3 frogEyeGreen;
                uniform vec3 frogPupil;
                varying vec3 vFrogRestPosition;
                varying float vFrogBellyMask;
` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>',
                `#include <color_fragment>
                vec2 bellyCoord = (vFrogRestPosition.xy - vec2(0.0, 1.235)) / vec2(.475, .355);
                float belly = (1.0 - smoothstep(.985, 1.015, dot(bellyCoord, bellyCoord))) * vFrogBellyMask;
                diffuseColor.rgb = mix(diffuseColor.rgb, frogCream, belly);
                vec2 eyeCoord = (vec2(abs(vFrogRestPosition.x), vFrogRestPosition.y) - vec2(.147, 2.07)) / vec2(.058, .061);
                float faceFront = step(.14, vFrogRestPosition.z);
                float eye = (1.0 - smoothstep(.96, 1.04, dot(eyeCoord, eyeCoord))) * faceFront;
                vec2 pupilCoord = (vec2(abs(vFrogRestPosition.x), vFrogRestPosition.y) - vec2(.150, 2.067)) / vec2(.030, .034);
                float pupil = (1.0 - smoothstep(.94, 1.06, dot(pupilCoord, pupilCoord))) * faceFront;
                diffuseColor.rgb = mix(diffuseColor.rgb, frogEyeGreen, eye);
                diffuseColor.rgb = mix(diffuseColor.rgb, frogPupil, pupil);`);
            this.outfits?.patchShader(shader);
        };
        bodyMaterial.customProgramCacheKey = () => 'milky-frog-surface-eyes-outfits-v2';
        this.bodyMesh = this.addSkinnedMesh(geometry, bodyMaterial);
        this.bellyMesh = this.bodyMesh;

        this.buildEyesAndFace(skin,green,black);
        this.buildLegsAndFeet(skin,dark);
        this.tailMesh=this.ellipsoid(this.bodyGroup,skin,[.065,.075,.095],[0,.90,-.40]);
        this.buildPropAttachments();
        this.wings = new WingSystem3D(this.bodyGroup);
        this.outfits = new OutfitSystem3D(this);
    }

    frontSurface(x,y) {
        return this.surface.front(x,y);
    }

    addSkinnedMesh(geometry, material) {
        const mesh = new THREE.SkinnedMesh(geometry, material);
        mesh.castShadow = true;
        // Keep the soft character skin free of shadow-map acne in the narrow
        // armpit gap. The unified skin still casts its full ground shadow.
        mesh.receiveShadow = false;
        // Limbs leave the rest bounds while waving; never cull their skin.
        mesh.frustumCulled = false;
        this.bodyGroup.add(mesh);
        mesh.bind(this.skeleton);
        return mesh;
    }

    addMesh(parent,geometry,material) {
        const mesh=new THREE.Mesh(geometry,material);
        mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
    }

    ellipsoid(parent,material,scale,position) {
        const mesh=this.addMesh(parent,new THREE.SphereGeometry(1,24,16),material);
        mesh.scale.set(...scale);mesh.position.set(...position);return mesh;
    }

    buildEyesAndFace(skin,green,black) {
        // Eyes are colored regions of the head skin, so their rings and pupils
        // follow its curved surface exactly at every viewing angle.
        // A relaxed closed smile: round corners clearly above the center,
        // following the face rather than a raised straight lip/beak.
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0x49351d, roughness: .9
        });
        const points = [];
        for (let i = 0; i <= 32; i++) {
            const x = (i / 32 - .5) * .246;
            const y = 1.952 + .025 * (x / .123) ** 2;
            points.push(new THREE.Vector3(x, y, this.frontSurface(x, y) + .008));
        }
        const smile = this.addMesh(this.bodyGroup,
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, .005, 8, false),
            mouthMaterial);
        smile.name = 'smileMouth';
        smile.castShadow = false;
        smile.receiveShadow = false;
        for (const endpoint of [points[0], points[points.length - 1]]) {
            const corner = this.ellipsoid(this.bodyGroup, mouthMaterial,
                [.005, .005, .005], endpoint.toArray());
            corner.castShadow = false;
            corner.receiveShadow = false;
        }

    }

    buildArms(skin,dark) {
        const root = new THREE.Bone();
        root.name = 'torso';
        this.bodyGroup.add(root);
        const bones = [root];
        for(const side of [1,-1]) {
            const arm=new THREE.Bone();
            arm.name = side === 1 ? 'leftShoulder' : 'rightShoulder';
            arm.position.set(side*.315,1.51,.015);
            root.add(arm);
            bones.push(arm);
            // The yellow arm belongs to the torso skin. Only the hand is rigid,
            // and its wrist overlaps the tapered skin so no open tube is exposed.
            const hand = new THREE.Group();
            const wrist = this.surface.armWrist;
            hand.position.set(side * (wrist.x - .315 - .05), wrist.y - 1.51 - .005, wrist.z - .015 + .005);
            hand.rotation.z = -side*1.12;
            this.ellipsoid(hand,dark,[.080,.092,.057],[0,0,0]);
            for(let i=0;i<3;i++) this.ellipsoid(hand,dark,[.027,.060,.034],
                [(i-1)*.043,-.059,.012]);
            this.ellipsoid(hand,dark,[.034,.050,.034],[-side*.065,.018,.018]);
            arm.add(hand);
            if(side===1) this.leftArm=arm; else this.rightArm=arm;
        }
        this.bodyGroup.updateMatrixWorld(true);
        this.skeleton = new THREE.Skeleton(bones);
    }

    buildLegsAndFeet(skin,dark) {
        for(const side of [1,-1]) {
            const leg=new THREE.Group();leg.position.set(side*.25,.745,0);
            // Rounded tapered calf; broad at the hip, narrow at the ankle.
            const profile=new THREE.CatmullRomCurve3([
                new THREE.Vector3(0,-.70,0),new THREE.Vector3(.052,-.67,0),
                new THREE.Vector3(.062,-.61,0),new THREE.Vector3(.12,-.43,0),new THREE.Vector3(.175,-.19,0),
                new THREE.Vector3(.16,.04,0),new THREE.Vector3(0,.16,0)
            ]);
            const geo=new THREE.LatheGeometry(profile.getPoints(32).map(p=>new THREE.Vector2(p.x,p.y)),32);
            geo.scale(1,1,1.05); this.addMesh(leg,geo,skin);
            const foot=new THREE.Group();foot.position.set(0,-.68,.085);
            this.ellipsoid(foot,dark,[.140,.068,.175],[0,.012,.040]);
            for(let i=0;i<3;i++) this.ellipsoid(foot,dark,[.046,.052,.065],[(i-1)*.075,-.003,.175]);
            leg.add(foot);this.bodyGroup.add(leg);
            if(side===1) {this.leftLeg=leg;this.leftFoot=foot;}
            else {this.rightLeg=leg;this.rightFoot=foot;}
        }
    }

    /**
     * 道具挂载特效
     */
    buildPropAttachments() {
        // A. 奶瓶火箭
        this.rocketMesh = new THREE.Group();
        const bottleGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.55, 16);
        const bottleMat = new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.2 });
        const bMesh = new THREE.Mesh(bottleGeom, bottleMat);
        bMesh.rotation.x = Math.PI / 2;
        this.rocketMesh.add(bMesh);

        const flameGeom = new THREE.ConeGeometry(0.14, 0.5, 12);
        flameGeom.rotateX(Math.PI);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9f1a });
        const flameMesh = new THREE.Mesh(flameGeom, flameMat);
        flameMesh.position.set(0, -0.4, -0.22);
        this.rocketMesh.add(flameMesh);

        this.rocketMesh.position.set(0, 1.1, -0.65);
        this.rocketMesh.visible = false;
        this.bodyGroup.add(this.rocketMesh);

        // B. 护盾透明球
        const shieldGeom = new THREE.SphereGeometry(1.15, 24, 20);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: 0x00d2d3,
            transparent: true,
            opacity: 0.42,
            roughness: 0.1,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        this.shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
        this.shieldMesh.position.set(0, 1.05, 0);
        this.shieldMesh.visible = false;
        this.group.add(this.shieldMesh);

        // C. 磁铁光环
        const ringGeom = new THREE.TorusGeometry(1.15, 0.06, 12, 32);
        ringGeom.rotateX(Math.PI / 2);
        const magnetMat = new THREE.MeshBasicMaterial({ color: 0x0984e3 });
        this.magnetMesh = new THREE.Mesh(ringGeom, magnetMat);
        this.magnetMesh.position.set(0, 0.8, 0);
        this.magnetMesh.visible = false;
        this.group.add(this.magnetMesh);
    }

    /**
     * 切换主页面展示模式与跑酷模式
     */
    setLobbyMode(enable) {
        this.lobbyMode = enable;
        this.lobbyTime = 0;
        this.isInteracting = false;
        this.interactTime = 0;

        if (enable) {
            // 面对屏幕正前方 (向镜头微笑)，亲昵饱满且不过于臃肿
            this.group.rotation.set(0, Math.PI, 0);
            this.group.position.set(0, 0, 0);
            this.group.scale.set(0.76, 0.76, 0.76);
            this.resetPoses();
        } else {
            this.group.rotation.set(0, 0, 0);
            this.group.scale.set(0.72, 0.72, 0.72);
            this.resetPoses();
        }
    }

    resetPoses() {
        this.bodyGroup.position.set(0, 0, 0);
        this.bodyGroup.rotation.set(0, 0, 0);
        this.bodyGroup.scale.set(1, 1, 1);
        if (this.leftArm) this.leftArm.rotation.set(0, 0, 0);
        if (this.rightArm) this.rightArm.rotation.set(0, 0, 0);
        if (this.leftLeg) { this.leftLeg.rotation.set(0, 0, 0); this.leftLeg.position.y = .745; }
        if (this.rightLeg) { this.rightLeg.rotation.set(0, 0, 0); this.rightLeg.position.y = .745; }
        if (this.leftFoot) this.leftFoot.rotation.set(0, 0, 0);
        if (this.rightFoot) this.rightFoot.rotation.set(0, 0, 0);
    }

    /**
     * 主页面正脸待机萌态与亲密互动动画
     */
    updateLobby(dt) {
        this.lobbyTime += dt;
        this.wings.update(dt, false);
        const t = this.lobbyTime;

        // 隐藏游戏内道具特效挂件
        if (this.rocketMesh) this.rocketMesh.visible = false;
        if (this.shieldMesh) this.shieldMesh.visible = false;
        if (this.magnetMesh) this.magnetMesh.visible = false;

        // 1. 如果处于玩家触摸/点击互动兴奋状态 (拉近观众距离)
        if (this.isInteracting) {
            this.interactTime += dt;
            // 欢呼小跳步 + 摸摸肚皮 + 左右晃动
            const bounce = Math.abs(Math.sin(this.interactTime * 14)) * 0.28;
            this.bodyGroup.position.y = bounce;
            this.bodyGroup.rotation.z = Math.sin(this.interactTime * 12) * 0.14;

            // 双手开心地高高举起挥舞！
            this.leftArm.rotation.z = -.55 + Math.sin(this.interactTime * 12) * .12;
            this.leftArm.rotation.x = -.20;
            this.rightArm.rotation.z = .55 - Math.sin(this.interactTime * 12) * .12;
            this.rightArm.rotation.x = -.20;

            this.bodyGroup.scale.set(1 + .025 * Math.sin(this.interactTime * 20),
                1 - .018 * Math.sin(this.interactTime * 20), 1);

            // 小脚掌微微踏步
            this.leftLeg.rotation.x = Math.sin(this.interactTime * 12) * 0.25;
            this.rightLeg.rotation.x = -Math.sin(this.interactTime * 12) * 0.25;

            if (this.interactTime > 1.25) {
                this.isInteracting = false;
                this.interactTime = 0;
            }
            return;
        }

        // 2. 默认待机萌态 (Idle)
        // A. 柔软呼吸大白肚皮 (缓慢起伏，极富生命感)
        const breathe = Math.sin(t * 2.5) * 0.05;
        this.bodyGroup.scale.set(1 + breathe * .12, 1 + breathe * .08, 1 + breathe * .12);

        // B. 呆萌小歪头与重心左右微移 (如小恐龙般憨态可掬)
        this.bodyGroup.rotation.z = Math.sin(t * 1.4) * 0.05;
        this.bodyGroup.rotation.y = Math.sin(t * 0.9) * 0.07;
        this.bodyGroup.position.y = Math.sin(t * 2.8) * 0.02;

        // Brief gentle greeting after a quiet first view; every pose starts from
        // rest to avoid stale Y/Z rotations carrying over from interaction.
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
        const subTime = (t + 4.3) % 6.4;
        if (subTime < 1.5) {
            const envelope = Math.sin(subTime / 1.5 * Math.PI);
            this.rightArm.rotation.z = (.75 + .10 * Math.sin(subTime * 10)) * envelope;
            this.rightArm.rotation.x = -.16 * envelope;
        } else {
            const rub = Math.sin(t * 2.5) * .025;
            this.leftArm.rotation.x = rub;
            this.rightArm.rotation.x = -rub;
        }

        // D. 屁股后面的呆萌小尾巴轻晃
        this.tailMesh.rotation.y = Math.sin(t * 3.2) * 0.28;

        // E. 稳定立足
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.leftFoot.rotation.set(0, 0, 0);
        this.rightFoot.rotation.set(0, 0, 0);
    }

    /**
     * 玩家在主界面点击/抚摸奶蛙触发互动
     */
    triggerInteract() {
        this.isInteracting = true;
        this.interactTime = 0;
    }

    /**
     * 点击“开始跑酷”时的一键丝滑起跑过渡
     * progress: 0 (正对玩家主页) -> 1 (背对镜头冲刺奔跑)
     */
    updateStartTransition(progress) {
        if (progress === 0) this.resetPoses();
        // 丝滑 180 度转体面向赛道前方
        this.group.rotation.y = Math.PI * (1 - progress);

        // 缩放过渡
        const currentScale = 0.76 - progress * (0.76 - 0.72);
        this.group.scale.set(currentScale, currentScale, currentScale);

        // 蓄力起跳小跳步
        const jumpArc = Math.sin(progress * Math.PI) * 0.32;
        this.bodyGroup.position.y = jumpArc;
        this.bodyGroup.rotation.x = progress * 0.12;

        if (progress > 0.4) {
            // 提前预备奔跑摆臂
            const p = (progress - 0.4) / 0.6;
            this.leftLeg.rotation.x = Math.sin(p * Math.PI * 2) * 0.7;
            this.rightLeg.rotation.x = -Math.sin(p * Math.PI * 2) * 0.7;
            this.leftArm.rotation.x = -this.leftLeg.rotation.x * 0.6;
            this.rightArm.rotation.x = -this.rightLeg.rotation.x * 0.6;
        }
    }

    /**
     * 骨骼与动作更新 (经典的左右魔性摇摆步态 Waddling)
     */
    update(dt, speed, state) {
        const { isGrounded, isSliding, props, targetTilt } = state;
        this.wings.update(dt, Boolean(state.isFlying) || state.flightBlend > .05);

        // 1. 变道侧倾阻尼
        this.lateralTilt += (targetTilt - this.lateralTilt) * Math.min(1, dt * 14);
        this.group.rotation.z = this.lateralTilt * 0.22;
        this.group.rotation.y = -this.lateralTilt * 0.18;

        // 2. 道具状态
        this.rocketMesh.visible = props.milk > 0;
        this.shieldMesh.visible = props.shield;
        this.magnetMesh.visible = props.magnet > 0;
        if (this.magnetMesh.visible) {
            this.magnetMesh.rotation.y += dt * 6.0;
        }

        // 3. 动作分支
        if (state.isFlying || state.flightBlend > .05) {
            this.animateFlight(dt, state.flightBlend ?? 1);
        } else if (isSliding) {
            this.animateSlide(dt);
        } else if (!isGrounded) {
            this.animateJump(dt, state.vy);
        } else {
            this.animateRun(dt, speed);
        }
    }

    animateFlight(dt, blend = 1) {
        // The front (+Z), including the cream belly, turns towards ground (-Y).
        this.bodyGroup.rotation.set(Math.PI / 2 * blend, 0, 0);
        this.bodyGroup.position.set(0, .36 * blend, -.90 * blend);
        this.bodyGroup.scale.set(1, 1, 1);
        this.leftArm.rotation.set(-.08, 0, -.28 * blend);
        this.rightArm.rotation.set(-.08, 0, .28 * blend);
        this.leftLeg.rotation.set(.04, 0, -.08);
        this.rightLeg.rotation.set(.04, 0, .08);
        this.leftLeg.position.y = this.rightLeg.position.y = .745;
        this.leftFoot.rotation.x = this.rightFoot.rotation.x = .10;
        this.tailMesh.rotation.y *= .9;
    }

    /**
     * 奶龙招牌式魔性奔跑步态 (左右摇屁股 Waddling + 脚掌向后高高翘起蹬踏)
     */
    animateRun(dt, speed) {
        const stepRate = Math.min(speed * 0.38, 18.0);
        this.runCycle += dt * stepRate;

        // A. 躯干 DuangDuang 垂直弹动
        const bounce = Math.abs(Math.sin(this.runCycle)) * 0.13;
        this.bodyGroup.position.y = bounce;
        this.bodyGroup.position.z = 0;

        // B. 左右招牌摇摆 (Waddling Roll)
        const waddleRoll = Math.sin(this.runCycle) * 0.14;
        this.bodyGroup.rotation.z = waddleRoll;
        this.bodyGroup.rotation.y = 0;

        // C. 双腿大幅交替摆动
        const legAngle = Math.sin(this.runCycle) * 0.58;
        this.leftLeg.rotation.x = legAngle;
        this.rightLeg.rotation.x = -legAngle;

        // D. 翘脚掌后蹬：后踢腿大幅向后翘，正对镜头亮出深色脚掌垫！
        if (legAngle > 0) {
            this.leftFoot.rotation.x = -0.15;
            this.rightFoot.rotation.x = 0.95; // 高高翘起！
            this.rightLeg.position.y = .745 + 0.06;
            this.leftLeg.position.y = .745;
        } else {
            this.rightFoot.rotation.x = -0.15;
            this.leftFoot.rotation.x = 0.95;  // 高高翘起！
            this.leftLeg.position.y = .745 + 0.06;
            this.rightLeg.position.y = .745;
        }

        // E. Counter-swing the whole skinned arms, with space beside the belly.
        // Forward-only rotation hid most of the hand motion in the rear camera.
        const stride = Math.sin(this.runCycle);
        this.leftArm.rotation.set(.35 - stride * .55, .30 + stride * .10, .55 + stride * .12);
        this.rightArm.rotation.set(.35 + stride * .55, -.30 + stride * .10, -.55 + stride * .12);

        // F. 小尾巴快乐晃晃
        this.tailMesh.rotation.y = Math.sin(this.runCycle * 2) * 0.35;

        // 恢复比例
        this.bodyGroup.scale.set(1.0, 1.0, 1.0);
        this.bodyGroup.rotation.x = 0.08; // 微微前冲
    }

    /**
     * 起跳腾空
     */
    animateJump(dt, vy) {
        this.bodyGroup.position.y = 0.08;
        this.bodyGroup.position.z = 0;
        this.bodyGroup.rotation.z *= 0.8;
        this.bodyGroup.rotation.x = -0.12;

        this.bodyGroup.scale.set(0.92, 1.15, 0.92);

        this.leftLeg.rotation.x = -0.42;
        this.rightLeg.rotation.x = -0.32;
        this.leftFoot.rotation.x = 0.65;
        this.rightFoot.rotation.x = 0.65;

        this.leftArm.rotation.x = -0.45;
        this.leftArm.rotation.z = -0.28;
        this.rightArm.rotation.x = -0.45;
        this.rightArm.rotation.z = 0.28;
    }

    /**
     * 滑铲贴地
     */
    animateSlide(dt) {
        this.bodyGroup.position.y = -0.38;
        this.bodyGroup.position.z = 0;
        this.bodyGroup.rotation.x = 0.90;
        this.bodyGroup.rotation.z *= 0.8;

        this.bodyGroup.scale.set(1.22, 0.62, 1.3);

        this.leftLeg.rotation.x = 0.92;
        this.rightLeg.rotation.x = 0.92;
        this.leftFoot.rotation.x = 0.2;
        this.rightFoot.rotation.x = 0.2;

        this.leftArm.rotation.x = 0.55;
        this.rightArm.rotation.x = 0.55;
    }

    /**
     * 翻车倒地
     */
    animateCrash() {
        this.bodyGroup.rotation.x = -Math.PI / 2.1;
        this.bodyGroup.position.y = -0.42;
        this.leftLeg.rotation.x = 0.35;
        this.rightLeg.rotation.x = -0.55;
    }
}
