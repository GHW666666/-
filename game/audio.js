/**
 * 奶娃快跑 - 音频合成与魔性音效系统
 * 基于原生 Web Audio API，无需加载任何庞大外链音频文件即可实时发声！
 * 兼容标准浏览器与支持 WebAudio 的微端环境，并在微信/抖音小游戏提供无缝 fallback
 */
import { platform } from './adapter.js';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = platform.getStorage('naiwa_muted', false);
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.comboCount = 0;
        this.lastCoinTime = 0;
        this.initialized = false;
    }

    /**
     * 懒初始化 AudioContext（防止现代浏览器因没有用户交互而报警拦截）
     */
    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initialized = true;
            }
        } catch (e) {
            console.warn('AudioContext not supported:', e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        platform.setStorage('naiwa_muted', this.isMuted);
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }

    // ================= 音效合成函数集 =================

    /**
     * 吃金币音效 (带连击升调)
     */
    playCoin() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const now = Date.now();
        if (now - this.lastCoinTime < 800) {
            this.comboCount = Math.min(this.comboCount + 1, 12);
        } else {
            this.comboCount = 0;
        }
        this.lastCoinTime = now;

        // 五声音阶升调
        const baseFreq = 587.33; // D5
        const scale = [1, 1.122, 1.259, 1.498, 1.681, 2.0, 2.24, 2.51, 2.99, 3.36, 4.0];
        const freq = baseFreq * (scale[this.comboCount % scale.length] || 1);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
    }

    /**
     * 魔性跳跃音效 (弹簧 Boing~)
     */
    playJump() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.22);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.23);
    }

    /**
     * 贴地滑铲音效 (Whoosh~)
     */
    playSlide() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.31);
    }

    /**
     * 变道音效 (轻快侧滑)
     */
    playSwitch() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
    }

    /**
     * 拾取强力道具 (Chime!)
     */
    playProp() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C 高音和弦
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.06);
            osc.stop(this.ctx.currentTime + idx * 0.06 + 0.32);
        });
    }

    /**
     * 撞击 / 爆炸音效 (Boom!)
     */
    playCrash() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.46);
    }

    /**
     * 鬼畜魔性大笑合成音 (颤音调频模拟哈-哈-哈-哈-哈！)
     */
    playLaugh() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const laughs = 5;
        for (let i = 0; i < laughs; i++) {
            const startTime = this.ctx.currentTime + i * 0.11;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            const f0 = 360 + (i % 2) * 50;
            osc.frequency.setValueAtTime(f0, startTime);
            osc.frequency.exponentialRampToValueAtTime(f0 - 80, startTime + 0.09);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.linearRampToValueAtTime(0.01, startTime + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.1);
        }
    }

    /**
     * 奶蛙主页摸肚皮 / 互动趣味音效 (Boing~ + 欢快琶音)
     */
    playInteract() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.05);
            osc.stop(this.ctx.currentTime + idx * 0.05 + 0.2);
        });
    }

    /**
     * 冲刺出发启动音效 (超燃起跑号角)
     */
    playStartRun() {
        if (this.isMuted) return;
        this.resume();
        if (!this.ctx) return;

        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
            gain.gain.setValueAtTime(0.28, this.ctx.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.07);
            osc.stop(this.ctx.currentTime + idx * 0.07 + 0.32);
        });
    }

    // ================= 欢快 8-Bit BGM 循环生成器 =================

    startBGM() {
        if (this.isMuted || this.bgmPlaying) return;
        this.resume();
        if (!this.ctx) return;

        this.bgmPlaying = true;
        // 经典轻快跑酷旋律音符序列 (MIDI 频率)
        const notes = [
            261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 329.63, 293.66,
            261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 440.00, 392.00
        ];
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (this.isMuted || !this.bgmPlaying || !this.ctx) return;

            const freq = notes[step % notes.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // 保持背景音乐音量适中温和
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.18);

            step++;
        }, 180); // 约 166 BPM
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

export const audio = new AudioManager();
