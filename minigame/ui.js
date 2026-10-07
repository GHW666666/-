/** Native WeChat UI. Coordinates are logical screen pixels; the runtime owns DPR. */
import { getNativeIcon } from './icons.js';

const C = { paper: '#fff9eb', ink: '#3b5145', sage: '#739377', faint: '#eeeddf', muted: '#94927c', gold: '#edc36b', coral: '#d78362', error: '#b65d54' };
const MODALS = ['mapModal', 'wardrobeModal', 'achievementsModal', 'rankModal', 'dailyModal', 'pauseModal', 'gameOverModal'];
const IDS = `hudTop hudSpeed touchControls pauseBtn stageCard stageName stageTimer stageSub stageProgress multiplierTag scoreText coinText speedValue statusTag challengeHud challengeIcon challengeTitle challengeCount challengeInstruction challengeFeedback challengeProgress wingSkinList outfitSkinList wardrobePreview wardrobePreviewName btnWardrobeClothes btnWardrobeWings btnWardrobeLeft btnWardrobeRight btnWardrobeReset btnEquipWardrobe wardrobeSectionNote wardrobeCoins wardrobePurchaseMessage outfitBrowser outfitFilters outfitCount btnOutfitPrev btnOutfitNext lobbyOverlay lobbyCoins lobbyHighScore muteIcon btnMute speechBubble bubbleText characterTouchZone reactionContainer btnOpenMaps btnOpenWardrobe btnOpenAchievements btnOpenRank btnOpenDaily lobbyMapTitle lobbyMapCard lobbyMapTag lobbyStartHint btnChangeMap btnStartRun mapModal mapListContainer btnCloseMapModal wardrobeModal btnCloseWardrobeModal achievementsModal btnCloseAchievementsModal achBestDistance achLifetimeCoins achJumps achSlides rankModal rankList rankSummary btnCloseRankModal dailyModal btnClaimDaily dailyDescription btnCloseDailyModal pauseModal btnResume btnPauseToLobby gameOverModal btnRestart btnGameOverToLobby finalScore finalCoins deathJoke`.split(' ');
const format = n => Math.max(0, Math.floor(Number(n) || 0)).toLocaleString('zh-CN');

/** Small event targets, not an HTML renderer. The engine binds its existing callbacks. */
class UINode {
    constructor(id, button = false) {
        this.id = id; this.button = button; this.textContent = ''; this.disabled = false; this.hidden = false;
        this.dataset = {}; this.listeners = new Map(); this.rect = { left: 0, top: 0, width: 0, height: 0 };
        this.style = { display: '', visibility: '', setProperty(key, value) { this[key] = value; } };
        const classes = new Set();
        this.classList = { add: (...names) => names.forEach(n => classes.add(n)), remove: (...names) => names.forEach(n => classes.delete(n)), contains: n => classes.has(n), toggle: (n, force) => { const yes = force ?? !classes.has(n); yes ? classes.add(n) : classes.delete(n); return yes; } };
    }
    addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
    dispatchEvent(event) { event.target ||= this; event.currentTarget = this; event.preventDefault ||= () => {}; event.stopPropagation ||= () => {}; for (const callback of [...(this.listeners.get(event.type) || [])]) callback(event); return true; }
    click() { if (!this.disabled && !this.hidden) this.dispatchEvent({ type: 'click' }); }
    getBoundingClientRect() { const r = this.rect; return { ...r, x: r.left, y: r.top, right: r.left + r.width, bottom: r.top + r.height }; }
    closest(selector) { return selector === 'button' && this.button ? this : null; }
    setAttribute(key, value) { this[key] = value; }
    focus() {}
    setPointerCapture(id) { this.pointerId = id; }
    releasePointerCapture() { this.pointerId = null; }
}

function round(ctx, x, y, w, h, radius, color) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
}
function label(ctx, value, x, y, size = 14, color = C.ink, align = 'left', maxWidth = Infinity, bold = false, weight = 600) {
    ctx.font = `${bold ? `${weight} ` : ''}${size}px sans-serif`; ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = align;
    let text = String(value ?? '');
    if (Number.isFinite(maxWidth) && ctx.measureText(text).width > maxWidth) { while (text.length && ctx.measureText(text + '…').width > maxWidth) text = text.slice(0, -1); text += '…'; }
    ctx.fillText(text, x, y);
}
function lines(ctx, text, x, y, width, size = 14, maxLines = 2, color = C.muted) {
    ctx.font = `${size}px sans-serif`; const output = []; let row = '';
    for (const char of String(text || '')) { if (ctx.measureText(row + char).width > width && row) { output.push(row); row = char; } else row += char; }
    if (row) output.push(row);
    output.slice(0, maxLines).forEach((value, i) => label(ctx, i === maxLines - 1 && output.length > maxLines ? value.slice(0, -1) + '…' : value, x, y + i * (size + 6), size, color));
}

