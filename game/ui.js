/**
 * 奶蛙快跑 - 高度定制 UI 系统 (包含主页面互动、地图漫游、拓展玩法弹窗与对标跑酷 HUD)
 */
const MAP_PREVIEWS = {
    egypt: `<rect width="100" height="82" fill="#f3e8ce"/><circle cx="77" cy="20" r="10" fill="#ebbd54"/><path d="M3 68 34 22 65 68Z" fill="#cea766"/><path d="M34 22 65 68 42 68Z" fill="#b99156"/><path d="M49 68 72 36 97 68Z" fill="#e3c38b"/><path d="M0 70h100" stroke="#a58d61" stroke-width="2"/><rect x="8" y="60" width="84" height="5" rx="2" fill="#278f8b"/>`,
    store: `<rect width="100" height="82" fill="#eaf1e5"/><rect x="6" y="12" width="33" height="58" rx="4" fill="#519488"/><rect x="10" y="17" width="25" height="40" rx="2" fill="#cce0d2"/><path d="M12 31h21M12 45h21" stroke="#519488" stroke-width="2"/><rect x="17" y="23" width="4" height="7" rx="1" fill="#e9bc62"/><rect x="25" y="38" width="5" height="7" rx="1" fill="#e07d66"/><rect x="65" y="22" width="26" height="48" rx="10" fill="#e78068"/><rect x="70" y="31" width="16" height="24" rx="2" fill="#fff0d8"/><path d="M76 35v16M72 43h8" stroke="#519488" stroke-width="3"/><path d="m42 66 11-19q3-5 6 0l11 19q2 4-3 4H45q-5 0-3-4" fill="#fff6e7" stroke="#d5c6ac"/><rect x="50" y="61" width="12" height="9" rx="1" fill="#344c40"/><path d="M0 74h100" stroke="#bccbb8" stroke-width="2"/>`,
    tea: `<rect width="100" height="82" fill="#f6e9d7"/><path d="M0 61q18-7 34 0t34 0 32 0v21H0Z" fill="#cd9b6c"/><path d="m54 20 27-4-4 41H59Z" fill="#e5b987" stroke="#a67a50" stroke-width="2"/><path d="m56 24 23-3M65 11l10 24" stroke="#9a776a" stroke-width="5"/><rect x="52" y="16" width="31" height="7" rx="3" fill="#fff6e5"/><circle cx="65" cy="47" r="4" fill="#604a3b"/><circle cx="74" cy="49" r="4" fill="#604a3b"/><ellipse cx="30" cy="55" rx="23" ry="10" fill="#fff4df"/><path d="M8 56v9q23 13 46 0v-9" fill="#edcf9e"/><ellipse cx="30" cy="54" rx="23" ry="8" fill="#fff6e7"/><circle cx="19" cy="70" r="6" fill="#604a3b"/><circle cx="85" cy="68" r="8" fill="#604a3b"/><circle cx="19" cy="20" r="6" fill="none" stroke="#ddb58b" stroke-width="2"/>`,
    pond: `<rect width="100" height="82" fill="#f5d9bb"/><circle cx="78" cy="20" r="11" fill="#eaa875"/><rect y="53" width="100" height="29" fill="#8dad8d"/><path d="M3 17q46 20 94 0" fill="none" stroke="#7b7551" stroke-width="1.5"/><path d="M19 24v4M38 30v4M59 30v4M79 24v4" stroke="#fff6cf" stroke-width="4" stroke-linecap="round"/><rect x="65" y="35" width="18" height="26" rx="2" fill="#526350"/><circle cx="74" cy="48" r="6" fill="#a7b99a"/><circle cx="74" cy="39" r="2" fill="#d8debd"/><ellipse cx="34" cy="65" rx="26" ry="12" fill="#5c8d5e"/><path d="m34 65 24-8-11 15Z" fill="#8dad8d"/><ellipse cx="33" cy="56" rx="16" ry="6" fill="#d99a73"/><path d="M17 56v7q16 9 32 0v-7" fill="#b46f54"/><ellipse cx="33" cy="55" rx="16" ry="5" fill="#f5dcbd"/>`,
    laundry: `<rect width="100" height="82" fill="#efece7"/><path d="M0 68q7-14 21-7 12-15 26-5 9-8 19 0 23-8 34 9v17H0Z" fill="#fffaf0"/><rect x="8" y="36" width="35" height="35" rx="5" fill="#b7acbd"/><rect x="11" y="40" width="29" height="6" rx="2" fill="#e6dce6"/><circle cx="25" cy="58" r="10" fill="#706c80"/><circle cx="25" cy="58" r="7" fill="#e8e4ed"/><path d="M46 14q22 9 49 2" fill="none" stroke="#918375" stroke-width="2"/><path d="m53 18-4 5 6 7 4-3 3 20h16l1-20 4 3 6-7-5-5-9 5h-13Z" fill="#d9a17f"/><path d="m89 20-1 19h-7v7h14V21" fill="#9eac8e"/><rect x="57" y="57" width="30" height="6" rx="3" fill="#c6c4a8"/><rect x="60" y="63" width="32" height="6" rx="3" fill="#c8b8c9"/>`,
};

