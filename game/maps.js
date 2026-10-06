/**
 * 奶娃快跑 - 地图配置与多场景扩展架构
 * 预留多地图系统：当前精装修「埃及·砂岩集市」，未来支持「霓虹·赛博都市」与「玛雅·热带雨林」
 */
export const MAP_CONFIGS = {
    egypt: {
        id: 'egypt',
        name: '埃及·砂岩集市',
        englishName: 'Egyptian Sandstone Bazaar',
        icon: '🏛️',
        badge: '📍 埃及',
        skyColor: 0x6ed3ff,     // 明媚晴空蓝
        fogColor: 0xfff0d8,     // 晨光金色透光雾
        sunColor: 0xfff3d6,     // 灼热太阳暖金光
        groundColor: 0xf6ead4,  // 砂石道砟
        themeColor: '#f39c12',  // 界面点缀色
        tag: '经典·探险',
        description: '穿越托勒密王朝砂岩长廊与蓝白集市，顺着黄色引桥冲上埃及特快火车车顶，远眺神秘金字塔群！',
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