function paper(ctx, x, y, w, h, radius = 21) {
    // The same thin white outline and warm inset as the browser's cream cards.
    round(ctx, x, y, w, h, radius, 'rgba(255,255,255,.91)');
    round(ctx, x + 1, y + 1, w - 2, h - 2, radius - 1, 'rgba(198,178,140,.17)');
    round(ctx, x + 3, y + 3, w - 6, h - 6, radius - 3, C.paper);
}
function path(ctx, points, fill, stroke, width = 1.4) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function circle(ctx, x, y, r, fill, stroke, width = 1.4) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function star(ctx, x, y, outer, inner, fill) {
    path(ctx, Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? inner : outer; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }), fill);
}
function icon(ctx, key, x, y, size = 24, wxApi) {
    const bitmap = wxApi === undefined ? getNativeIcon(key) : getNativeIcon(key, wxApi);
    if (bitmap) { ctx.drawImage(bitmap, x, y, size, size); return; }
    // Images can arrive after the first frame; recognizable vector fallbacks do
    // not depend on emoji fonts or Unicode symbols present on the phone.
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32); ctx.lineCap = ctx.lineJoin = 'round';
    if (key === 'coin' || key === 'achievement') {
        const cy = key === 'achievement' ? 12 : 16, r = key === 'achievement' ? 9 : 12;
        if (key === 'achievement') path(ctx, [[10, 18], [8, 29], [16, 25], [24, 29], [22, 18]], '#9bb6a3');
        circle(ctx, 16, cy, r, '#f2c764'); circle(ctx, 16, cy, r * .7, null, '#bd8b3c', 1.2); star(ctx, 16, cy, r * .52, r * .24, '#fff3c1');
    } else if (key === 'trophy' || key === 'rank') {
        const gold = key === 'rank' ? '#d4b372' : '#d79b5c';
        ctx.beginPath(); ctx.moveTo(10, 6); ctx.lineTo(22, 6); ctx.lineTo(22, 13); ctx.quadraticCurveTo(22, 20, 16, 20); ctx.quadraticCurveTo(10, 20, 10, 13); ctx.closePath(); ctx.fillStyle = gold; ctx.fill();
        path(ctx, [[10, 8], [6, 8], [6, 12], [8, 16], [11, 17]], null, gold);
        path(ctx, [[22, 8], [26, 8], [26, 12], [24, 16], [21, 17]], null, gold);
        path(ctx, [[16, 20], [16, 25]], null, gold); path(ctx, [[11, 26], [21, 26]], null, gold);
        if (key === 'rank') path(ctx, [[13, 12], [15, 14], [19, 10]], null, '#fff4d9'); else star(ctx, 16, 12, 4, 1.8, '#fff2d7');
    } else if (key === 'map') {
        path(ctx, [[4, 7], [12, 4], [20, 7], [28, 4], [28, 25], [20, 28], [12, 25], [4, 28]], '#a8c1a7');
        path(ctx, [[12, 4], [12, 25]], null, '#5b846e'); path(ctx, [[20, 7], [20, 28]], null, '#5b846e');
        path(ctx, [[7, 20], [14, 13], [18, 16], [24, 9]], null, '#fff5da', 2);
    } else if (key === 'wardrobe') {
        path(ctx, [[9, 6], [2, 11], [6, 17], [10, 15], [10, 27], [22, 27], [22, 15], [26, 17], [30, 11], [23, 6]], '#e0b3a1');
        ctx.beginPath(); ctx.moveTo(11, 6); ctx.quadraticCurveTo(16, 13, 20, 6); ctx.strokeStyle = '#8d655b'; ctx.lineWidth = 1.3; ctx.stroke(); path(ctx, [[10, 17], [22, 17]], null, '#8d655b');
    } else if (key === 'daily') {
        round(ctx, 5, 13, 22, 15, 2, '#e0b3a1'); round(ctx, 3, 10, 26, 6, 2, '#e0b3a1');
        path(ctx, [[16, 10], [16, 28]], null, '#fff2d7', 3);
        ctx.beginPath(); ctx.moveTo(16, 10); ctx.quadraticCurveTo(2, 9, 8, 4); ctx.quadraticCurveTo(14, 2, 16, 10); ctx.quadraticCurveTo(19, 1, 25, 5); ctx.quadraticCurveTo(30, 10, 16, 10); ctx.strokeStyle = '#e0b3a1'; ctx.lineWidth = 2.5; ctx.stroke();
    } else if (key.startsWith('sound-')) {
        path(ctx, [[6, 13], [11, 13], [18, 8], [18, 25], [11, 20], [6, 20]], '#7e9a83');
        if (key === 'sound-off') path(ctx, [[5, 6], [27, 28]], null, '#d78362', 2.2);
        else { ctx.beginPath(); ctx.moveTo(22, 11); ctx.quadraticCurveTo(28, 16, 22, 22); ctx.strokeStyle = '#7e9a83'; ctx.lineWidth = 2; ctx.stroke(); }
    } else if (key === 'touch') {
        ctx.beginPath(); ctx.moveTo(9, 18); ctx.lineTo(9, 5); ctx.quadraticCurveTo(9, 1, 13, 3); ctx.lineTo(13, 14); ctx.quadraticCurveTo(25, 10, 26, 17); ctx.lineTo(24, 25); ctx.quadraticCurveTo(17, 32, 11, 25); ctx.lineTo(5, 17); ctx.quadraticCurveTo(5, 13, 9, 18); ctx.fillStyle = '#e8c574'; ctx.fill();
    } else if (key === 'status-wing') {
        path(ctx, [[5, 24], [8, 12], [23, 3], [26, 8], [20, 16], [27, 12], [25, 19], [18, 24], [9, 27]], '#f6dda1');
        path(ctx, [[8, 25], [21, 11]], null, '#bd9c61', 1.7);
    } else if (key === 'status-flame') {
        ctx.beginPath(); ctx.moveTo(17, 2); ctx.quadraticCurveTo(17, 12, 25, 15); ctx.quadraticCurveTo(31, 28, 16, 30); ctx.quadraticCurveTo(1, 26, 8, 15); ctx.lineTo(11, 20); ctx.quadraticCurveTo(17, 13, 17, 2); ctx.fillStyle = '#ff4757'; ctx.fill();
        path(ctx, [[16, 17], [12, 25], [16, 28], [21, 25]], '#f6dda1');
    } else if (key === 'status-bolt') {
        path(ctx, [[18, 2], [6, 18], [14, 18], [11, 30], [26, 12], [18, 12]], '#00d2d3');
    } else if (key === 'status-challenge' || key === 'status-feature') {
        const fill = key === 'status-challenge' ? '#f6dda1' : '#a6edc2';
        path(ctx, [[16, 2], [20, 12], [30, 16], [20, 20], [16, 30], [12, 20], [2, 16], [12, 12]], fill);
    }
    ctx.restore();
}

function wrappedRows(ctx, value, width, size, maxLines = 2) {
    ctx.font = `600 ${size}px sans-serif`; const rows = []; let row = '';
    for (const char of String(value || '')) { if (ctx.measureText(row + char).width > width && row) { rows.push(row); row = char; } else row += char; }
    if (row) rows.push(row);
    if (rows.length === 2) {
        const text = rows.join(''), middle = Math.ceil(text.length / 2), punctuation = [...text].map((char, i) => /[，、；。？！]/.test(char) ? i + 1 : -1).filter(i => i > 3 && i < text.length - 3 && Math.abs(i - middle) <= 4);
        const splits = [...punctuation.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle)), middle];
        const split = splits.find(i => ctx.measureText(text.slice(0, i)).width <= width && ctx.measureText(text.slice(i)).width <= width);
        if (split) { rows[0] = text.slice(0, split); rows[1] = text.slice(split); }
    }
    return rows.slice(0, maxLines).map((text, i) => i === maxLines - 1 && rows.length > maxLines ? text.slice(0, -1) + '…' : text);
}
function statistic(ctx, value, x, y, preferredSize, maxWidth) {
    let size = preferredSize; const text = String(value);
    do { ctx.font = `600 ${size}px sans-serif`; if (ctx.measureText(text).width <= maxWidth || size <= 11) break; size -= .5; } while (size > 11);
    label(ctx, text, x, y, size, C.ink, 'left', maxWidth, true);
}