function mapPreview(map) {
    const drawing = MAP_PREVIEWS[map.id];
    return drawing
        ? `<svg viewBox="0 0 100 82" aria-hidden="true" focusable="false">${drawing}</svg>`
        : `<span aria-hidden="true">${map.icon}</span>`;
}

const OUTFIT_PREVIEWS = {
    base: '<ellipse cx="38" cy="44" rx="20" ry="26" fill="#f4c74b"/><ellipse cx="38" cy="52" rx="14" ry="16" fill="#fae6b9"/><circle cx="31" cy="27" r="4" fill="#769b5c"/><circle cx="45" cy="27" r="4" fill="#769b5c"/><circle cx="31" cy="27" r="2" fill="#273d2e"/><circle cx="45" cy="27" r="2" fill="#273d2e"/><path d="M33 34q5 3 10 0" stroke="#89652f" stroke-width="1.3" fill="none"/>',
    nurse: '<path d="m22 27-10 8 6 10 6-4v26h29V41l5 4 6-10-11-8-15 5Z" fill="#efb6c6"/><path d="M28 32h20l4 35H24Z" fill="#fff9ed"/><path d="M25 8h26l3 14H22Z" fill="#fff9ed"/><path d="M35 12h6v3h4v6h-4v3h-6v-3h-4v-6h4Z" fill="#cc597d"/><path d="M35 41h6m-3-3v6" stroke="#cc597d" stroke-width="1.6"/>',
    thief: '<path d="m23 29-12 7 7 12 7-4v24h28V44l5 4 7-12-12-7-15 5Z" fill="#f8f3e4"/><path d="M19 35h38M23 44h32M25 53h28M25 62h28" stroke="#4a5150" stroke-width="5"/><path d="M24 20q14-10 28 0l-2 6H26Z" fill="#495150"/><ellipse cx="31" cy="23" rx="4" ry="2" fill="#f4c74b"/><ellipse cx="45" cy="23" rx="4" ry="2" fill="#f4c74b"/><path d="M23 14q15-20 30 0Z" fill="#535651"/>',
    street: '<path d="m23 27-11 8 7 13 7-4v24h26V44l6 4 7-13-12-8-14 8Z" fill="#fff5df"/><path d="M26 31v37h25V31l-12 8Z" fill="#8faf9a"/><path d="M39 38v29" stroke="#fff5df" stroke-width="2"/><path d="m31 43 4 7 3-7" stroke="#406755" stroke-width="1.7" fill="none"/><path d="M21 17q17-17 34 0v5H21Z" fill="#8faf9a"/><path d="M21 21H12q-4 5 2 5h19" fill="#406755"/>',
    ufo: '<ellipse cx="38" cy="47" rx="18" ry="22" fill="#b6d66f"/><path d="M23 55h30M28 46h20" stroke="#665789" stroke-width="3"/><ellipse cx="38" cy="27" rx="28" ry="9" fill="#665789"/><path d="M24 25a14 17 0 0 1 28 0Z" fill="#b6d66f"/><ellipse cx="38" cy="27" rx="28" ry="5" fill="#807099"/><circle cx="18" cy="28" r="2" fill="#effbc1"/><circle cx="38" cy="31" r="2" fill="#effbc1"/><circle cx="58" cy="28" r="2" fill="#effbc1"/><path d="M38 11V5" stroke="#665789" stroke-width="1.5"/><circle cx="38" cy="5" r="3" fill="#b6d66f"/>',
    tv: '<ellipse cx="38" cy="54" rx="20" ry="18" fill="#475e68"/><path d="M22 49h32" stroke="#c98567" stroke-width="3"/><path d="M24 58h28" stroke="#e9d8b7" stroke-width="1.5"/><rect x="14" y="13" width="48" height="29" rx="6" fill="#bc9274"/><rect x="19" y="18" width="34" height="19" rx="3" fill="#e9d8b7"/><path d="m24 22 6 3-6 3 7 3-4 3m12-13 4 3-5 3 8 3-5 3" stroke="#829a8e" stroke-width="1.5" fill="none"/><circle cx="57" cy="25" r="1.5" fill="#665847"/><circle cx="57" cy="32" r="1.5" fill="#665847"/><path d="m31 13-6-7m20 7 6-7" stroke="#665847" stroke-width="1.7" stroke-linecap="round"/>',
    jellyfish: '<ellipse cx="38" cy="52" rx="20" ry="20" fill="#adbdcc"/><path d="M12 28a26 23 0 0 1 52 0q-7 9-13 0-7 9-13 0-7 9-13 0-7 9-13 0Z" fill="#c7b4d1"/><path d="M21 31q-8 11 0 19m10-17q6 8-1 15m17-15q-7 10 2 18m9-20q8 8 0 15" stroke="#b098c1" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="13" rx="8" ry="3" fill="#e9dbe8" transform="rotate(-22 31 13)"/><path d="M31 56h14" stroke="#dfd6e9" stroke-width="2"/>',
    mushroom: '<ellipse cx="38" cy="54" rx="20" ry="19" fill="#607e68"/><path d="M28 28h20v14H28Z" fill="#f2e8c9"/><path d="M9 28C15 0 58 0 67 28q-29 11-58 0Z" fill="#df877a"/><ellipse cx="38" cy="29" rx="29" ry="5" fill="#e9c1a0"/><circle cx="26" cy="16" r="4" fill="#f5e8c9"/><circle cx="43" cy="12" r="4" fill="#f5e8c9"/><circle cx="54" cy="22" r="3" fill="#f5e8c9"/><circle cx="17" cy="24" r="3" fill="#f5e8c9"/><rect x="26" y="46" width="10" height="12" rx="2" fill="#ffead8"/><path d="M43 45v21" stroke="#8ba78d" stroke-width="1.5"/>',
    zipper: '<ellipse cx="38" cy="44" rx="23" ry="27" fill="#874658"/><ellipse cx="38" cy="25" rx="16" ry="12" fill="#f4c74b"/><path d="M18 17q3-22 20-17 17-5 20 17Z" fill="#874658"/><ellipse cx="38" cy="51" rx="16" ry="11" fill="#302d3f"/><path d="M22 49h32M23 53h30" stroke="#b99568" stroke-width="2"/><path d="M25 47v8m5-8v8m5-8v8m5-8v8m5-8v8m5-8v8" stroke="#ffe4b8" stroke-width="1.5"/><rect x="49" y="47" width="5" height="9" rx="1" fill="#a58853"/><circle cx="31" cy="24" r="3" fill="#76975d"/><circle cx="45" cy="24" r="3" fill="#76975d"/><path d="M32 32q6 3 12 0" stroke="#a28152" stroke-width="1.5" fill="none"/>',
    dumpling: '<ellipse cx="38" cy="53" rx="21" ry="19" fill="#dfca9d"/><path d="M12 32Q11 15 25 10L38 5l13 5q14 5 13 22-27 14-52 0Z" fill="#f5e8c8"/><path d="m38 7-6 27m6-27 6 27m-12-23-10 19m22-19 10 19m-16-9v15" stroke="#dbc696" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="37" rx="24" ry="4" fill="#b8bf92"/><path d="M30 50h16M30 56h16" stroke="#fff1d3" stroke-width="2"/>',
};

