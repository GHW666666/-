/**
 * 奶蛙快跑 - 核心配置与游戏参数 (3D全真引擎版)
 */
export const CONFIG = {
    // 逻辑基准与画布配置
    CANVAS_WIDTH: 720,
    CANVAS_HEIGHT: 1280,

    // 3D 轨道配置（3条赛道：-1 左, 0 中, 1 右，世界单位：米）
    TRACK_COUNT: 3,
    LANE_WIDTH: 3.2,       // 轨道间距 (米)
    LANE_SWITCH_SPEED: 16, // 变道平滑插值速度

    // 3D 摄像机视锥配置
    CAMERA: {
        FOV: 60,
        NEAR: 0.1,
        FAR: 280,
        OFFSET_X: 0,
        OFFSET_Y: 3.8,     // 俯视角黄金高度 (紧贴角色后背)
        OFFSET_Z: -6.4,    // 摄像机位于角色后方距离
        LOOK_OFFSET_Y: 1.4,// 镜头目标点高度
        LOOK_OFFSET_Z: 14.0,// 视线聚焦前方
    },

    // 速度参数 (米/秒)
    SPEED: {
        INITIAL: 26.0,      // 初始速度 (~93 km/h 刺激流畅)
        MAX: 56.0,          // 极限速度
        ACCELERATION: 0.45, // 每秒加速度
        RUSH_SPEED: 65.0,   // 奶瓶暴走超速冲刺
    },

    // 玩家物理与动作参数
    PLAYER: {
        COLLIDER_WIDTH: 1.1,
        COLLIDER_HEIGHT: 1.85,
        COLLIDER_DEPTH: 1.0,
        GRAVITY: 36.0,        // 重力加速度 (m/s^2)
        JUMP_FORCE: 14.5,     // 起跳初速度
        SUPER_JUMP_FORCE: 21.0,// 弹簧鞋超大跳 (可直接跳上火车顶)
        SLIDE_DURATION: 0.72, // 滑铲持续时间 (秒)
        SLIDE_HEIGHT: 0.85,   // 滑铲判定高度 (可通过限高杆)
    },

    // 场景尺寸 (米)
    WORLD: {
        CHUNK_LENGTH: 48,     // 单个场景地块长度
        VISIBLE_CHUNKS: 7,    // 同时保持的前方地块数 (7块 x 48米 = 336米，远超 280米 视锥距离)
        TRAIN_HEIGHT: 2.45,   // 火车车顶高度 (屋顶冲刺高度)
        TRAIN_WIDTH: 2.65,    // 火车宽度
        TRAIN_LENGTH: 15.0,   // 火车长度
        RAMP_LENGTH: 11.5,    // 引桥斜坡长度
        RAMP_HEIGHT: 2.45,    // 引桥最高端高度
        LONG_VEHICLE_LENGTH: 220,
        VEHICLE_ROOF_FIRST_BARRIER: 40,
        VEHICLE_ROOF_BARRIER_GAP: 100, // 留出最高速度、弹簧鞋落地及下一次动作的时间
        VEHICLE_ROUTE_EXIT_GAP: 35,
    },

    // 道具持续时间 (秒)
    PROP_DURATION: {
        MILK: 6.0,          // 超级奶瓶（无敌冲刺+全屏吸金币+火箭拖尾）
        MAGNET: 8.0,        // 大磁铁（全屏磁吸金币）
        SHOE: 8.0,          // 弹簧鞋（超高跳跃翻越列车）
        SHIELD: 999.0,      // 护盾（持续到被消耗抵消1次碰撞）
        FLIGHT: 8.0,        // 羽毛激活翅膀，限时空中金币航道
    },

    FLIGHT: { HEIGHT: 12, LANDING_DURATION: 1.1, LANDING_GRACE: 1.5 },

    // 磁铁吸附范围 (米)
    MAGNET_RANGE: 16.0,

    // 埃及砂岩集市亮眼明媚调色盘 (地中海暖阳明媚、碧空万里、金光灿烂)
    THEME: {
        SKY_COLOR: 0x70c5ff,       // 明媚碧蓝晴空
        FOG_COLOR: 0xfff6e5,       // 温暖淡金晨光雾 (极低密度，通透澄净)
        SUN_COLOR: 0xfffae8,       // 暖金烈阳高光
        SAND_COLOR: 0xf6ead4,      // 亮丽奶油砂岩石板地
        STONE_COLOR: 0xfff3dc,     // 阳光沐浴下的米白/象牙砂岩柱廊
        STONE_TRIM: 0xf1dfbb,      // 暖金浮雕饰边
        RAIL_COLOR: 0xf5f8fa,      // 耀眼高反光银白钢轨
        WOOD_COLOR: 0x8d6e63,      // 温暖栗色/胡桃木质枕木
        AWNING_BLUE: 0x0984e3,     // 饱和鲜艳的地中海宝石蓝遮阳棚
        AWNING_WHITE: 0xffffff,    // 亮纯白遮阳棚条纹
        PALM_GREEN: 0x2ed573,      // 鲜艳葱翠热带棕榈叶
        TRAIN_BODY: 0xffffff,
        TRAIN_STRIPE: 0x0984e3,
        GOLD_COIN: 0xffd32a,       // 闪耀灿金五角星
    }
};