export class UIManager {
    constructor(wxApi = typeof wx !== 'undefined' ? wx : null) {
        this.wx = wxApi;
        this.dom = Object.fromEntries(IDS.map(id => [id, new UINode(id, id.startsWith('btn') || id === 'pauseBtn')]));
        this.elements = this.dom; this.width = typeof window !== 'undefined' ? window.innerWidth || 375 : 375; this.height = typeof window !== 'undefined' ? window.innerHeight || 667 : 667; this.hits = []; this.pointer = null;
        this.updatePreviewRect();
        this.wardrobeTab = 'clothes'; this.outfitFilter = 'all'; this.outfitPage = 0; this.mapScroll = 0; this.rankScroll = 0;
        this.mapCards = []; this.clothesCards = []; this.wingCards = []; this.rankEntries = []; this.reactions = [];
        for (const name of MODALS) this.dom[name].style.display = 'none';
        this.dom.lobbyOverlay.style.display = 'flex'; this.dom.hudTop.style.display = 'none'; this.dom.hudSpeed.style.display = 'none';
        this.dom.wardrobePurchaseMessage.hidden = true; this.dom.btnClaimDaily.textContent = '领取 100 金币';
        this.dom.btnOutfitPrev.addEventListener('click', () => { this.outfitPage = Math.max(0, this.outfitPage - 1); });
        this.dom.btnOutfitNext.addEventListener('click', () => { this.outfitPage = Math.min(this.outfitPages - 1, this.outfitPage + 1); });
        this.filterNodes = ['all', 'daily', 'weird'].map(filter => { const node = new UINode(`filter-${filter}`, true); node.dataset.outfitFilter = filter; node.addEventListener('click', () => { this.outfitFilter = filter; this.outfitPage = 0; }); return node; });
    }
    activeModal() { return MODALS.find(name => this.dom[name].style.display !== 'none') || null; }
    showLobby(data = {}) {
        this.dom.lobbyOverlay.style.display = 'flex'; this.dom.hudTop.style.display = 'none'; this.dom.hudSpeed.style.display = 'none'; this.hideAllModals(); this.updateChallenge(null);
        if (data.coins !== undefined) this.dom.lobbyCoins.textContent = data.coins;
        if (data.highScore !== undefined) this.dom.lobbyHighScore.textContent = `${Math.floor(data.highScore)}m`;
        if (data.currentMap) this.applyMap(data.currentMap);
    }
    hideLobby() { this.dom.lobbyOverlay.style.display = 'none'; this.dom.hudTop.style.display = 'flex'; this.dom.hudSpeed.style.display = 'block'; }
    applyMap(map) { this.currentMap = map; this.dom.lobbyMapTitle.textContent = map.name; this.dom.lobbyStartHint.textContent = map.startHint || '左右换道，上滑跳跃，下滑滑铲'; this.dom.stageName.textContent = map.stageTitle || map.name; this.dom.stageSub.textContent = map.stageSubtitle || map.tag; }
    setSpeechBubble(text) { this.dom.bubbleText.textContent = text; }
    spawnReaction(text = '♥') { this.reactions.push({ text, start: Date.now() }); }
    updateMuteIcon(muted) { this.muted = muted; this.dom.muteIcon.textContent = muted ? '静音' : '声音'; }
    updateHUD(state) {
        this.dom.scoreText.textContent = `${Math.floor(state.score)} 米`; this.dom.coinText.textContent = state.coins;
        this.dom.speedValue.textContent = Math.floor(state.speed); this.dom.multiplierTag.textContent = state.player.props.milk > 0 ? 'x4' : 'x2';
        const status = state.player.isFlying ? ['翅膀飞行', '#f6dda1', 'status-wing']
            : state.player.props.milk > 0 ? ['奶瓶暴走', '#ff4757', 'status-flame']
            : state.player.mapChallengeLabel ? [state.player.mapChallengeLabel, '#f6dda1', 'status-challenge']
            : state.player.isOnRoof ? [this.currentMap?.roofLabel || '高台冲刺', '#00d2d3', 'status-bolt']
            : state.player.mapFeatureLabel ? [state.player.mapFeatureLabel, '#a6edc2', 'status-feature']
            : ['极限巡航', '#78e08f', ''];
        this.dom.statusTag.textContent = status[0]; this.dom.statusTag.style.color = status[1]; this.dom.statusTag.dataset.icon = status[2];
        this.updateChallenge(state.player.isFlying ? { id: 'flight', title: '云翼飞行', total: 0, remaining: state.player.props.flight || state.player.flightLandingTimer, instruction: '左右换道收集金币，天空没有障碍', feedback: '肚皮朝下 · 自动飞行', progress: state.player.props.flight / 8 } : state.challenge);
    }
    updateChallenge(challenge) { this.challenge = challenge || null; this.dom.challengeHud.hidden = !challenge; }
    renderMapList(maps, selectedId, onSelect) {
        this.mapScroll = 0; this.mapCards = maps.map(map => { const node = new UINode(`map-${map.id}`, true); node.map = map; node.selected = map.id === selectedId; node.disabled = !map.available; node.addEventListener('click', () => { onSelect?.(map.id); this.hideMapModal(); }); return node; });
    }
    makeSkinCards(skins, equippedId, previewId, callback, type, inventoryState) {
        const owned = new Set(inventoryState?.[type === 'clothes' ? 'outfits' : 'wings'] || ['none']);
        return skins.map(skin => { const node = new UINode(`${type}-${skin.id}`, true); node.skin = skin; node.selected = previewId === skin.id; node.owned = owned.has(skin.id); node.equipped = node.owned && equippedId === skin.id; node.dataset.owned = String(node.owned); node.dataset[type] = skin.id; node.addEventListener('click', () => callback?.(skin.id)); return node; });
    }
    renderOutfitSkins(skins, equippedId, previewId, onPreview, inventoryState) {
        if (onPreview) this.onPreviewOutfit = onPreview;
        this.outfitBrowserState = { skins: Object.values(skins), equippedId, previewId, inventoryState };
        this.clothesCards = this.makeSkinCards(Object.values(skins), equippedId, previewId, this.onPreviewOutfit, 'clothes', inventoryState);
    }
    renderOutfitBrowser() { /* Filtering is applied while laying out the native cards. */ }
    updateOutfitBrowseArrows() { this.dom.btnOutfitPrev.disabled = this.outfitPage <= 0; this.dom.btnOutfitNext.disabled = this.outfitPage >= (this.outfitPages || 1) - 1; }
    renderWingSkins(skins, equippedId, onPreview, previewId = equippedId, inventoryState) {
        if (onPreview) this.onPreviewWing = onPreview;
        this.wingCards = this.makeSkinCards([{ id: 'none', name: '不佩戴翅膀', price: 0 }, ...Object.values(skins)], equippedId, previewId, this.onPreviewWing, 'wings', inventoryState);
    }
    showWardrobeTab(type) { this.wardrobeTab = type === 'wings' ? 'wings' : 'clothes'; this.dom.outfitSkinList.hidden = this.wardrobeTab !== 'clothes'; this.dom.wingSkinList.hidden = this.wardrobeTab === 'clothes'; }
    updateWardrobePreview({ name, description, equipped, owned = true, price = 0, coins = 0, purchaseMessage }) {
        const d = this.dom, cost = Math.max(0, Math.floor(Number(price) || 0)), wallet = Math.max(0, Math.floor(Number(coins) || 0));
        d.wardrobePreviewName.textContent = name; d.wardrobeSectionNote.textContent = description || '';
        d.wardrobeCoins.textContent = format(wallet); d.wardrobePurchaseMessage.textContent = typeof purchaseMessage === 'string' ? purchaseMessage : purchaseMessage?.text || '';
        d.wardrobePurchaseMessage.hidden = !d.wardrobePurchaseMessage.textContent;
        d.btnEquipWardrobe.disabled = owned ? equipped : wallet < cost; d.btnEquipWardrobe.dataset.action = owned ? 'equip' : 'purchase';
        d.btnEquipWardrobe.textContent = owned ? equipped ? '已装备' : this.wardrobeTab === 'wings' ? '装备这双翅膀' : '穿上这套' : wallet < cost ? `还差 ${format(cost - wallet)} 金币` : `${format(cost)} 金币 · 解锁并${this.wardrobeTab === 'wings' ? '装备' : '穿上'}`;
    }
    updateDailyAvailability({ claimed }) { this.dom.btnClaimDaily.disabled = Boolean(claimed); this.dom.btnClaimDaily.textContent = claimed ? '今日已领取' : '领取 100 金币'; this.dom.dailyDescription.textContent = claimed ? '今天的补给已收下，明天再来。' : '每日领一份补给，攒金币解锁新造型。'; }
    renderAchievements(stats) { for (const [key, id] of [['bestDistance', 'achBestDistance'], ['lifetimeCoins', 'achLifetimeCoins'], ['jumps', 'achJumps'], ['slides', 'achSlides']]) this.dom[id].textContent = format(stats?.[key]); }
    showMapModal() { this.dom.mapModal.style.display = 'flex'; }
    hideMapModal() { this.dom.mapModal.style.display = 'none'; }
    wardrobeLayout() {
        const top = this.safeHeaderY(), bottom = this.safeBottomInset();
        // A tall capsule leaves less usable room on older 568px phones. Compact
        // the header/catalog instead of expanding the model over touch buttons.
        const compact = this.height - top - bottom < 500, cardHeight = compact ? 65 : 83;
        const equipY = this.height - bottom - 47, cardY = equipY - cardHeight - 36, filterY = cardY - (compact ? 30 : 34);
        const tabHeight = compact ? 26 : 33, tabY = filterY - tabHeight - (compact ? 6 : 8);
        // Keep category tabs with the catalog below the fitting model and its
        // 76px rotation footer. Reclaim their former header space for the model.
        const previewTop = top + (compact ? 51 : 66), previewBottom = tabY - 76;
        return { top, compact, equipY, cardY, cardHeight, filterY, previewTop, previewBottom, previewHeight: Math.max(1, previewBottom - previewTop), tabY, tabHeight, nameY: top + (compact ? 42 : 52), rotateOffset: compact ? 22 : 26, rotateHeight: compact ? 28 : 31 };
    }
    updatePreviewRect() {
        const l = this.wardrobeLayout();
        // Shared WardrobePreview3D reserves 12px at either side and 76px below
        // the model for native/browser rotation controls. Keep that contract.
        this.dom.wardrobePreview.rect = { left: 18, top: l.previewTop, width: this.width - 36, height: l.previewHeight + 76 };
    }
    showWardrobeModal() { this.updatePreviewRect(); this.dom.wardrobeModal.style.display = 'flex'; this.dom.lobbyOverlay.style.visibility = 'hidden'; }
    hideWardrobeModal() { const open = this.dom.wardrobeModal.style.display !== 'none'; this.dom.wardrobeModal.style.display = 'none'; this.dom.lobbyOverlay.style.visibility = ''; if (open) this.onWardrobeClose?.(); }
    showAchievementsModal(stats) { if (stats) this.renderAchievements(stats); this.dom.achievementsModal.style.display = 'flex'; }
    hideAchievementsModal() { this.dom.achievementsModal.style.display = 'none'; }
    showRankModal(data = {}) {
        this.rankData = typeof data === 'number' ? { bestDistance: data, totalRuns: 0 } : data;
        this.rankEntries = typeof data === 'number' && data > 0 ? [{ distance: data, legacy: true }] : [...(data.entries || [])];
        this.rankEntries.sort((a, b) => (b.distance || 0) - (a.distance || 0) || (b.coins || 0) - (a.coins || 0) || (Date.parse(b.finishedAt) || 0) - (Date.parse(a.finishedAt) || 0));
        this.rankEntries = this.rankEntries.slice(0, 20); this.rankScroll = 0; this.dom.rankModal.style.display = 'flex';
    }
    hideRankModal() { this.dom.rankModal.style.display = 'none'; }
    showDailyModal() { this.dom.dailyModal.style.display = 'flex'; }
    hideDailyModal() { this.dom.dailyModal.style.display = 'none'; }
    showGameOver(score, coins, joke) { this.updateChallenge(null); this.dom.finalScore.textContent = `${Math.floor(score)} 米`; this.dom.finalCoins.textContent = format(coins); this.dom.deathJoke.textContent = joke || '肚皮休息一下，再跑一次！'; this.dom.gameOverModal.style.display = 'flex'; }
    hideGameOver() { this.dom.gameOverModal.style.display = 'none'; }
    showPause() { this.updateChallenge(null); this.dom.pauseModal.style.display = 'flex'; }
    hidePause() { this.dom.pauseModal.style.display = 'none'; }
    hideAllModals() { this.hideWardrobeModal(); for (const name of MODALS) this.dom[name].style.display = 'none'; }

