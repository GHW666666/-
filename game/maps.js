/**
 * 奶蛙快跑 - 地图配置与多场景扩展架构
 * 五个可探索世界，每个地图独立配置配色、灯光与玩法文案。
 */
export const MAP_CONFIGS = {
    egypt: {
        id: 'egypt',
        name: '埃及·砂岩集市',
        englishName: 'Egyptian Sandstone Bazaar',
        icon: '🏛️',
        badge: '📍 埃及',
        skyColor: 0xb5e1e6,
        fogColor: 0xf5e4c7,
        sunColor: 0xffedce,
        groundColor: 0xeecfa1,
        themeColor: '#168f91',
        environmentStyle: 'egypt',
        lighting: { hemiSky: 0xe0f7fa, hemiGround: 0xfff8e7, hemiIntensity: 1.35, sunIntensity: 1.95, sunPosition: [25, 45, -15] },
        stageTitle: '埃及',
        stageSubtitle: '砂岩集市',
        tag: '沙漠·奇遇',
        shortDescription: '金字塔、法老与棕榈集市，沿着沙金跑道追逐阳光。',
        surfaceLabel: '砂岩跑道',
        rideLabel: '埃及特快',
        roofLabel: '车顶冲刺',
        startHint: '顺着引桥冲上车顶，穿过砂岩集市！',
        description: '沿着青绿金边的砂岩跑道冲刺，邂逅错落金字塔、法老雕像与棕榈市集，冲上埃及特快车顶！',
        dialogues: [
            '快摸摸我的大肚皮，等下要冲上火车顶啦！',
            '今天阳光真好，听说砂岩集市里有黄金烤全羊！',
            '等我跑过10万米，就去跟许嵩表白~',
            '听说埃及特快的车顶风景特别棒，还能捡金币！',
            '点我摸摸肚皮，给你加个好运暴走Buff！',
            '看我可爱的绿色大眼睛，是不是萌化你啦？',
            'DuangDuang~ 我的小尾巴摇得停不下来！'
        ],
        available: true,
    },
    store: {
        id: 'store',
        name: '巨物便利店',
        englishName: 'Midnight Mini Mart',
        icon: '🛒',
        badge: '巨物·夜宵',
        environmentStyle: 'store',
        skyColor: 0xf2e8dc,
        fogColor: 0xf6efe3,
        sunColor: 0xfff2db,
        groundColor: 0xe6dfcf,
        themeColor: '#2c877a',
        lighting: { hemiSky: 0xf3fff4, hemiGround: 0xebd8bd, hemiIntensity: 1.5, sunIntensity: 1.5, sunPosition: [15, 40, -20] },
        stageTitle: '巨物',
        stageSubtitle: '便利店',
        tag: '巨物·夜宵',
        shortDescription: '逛满满的零食街，收集三枚金币，完成夜宵订单。',
        description: '穿过密集货架、巨物零食与冰柜街道，登上包装盒平台。看到夜宵订单提示，沿中间道收集三枚金币，完成三连可获额外金币。',
        surfaceLabel: '便利店走道',
        rideLabel: '零食包装箱',
        roofLabel: '货架冲刺',
        startHint: '看订单提示，沿中间道收集 3 枚金币领奖励！',
        dialogues: [
            '牛奶盒比我还大！这家店我可以住一整年。',
            '别急着结账，我还没跑到零食那一排呢！',
            '冰柜里凉凉的，先摸摸肚皮暖一暖。',
            '今晚的计划：跑一圈，再吃亿点点！'
        ],
        available: true,
    },
    tea: {
        id: 'tea',
        name: '奶茶泡泡港',
        englishName: 'Boba Bubble Harbor',
        icon: '🧋',
        badge: '奶茶·漂流',
        environmentStyle: 'tea',
        skyColor: 0xf7e8dc,
        fogColor: 0xf6e8d4,
        sunColor: 0xffedce,
        groundColor: 0xc89162,
        themeColor: '#986038',
        lighting: { hemiSky: 0xfff4e5, hemiGround: 0xeac39c, hemiIntensity: 1.5, sunIntensity: 1.65, sunPosition: [-20, 40, -20] },
        stageTitle: '奶茶',
        stageSubtitle: '泡泡港',
        tag: '奶茶·漂流',
        shortDescription: '珍珠弹射起飞，穿过空中三连泡泡，收集甜蜜奖励。',
        description: '穿梭茶杯、吸管与奶茶小店组成的港口。泡泡航线开启时回到中间道，踩珍珠垫起飞，保持航线穿过三个空中泡泡；错过只会失去奖励。',
        surfaceLabel: '奶盖码头',
        rideLabel: '珍珠货船',
        roofLabel: '杯盖冲刺',
        startHint: '回中间道踩珍珠垫，穿过 3 个空中泡泡！',
        dialogues: [
            '三分糖，加珍珠！等等，珍珠怎么比我还大？',
            '我的肚皮自带奶盖，今天申请免费续杯。',
            '这条河闻起来好香，跑完再喝一口。',
            '船要开啦！快跟上奶蛙的甜蜜航线。'
        ],
        available: true,
    },
    pond: {
        id: 'pond',
        name: '蛙塘音乐节',
        englishName: 'Lily Pad Music Festival',
        icon: '🎵',
        badge: '荷塘·律动',
        environmentStyle: 'pond',
        skyColor: 0xf4c6b1,
        fogColor: 0xf4d9bc,
        sunColor: 0xffdcc1,
        groundColor: 0x78a994,
        themeColor: '#567d52',
        lighting: { hemiSky: 0xffe1c4, hemiGround: 0xa6ba8b, hemiIntensity: 1.55, sunIntensity: 1.6, sunPosition: [-30, 28, -20] },
        stageTitle: '蛙塘',
        stageSubtitle: '音乐节',
        tag: '荷塘·律动',
        shortDescription: '跟着左、中、右节拍点换道，在落日音乐节打出三连拍。',
        description: '沿摊位、帐篷、音箱围绕的荷叶栈道跑酷。三连拍开启时按地板提示向左、中、右换道，脚踏实地点亮三个节拍，连击成功领取额外金币。',
        surfaceLabel: '荷叶栈道',
        rideLabel: '鼓面舞台',
        roofLabel: '舞台冲刺',
        startHint: '跟地板提示换道：左 → 中 → 右，踩出三连拍！',
        dialogues: [
            '今晚我不是奶蛙，我是荷塘最会跳的主唱！',
            '摸摸肚皮，咚咚咚！这个鼓点怎么样？',
            '等夕阳落下，灯串亮起，我们就出发。',
            '别踩错拍子，今晚的快乐要跑着收集！'
        ],
        available: true,
    },
    laundry: {
        id: 'laundry',
        name: '云端洗衣房',
        englishName: 'Cloud Laundry Club',
        icon: '🧺',
        badge: '云端·轻盈',
        environmentStyle: 'laundry',
        skyColor: 0xece7e0,
        fogColor: 0xf6f1e9,
        sunColor: 0xfff3df,
        groundColor: 0xe5e1d9,
        themeColor: '#807394',
        lighting: { hemiSky: 0xf5f0ff, hemiGround: 0xe5dccb, hemiIntensity: 1.65, sunIntensity: 1.3, sunPosition: [20, 45, -10] },
        stageTitle: '云端',
        stageSubtitle: '洗衣房',
        tag: '云端·轻盈',
        shortDescription: '踩暖风口追逐三只袜子，沿高架晾衣台轻盈落地。',
        description: '沿洗衣机、衣架与云岛组成的毛巾桥奔跑。收袜子挑战开启时回中间道，踩暖风口托举追袜子，也可沿坡登上晾衣台收集，三只全齐领取额外金币。',
        surfaceLabel: '毛巾桥',
        rideLabel: '折叠毛巾台',
        roofLabel: '晾衣台冲刺',
        startHint: '中间道踩暖风或沿坡登台，收齐 3 只袜子！',
        dialogues: [
            '刚晒好的毛巾软软的，跑完我要躺一下。',
            '谁把我的袜子晾到云上去了？我来追！',
            '这里的风闻起来像干净的阳光。',
            '今天不用洗肚皮，只要把快乐晒一晒！'
        ],
        available: true,
    },
    cyber: {
        id: 'cyber',
        name: '霓虹·赛博都市',
        englishName: 'Cyberpunk Neon City',
        icon: '🌃',
        badge: '🔒 即将上线',
        skyColor: 0x0f172a,
        fogColor: 0x1e1b4b,
        sunColor: 0x38bdf8,
        groundColor: 0x1e293b,
        themeColor: '#00d2d3',
        tag: '科幻·夜景',
        description: '在未来全息磁悬浮列车顶飞驰，穿梭于摩天大楼与全息霓虹天际线！',
        dialogues: [
            '赛博世界里有没有电子烤羊肉串呀？'
        ],
        available: false,
    },
    jungle: {
        id: 'jungle',
        name: '玛雅·热带雨林',
        englishName: 'Maya Jungle Ruins',
        icon: '🌴',
        badge: '🔒 即将上线',
        skyColor: 0x38bdf8,
        fogColor: 0xdcfce7,
        sunColor: 0xfef08a,
        groundColor: 0x78350f,
        themeColor: '#10b981',
        tag: '神秘·自然',
        description: '滑过古老神庙藤蔓与巨石机关，探索失落的翡翠遗迹与黄金树冠！',
        dialogues: [
            '雨林里有好多大香蕉和神秘图腾！'
        ],
        available: false,
    }
};

class MapManager {
    constructor() {
        this.currentMapId = 'egypt';
    }

    getCurrentMap() {
        return MAP_CONFIGS[this.currentMapId] || MAP_CONFIGS.egypt;
    }

    setMap(mapId) {
        if (MAP_CONFIGS[mapId] && MAP_CONFIGS[mapId].available) {
            this.currentMapId = mapId;
            return true;
        }
        return false;
    }

    getAllMaps() {
        return Object.values(MAP_CONFIGS);
    }
}

export const mapManager = new MapManager();
