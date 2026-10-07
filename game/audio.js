/**
 * 奶蛙快跑 - 原创文件 BGM 与 Web Audio 合成音效。
 * 浏览器直接播放本地媒体，微信/抖音使用原生播放器；文件失败时保留合成 BGM。
 */
import { platform } from './adapter.js';

export const BGM_ASSET_PATH = 'assets/audio/naiwa-sunny-run.mp3';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = platform.getStorage('naiwa_muted', false);
        this.bgmRequested = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.bgmPlayer = null;
        this.bgmPlayerKind = null;
        this.bgmFileFailed = false;
        this.bgmGeneration = 0;
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
            const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
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
            // A blocked context may be resumed again by the next real user gesture.
            try { this.ctx.resume()?.catch?.(() => {}); } catch (_) { /* Native contexts may already be closed. */ }
        }
        if (this.canPlayBGM() && !this.bgmPlaying) this.playBGM();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        platform.setStorage('naiwa_muted', this.isMuted);
        if (this.isMuted) {
            this.pauseBGM();
        } else {
            this.resume();
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

    // ================= 原创 BGM 与合成回退 =================

    startBGM() {
        this.bgmRequested = true;
        this.resume();
    }

    canPlayBGM() {
        return this.bgmRequested && !this.isMuted && !(typeof document !== 'undefined' && document.hidden);
    }

    createBGMPlayer() {
        if (this.bgmPlayer || this.bgmFileFailed) return this.bgmPlayer;
        try {
            const nativeApi = platform.env === 'wechat' && typeof wx !== 'undefined' ? wx
                : platform.env === 'douyin' && typeof tt !== 'undefined' ? tt : null;
            if (nativeApi?.createInnerAudioContext) {
                this.bgmPlayer = nativeApi.createInnerAudioContext();
                this.bgmPlayerKind = 'native';
                this.bgmPlayer.onError?.(error => this.failFileBGM(error));
                this.bgmPlayer.src = BGM_ASSET_PATH;
            } else if (platform.env === 'browser' && typeof window !== 'undefined' && typeof window.Audio === 'function') {
                // Keep media separate from Web Audio: file:// fetch/XHR and media-source nodes can hit CORS.
                this.bgmPlayer = new window.Audio(`./${BGM_ASSET_PATH}`);
                this.bgmPlayerKind = 'browser';
                this.bgmPlayer.preload = 'auto';
                this.bgmPlayer.addEventListener('error', () => this.failFileBGM(this.bgmPlayer?.error));
            } else {
                this.bgmFileFailed = true;
                return null;
            }
            this.bgmPlayer.loop = true;
            this.bgmPlayer.autoplay = false;
            this.bgmPlayer.volume = 0.34;
            return this.bgmPlayer;
        } catch (error) {
            this.failFileBGM(error);
            return null;
        }
    }

    playBGM() {
        if (!this.canPlayBGM() || this.bgmPlaying) return;
        const player = this.createBGMPlayer();
        if (!player || this.bgmFileFailed) {
            this.startSynthBGM();
            return;
        }
        const generation = ++this.bgmGeneration;
        // Also covers a pending browser play(), so transition completion cannot create a second request.
        this.bgmPlaying = true;
        try {
            const result = player.play();
            result?.then?.(() => {
                if (generation !== this.bgmGeneration || !this.canPlayBGM()) return;
                this.bgmPlaying = true;
            }).catch(error => {
                if (generation !== this.bgmGeneration) return;
                this.bgmPlaying = false;
                if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') return;
                this.failFileBGM(error);
            });
        } catch (error) {
            if (generation === this.bgmGeneration) this.failFileBGM(error);
        }
    }

    failFileBGM(error) {
        if (this.bgmFileFailed) return;
        this.bgmFileFailed = true;
        this.pauseBGM();
        console.warn('File BGM unavailable; using synthesized music:', error);
        if (this.canPlayBGM()) this.startSynthBGM();
    }

    startSynthBGM() {
        if (!this.canPlayBGM() || this.bgmInterval !== null || !this.ctx) return;

        this.bgmPlaying = true;
        // 经典轻快跑酷旋律音符序列 (MIDI 频率)
        const notes = [
            261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 329.63, 293.66,
            261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 440.00, 392.00
        ];
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (!this.canPlayBGM() || !this.bgmPlaying || !this.ctx) return;

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

    pauseBGM(reset = false) {
        // Invalidate play() promises before pausing, which can reject those promises with AbortError.
        this.bgmGeneration++;
        this.bgmPlaying = false;
        if (this.bgmInterval !== null) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        if (!this.bgmPlayer) return;
        try {
            if (reset && this.bgmPlayerKind === 'native') this.bgmPlayer.stop();
            else {
                this.bgmPlayer.pause();
                if (reset) this.bgmPlayer.currentTime = 0;
            }
        } catch (_) { /* Failed or not-yet-loaded media can reject pause/seek. */ }
    }

    stopBGM({ reset = false } = {}) {
        this.bgmRequested = false;
        this.pauseBGM(reset);
    }
}

export const audio = new AudioManager();
