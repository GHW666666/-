/**
 * Platform.js
 * 统一跨平台抽象层：无缝兼容 微信小游戏 (wx)、抖音小游戏 (tt) 与 现代浏览器 H5
 */

class PlatformBridge {
  constructor() {
    this.platform = this.detectPlatform();
    this.recorder = null;
    this.recordedVideoPath = null;
    this.isRecording = false;

    this.init();
  }

  detectPlatform() {
    if (typeof tt !== 'undefined' && typeof tt.getSystemInfoSync === 'function') {
      return 'douyin';
    }
    if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
      return 'wechat';
    }
    return 'browser';
  }

  init() {
    console.log(`[Platform] 当前运行平台: ${this.platform}`);

    // 初始化微信/抖音转发菜单
    if (this.platform === 'wechat' && typeof wx.showShareMenu === 'function') {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      wx.onShareAppMessage(() => ({
        title: '【奶娃跑跑】“牛来！速归！”快帮奶娃躲避暴走神牛！',
        imageUrl: ''
      }));
    } else if (this.platform === 'douyin' && typeof tt.showShareMenu === 'function') {
      tt.showShareMenu({
        menus: ['shareAppMessage']
      });
      this.initDouyinRecorder();
    }
  }

  getSystemInfo() {
    if (this.platform === 'wechat') {
      return wx.getSystemInfoSync();
    }
    if (this.platform === 'douyin') {
      return tt.getSystemInfoSync();
    }
    return {
      windowWidth: window.innerWidth || 375,
      windowHeight: window.innerHeight || 667,
      pixelRatio: window.devicePixelRatio || 2,
      platform: 'h5'
    };
  }

  getStorage(key, defaultValue = null) {
    try {
      if (this.platform === 'wechat') {
        const val = wx.getStorageSync(key);
        return val !== '' ? val : defaultValue;
      }
      if (this.platform === 'douyin') {
        const val = tt.getStorageSync(key);
        return val !== '' ? val : defaultValue;
      }
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  setStorage(key, value) {
    try {
      if (this.platform === 'wechat') {
        wx.setStorageSync(key, value);
      } else if (this.platform === 'douyin') {
        tt.setStorageSync(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('[Platform] 保存本地数据失败:', e);
    }
  }

  vibrate(type = 'short') {
    if (this.platform === 'wechat') {
      if (type === 'short') wx.vibrateShort({ type: 'medium' });
      else wx.vibrateLong();
    } else if (this.platform === 'douyin') {
      if (type === 'short') tt.vibrateShort();
      else tt.vibrateLong();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'short' ? 20 : 60);
    }
  }

  /**
   * 激励视频广告（支持看广告复活、获得道具等）
   */
  showRewardVideoAd({ adUnitId = '', onReward, onFail }) {
    if (this.platform === 'wechat' && typeof wx.createRewardedVideoAd === 'function') {
      const ad = wx.createRewardedVideoAd({ adUnitId: adUnitId || 'adunit-mock' });
      ad.load()
        .then(() => ad.show())
        .catch(err => {
          console.warn('微信广告加载失败', err);
          if (onFail) onFail(err);
        });
      ad.onClose((res) => {
        if (res && res.isEnded) {
          if (onReward) onReward();
        } else {
          if (onFail) onFail('广告未完整播放');
        }
      });
      return;
    }

    if (this.platform === 'douyin' && typeof tt.createRewardedVideoAd === 'function') {
      const ad = tt.createRewardedVideoAd({ adUnitId: adUnitId || 'adunit-mock' });
      ad.show()
        .then(() => {
          ad.onClose((res) => {
            if (res && res.isEnded) {
              if (onReward) onReward();
            } else {
              if (onFail) onFail('广告未完整播放');
            }
          });
        })
        .catch(err => {
          if (onFail) onFail(err);
        });
      return;
    }

    // 浏览器 H5 开发测试模拟
    console.log('[Platform] 浏览器环境，模拟广告播放中...');
    setTimeout(() => {
      const confirmReward = confirm('【模拟激励广告】是否看完广告获取复活奖励？');
      if (confirmReward) {
        if (onReward) onReward();
      } else {
        if (onFail) onFail('未完整观看广告');
      }
    }, 100);
  }

  /**
   * 抖音专属：自动游戏录屏管理（爆款裂变利器）
   */
  initDouyinRecorder() {
    if (this.platform !== 'douyin' || typeof tt.getGameRecorderManager !== 'function') return;

    this.recorder = tt.getGameRecorderManager();
    this.recorder.onStart(() => {
      this.isRecording = true;
      console.log('[Douyin] 录屏已开始');
    });

    this.recorder.onStop((res) => {
      this.isRecording = false;
      this.recordedVideoPath = res.videoPath;
      console.log('[Douyin] 录屏已结束:', res.videoPath);
    });

    this.recorder.onError((err) => {
      this.isRecording = false;
      console.warn('[Douyin] 录屏异常:', err);
    });
  }

  startRecording() {
    if (this.platform === 'douyin' && this.recorder && !this.isRecording) {
      try {
        this.recorder.start({ duration: 60 });
      } catch (e) {
        console.warn('开启录屏失败', e);
      }
    }
  }

  stopRecording(onFinish) {
    if (this.platform === 'douyin' && this.recorder && this.isRecording) {
      try {
        this.recorder.stop();
        if (onFinish) {
          const checkTimer = setInterval(() => {
            if (!this.isRecording && this.recordedVideoPath) {
              clearInterval(checkTimer);
              onFinish(this.recordedVideoPath);
            }
          }, 200);
        }
      } catch (e) {
        console.warn('停止录屏失败', e);
      }
    }
  }

  /**
   * 平台统一分享接口
   */
  shareGame({ title = '【奶娃跑跑】“牛来！速归！”快帮奶娃躲避暴走神牛！', score = 0 }) {
    if (this.platform === 'douyin') {
      // 抖音如果录屏存在，优先调起录屏分享发布带话题
      if (this.recordedVideoPath && typeof tt.shareAppMessage === 'function') {
        tt.shareAppMessage({
          channel: 'video',
          title: `我操控奶娃跑了 ${score} 米，身后那头“牛来”太吓人了！#奶娃跑跑 #小游戏 #牛来`,
          extra: {
            videoPath: this.recordedVideoPath,
            videoTopics: ['奶娃跑跑', '牛来', '地铁跑酷', '魔性小游戏']
          },
          success: () => console.log('抖音视频分享成功'),
          fail: (e) => console.warn('抖音分享失败', e)
        });
        return;
      }
      if (typeof tt.shareAppMessage === 'function') {
        tt.shareAppMessage({
          title: `我操控奶娃狂奔了 ${score} 米，快来挑战我！`
        });
      }
      return;
    }

    if (this.platform === 'wechat' && typeof wx.shareAppMessage === 'function') {
      wx.shareAppMessage({
        title: `【奶娃跑跑】我跑了 ${score} 米！你能甩开狂暴“牛来”吗？`,
        query: `score=${score}`
      });
      return;
    }

    // 浏览器环境
    alert(`[分享游戏] ${title} \n（在微信或抖音中将直接调起原生分享卡片/发布短视频）`);
  }
}

export const Platform = new PlatformBridge();
