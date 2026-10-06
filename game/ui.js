/**
 * 奶蛙快跑 - 高度定制 UI 系统 (包含主页面互动、地图漫游、拓展玩法弹窗与对标跑酷 HUD)
 */
export class UIManager {
    constructor() {
        this.dom = {
            // 跑酷游戏中 HUD
            hudTop: document.getElementById('hudTop'),
            hudSpeed: document.getElementById('hudSpeed'),
            touchControls: document.getElementById('touchControls'),
            pauseBtn: document.getElementById('btnPause'),

            stageCard: document.getElementById('stageCard'),
            stageName: document.getElementById('stageName'),
            stageTimer: document.getElementById('stageTimer'),
            stageSub: document.getElementById('stageSub'),
            stageProgress: document.getElementById('stageProgressBar'),

            multiplierTag: document.getElementById('multiplierTag'),
            scoreText: document.getElementById('scoreText'),
            coinText: document.getElementById('coinText'),

            speedValue: document.getElementById('speedValue'),
            statusTag: document.getElementById('statusTag'),

            // 主页面 (Lobby) 核心节点
            lobbyOverlay: document.getElementById('lobbyOverlay'),
            lobbyCoins: document.getElementById('lobbyCoins'),
            lobbyHighScore: document.getElementById('lobbyHighScore'),
            muteIcon: document.getElementById('muteIcon'),
            btnMute: document.getElementById('btnMute'),

            speechBubble: document.getElementById('speechBubble'),
            bubbleText: document.getElementById('bubbleText'),
            characterTouchZone: document.getElementById('characterTouchZone'),
            reactionContainer: document.getElementById('reactionContainer'),

            btnOpenMaps: document.getElementById('btnOpenMaps'),
            btnOpenWardrobe: document.getElementById('btnOpenWardrobe'),
            btnOpenRank: document.getElementById('btnOpenRank'),
            btnOpenDaily: document.getElementById('btnOpenDaily'),

            lobbyMapTitle: document.getElementById('lobbyMapTitle'),
            btnChangeMap: document.getElementById('btnChangeMap'),
            btnStartRun: document.getElementById('btnStartRun'),

            // 弹窗群
            mapModal: document.getElementById('mapModal'),
            mapListContainer: document.getElementById('mapListContainer'),
            btnCloseMapModal: document.getElementById('btnCloseMapModal'),

            wardrobeModal: document.getElementById('wardrobeModal'),
            btnCloseWardrobeModal: document.getElementById('btnCloseWardrobeModal'),

            rankModal: document.getElementById('rankModal'),
            rankMyScore: document.getElementById('rankMyScore'),
            btnCloseRankModal: document.getElementById('btnCloseRankModal'),

            dailyModal: document.getElementById('dailyModal'),
            btnClaimDaily: document.getElementById('btnClaimDaily'),
            btnCloseDailyModal: document.getElementById('btnCloseDailyModal'),

            pauseModal: document.getElementById('pauseModal'),
            btnResume: document.getElementById('btnResume'),
            btnPauseToLobby: document.getElementById('btnPauseToLobby'),

            gameOverModal: document.getElementById('gameOverModal'),
            btnRestart: document.getElementById('btnRestart'),
            btnGameOverToLobby: document.getElementById('btnGameOverToLobby'),
            finalScore: document.getElementById('finalScore'),
            finalCoins: document.getElementById('finalCoins'),
            deathJoke: document.getElementById('deathJoke'),
        };
    }

