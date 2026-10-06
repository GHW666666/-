/**
 * InputManager.js
 * 统一手势与按键输入监听器（支持移动端滑屏、PC端键盘、鼠标拖拽手势）
 */

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas || window;
    this.handlers = {
      left: [],
      right: [],
      jump: [],
      slide: []
    };

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isDragging = false;
    this.minSwipeDistance = 25; // 触发滑动的最小像素距离
    this.maxSwipeTime = 500; // 滑动最大耗时(ms)

    this.initEvents();
  }

  on(action, callback) {
    if (this.handlers[action]) {
      this.handlers[action].push(callback);
    }
  }

  trigger(action) {
    if (this.handlers[action]) {
      this.handlers[action].forEach(cb => cb());
    }
  }

  initEvents() {
    // 1. 触摸事件 (微信小游戏 / 抖音 / 移动端)
    if (typeof wx !== 'undefined' && typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(e => this.handleTouchStart(e.touches[0]));
      wx.onTouchEnd(e => this.handleTouchEnd(e.changedTouches[0]));
    } else if (typeof tt !== 'undefined' && typeof tt.onTouchStart === 'function') {
      tt.onTouchStart(e => this.handleTouchStart(e.touches[0]));
      tt.onTouchEnd(e => this.handleTouchEnd(e.changedTouches[0]));
    } else if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', e => {
        if (e.touches && e.touches[0]) this.handleTouchStart(e.touches[0]);
      }, { passive: true });

      window.addEventListener('touchend', e => {
        if (e.changedTouches && e.changedTouches[0]) this.handleTouchEnd(e.changedTouches[0]);
      }, { passive: true });

      // 2. 鼠标拖拽模拟滑屏 (PC 浏览器预览)
      window.addEventListener('mousedown', e => {
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.touchStartTime = Date.now();
        this.isDragging = true;
      });

      window.addEventListener('mouseup', e => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.resolveSwipe(e.clientX - this.touchStartX, e.clientY - this.touchStartY, Date.now() - this.touchStartTime);
      });

      // 3. 键盘事件 (PC 开发调试快捷键)
      window.addEventListener('keydown', e => {
        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            this.trigger('left');
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.trigger('right');
            break;
          case 'ArrowUp':
          case 'KeyW':
          case 'Space':
            this.trigger('jump');
            break;
          case 'ArrowDown':
          case 'KeyS':
            this.trigger('slide');
            break;
        }
      });
    }
  }

  handleTouchStart(touch) {
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  handleTouchEnd(touch) {
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dt = Date.now() - this.touchStartTime;
    this.resolveSwipe(dx, dy, dt);
  }

  resolveSwipe(dx, dy, dt) {
    if (dt > this.maxSwipeTime) return; // 超时不算滑动

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < this.minSwipeDistance) return;

    if (absX > absY) {
      // 水平方向换轨
      if (dx < 0) {
        this.trigger('left');
      } else {
        this.trigger('right');
      }
    } else {
      // 垂直方向跳跃/滑铲
      if (dy < 0) {
        this.trigger('jump');
      } else {
        this.trigger('slide');
      }
    }
  }
}