    hit(node, x, y, w, h) { node.rect = { left: x, top: y, width: w, height: h }; if (!node.hidden) this.hits.push(node); }
    button(ctx, id, text, x, y, w, h, fill = C.sage, foreground = '#fff8e9', size = 14) {
        const node = typeof id === 'string' ? this.dom[id] : id;
        round(ctx, x, y, w, h, Math.min(14, h / 3), node.disabled ? C.faint : fill);
        label(ctx, text, x + w / 2, y + h / 2, size, node.disabled ? C.muted : foreground, 'center', w - 12, true);
        this.hit(node, x, y, w, h);
    }
    draw(ctx, width, height) {
        this.width = width; this.height = height; this.hits = []; this.scrollArea = null; ctx.clearRect(0, 0, width, height);
        const modal = this.activeModal();
        if (this.dom.lobbyOverlay.style.display !== 'none' && this.dom.lobbyOverlay.style.visibility !== 'hidden') this.drawLobby(ctx, width, height);
        else if (this.dom.hudTop.style.display !== 'none' && !modal) this.drawHUD(ctx, width, height);
        if (modal) { this.hits = []; this.drawModal(ctx, width, height, modal); }
        return true;
    }
    drawLobby(ctx, w, h) {
        const d = this.dom, pad = 16, headerY = this.safeHeaderY(), short = h < 690;
        const statW = Math.min(w < 350 ? 116 : 130, (w - pad * 2 - 48) / 2), statH = 49;
        for (const [x, title, value, key] of [[pad, '金币', format(d.lobbyCoins.textContent), 'coin'], [w - pad - statW, '最远距离', d.lobbyHighScore.textContent || '0m', 'trophy']]) {
            paper(ctx, x, headerY, statW, statH, 21); icon(ctx, key, x + 8, headerY + 9, 31, this.wx);
            label(ctx, title, x + 46, headerY + 14, 10, '#7e816c', 'left', statW - 52, true);
            statistic(ctx, value, x + 46, headerY + 33, w < 350 ? 17 : 19, statW - 52);
        }
        paper(ctx, w / 2 - 16, headerY + 9, 32, 32, 16); icon(ctx, this.muted ? 'sound-off' : 'sound-on', w / 2 - 10, headerY + 15, 20, this.wx);
        this.hit(d.btnMute, w / 2 - 18, headerY + 6, 36, 38);
        const bubbleW = Math.min(270, w - 56), bubbleY = headerY + statH + (short ? 18 : 26);
        const bubbleRows = wrappedRows(ctx, d.bubbleText.textContent || '摸摸肚皮，然后一起出发吧！', bubbleW - 34, 13), bubbleH = 23 + bubbleRows.length * 17;
        paper(ctx, (w - bubbleW) / 2, bubbleY, bubbleW, bubbleH, 20);
        bubbleRows.forEach((row, i) => label(ctx, row, w / 2, bubbleY + 17 + i * 17, 13, '#405344', 'center', bubbleW - 34, true));
        path(ctx, [[w / 2 - 9, bubbleY + bubbleH - 1], [w / 2, bubbleY + bubbleH + 9], [w / 2 + 9, bubbleY + bubbleH - 1]], C.paper);
        this.hit(d.speechBubble, (w - bubbleW) / 2, bubbleY, bubbleW, bubbleH + 9);

        const bottom = this.safeBottomInset(), dockH = short ? 53 : 57, dockY = h - bottom - dockH, startH = short ? 59 : 65, startY = dockY - 8 - startH, mapY = startY - 35;
        this.lobbyModelRect = { left: w * .14, top: bubbleY + bubbleH + 17, width: w * .72, height: Math.max(40, mapY - 12 - (bubbleY + bubbleH + 17)) };
        const body = this.lobbyModelRect;
        this.hit(d.characterTouchZone, body.left, body.top, body.width, body.height);
        const hintW = 136, hintY = body.top + body.height * .68;
        round(ctx, (w - hintW) / 2, hintY, hintW, 23, 12, 'rgba(94,93,34,.64)');
        icon(ctx, 'touch', (w - hintW) / 2 + 8, hintY + 3, 16, this.wx); label(ctx, '点击摸摸肚皮', w / 2 + 8, hintY + 12, 11, '#f8efcd', 'center', 110, true);

        const mapW = Math.min(w - 50, 265), mapX = (w - mapW) / 2;
        paper(ctx, mapX, mapY, mapW, 27, 14);
        label(ctx, '当前世界', mapX + 11, mapY + 14, 9, C.muted, 'left', 42, true);
        label(ctx, d.lobbyMapTitle.textContent, mapX + 59, mapY + 14, 10, '#526849', 'left', mapW - 125, true);
        round(ctx, mapX + mapW - 66, mapY + 3, 62, 21, 11, '#ececdd'); label(ctx, '换一个', mapX + mapW - 39, mapY + 14, 9, '#4c6653', 'center');
        path(ctx, [[mapX + mapW - 19, mapY + 16], [mapX + mapW - 13, mapY + 10]], null, '#4c6653', 1.2); path(ctx, [[mapX + mapW - 18, mapY + 10], [mapX + mapW - 13, mapY + 10], [mapX + mapW - 13, mapY + 15]], null, '#4c6653', 1.2);
        this.hit(d.btnChangeMap, mapX + mapW - 70, mapY, 70, 27);

        round(ctx, pad, startY, w - pad * 2, startH, 21, '#f5d5bf'); round(ctx, pad + 1, startY + 1, w - pad * 2 - 2, startH - 2, 20, C.coral);
        const headingSize = w < 350 ? 21 : 23;
        ctx.font = `600 ${headingSize}px sans-serif`; const titleW = ctx.measureText('出发！开始跑酷').width, totalW = titleW + 25, titleX = (w - totalW) / 2;
        path(ctx, [[titleX, startY + 15], [titleX, startY + 33], [titleX + 15, startY + 24]], C.paper);
        label(ctx, '出发！开始跑酷', titleX + 25, startY + 25, headingSize, '#fffaf0', 'left', w - 70, true);
        label(ctx, d.lobbyStartHint.textContent || '左右换道，上滑跳跃，下滑滑铲', w / 2, startY + startH - 16, w < 350 ? 9 : 10, '#fff0dc', 'center', w - 62);
        this.hit(d.btnStartRun, pad, startY, w - pad * 2, startH);

        paper(ctx, pad, dockY, w - pad * 2, dockH, 19);
        const menu = [['btnOpenMaps', 'map', '地图'], ['btnOpenWardrobe', 'wardrobe', '衣橱'], ['btnOpenAchievements', 'achievement', '成就'], ['btnOpenRank', 'rank', '排行'], ['btnOpenDaily', 'daily', '补给']], bw = (w - pad * 2 - 12) / 5;
        for (let i = 0; i < menu.length; i++) { const x = pad + 6 + i * bw; icon(ctx, menu[i][1], x + (bw - 24) / 2, dockY + 6, 24, this.wx); label(ctx, menu[i][2], x + bw / 2, dockY + 40, 10, '#465e4e', 'center', bw - 4, true); this.hit(d[menu[i][0]], x, dockY + 3, bw, dockH - 6); }
        if (!d.btnClaimDaily.disabled) circle(ctx, pad + 6 + bw * 4.5 + 13, dockY + 8, 3, C.coral);
        this.reactions = this.reactions.filter(r => Date.now() - r.start < 1000); for (const r of this.reactions) label(ctx, r.text, w / 2, body.top + body.height * .55 - (Date.now() - r.start) * .06, 30, C.gold, 'center');
    }
    drawHUD(ctx, w, h) {
        const d = this.dom, y = this.safeHeaderY();
        paper(ctx, 14, y, 120, 42, 17); icon(ctx, 'coin', 22, y + 7, 28, this.wx); label(ctx, format(d.coinText.textContent), 54, y + 21, 17, C.ink, 'left', 70, true);
        paper(ctx, w - 190, y, 125, 42, 17); label(ctx, d.scoreText.textContent || '0 米', w - 177, y + 21, 17, C.ink, 'left', 101, true);
        paper(ctx, w - 55, y + 1, 41, 40, 16); round(ctx, w - 40, y + 13, 4, 16, 1, C.ink); round(ctx, w - 31, y + 13, 4, 16, 1, C.ink); this.hit(d.pauseBtn, w - 55, y + 1, 41, 40);
        round(ctx, w / 2 - 97, y + 50, 194, 38, 12, 'rgba(255,248,233,.90)'); label(ctx, `${d.stageName.textContent} · ${d.stageSub.textContent}`, w / 2, y + 69, 13, C.ink, 'center', 178);
        if (this.challenge) { const c = this.challenge; round(ctx, 25, y + 100, w - 50, 85, 15, C.paper); label(ctx, `${c.title}  ${c.total ? `${c.completed}/${c.total}` : `${Math.ceil(c.remaining || 0)}s`}`, 40, y + 119, 16, C.ink, 'left', w - 80, true); lines(ctx, c.instruction, 40, y + 143, w - 80, 12, 1); label(ctx, c.feedback || '跟随动作提示', 40, y + 164, 11, C.sage, 'left', w - 80); round(ctx, 40, y + 175, (w - 80) * Math.max(0, Math.min(1, c.progress || 0)), 3, 1, C.sage); }
        if (d.hudSpeed.style.display !== 'none') this.drawSpeedCard(ctx, w, h);
        const footerY = h - this.safeBottomInset() - 32;
        label(ctx, '左右换道 · 上跳下滑', w - 16, footerY + 16, 10, C.ink, 'right', w - 204);
    }
    drawSpeedCard(ctx, w, h) {
        const d = this.dom, value = String(d.speedValue.textContent || 0), status = d.statusTag.textContent || '极限巡航', statusIcon = d.statusTag.dataset.icon;
        const fontFamily = '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif';
        ctx.font = `900 26px ${fontFamily}`; const numberW = ctx.measureText(value).width;
        ctx.font = `700 13px ${fontFamily}`; const rowW = numberW + 4 + ctx.measureText('m/s').width;
        ctx.font = `800 12px ${fontFamily}`; const statusW = ctx.measureText(status).width + Math.max(0, [...status].length - 1) * .5 + (statusIcon ? 16 : 0);
        // Match .hud-speed-card: left 18px, bottom 96px, 14px horizontal
        // padding, 26px white speed and a separate 12px colored status line.
        const cardW = Math.min(w - 36, Math.max(rowW, statusW) + 30), cardH = 64, x = 18, bottom = Math.max(96, this.safeBottomInset() + 62), y = h - bottom - cardH;
        d.hudSpeed.rect = { left: x, top: y, width: cardW, height: cardH };
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        round(ctx, x, y, cardW, cardH, 12, 'rgba(18,28,38,.78)');
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.font = `900 26px ${fontFamily}`; ctx.fillStyle = '#ffffff'; ctx.fillText(value, x + 15, y + 30);
        ctx.font = `700 13px ${fontFamily}`; ctx.fillStyle = '#bdc3c7'; ctx.fillText('m/s', x + 15 + numberW + 4, y + 30);
        if (statusIcon) icon(ctx, statusIcon, x + 15, y + 42, 12, this.wx);
        label(ctx, status, x + 15 + (statusIcon ? 16 : 0), y + 47, 12, d.statusTag.style.color || '#78e08f', 'left', cardW - 30 - (statusIcon ? 16 : 0), true, 800);
        ctx.restore();
    }
    drawModal(ctx, w, h, name) {
        if (name === 'wardrobeModal') { this.drawWardrobe(ctx, w, h); return; }
        round(ctx, 0, 0, w, h, 0, 'rgba(30,47,39,.43)');
        const compact = ['dailyModal', 'pauseModal', 'gameOverModal'].includes(name), top = compact ? Math.max(this.safeHeaderY() + 10, h * .23) : this.safeHeaderY() + 9, mh = compact ? Math.min(h - top - this.safeBottomInset() - 12, name === 'gameOverModal' ? 344 : 294) : h - top - this.safeBottomInset() - 11;
        paper(ctx, 14, top, w - 28, mh, 24);
        const title = { mapModal: '选择世界', achievementsModal: '成长成就', rankModal: '我的跑酷纪录', dailyModal: '每日补给', pauseModal: '肚皮休息一下', gameOverModal: '这次跑得真不错' }[name];
        label(ctx, title, 34, top + 31, 22, C.ink, 'left', w - 108, true);
        const close = { mapModal: 'btnCloseMapModal', achievementsModal: 'btnCloseAchievementsModal', rankModal: 'btnCloseRankModal', dailyModal: 'btnCloseDailyModal' }[name];
        if (close) this.button(ctx, close, '×', w - 63, top + 14, 32, 32, C.faint, C.ink, 20);
        if (name === 'mapModal') this.drawMaps(ctx, w, h, top);
        if (name === 'achievementsModal') this.drawAchievements(ctx, w, top);
        if (name === 'rankModal') this.drawRank(ctx, w, h, top);
        if (name === 'dailyModal') { icon(ctx, 'daily', w / 2 - 29, top + 62, 58, this.wx); label(ctx, '+100 金币', w / 2, top + 145, 24, C.ink, 'center', w - 70, true); lines(ctx, this.dom.dailyDescription.textContent, 40, top + 186, w - 80, 12, 2); this.button(ctx, 'btnClaimDaily', this.dom.btnClaimDaily.textContent, 34, top + mh - 61, w - 68, 43, C.gold, C.ink); }
        if (name === 'pauseModal') { lines(ctx, '准备好了就继续，让奶蛙跑得更远。', 37, top + 96, w - 74, 15, 2); this.button(ctx, 'btnResume', '继续跑酷', 34, top + mh - 119, w - 68, 44); this.button(ctx, 'btnPauseToLobby', '返回主页', 34, top + mh - 61, w - 68, 43, C.faint, C.ink); }
        if (name === 'gameOverModal') { label(ctx, this.dom.finalScore.textContent, w / 2, top + 91, 34, C.ink, 'center', w - 70, true); label(ctx, `金币余额  ${this.dom.finalCoins.textContent}`, w / 2, top + 131, 14, C.muted, 'center'); lines(ctx, this.dom.deathJoke.textContent, 37, top + 170, w - 74, 12, 2); this.button(ctx, 'btnRestart', '再跑一次', 34, top + mh - 116, w - 68, 43); this.button(ctx, 'btnGameOverToLobby', '返回主页', 34, top + mh - 61, w - 68, 43, C.faint, C.ink); }
    }
    drawMaps(ctx, w, h, top) {
        const y0 = top + 62, bottom = h - this.safeBottomInset() - 20, itemH = 95, areaH = bottom - y0;
        this.mapMaxScroll = Math.max(0, this.mapCards.length * itemH - areaH); this.mapScroll = Math.max(0, Math.min(this.mapMaxScroll, this.mapScroll));
        this.scrollArea = { kind: 'maps', left: 28, top: y0, width: w - 56, height: areaH };
        ctx.save(); ctx.beginPath(); ctx.rect(28, y0, w - 56, areaH); ctx.clip();
        for (let i = 0; i < this.mapCards.length; i++) { const node = this.mapCards[i], map = node.map, y = y0 + i * itemH - this.mapScroll; if (y + 87 < y0 || y > bottom) continue; round(ctx, 29, y, w - 58, 86, 15, node.selected ? '#e3ebd8' : '#f1edde'); round(ctx, 39, y + 13, 51, 60, 12, '#fff6df'); const picture = getNativeIcon(`map-${map.id}`, this.wx); if (picture) ctx.drawImage(picture, 41, y + 19, 47, 47); else icon(ctx, 'map', 47, y + 28, 35, this.wx); label(ctx, map.name, 105, y + 24, 16, C.ink, 'left', w - 186, true); label(ctx, node.selected ? '当前' : node.disabled ? '筹备中' : '出发 ›', w - 47, y + 23, 10, C.sage, 'right'); lines(ctx, map.shortDescription || map.description, 105, y + 49, w - 151, 11, 2); const visibleTop = Math.max(y, y0); this.hit(node, 29, visibleTop, w - 58, Math.min(y + 86, bottom) - visibleTop); }
        ctx.restore();
    }
    drawAchievements(ctx, w, top) {
        const stats = [['achBestDistance', '最远距离', '米'], ['achLifetimeCoins', '累计获得金币', '金币'], ['achJumps', '完成跳跃', '次'], ['achSlides', '完成滑铲', '次']];
        for (let i = 0; i < stats.length; i++) { const [id, name, suffix] = stats[i], x = 29 + (i % 2) * (w - 52) / 2, y = top + 79 + Math.floor(i / 2) * 116, sw = (w - 64) / 2; round(ctx, x, y, sw, 101, 17, '#eeeddb'); label(ctx, name, x + 14, y + 23, 12, C.muted); label(ctx, this.dom[id].textContent || '0', x + 14, y + 58, 27, C.ink, 'left', sw - 26, true); label(ctx, suffix, x + 14, y + 84, 10, C.muted); }
        lines(ctx, '每一次出发、跳跃和滑铲，都会留下记录。', 35, top + 334, w - 70, 12, 2);
    }
    drawRank(ctx, w, h, top) {
        round(ctx, 29, top + 65, w - 58, 70, 14, '#e3ebd8'); label(ctx, '最远距离', 44, top + 84, 11, C.muted); label(ctx, `${format(this.rankData?.bestDistance)} 米`, 44, top + 111, 22, C.ink, 'left', (w - 60) / 2, true); label(ctx, `${format(this.rankData?.totalRuns)} 局跑酷`, w - 45, top + 104, 13, C.sage, 'right');
        const y0 = top + 149, bottom = h - this.safeBottomInset() - 20, areaH = bottom - y0;
        if (!this.rankEntries.length) { label(ctx, '第一局，就从现在开始', w / 2, y0 + 61, 18, C.ink, 'center'); lines(ctx, '完成跑酷后，成绩会按距离排序。', 39, y0 + 98, w - 78, 13, 2); return; }
        this.rankMaxScroll = Math.max(0, this.rankEntries.length * 77 - areaH); this.rankScroll = Math.max(0, Math.min(this.rankMaxScroll, this.rankScroll)); this.scrollArea = { kind: 'rank', left: 28, top: y0, width: w - 56, height: areaH };
        ctx.save(); ctx.beginPath(); ctx.rect(28, y0, w - 56, areaH); ctx.clip();
        for (let i = 0; i < this.rankEntries.length; i++) { const e = this.rankEntries[i], y = y0 + i * 77 - this.rankScroll; if (y + 69 < y0 || y > bottom) continue; round(ctx, 29, y, w - 58, 69, 11, i === 0 ? '#f4e8c8' : '#f1edde'); label(ctx, String(i + 1).padStart(2, '0'), 43, y + 28, 17, C.sage, 'left', 29, true); label(ctx, `${format(e.distance)} 米`, 80, y + 24, 18, C.ink, 'left', w - 200, true); if (!e.legacy) label(ctx, `✦ ${format(e.coins)}`, w - 44, y + 25, 11, C.muted, 'right', 85); label(ctx, e.legacy ? '历史最佳记录' : e.mapName || '奶蛙跑酷', 80, y + 50, 11, C.muted, 'left', w - 170); if (!e.legacy && Number.isFinite(Date.parse(e.finishedAt))) label(ctx, new Date(e.finishedAt).toLocaleDateString('zh-CN'), w - 43, y + 50, 9, C.muted, 'right', 80); }
        ctx.restore();
    }
    drawWardrobe(ctx, w, h) {
        const d = this.dom, layout = this.wardrobeLayout(), top = layout.top; round(ctx, 0, 0, w, h, 0, '#f4eee2');
        label(ctx, '奶蛙衣柜', 22, top + 21, 23, C.ink, 'left', w - 170, true); icon(ctx, 'coin', w - 151, top + 11, 20, this.wx); label(ctx, d.wardrobeCoins.textContent, w - 64, top + 21, 13, C.ink, 'right', 82, true);
        this.button(ctx, 'btnCloseWardrobeModal', '×', w - 50, top + 6, 32, 32, C.faint, C.ink, 20);
        const clothes = this.wardrobeTab === 'clothes';
        label(ctx, d.wardrobePreviewName.textContent, w / 2, layout.nameY, layout.compact ? 15 : 17, C.ink, 'center', w - 40, true);
        // Leave the WebGL model's viewport transparent; its existing fitting camera uses this rect.
        const previewY = layout.previewTop, previewBottom = previewY + layout.previewHeight;
        this.hit(d.wardrobePreview, 18, previewY, w - 36, layout.previewHeight + 76);
        ctx.clearRect(30, previewY, w - 60, layout.previewHeight);
        label(ctx, '滑动奶蛙 · 360° 试穿', w / 2, previewBottom + (layout.compact ? 9 : 11), 10, C.muted, 'center');
        const rotateY = previewBottom + layout.rotateOffset;
        this.button(ctx, 'btnWardrobeLeft', '左转', 40, rotateY, (w - 100) / 3, layout.rotateHeight, C.faint, C.ink, 11); this.button(ctx, 'btnWardrobeReset', '正面', 50 + (w - 100) / 3, rotateY, (w - 100) / 3, layout.rotateHeight, C.faint, C.ink, 11); this.button(ctx, 'btnWardrobeRight', '右转', 60 + 2 * (w - 100) / 3, rotateY, (w - 100) / 3, layout.rotateHeight, C.faint, C.ink, 11);
        this.button(ctx, 'btnWardrobeClothes', '衣服', 22, layout.tabY, (w - 51) / 2, layout.tabHeight, clothes ? C.sage : C.faint, clothes ? C.paper : C.ink); this.button(ctx, 'btnWardrobeWings', '翅膀', (w + 7) / 2, layout.tabY, (w - 51) / 2, layout.tabHeight, clothes ? C.faint : C.sage, clothes ? C.ink : C.paper);
        const filterY = layout.filterY;
        if (clothes) for (let i = 0; i < 3; i++) this.button(ctx, this.filterNodes[i], ['全部', '日常', '猎奇'][i], 24 + i * 62, filterY, 55, 25, this.outfitFilter === this.filterNodes[i].dataset.outfitFilter ? C.sage : C.faint, this.outfitFilter === this.filterNodes[i].dataset.outfitFilter ? C.paper : C.ink, 10);
        else label(ctx, '永久外观 · 拾到羽毛后飞行', 24, filterY + 13, 12, C.muted);
        const weird = ['ufo', 'tv', 'jellyfish', 'mushroom', 'zipper', 'dumpling'];
        const cards = clothes ? this.clothesCards.filter(n => this.outfitFilter === 'all' || (n.skin.category || (weird.includes(n.skin.id) ? 'weird' : 'daily')) === this.outfitFilter) : this.wingCards;
        const perPage = Math.max(2, Math.floor((w - 52) / 104)); this.outfitPages = Math.max(1, Math.ceil(cards.length / perPage)); this.outfitPage = Math.min(this.outfitPage, this.outfitPages - 1); this.updateOutfitBrowseArrows();
        const cardY = layout.cardY, cardH = layout.cardHeight, cardW = (w - 52 - (perPage - 1) * 7) / perPage;
        this.scrollArea = { kind: 'skins', left: 24, top: cardY, width: w - 48, height: cardH + 2 };
        cards.slice(this.outfitPage * perPage, (this.outfitPage + 1) * perPage).forEach((node, index) => { const x = 26 + index * (cardW + 7); paper(ctx, x, cardY, cardW, cardH, 12); if (node.selected) { round(ctx, x, cardY, cardW, cardH, 12, '#9eb68d'); round(ctx, x + 2, cardY + 2, cardW - 4, cardH - 4, 10, '#e7eddb'); } this.drawSkinIcon(ctx, node.skin.id, x + cardW / 2, cardY + (layout.compact ? 18 : 23), clothes); label(ctx, node.skin.name, x + cardW / 2, cardY + (layout.compact ? 43 : 50), 10, C.ink, 'center', cardW - 8, true); label(ctx, node.equipped ? '已装备' : node.owned ? node.skin.id === 'none' ? '免费' : '已解锁' : `${format(node.skin.price)} 金币`, x + cardW / 2, cardY + (layout.compact ? 58 : 69), 10, node.owned ? C.sage : '#9c7938', 'center', cardW - 8); if (!node.owned) { round(ctx, x + cardW - 18, cardY + 5, 12, 11, 3, '#ac945a'); ctx.beginPath(); ctx.moveTo(x + cardW - 16, cardY + 6); ctx.quadraticCurveTo(x + cardW - 12, cardY - 3, x + cardW - 8, cardY + 6); ctx.strokeStyle = '#ac945a'; ctx.lineWidth = 1.4; ctx.stroke(); circle(ctx, x + cardW - 12, cardY + 10, 1.2, '#fff9e9'); } this.hit(node, x, cardY, cardW, cardH); });
        this.button(ctx, 'btnOutfitPrev', '‹', w - 100, filterY, 31, 25, C.faint, C.ink, 19); this.button(ctx, 'btnOutfitNext', '›', w - 63, filterY, 31, 25, C.faint, C.ink, 19);
        label(ctx, `${this.outfitPage + 1}/${this.outfitPages}`, w - 111, filterY + 13, 9, C.muted, 'right');
        const message = d.wardrobePurchaseMessage.hidden ? d.wardrobeSectionNote.textContent : d.wardrobePurchaseMessage.textContent;
        label(ctx, message, 25, layout.equipY - 15, 10, /不足|保存|失败|重试/.test(message) ? C.error : C.muted, 'left', w - 52);
        this.button(ctx, 'btnEquipWardrobe', d.btnEquipWardrobe.textContent, 22, layout.equipY, w - 44, 47, d.btnEquipWardrobe.dataset.action === 'purchase' ? C.gold : C.sage, d.btnEquipWardrobe.dataset.action === 'purchase' ? C.ink : C.paper, 14);
    }
    drawSkinIcon(ctx, id, x, y, clothes) {
        const bitmap = getNativeIcon(`${clothes ? 'skin' : 'wing'}-${id}`, this.wx);
        if (bitmap) { ctx.drawImage(bitmap, x - 18, y - 18, 36, 36); return; }
        const oval = (cx, cy, rx, ry, color, angle = 0) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); };
        if (!clothes) {
            for (const side of [-1, 1]) for (let i = 0; i < 3; i++) oval(x + side * (5 + i * 5), y + i * 2, 5, 11, i === 2 ? '#a8c1a7' : '#f4deb0', side * .6);
            if (id === 'none') { path(ctx, [[x - 10, y - 10], [x + 10, y + 10]], null, C.muted, 2); path(ctx, [[x + 10, y - 10], [x - 10, y + 10]], null, C.muted, 2); }
            return;
        }
        if (id === 'none') { round(ctx, x - 12, y - 15, 24, 31, 12, '#edc36b'); oval(x, y + 7, 9, 8, C.paper); for (const side of [-1, 1]) { circle(ctx, x + side * 5, y - 7, 3, '#8aab73'); circle(ctx, x + side * 5, y - 7, 1.6, C.ink); } }
        else if (id === 'nurse') { round(ctx, x - 13, y - 8, 26, 24, 5, '#df9caa'); round(ctx, x - 10, y - 16, 20, 12, 4, C.paper); round(ctx, x - 2, y - 13, 4, 7, 0, '#cc597d'); round(ctx, x - 4, y - 11, 8, 3, 0, '#cc597d'); round(ctx, x - 7, y + 1, 14, 14, 4, C.paper); }
        else if (id === 'bandit') { round(ctx, x - 13, y - 14, 26, 29, 7, '#535858'); for (let i = 0; i < 3; i++) round(ctx, x - 13, y + i * 5, 26, 2, 0, C.paper); oval(x - 5, y - 6, 3, 1.5, C.paper); oval(x + 5, y - 6, 3, 1.5, C.paper); }
        else if (id === 'street') { round(ctx, x - 12, y - 2, 24, 18, 5, '#8ead96'); round(ctx, x - 10, y - 13, 20, 10, 7, '#8ead96'); round(ctx, x - 2, y - 5, 20, 3, 1, '#406755'); path(ctx, [[x, y], [x, y + 15]], null, C.paper, 2); }
        else if (id === 'ufo') { oval(x, y - 2, 10, 10, '#b6d66f'); oval(x, y + 3, 17, 6, '#81739b'); for (const side of [-1, 0, 1]) circle(ctx, x + side * 9, y + 3, 1.5, '#effbc1'); }
        else if (id === 'tv') { path(ctx, [[x - 8, y - 17], [x, y - 10], [x + 8, y - 17]], null, '#817361'); round(ctx, x - 15, y - 10, 30, 26, 5, '#ad8c70'); round(ctx, x - 11, y - 6, 21, 17, 3, '#e9d8b7'); path(ctx, [[x - 8, y + 2], [x - 3, y - 3], [x + 3, y + 5], [x + 7, y]], null, '#8ba0a0'); circle(ctx, x + 12, y + 10, 1.4, '#66594c'); }
        else if (id === 'jellyfish') { for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, y); ctx.quadraticCurveTo(x + i * 8 + 5, y + 10, x + i * 8 - 2, y + 17); ctx.strokeStyle = '#99cfd5'; ctx.lineWidth = 2; ctx.stroke(); } oval(x, y - 4, 15, 10, '#b5a4c0'); oval(x, y - 8, 8, 3, '#e4d6f4'); }
        else if (id === 'mushroom') { round(ctx, x - 4, y - 2, 8, 18, 4, C.paper); oval(x, y - 4, 16, 9, '#d8907e'); for (const [dx, dy] of [[-8, -6], [2, -9], [9, -3]]) circle(ctx, x + dx, y + dy, 2.2, C.paper); }
        else if (id === 'zipper') { round(ctx, x - 13, y - 15, 26, 31, 8, '#945e72'); round(ctx, x - 11, y, 22, 10, 5, '#302d3f'); for (let i = 0; i < 5; i++) round(ctx, x - 9 + i * 4, y, 2, 3, 0, C.paper); }
        else if (id === 'dumpling') { oval(x, y + 1, 16, 13, '#efe1bd'); for (const dx of [-8, -3, 3, 8]) path(ctx, [[x, y - 11], [x + dx, y]], null, '#c4ad85', 1); }
    }

    safeHeaderY() {
        try {
            const menu = this.wx?.getMenuButtonBoundingClientRect?.(), info = this.wx?.getWindowInfo?.() || this.wx?.getSystemInfoSync?.() || {};
            return Math.max(56, Number(info.statusBarHeight) + 8 || 0, Number(menu?.bottom) + 8 || 0);
        } catch { return 56; }
    }
    safeBottomInset() {
        const fallback = this.height < 690 ? 12 : 18;
        try { const info = this.wx?.getWindowInfo?.() || this.wx?.getSystemInfoSync?.(); return Math.max(fallback, Math.min(48, this.height - (Number(info?.safeArea?.bottom) || this.height))); } catch { return fallback; }
    }

    contains(rect, x, y) { return x >= rect.left && y >= rect.top && x <= rect.left + rect.width && y <= rect.top + rect.height; }
    pointerEvent(type, node, x, y) { return { type, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, target: node, preventDefault() {}, stopPropagation() {} }; }
    onPointerStart(x, y) {
        const node = [...this.hits].reverse().find(target => this.contains(target.rect, x, y));
        const consumed = Boolean(node || this.activeModal() || this.dom.lobbyOverlay.style.display !== 'none');
        this.pointer = { node, x, y, lastX: x, lastY: y, moved: false, consumed, scroll: this.activeModal() && this.scrollArea && this.contains(this.scrollArea, x, y) ? this.scrollArea.kind : null };
        if (node === this.dom.wardrobePreview) node.dispatchEvent(this.pointerEvent('pointerdown', node, x, y));
        return consumed;
    }
    onPointerMove(x, y) {
        const p = this.pointer; if (!p) return Boolean(this.activeModal());
        if (Math.hypot(x - p.x, y - p.y) > 8) p.moved = true;
        if (p.node === this.dom.wardrobePreview) p.node.dispatchEvent(this.pointerEvent('pointermove', p.node, x, y));
        else if (p.scroll === 'maps') this.mapScroll = Math.max(0, Math.min(this.mapMaxScroll || 0, this.mapScroll - (y - p.lastY)));
        else if (p.scroll === 'rank') this.rankScroll = Math.max(0, Math.min(this.rankMaxScroll || 0, this.rankScroll - (y - p.lastY)));
        p.lastX = x; p.lastY = y; return p.consumed;
    }
    onPointerEnd(x, y) {
        const p = this.pointer; if (!p) return Boolean(this.activeModal()); this.pointer = null;
        if (p.node === this.dom.wardrobePreview) p.node.dispatchEvent(this.pointerEvent('pointerup', p.node, x, y));
        else if (p.scroll === 'skins' && Math.abs(x - p.x) > 40) { this.outfitPage = Math.max(0, Math.min((this.outfitPages || 1) - 1, this.outfitPage + (x < p.x ? 1 : -1))); }
        else if (!p.moved && p.node && this.contains(p.node.rect, x, y)) p.node.click();
        return p.consumed;
    }
    onPointerCancel(x, y) { const p = this.pointer; this.pointer = null; if (p?.node === this.dom.wardrobePreview) p.node.dispatchEvent(this.pointerEvent('pointercancel', p.node, x, y)); return Boolean(p?.consumed || this.activeModal()); }
}