    /**
     * 显示主页面
     */
    showLobby(data = {}) {
        if (this.dom.lobbyOverlay) this.dom.lobbyOverlay.style.display = 'flex';

        // 隐藏游戏跑酷 HUD
        if (this.dom.hudTop) this.dom.hudTop.style.display = 'none';
        if (this.dom.hudSpeed) this.dom.hudSpeed.style.display = 'none';
        if (this.dom.touchControls) this.dom.touchControls.style.display = 'none';

        // 关闭所有弹窗
        this.hideAllModals();

        // 刷新主页统计
        if (data.coins !== undefined && this.dom.lobbyCoins) {
            this.dom.lobbyCoins.textContent = data.coins;
        }
        if (data.highScore !== undefined && this.dom.lobbyHighScore) {
            this.dom.lobbyHighScore.textContent = `${Math.floor(data.highScore)}m`;
        }
        if (data.currentMap && this.dom.lobbyMapTitle) {
            this.dom.lobbyMapTitle.textContent = `${data.currentMap.name} ${data.currentMap.icon || ''}`;
        }
    }

    /**
     * 隐藏主页面，开启游戏内跑酷 HUD
     */
    hideLobby() {
        if (this.dom.lobbyOverlay) this.dom.lobbyOverlay.style.display = 'none';

        // 显示游戏内 HUD 与虚拟按键
        if (this.dom.hudTop) this.dom.hudTop.style.display = 'flex';
        if (this.dom.hudSpeed) this.dom.hudSpeed.style.display = 'block';
        if (this.dom.touchControls) this.dom.touchControls.style.display = 'flex';
    }

    /**
     * 更新奶龙说话气泡文本，并触发弹性弹出动效
     */
    setSpeechBubble(text) {
        if (!this.dom.bubbleText || !this.dom.speechBubble) return;
        this.dom.bubbleText.textContent = text;

        // 重启呼吸弹动微动画
        this.dom.speechBubble.style.transform = 'scale(1.08)';
        setTimeout(() => {
            if (this.dom.speechBubble) this.dom.speechBubble.style.transform = '';
        }, 160);
    }

