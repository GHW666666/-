/**
 * 奶娃快跑 - 高度还原 3D 奶龙 (Nailong) 角色模型与神韵级程序化骨骼动画
 * 特征极致还原：
 * 1. 经典无缝水滴梨形体态 (头颈身一体顺滑微弧，绝非突兀球体拼接)
 * 2. 鲜明亮丽的金黄暖萌肤色 (高饱和明亮黄 + 微弱动漫自发光，在阳光下格外亮眼)
 * 3. 浑圆大白肚皮、背后可爱微翘小尾巴、圆润小屁股
 * 4. 前脸大圆绿眼 (嫩绿外环 + 漆黑圆瞳 + 动漫高光小白点) 与微笑浅弧
 * 5. 肉嘟嘟小粗腿，奔跑时身体魔性DuangDuang左右摇摆(Waddling)，后蹬时清晰露出深色脚掌垫
 */
import * as THREE from '../libs/three.module.js';

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

    /**
     * 高精度水滴梨形程序化建模 (极度还原奶龙本体)
     */
    buildCharacter() {
        // A. 亮眼明媚卡通材质
        const yellowSkinMat = new THREE.MeshStandardMaterial({
            color: 0xffdf18,      // 标志性明亮奶龙黄
            roughness: 0.32,
            metalness: 0.04,
            emissive: 0xffaa00,   // 柔和暖色内蕴光辉，杜绝阴影死黑发脏
            emissiveIntensity: 0.12,
        });

        const whiteBellyMat = new THREE.MeshStandardMaterial({
            color: 0xfffef0,      // 软萌奶白肚皮
            roughness: 0.4,
            metalness: 0.0,
        });

        const darkFootMat = new THREE.MeshStandardMaterial({
            color: 0x422d1d,      // 经典耐磨脚底板深棕黑
            roughness: 0.65,
        });

        const greenEyeMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 }); // 标志性亮翠绿大眼眶
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });    // 乌黑大瞳仁
        const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff });     // 水汪汪高光点

        this.bodyGroup = new THREE.Group();
        this.group.add(this.bodyGroup);

        // 1. 无缝水滴梨形一体化身躯 (LatheGeometry 连续样条截面)
        // 从底座 (y=0.35) 到 头顶 (y=1.92)，圆润过渡无任何断层
        const profilePoints = [
            new THREE.Vector2(0.00, 0.35),  // 底部中心
            new THREE.Vector2(0.32, 0.38),  // 底部下沿
            new THREE.Vector2(0.62, 0.58),  // 饱满圆臀最宽处
            new THREE.Vector2(0.68, 0.88),  // 胖肚下侧
            new THREE.Vector2(0.64, 1.15),  // 上腹部
            new THREE.Vector2(0.52, 1.42),  // 胸颈过渡弧
            new THREE.Vector2(0.44, 1.65),  // 萌脸颊
            new THREE.Vector2(0.35, 1.82),  // 额头转折
            new THREE.Vector2(0.18, 1.92),  // 脑门圆顶
            new THREE.Vector2(0.00, 1.95),  // 头顶极点
        ];

        const bodyGeom = new THREE.LatheGeometry(profilePoints, 32);
        // 让前后略微膨胀，造就前凸白肚皮与后翘圆屁股
        bodyGeom.scale(1.0, 1.0, 1.08);

        this.bodyMesh = new THREE.Mesh(bodyGeom, yellowSkinMat);
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.bodyGroup.add(this.bodyMesh);

        // 2. 标志性圆润凸起大白肚皮 (胸腹前置柔和补丁)
        const bellyGeom = new THREE.SphereGeometry(0.54, 24, 20);
        bellyGeom.scale(0.86, 1.18, 0.45);
        this.bellyMesh = new THREE.Mesh(bellyGeom, whiteBellyMat);
        this.bellyMesh.position.set(0, 0.95, 0.42);
        this.bellyMesh.rotation.x = -0.15;
        this.bodyGroup.add(this.bellyMesh);

        // 3. 屁股上方微翘的呆萌小短尾 (背面视角极吸睛)
        const tailGeom = new THREE.ConeGeometry(0.16, 0.42, 16);
        tailGeom.rotateX(-Math.PI / 2.3);
        this.tailMesh = new THREE.Mesh(tailGeom, yellowSkinMat);
        this.tailMesh.position.set(0, 0.65, -0.62);
        this.tailMesh.castShadow = true;
        this.bodyGroup.add(this.tailMesh);

        // 4. 正脸五官：经典双层翠绿大圆眼 + 黑亮瞳孔 + 呆萌微笑嘴弧
        this.buildEyesAndFace(yellowSkinMat, greenEyeMat, pupilMat, specMat);

        // 5. 肉乎乎的短小双臂 (跑动时自然前后晃荡)
        this.buildArms(yellowSkinMat);

        // 6. 粗短小腿与宽宽肉脚 (后蹬时清晰露出深色脚垫)
        this.buildLegsAndFeet(yellowSkinMat, darkFootMat);

        // 7. 道具挂件 (火箭冲刺背包、护盾流光球、磁力环)
        this.buildPropAttachments();
    }

    /**
     * 脸部五官：鲜明绿大眼
     */
    buildEyesAndFace(yellowMat, greenEyeMat, pupilMat, specMat) {
        const eyeGeom = new THREE.SphereGeometry(0.13, 20, 16);
        eyeGeom.scale(1.0, 1.15, 0.45);

        const pupilGeom = new THREE.SphereGeometry(0.07, 16, 14);
        pupilGeom.scale(1.0, 1.0, 0.35);

        const specGeom = new THREE.SphereGeometry(0.03, 10, 10);

        // 左眼
        const leftEyeGroup = new THREE.Group();
        const leftEyeMesh = new THREE.Mesh(eyeGeom, greenEyeMat);
        const leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
        leftPupil.position.set(0.02, 0, 0.05);
        const leftSpec = new THREE.Mesh(specGeom, specMat);
        leftSpec.position.set(0.04, 0.035, 0.07);
        leftEyeGroup.add(leftEyeMesh, leftPupil, leftSpec);
        leftEyeGroup.position.set(0.20, 1.62, 0.38);
        leftEyeGroup.rotation.y = 0.25;
        this.bodyGroup.add(leftEyeGroup);

        // 右眼
        const rightEyeGroup = new THREE.Group();
        const rightEyeMesh = new THREE.Mesh(eyeGeom, greenEyeMat);
        const rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
        rightPupil.position.set(-0.02, 0, 0.05);
        const rightSpec = new THREE.Mesh(specGeom, specMat);
        rightSpec.position.set(-0.01, 0.035, 0.07);
        rightEyeGroup.add(rightEyeMesh, rightPupil, rightSpec);
        rightEyeGroup.position.set(-0.20, 1.62, 0.38);
        rightEyeGroup.rotation.y = -0.25;
        this.bodyGroup.add(rightEyeGroup);

        // 呆萌招牌微笑大嘴弧 (对称居中向上微笑，憨态可掬)
        const mouthArc = Math.PI * 0.72;
        const mouthGeom = new THREE.TorusGeometry(0.12, 0.026, 12, 24, mouthArc);
        mouthGeom.rotateZ(-Math.PI / 2 - mouthArc / 2); // 精确关于Y轴对称向上微笑
        const mouthMesh = new THREE.Mesh(mouthGeom, pupilMat);
        mouthMesh.position.set(0, 1.34, 0.585);
        mouthMesh.rotation.x = -0.22;
        this.bodyGroup.add(mouthMesh);

        // 小恐龙可爱圆圆小鼻孔
        const noseGeom = new THREE.SphereGeometry(0.026, 8, 8);
        for (const side of [-1, 1]) {
            const nose = new THREE.Mesh(noseGeom, pupilMat);
            nose.position.set(side * 0.05, 1.49, 0.52);
            this.bodyGroup.add(nose);
        }
    }

    /**
     * 肉感小短手
     */
    buildArms(yellowMat) {
        const armGeom = new THREE.CapsuleGeometry(0.10, 0.34, 12, 12);
        armGeom.translate(0, -0.17, 0);

        this.leftArm = new THREE.Group();
        const leftMesh = new THREE.Mesh(armGeom, yellowMat);
        leftMesh.castShadow = true;
        this.leftArm.add(leftMesh);
        this.leftArm.position.set(0.55, 1.25, 0.06);
        this.leftArm.rotation.z = -0.32;
        this.bodyGroup.add(this.leftArm);

        this.rightArm = new THREE.Group();
        const rightMesh = new THREE.Mesh(armGeom, yellowMat);
        rightMesh.castShadow = true;
        this.rightArm.add(rightMesh);
        this.rightArm.position.set(-0.55, 1.25, 0.06);
        this.rightArm.rotation.z = 0.32;
        this.bodyGroup.add(this.rightArm);
    }

    /**
     * 短粗大腿与带有深色脚垫的大脚掌 (后蹬动作关键细节)
     */
    buildLegsAndFeet(yellowMat, darkFootMat) {
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(0.26, 0.45, 0.0);
        this.bodyGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(-0.26, 0.45, 0.0);
        this.bodyGroup.add(this.rightLeg);

        const thighGeom = new THREE.CylinderGeometry(0.16, 0.14, 0.32, 16);
        thighGeom.translate(0, -0.16, 0);

        // 左大腿
        const leftThigh = new THREE.Mesh(thighGeom, yellowMat);
        leftThigh.castShadow = true;
        this.leftLeg.add(leftThigh);

        // 左脚掌
        this.leftFoot = new THREE.Group();
        this.leftFoot.position.set(0, -0.32, 0.10);
        this.leftLeg.add(this.leftFoot);

        const footUpperGeom = new THREE.SphereGeometry(0.18, 16, 12);
        footUpperGeom.scale(1.05, 0.55, 1.5);
        const leftFootUpper = new THREE.Mesh(footUpperGeom, yellowMat);
        leftFootUpper.position.set(0, 0.04, 0);
        leftFootUpper.castShadow = true;
        this.leftFoot.add(leftFootUpper);

        // 深色防滑脚底垫 (后蹬时正对镜头)
        const soleGeom = new THREE.BoxGeometry(0.26, 0.04, 0.45);
        const leftSole = new THREE.Mesh(soleGeom, darkFootMat);
        leftSole.position.set(0, -0.05, 0);
        this.leftFoot.add(leftSole);

        // 右大腿与脚掌
        const rightThigh = new THREE.Mesh(thighGeom, yellowMat);
        rightThigh.castShadow = true;
        this.rightLeg.add(rightThigh);

        this.rightFoot = new THREE.Group();
        this.rightFoot.position.set(0, -0.32, 0.10);
        this.rightLeg.add(this.rightFoot);

        const rightFootUpper = new THREE.Mesh(footUpperGeom, yellowMat);
        rightFootUpper.position.set(0, 0.04, 0);
        rightFootUpper.castShadow = true;
        this.rightFoot.add(rightFootUpper);

        const rightSole = new THREE.Mesh(soleGeom, darkFootMat);
        rightSole.position.set(0, -0.05, 0);
        this.rightFoot.add(rightSole);
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
        if (this.leftArm) this.leftArm.rotation.set(0, 0, -0.32);
        if (this.rightArm) this.rightArm.rotation.set(0, 0, 0.32);
        if (this.leftLeg) this.leftLeg.rotation.set(0, 0, 0);
        if (this.rightLeg) this.rightLeg.rotation.set(0, 0, 0);
        if (this.leftFoot) this.leftFoot.rotation.set(0, 0, 0);
        if (this.rightFoot) this.rightFoot.rotation.set(0, 0, 0);
    }

    /**
     * 主页面正脸待机萌态与亲密互动动画
     */
    updateLobby(dt) {
        this.lobbyTime += dt;
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
            this.leftArm.rotation.z = -1.15 + Math.sin(this.interactTime * 16) * 0.35;
            this.leftArm.rotation.x = -0.55;
            this.rightArm.rotation.z = 1.15 - Math.sin(this.interactTime * 16) * 0.35;
            this.rightArm.rotation.x = -0.55;

            // 大白肚皮DuangDuang开心弹动
            this.bellyMesh.scale.set(
                0.86 * (1 + 0.12 * Math.sin(this.interactTime * 20)),
                1.18 * (1 + 0.08 * Math.sin(this.interactTime * 20)),
                0.45 * (1 + 0.10 * Math.sin(this.interactTime * 20))
            );

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
        this.bellyMesh.scale.set(0.86 * (1 + breathe), 1.18 * (1 + breathe * 0.8), 0.45);

        // B. 呆萌小歪头与重心左右微移 (如小恐龙般憨态可掬)
        this.bodyGroup.rotation.z = Math.sin(t * 1.4) * 0.05;
        this.bodyGroup.rotation.y = Math.sin(t * 0.9) * 0.07;
        this.bodyGroup.position.y = Math.sin(t * 2.8) * 0.02;

        // C. 动作编排：每隔 5 秒向镜头前的玩家萌萌挥右手打招呼
        const cyclePeriod = 5.2;
        const subTime = t % cyclePeriod;

        if (subTime < 2.2) {
            // 动作1：右手抬起向镜头挥手 ("嗨！你来啦~")
            const wave = Math.sin(subTime * 7) * 0.28;
            this.rightArm.rotation.z = 1.35 + wave;
            this.rightArm.rotation.x = -0.65;
            this.rightArm.rotation.y = -0.25;

            // 左手软软搭在大肚皮侧边
            this.leftArm.rotation.z = -0.28;
            this.leftArm.rotation.x = -0.22;
        } else if (subTime >= 2.6 && subTime < 4.2) {
            // 动作2：双手摸摸大肚子，露出满足憨笑
            const rub = Math.sin(subTime * 5) * 0.08;
            this.rightArm.rotation.z = 0.42;
            this.rightArm.rotation.x = -0.28 + rub;
            this.leftArm.rotation.z = -0.42;
            this.leftArm.rotation.x = -0.28 - rub;
        } else {
            // 动作3：自然微屈垂手
            this.rightArm.rotation.z = 0.32;
            this.rightArm.rotation.x = 0;
            this.rightArm.rotation.y = 0;
            this.leftArm.rotation.z = -0.32;
            this.leftArm.rotation.x = 0;
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
        // 丝滑 180 度转体面向赛道前方
        this.group.rotation.y = Math.PI * (1 - progress);

        // 缩放过渡
        const currentScale = 0.92 - progress * (0.92 - 0.72);
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
        if (isSliding) {
            this.animateSlide(dt);
        } else if (!isGrounded) {
            this.animateJump(dt, state.vy);
        } else {
            this.animateRun(dt, speed);
        }
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

        // B. 左右招牌摇摆 (Waddling Roll)
        const waddleRoll = Math.sin(this.runCycle) * 0.14;
        this.bodyGroup.rotation.z = waddleRoll;

        // C. 双腿大幅交替摆动
        const legAngle = Math.sin(this.runCycle) * 0.82;
        this.leftLeg.rotation.x = legAngle;
        this.rightLeg.rotation.x = -legAngle;

        // D. 翘脚掌后蹬：后踢腿大幅向后翘，正对镜头亮出深色脚掌垫！
        if (legAngle > 0) {
            this.leftFoot.rotation.x = -0.15;
            this.rightFoot.rotation.x = 0.95; // 高高翘起！
            this.rightLeg.position.y = 0.45 + 0.12;
            this.leftLeg.position.y = 0.45;
        } else {
            this.rightFoot.rotation.x = -0.15;
            this.leftFoot.rotation.x = 0.95;  // 高高翘起！
            this.leftLeg.position.y = 0.45 + 0.12;
            this.rightLeg.position.y = 0.45;
        }

        // E. 手臂反向摆动
        this.leftArm.rotation.x = -legAngle * 0.72;
        this.rightArm.rotation.x = legAngle * 0.72;

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
        this.bodyGroup.rotation.z *= 0.8;
        this.bodyGroup.rotation.x = -0.12;

        this.bodyGroup.scale.set(0.92, 1.15, 0.92);

        this.leftLeg.rotation.x = -0.42;
        this.rightLeg.rotation.x = -0.32;
        this.leftFoot.rotation.x = 0.65;
        this.rightFoot.rotation.x = 0.65;

        this.leftArm.rotation.x = -0.85;
        this.leftArm.rotation.z = -0.55;
        this.rightArm.rotation.x = -0.85;
        this.rightArm.rotation.z = 0.55;
    }

    /**
     * 滑铲贴地
     */
    animateSlide(dt) {
        this.bodyGroup.position.y = -0.38;
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
