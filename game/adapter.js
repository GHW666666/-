/**
 * 平台抽象适配层 (Platform Adapter)
 * 完美抹平 浏览器(H5)、微信小游戏(wx)、抖音小游戏(tt) 的环境差异
 * 让游戏核心代码在这三个平台上 100% 保持同一套源码！
 */
export class PlatformAdapter {
    constructor() {
        this.env = this.detectEnvironment();
        this.canvas = null;
        this.ctx = null;
        this.systemInfo = null;
        this.touchListeners = [];
        this.keyListeners = [];
    }

    /**
     * 检测当前运行环境
     */
    detectEnvironment() {
        if (typeof wx !== 'undefined' && wx.createCanvas) {
            return 'wechat';
        } else if (typeof tt !== 'undefined' && tt.createCanvas) {
            return 'douyin';
        } else {
            return 'browser';
        }
    }

    /**
     * 初始化画布与上下文
     */
    initCanvas(containerCanvas = null, contextType = 'webgl') {
        if (this.env === 'wechat') {
            this.canvas = wx.createCanvas();
            this.systemInfo = wx.getSystemInfoSync();
        } else if (this.env === 'douyin') {
            this.canvas = tt.createCanvas();
            this.systemInfo = tt.getSystemInfoSync();
        } else {
            this.canvas = containerCanvas || document.getElementById('gameCanvas');
            this.updateBrowserSystemInfo();
        }

        if (contextType === '2d' && this.canvas) {
            this.ctx = this.canvas.getContext('2d', { alpha: false });
        }
        this.setupInputListeners();
        return { canvas: this.canvas, ctx: this.ctx };
    }

    updateBrowserSystemInfo() {
        if (this.env === 'browser') {
            this.systemInfo = {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1,
            };
        }
    }

    /**
     * 获取窗口视口物理尺寸
     */
    getWindowSize() {
        if (this.env === 'browser') {
            this.updateBrowserSystemInfo();
        }
        return {
            width: this.systemInfo ? this.systemInfo.windowWidth : 720,
            height: this.systemInfo ? this.systemInfo.windowHeight : 1280,
            pixelRatio: this.systemInfo ? (this.systemInfo.pixelRatio || 1) : 1
        };
    }

    /**
     * 本地数据存储读写 (自动适配 localStorage / wx.storage / tt.storage)
     */
    getStorage(key, defaultValue = null) {
        try {
            if (this.env === 'wechat') {
                const res = wx.getStorageSync(key);
                return res !== '' && res !== undefined ? res : defaultValue;
            } else if (this.env === 'douyin') {
                const res = tt.getStorageSync(key);
                return res !== '' && res !== undefined ? res : defaultValue;
            } else {
                const val = localStorage.getItem(key);
                return val !== null ? JSON.parse(val) : defaultValue;
            }
        } catch (e) {
            console.warn('Storage read failed:', e);
            return defaultValue;
        }
    }

    setStorage(key, value) {
        try {
            if (this.env === 'wechat') {
                wx.setStorageSync(key, value);
            } else if (this.env === 'douyin') {
                tt.setStorageSync(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (e) {
            console.warn('Storage write failed:', e);
        }
    }

    /**
     * 统一触控与手势输入监听
     */
    setupInputListeners() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        const handleStart = (x, y) => {
            touchStartX = x;
            touchStartY = y;
            touchStartTime = Date.now();
            this.notifyTouch('start', { x, y });
        };

        const handleMove = (x, y) => {
            this.notifyTouch('move', { x, y });
        };

        const handleEnd = (x, y) => {
            const dx = x - touchStartX;
            const dy = y - touchStartY;
            const dt = Date.now() - touchStartTime;
            const distance = Math.hypot(dx, dy);

            // 滑动手势判断阈值
            const SWIPE_THRESHOLD = 30; // 像素

            if (distance > SWIPE_THRESHOLD && dt < 600) {
                // 判断主要滑动方向
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        this.notifyGesture('swipe_right');
                    } else {
                        this.notifyGesture('swipe_left');
                    }
                } else {
                    if (dy < 0) {
                        this.notifyGesture('swipe_up');
                    } else {
                        this.notifyGesture('swipe_down');
                    }
                }
            } else {
                // 点击操作
                this.notifyGesture('tap', { x, y });
            }

            this.notifyTouch('end', { x, y });
        };

        if (this.env === 'wechat') {
            wx.onTouchStart((e) => {
                if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
            });
            wx.onTouchMove((e) => {
                if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
            });
            wx.onTouchEnd((e) => {
                if (e.changedTouches && e.changedTouches[0]) handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            });
        } else if (this.env === 'douyin') {
            tt.onTouchStart((e) => {
                if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
            });
            tt.onTouchMove((e) => {
                if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
            });
            tt.onTouchEnd((e) => {
                if (e.changedTouches && e.changedTouches[0]) handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            });
        } else {
            // 浏览器环境
            const cvs = this.canvas;
            if (!cvs) return;

            // 触摸屏
            cvs.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const rect = cvs.getBoundingClientRect();
                const touch = e.touches[0];
                handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
            }, { passive: false });

            cvs.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = cvs.getBoundingClientRect();
                const touch = e.touches[0];
                handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
            }, { passive: false });

            cvs.addEventListener('touchend', (e) => {
                e.preventDefault();
                const rect = cvs.getBoundingClientRect();
                const touch = e.changedTouches[0];
                handleEnd(touch.clientX - rect.left, touch.clientY - rect.top);
            }, { passive: false });

            // 鼠标点击/拖动适配
            let isMouseDown = false;
            cvs.addEventListener('mousedown', (e) => {
                isMouseDown = true;
                const rect = cvs.getBoundingClientRect();
                handleStart(e.clientX - rect.left, e.clientY - rect.top);
            });
            window.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return;
                const rect = cvs.getBoundingClientRect();
                handleMove(e.clientX - rect.left, e.clientY - rect.top);
            });
            window.addEventListener('mouseup', (e) => {
                if (!isMouseDown) return;
                isMouseDown = false;
                const rect = cvs.getBoundingClientRect();
                handleEnd(e.clientX - rect.left, e.clientY - rect.top);
            });

            // 键盘支持 (WASD 与 方向键)
            window.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'KeyA'].includes(e.code)) {
                    this.notifyGesture('swipe_left');
                } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
                    this.notifyGesture('swipe_right');
                } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
                    this.notifyGesture('swipe_up');
                } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                    this.notifyGesture('swipe_down');
                }
            });
        }
    }

    onGesture(callback) {
        this.touchListeners.push(callback);
    }

    notifyGesture(type, data = null) {
        for (const cb of this.touchListeners) {
            cb(type, data);
        }
    }

    notifyTouch(event, data) {
        // 可选提供给底层UI元素碰撞使用
    }

    /**
     * 振动反馈 (触觉微振动，微信/抖音/移动端Web)
     */
    vibrate(short = true) {
        try {
            if (this.env === 'wechat') {
                if (short) wx.vibrateShort({ type: 'medium' });
                else wx.vibrateLong();
            } else if (this.env === 'douyin') {
                if (short) tt.vibrateShort();
                else tt.vibrateLong();
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(short ? 25 : 80);
            }
        } catch (e) {
            // 静默失败
        }
    }
}

export const platform = new PlatformAdapter();