    /**
     * 在屏幕中间弹出欢快互动的爱心/星星粒子
     */
    spawnReaction(emoji = '💖') {
        if (!this.dom.reactionContainer) return;
        const emojis = ['💖', '✨', '⭐', '🦖', '🌟'];
        const chosen = emoji || emojis[Math.floor(Math.random() * emojis.length)];

        const el = document.createElement('div');
        el.className = 'floating-reaction';
        el.textContent = chosen;

        // 居中扩散微随机位置
        const left = 44 + (Math.random() * 20 - 10);
        const top = 42 + (Math.random() * 16 - 8);
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;

        this.dom.reactionContainer.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 1200);
    }

    /**
     * 动态渲染地图选择列表
     */
    renderMapList(maps, currentMapId, onSelectMap) {
        if (!this.dom.mapListContainer) return;
        this.dom.mapListContainer.innerHTML = '';

        maps.forEach(map => {
            const card = document.createElement('div');
            const isActive = map.id === currentMapId;
            const isLocked = !map.available;

            card.className = `map-card-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
            card.innerHTML = `
                <div class="map-item-left">
                    <div class="map-item-icon">${map.icon}</div>
                    <div class="map-item-info">
                        <div class="map-item-name">${map.name}</div>
                        <div class="map-item-desc">${map.description}</div>
                    </div>
                </div>
                <div class="map-item-badge ${isActive ? 'active-badge' : isLocked ? 'lock-badge' : ''}">
                    ${isActive ? '当前冒险' : isLocked ? '敬请期待' : '切换'}
                </div>
            `;

            if (!isLocked) {
                card.addEventListener('click', () => {
                    if (onSelectMap) onSelectMap(map.id);
                    this.hideMapModal();
                });
            }

            this.dom.mapListContainer.appendChild(card);
        });
    }

    /**
     * 跑酷实时 HUD 刷新
     */
    updateHUD(state) {
        // 1. 关卡倒计时与进度条 (30秒循环模式)
        const elapsed = (state.score / 120) % 30;
        const remainSec = Math.max(1, Math.ceil(30 - elapsed));
        if (this.dom.stageTimer) this.dom.stageTimer.textContent = `${remainSec}s`;
        if (this.dom.stageProgress) {
            const pct = Math.min(100, (elapsed / 30) * 100);
            this.dom.stageProgress.style.width = `${pct}%`;
        }

        // 2. 右上角计米器 (格式化 6 位数字，如 027131 米)
        const m = Math.floor(state.score);
        const mStr = String(m).padStart(6, '0');
        if (this.dom.scoreText) this.dom.scoreText.textContent = `${mStr} 米`;

        // 金币数
        if (this.dom.coinText) this.dom.coinText.textContent = `${state.coins}`;

        // 暴走/道具倍率
        if (this.dom.multiplierTag) {
            const mult = state.player.props.milk > 0 ? 'x4' : 'x2';
            this.dom.multiplierTag.textContent = mult;
        }

        // 3. 左下角速度与屋顶冲刺状态标签
        const currentSpeedKmh = Math.floor(state.speed);
        if (this.dom.speedValue) this.dom.speedValue.textContent = `${currentSpeedKmh}`;

        if (this.dom.statusTag) {
            if (state.player.props.milk > 0) {
                this.dom.statusTag.textContent = '🔥 奶瓶暴走';
                this.dom.statusTag.style.color = '#ff4757';
            } else if (state.player.isOnRoof) {
                this.dom.statusTag.textContent = '⚡ 屋顶冲刺';
                this.dom.statusTag.style.color = '#00d2d3';
            } else {
                this.dom.statusTag.textContent = '极限巡航';
                this.dom.statusTag.style.color = '#78e08f';
            }
        }
    }

    updateMuteIcon(isMuted) {
        if (this.dom.muteIcon) {
            this.dom.muteIcon.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    // ================= 弹窗管理 =================
    showMapModal() {
        if (this.dom.mapModal) this.dom.mapModal.style.display = 'flex';
    }

    hideMapModal() {
        if (this.dom.mapModal) this.dom.mapModal.style.display = 'none';
    }

    showWardrobeModal() {
        if (this.dom.wardrobeModal) this.dom.wardrobeModal.style.display = 'flex';
    }

    hideWardrobeModal() {
        if (this.dom.wardrobeModal) this.dom.wardrobeModal.style.display = 'none';
    }

    showRankModal(myScore) {
        if (this.dom.rankModal) {
            this.dom.rankModal.style.display = 'flex';
            if (this.dom.rankMyScore) {
                this.dom.rankMyScore.textContent = `${Math.floor(myScore)} 米`;
            }
        }
    }

    hideRankModal() {
        if (this.dom.rankModal) this.dom.rankModal.style.display = 'none';
    }

    showDailyModal() {
        if (this.dom.dailyModal) this.dom.dailyModal.style.display = 'flex';
    }

    hideDailyModal() {
        if (this.dom.dailyModal) this.dom.dailyModal.style.display = 'none';
    }

    showGameOver(score, coins, joke) {
        if (this.dom.gameOverModal) {
            this.dom.gameOverModal.style.display = 'flex';
            if (this.dom.finalScore) this.dom.finalScore.textContent = `${Math.floor(score)} 米`;
            if (this.dom.finalCoins) this.dom.finalCoins.textContent = `${coins}`;
            if (this.dom.deathJoke) this.dom.deathJoke.textContent = joke || '等我奶蛙跑酷达到10万米我也要去问问许嵩 那阵子我们的感情到底出了什么问题#奶蛙';
        }
    }

    hideGameOver() {
        if (this.dom.gameOverModal) this.dom.gameOverModal.style.display = 'none';
    }

    showPause() {
        if (this.dom.pauseModal) this.dom.pauseModal.style.display = 'flex';
    }

    hidePause() {
        if (this.dom.pauseModal) this.dom.pauseModal.style.display = 'none';
    }

    hideAllModals() {
        this.hideMapModal();
        this.hideWardrobeModal();
        this.hideRankModal();
        this.hideDailyModal();
        this.hidePause();
        this.hideGameOver();
    }
}