function wardrobePreviewIcon(id, type) {
    if (type === 'wing') return `<svg viewBox="0 0 76 78" aria-hidden="true" focusable="false">${id === 'none'
        ? '<circle cx="38" cy="39" r="21" fill="none" stroke="#c9c4b7" stroke-width="1.4"/><path d="m23 54 30-30" stroke="#c9c4b7" stroke-width="1.4"/>'
        : '<path d="M36 53C12 57 8 32 11 18c10 7 15 11 23 13l4 17Z" fill="#e7c787"/><path d="M40 53c24 4 28-21 25-35-10 7-15 11-23 13l-4 17Z" fill="#e7c787"/><path d="M36 49C13 51 13 34 14 23c9 9 14 12 22 14Zm4 0c23 2 23-15 22-26-9 9-14 12-22 14Z" fill="#fff3d2"/><path d="m19 32 13 11m-13-4 12 7m26-14-13 11m13-4-12 7" stroke="#cfb37f" stroke-width="1.2" stroke-linecap="round"/>'}</svg>`;
    const key = ({ none: 'base', default: 'base', original: 'base', bandit: 'thief', casual: 'street' })[id] || id;
    return `<svg viewBox="0 0 76 78" aria-hidden="true" focusable="false">${OUTFIT_PREVIEWS[key] || OUTFIT_PREVIEWS.base}</svg>`;
}

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
            challengeHud: document.getElementById('challengeHud'),
            challengeIcon: document.getElementById('challengeIcon'),
            challengeTitle: document.getElementById('challengeTitle'),
            challengeCount: document.getElementById('challengeCount'),
            challengeInstruction: document.getElementById('challengeInstruction'),
            challengeFeedback: document.getElementById('challengeFeedback'),
            challengeProgress: document.getElementById('challengeProgress'),
            wingSkinList: document.getElementById('wingSkinList'),
            outfitSkinList: document.getElementById('outfitSkinList'),
            wardrobePreview: document.getElementById('wardrobePreview'),
            wardrobePreviewName: document.getElementById('wardrobePreviewName'),
            btnWardrobeClothes: document.getElementById('btnWardrobeClothes'),
            btnWardrobeWings: document.getElementById('btnWardrobeWings'),
            btnWardrobeLeft: document.getElementById('btnWardrobeLeft'),
            btnWardrobeRight: document.getElementById('btnWardrobeRight'),
            btnWardrobeReset: document.getElementById('btnWardrobeReset'),
            btnEquipWardrobe: document.getElementById('btnEquipWardrobe'),
            wardrobeSectionNote: document.getElementById('wardrobeSectionNote'),
            wardrobeCoins: document.getElementById('wardrobeCoins'),
            wardrobePurchaseMessage: document.getElementById('wardrobePurchaseMessage'),
            outfitBrowser: document.getElementById('outfitBrowser'),
            outfitFilters: document.getElementById('outfitFilters'),
            outfitCount: document.getElementById('outfitCount'),
            btnOutfitPrev: document.getElementById('btnOutfitPrev'),
            btnOutfitNext: document.getElementById('btnOutfitNext'),

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
            btnOpenAchievements: document.getElementById('btnOpenAchievements'),
            btnOpenRank: document.getElementById('btnOpenRank'),
            btnOpenDaily: document.getElementById('btnOpenDaily'),

            lobbyMapTitle: document.getElementById('lobbyMapTitle'),
            lobbyMapCard: document.getElementById('lobbyMapCard'),
            lobbyMapTag: document.getElementById('lobbyMapTag'),
            lobbyStartHint: document.getElementById('lobbyStartHint'),
            btnChangeMap: document.getElementById('btnChangeMap'),
            btnStartRun: document.getElementById('btnStartRun'),

            // 弹窗群
            mapModal: document.getElementById('mapModal'),
            mapListContainer: document.getElementById('mapListContainer'),
            btnCloseMapModal: document.getElementById('btnCloseMapModal'),

            wardrobeModal: document.getElementById('wardrobeModal'),
            btnCloseWardrobeModal: document.getElementById('btnCloseWardrobeModal'),

            achievementsModal: document.getElementById('achievementsModal'),
            btnCloseAchievementsModal: document.getElementById('btnCloseAchievementsModal'),
            achBestDistance: document.getElementById('achBestDistance'),
            achLifetimeCoins: document.getElementById('achLifetimeCoins'),
            achJumps: document.getElementById('achJumps'),
            achSlides: document.getElementById('achSlides'),

            rankModal: document.getElementById('rankModal'),
            rankList: document.getElementById('rankList'),
            rankSummary: document.getElementById('rankSummary'),
            btnCloseRankModal: document.getElementById('btnCloseRankModal'),

            dailyModal: document.getElementById('dailyModal'),
            btnClaimDaily: document.getElementById('btnClaimDaily'),
            dailyDescription: document.getElementById('dailyDescription'),
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
        const tabs = [this.dom.btnWardrobeClothes, this.dom.btnWardrobeWings];
        for (const button of tabs) button?.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tabs[1 - tabs.indexOf(button)];
            next.click(); next.focus({ preventScroll: true });
        });
        this.outfitFilter = 'all';
        this.outfitScrollPositions = {};
        this.dom.outfitFilters?.addEventListener('click', event => {
            const button = event.target.closest('[data-outfit-filter]');
            if (!button || !this.outfitBrowserState) return;
            this.outfitScrollPositions[this.outfitFilter] = this.dom.outfitSkinList.scrollLeft;
            this.outfitFilter = button.dataset.outfitFilter;
            this.renderOutfitBrowser();
        });
        for (const [button, direction] of [[this.dom.btnOutfitPrev, -1], [this.dom.btnOutfitNext, 1]]) {
            button?.addEventListener('click', () => this.dom.outfitSkinList.scrollBy({ left: direction * this.dom.outfitSkinList.clientWidth * .75, behavior: 'smooth' }));
        }
        this.dom.outfitSkinList?.addEventListener('scroll', () => {
            this.outfitScrollPositions[this.outfitFilter] = this.dom.outfitSkinList.scrollLeft;
            this.updateOutfitBrowseArrows();
        }, { passive: true });
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
        this.updateChallenge(null);

        // 关闭所有弹窗
        this.hideAllModals();

        // 刷新主页统计
        if (data.coins !== undefined && this.dom.lobbyCoins) {
            this.dom.lobbyCoins.textContent = data.coins;
        }
        if (data.highScore !== undefined && this.dom.lobbyHighScore) {
            this.dom.lobbyHighScore.textContent = `${Math.floor(data.highScore)}m`;
        }
        if (data.currentMap) this.applyMap(data.currentMap);
    }

    /** 地图文案与颜色只更新对应节点，保留其余界面的颜色。 */
    applyMap(map) {
        this.currentMap = map;
        if (this.dom.lobbyMapTitle) this.dom.lobbyMapTitle.textContent = `${map.name} ${map.icon || ''}`;
        if (this.dom.lobbyStartHint) this.dom.lobbyStartHint.textContent = map.startHint || '变道、跳跃、滑铲，探索前方的世界！';
        if (this.dom.lobbyMapTag) {
            this.dom.lobbyMapTag.textContent = map.stageTitle || map.name;
            this.dom.lobbyMapTag.style.backgroundColor = map.themeColor;
            this.dom.lobbyMapTag.style.color = '#fff';
        }
        if (this.dom.lobbyMapCard) this.dom.lobbyMapCard.style.borderColor = map.themeColor;
        if (this.dom.stageName) this.dom.stageName.textContent = map.stageTitle || map.name;
        if (this.dom.stageSub) this.dom.stageSub.textContent = map.stageSubtitle || map.tag;
        if (this.dom.stageProgress) this.dom.stageProgress.style.backgroundColor = map.themeColor;
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
            const card = document.createElement('button');
            const isActive = map.id === currentMapId;
            const isLocked = !map.available;

            card.className = `map-card-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
            card.type = 'button';
            card.dataset.map = map.id;
            card.disabled = isLocked;
            card.style.setProperty('--map-color', map.themeColor);
            card.setAttribute('aria-label', `${map.name}，${isActive ? '当前地图' : isLocked ? '尚未开放' : '开始探索'}`);
            if (isActive) card.setAttribute('aria-current', 'true');
            card.innerHTML = `
                <div class="map-item-preview">${mapPreview(map)}</div>
                <div class="map-item-info">
                    <div class="map-item-heading">
                        <div class="map-item-name">${map.name}</div>
                        <span class="map-item-badge ${isActive ? 'active-badge' : isLocked ? 'lock-badge' : ''}">
                            ${isActive ? '当前' : isLocked ? '筹备中' : '出发'}
                        </span>
                    </div>
                    <div class="map-item-tag">${map.tag}</div>
                    <div class="map-item-desc">${map.shortDescription || map.description}</div>
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
        this.updateChallenge(state.player.isFlying ? {
            id: 'flight', title: '云翼飞行', completed: 0, total: 0,
            remaining: state.player.props.flight || state.player.flightLandingTimer,
            instruction: '左右换道收集空中金币，天空没有障碍',
            feedback: state.player.props.flight > 0 ? '肚皮朝下 · 自动飞行' : '准备降落 · 跑道已清空',
            progress: state.player.props.flight / 8,
        } : state.challenge);
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
            if (state.player.isFlying) {
                this.dom.statusTag.textContent = '🪽 翅膀飞行';
                this.dom.statusTag.style.color = '#f6dda1';
            } else if (state.player.props.milk > 0) {
                this.dom.statusTag.textContent = '🔥 奶瓶暴走';
                this.dom.statusTag.style.color = '#ff4757';
            } else if (state.player.mapChallengeLabel) {
                this.dom.statusTag.textContent = `✦ ${state.player.mapChallengeLabel}`;
                this.dom.statusTag.style.color = '#f6dda1';
            } else if (state.player.isOnRoof) {
                this.dom.statusTag.textContent = `⚡ ${this.currentMap?.roofLabel || '高台冲刺'}`;
                this.dom.statusTag.style.color = '#00d2d3';
            } else if (state.player.mapFeatureLabel) {
                this.dom.statusTag.textContent = `✨ ${state.player.mapFeatureLabel}`;
                this.dom.statusTag.style.color = '#a6edc2';
            } else {
                this.dom.statusTag.textContent = '极限巡航';
                this.dom.statusTag.style.color = '#78e08f';
            }
        }
    }

    updateChallenge(challenge) {
        const d = this.dom;
        if (!d.challengeHud) return;
        d.challengeHud.hidden = !challenge;
        if (!challenge) return;
        const theme = challenge.id.split(':')[0];
        d.challengeHud.dataset.theme = theme;
        d.challengeIcon.textContent = { store: '🛒', tea: '🫧', pond: '♫', laundry: '🧦', flight: '🪽' }[theme] || '✦';
        d.challengeTitle.textContent = challenge.title;
        d.challengeCount.textContent = challenge.total ? `${challenge.completed}/${challenge.total}` : `${Math.ceil(challenge.remaining)}s`;
        d.challengeInstruction.textContent = challenge.instruction;
        d.challengeFeedback.textContent = challenge.feedback || (challenge.combo ? `${challenge.combo} 连击` : '跟随赛道上的动作标记');
        d.challengeHud.dataset.complete = String(challenge.total > 0 && challenge.completed === challenge.total);
        d.challengeProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, challenge.progress || 0))})`;
    }

    updateMuteIcon(isMuted) {
        if (this.dom.muteIcon) {
            this.dom.muteIcon.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    renderSkins(list, skins, equippedId, previewId, onPreview, type, inventoryState) {
        if (!list) return;
        list.replaceChildren();
        const ownedIds = new Set(inventoryState?.[type === 'outfit' ? 'outfits' : 'wings'] || ['none']);
        for (const skin of skins) {
            const owned = ownedIds.has(skin.id);
            const equipped = owned && skin.id === equippedId;
            const price = Math.max(0, Math.floor(Number(skin.price) || 0));
            const button = document.createElement('button');
            button.type = 'button'; button.className = `skin-card ${type}-skin-card`;
            button.classList.toggle('active', skin.id === previewId);
            button.classList.toggle('equipped', equipped);
            button.classList.toggle('locked', !owned);
            button.dataset[type] = skin.id;
            button.dataset.owned = String(owned);
            if (skin.description) button.title = skin.description;
            button.setAttribute('aria-pressed', String(skin.id === previewId));
            button.setAttribute('aria-label', `${skin.name}，${equipped ? '已装备' : owned ? '已解锁' : `未解锁，售价 ${price.toLocaleString('zh-CN')} 金币`}，点击试穿`);
            const icon = document.createElement('span'); icon.className = 'skin-illustration'; icon.innerHTML = wardrobePreviewIcon(skin.id, type);
            const name = document.createElement('span'); name.className = 'skin-name'; name.textContent = skin.name;
            const tag = document.createElement('span'); tag.className = `skin-tag${owned ? '' : ' skin-price'}`;
            tag.textContent = equipped ? '已装备' : owned ? skin.id === 'none' ? '免费' : '已解锁' : `✦ ${price.toLocaleString('zh-CN')}`;
            button.append(icon, name, tag);
            if (!owned) {
                const lock = document.createElement('span'); lock.className = 'skin-lock-badge'; lock.setAttribute('aria-hidden', 'true');
                lock.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="10" r="1" fill="#fff9e9"/></svg>';
                button.append(lock);
            }
            button.addEventListener('click', () => onPreview?.(skin.id));
            list.append(button);
        }
    }

    renderOutfitSkins(skins, equippedId, previewId, onPreview, inventoryState) {
        if (onPreview) this.onPreviewOutfit = onPreview;
        if (this.outfitBrowserState && !this.dom.outfitSkinList.hidden) {
            this.outfitScrollPositions[this.outfitFilter] = this.dom.outfitSkinList.scrollLeft;
        }
        this.outfitBrowserState = { skins: Object.values(skins), equippedId, previewId, inventoryState };
        this.renderOutfitBrowser();
    }

    renderOutfitBrowser() {
        const state = this.outfitBrowserState;
        if (!state) return;
        const weirdIds = ['ufo', 'tv', 'jellyfish', 'mushroom', 'zipper', 'dumpling'];
        const category = skin => skin.category || (weirdIds.includes(skin.id) ? 'weird' : 'daily');
        const filtered = state.skins.filter(skin => this.outfitFilter === 'all' || category(skin) === this.outfitFilter);
        this.renderSkins(this.dom.outfitSkinList, filtered, state.equippedId, state.previewId, this.onPreviewOutfit, 'outfit', state.inventoryState);
        for (const button of this.dom.outfitFilters.querySelectorAll('[data-outfit-filter]')) {
            const selected = button.dataset.outfitFilter === this.outfitFilter;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        }
        this.dom.outfitCount.textContent = this.outfitFilter === 'all' ? `${state.skins.length} 套造型` : `${filtered.length} / ${state.skins.length} 套`;
        this.dom.outfitSkinList.scrollLeft = this.outfitScrollPositions[this.outfitFilter] || 0;
        this.updateOutfitBrowseArrows();
    }

    updateOutfitBrowseArrows() {
        const list = this.dom.outfitSkinList;
        if (!list) return;
        this.dom.btnOutfitPrev.disabled = list.scrollLeft <= 2;
        this.dom.btnOutfitNext.disabled = list.scrollLeft >= list.scrollWidth - list.clientWidth - 2;
    }

    renderWingSkins(skins, equippedId, onPreview, previewId = equippedId, inventoryState) {
        if (onPreview) this.onPreviewWing = onPreview;
        this.renderSkins(this.dom.wingSkinList, [{ id: 'none', name: '不佩戴翅膀', price: 0 }, ...Object.values(skins)], equippedId, previewId, this.onPreviewWing, 'wing', inventoryState);
    }

    showWardrobeTab(type) {
        const clothes = type !== 'wings';
        this.wardrobeTab = clothes ? 'clothes' : 'wings';
        this.dom.outfitSkinList.hidden = !clothes;
        this.dom.wingSkinList.hidden = clothes;
        this.dom.outfitBrowser.hidden = !clothes;
        for (const [button, active] of [[this.dom.btnWardrobeClothes, clothes], [this.dom.btnWardrobeWings, !clothes]]) {
            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', String(active));
            button.tabIndex = active ? 0 : -1;
        }
        this.dom.wardrobeSectionNote.textContent = clothes ? '点选试穿，喜欢就穿上。' : '翅膀常驻显示，拾到羽毛才会起飞。';
    }

    updateWardrobePreview({ name, equipped, description, owned = true, price = 0, coins = 0, purchaseMessage }) {
        this.dom.wardrobePreviewName.textContent = name;
        const selected = this.outfitBrowserState?.skins.find(skin => skin.id === this.outfitBrowserState.previewId);
        const note = description || (this.wardrobeTab === 'clothes' ? selected?.description : null);
        if (note) this.dom.wardrobeSectionNote.textContent = note;
        this.dom.wardrobeSectionNote.title = this.dom.wardrobeSectionNote.textContent;
        const cost = Math.max(0, Math.floor(Number(price) || 0));
        const wallet = Math.max(0, Math.floor(Number(coins) || 0));
        this.dom.wardrobeCoins.textContent = wallet.toLocaleString('zh-CN');
        const message = typeof purchaseMessage === 'string' ? purchaseMessage : purchaseMessage?.text || '';
        this.dom.wardrobePurchaseMessage.textContent = message;
        this.dom.wardrobePurchaseMessage.hidden = !message;
        this.dom.wardrobePurchaseMessage.dataset.status = /不足|未保存|失败|重试/.test(message) ? 'error' : 'success';
        const button = this.dom.btnEquipWardrobe;
        button.disabled = owned ? equipped : wallet < cost;
        button.classList.toggle('is-equipped', owned && equipped);
        button.classList.toggle('is-purchase', !owned);
        button.classList.toggle('is-short', !owned && wallet < cost);
        button.dataset.action = owned ? 'equip' : 'purchase';
        button.querySelector('span').textContent = owned
            ? equipped ? '已装备' : this.wardrobeTab === 'wings' ? '装备这双翅膀' : '穿上这套'
            : wallet < cost ? `还差 ${(cost - wallet).toLocaleString('zh-CN')} 金币`
                : `✦ ${cost.toLocaleString('zh-CN')} 金币 · ${this.wardrobeTab === 'wings' ? '解锁并装备' : '解锁并穿上'}`;
        button.querySelector('i').textContent = !owned ? '+' : '✓';
    }

    updateDailyAvailability({ claimed }) {
        if (!this.dom.btnClaimDaily) return;
        this.dom.btnClaimDaily.disabled = Boolean(claimed);
        this.dom.btnClaimDaily.textContent = claimed ? '今日已领取' : '领取 100 金币';
        this.dom.btnClaimDaily.classList.toggle('daily-claimed', Boolean(claimed));
        if (this.dom.dailyDescription) this.dom.dailyDescription.textContent = claimed ? '今天的补给已收下，明天再来。' : '每日领一份补给，攒金币解锁新造型。';
        if (this.dom.dailyModal) this.dom.dailyModal.dataset.claimed = String(Boolean(claimed));
    }

    renderAchievements(stats) {
        const format = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('zh-CN');
        for (const [key, node] of [['bestDistance', this.dom.achBestDistance], ['lifetimeCoins', this.dom.achLifetimeCoins], ['jumps', this.dom.achJumps], ['slides', this.dom.achSlides]]) {
            if (node) node.textContent = format(stats?.[key]);
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
        if (this.dom.lobbyOverlay) this.dom.lobbyOverlay.style.visibility = 'hidden';
        this.dom.btnOpenWardrobe?.setAttribute('aria-expanded', 'true');
        this.dom.wardrobePreview?.focus({ preventScroll: true });
    }

    hideWardrobeModal() {
        const wasOpen = this.dom.wardrobeModal?.style.display !== 'none';
        if (this.dom.wardrobeModal) this.dom.wardrobeModal.style.display = 'none';
        if (this.dom.lobbyOverlay) this.dom.lobbyOverlay.style.visibility = '';
        this.dom.btnOpenWardrobe?.setAttribute('aria-expanded', 'false');
        if (wasOpen) {
            this.onWardrobeClose?.();
            this.dom.btnOpenWardrobe?.focus({ preventScroll: true });
        }
    }

    showAchievementsModal(stats) {
        if (stats) this.renderAchievements(stats);
        if (this.dom.achievementsModal) this.dom.achievementsModal.style.display = 'flex';
        this.dom.btnOpenAchievements?.setAttribute('aria-expanded', 'true');
        this.dom.btnCloseAchievementsModal?.focus({ preventScroll: true });
    }

    hideAchievementsModal() {
        const wasOpen = this.dom.achievementsModal?.style.display !== 'none';
        if (this.dom.achievementsModal) this.dom.achievementsModal.style.display = 'none';
        this.dom.btnOpenAchievements?.setAttribute('aria-expanded', 'false');
        if (wasOpen) this.dom.btnOpenAchievements?.focus({ preventScroll: true });
    }

    showRankModal(data = {}) {
        const format = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('zh-CN');
        // The compatibility path is an explicitly labelled historic record,
        // never a fabricated game, date, or coin count.
        const entries = typeof data === 'number' && data > 0 ? [{ distance: data, legacy: true }] : [...(data.entries || [])];
        const time = entry => Number.isFinite(new Date(entry.finishedAt).getTime()) ? new Date(entry.finishedAt).getTime() : 0;
        entries.sort((a, b) => (b.distance || 0) - (a.distance || 0) || (b.coins || 0) - (a.coins || 0) || time(b) - time(a));
        const bestDistance = typeof data === 'number' ? data : data.bestDistance || 0;
        const summary = this.dom.rankSummary; summary.replaceChildren();
        const best = document.createElement('div');
        const bestLabel = document.createElement('span'); bestLabel.textContent = '最远距离';
        const bestValue = document.createElement('strong'); bestValue.textContent = `${format(bestDistance)} 米`;
        best.append(bestLabel, bestValue);
        const count = document.createElement('div');
        const countLabel = document.createElement('span'); countLabel.textContent = '完成跑酷';
        const countValue = document.createElement('strong'); countValue.textContent = `${format(data.totalRuns || 0)} 局`;
        count.append(countLabel, countValue); summary.append(best, count);
        const list = this.dom.rankList; list.replaceChildren(); list.scrollTop = 0;
        if (!entries.length) {
            const empty = document.createElement('li'); empty.className = 'personal-rank-empty';
            const symbol = document.createElement('span'); symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = '↗';
            const title = document.createElement('strong'); title.textContent = '第一局，就从现在开始';
            const note = document.createElement('p'); note.textContent = '完成一次跑酷，距离、金币和地图就会记在这里。';
            empty.append(symbol, title, note); list.append(empty);
        }
        for (const [index, entry] of entries.slice(0, 20).entries()) {
            const item = document.createElement('li'); item.className = `personal-rank-item${entry.legacy ? ' legacy' : ''}`;
            if (entry.id) item.dataset.runId = entry.id;
            const position = document.createElement('span'); position.className = 'personal-rank-position'; position.textContent = String(index + 1).padStart(2, '0');
            const body = document.createElement('div'); body.className = 'personal-rank-body';
            const headline = document.createElement('div'); headline.className = 'personal-rank-headline';
            const distance = document.createElement('strong'); distance.textContent = `${format(entry.distance)} 米`;
            headline.append(distance);
            if (!entry.legacy) {
                const coins = document.createElement('span'); coins.className = 'personal-rank-coins'; coins.textContent = `✦ ${format(entry.coins)} 金币`; headline.append(coins);
            }
            const details = document.createElement('div'); details.className = 'personal-rank-details';
            const map = document.createElement('span'); map.textContent = entry.legacy ? '历史最佳记录' : entry.mapName || '奶蛙跑酷'; details.append(map);
            if (!entry.legacy) {
                const date = document.createElement('time');
                const at = new Date(entry.finishedAt);
                date.textContent = time(entry) ? at.toLocaleString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '未记录时间';
                if (time(entry)) date.dateTime = at.toISOString();
                details.append(date);
            }
            body.append(headline, details); item.append(position, body); list.append(item);
        }
        this.dom.rankModal.style.display = 'flex';
        this.dom.btnOpenRank?.setAttribute('aria-expanded', 'true');
        this.dom.btnCloseRankModal?.focus({ preventScroll: true });
    }

    hideRankModal() {
        const wasOpen = this.dom.rankModal?.style.display !== 'none';
        if (this.dom.rankModal) this.dom.rankModal.style.display = 'none';
        this.dom.btnOpenRank?.setAttribute('aria-expanded', 'false');
        if (wasOpen) this.dom.btnOpenRank?.focus({ preventScroll: true });
    }

    showDailyModal() {
        if (this.dom.dailyModal) this.dom.dailyModal.style.display = 'flex';
    }

    hideDailyModal() {
        if (this.dom.dailyModal) this.dom.dailyModal.style.display = 'none';
    }

    showGameOver(score, coins, joke) {
        this.updateChallenge(null);
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
        this.updateChallenge(null);
        if (this.dom.pauseModal) this.dom.pauseModal.style.display = 'flex';
    }

    hidePause() {
        if (this.dom.pauseModal) this.dom.pauseModal.style.display = 'none';
    }

    hideAllModals() {
        this.hideMapModal();
        this.hideWardrobeModal();
        this.hideAchievementsModal();
        this.hideRankModal();
        this.hideDailyModal();
        this.hidePause();
        this.hideGameOver();
    }
}
