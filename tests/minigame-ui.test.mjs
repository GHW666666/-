import test from 'node:test';
import assert from 'node:assert/strict';
import { UIManager } from '../minigame/ui.js';

function context() {
    const texts = [], clears = [], images = [], fills = [];
    const ctx = { texts, clears, images, fills, measureText: text => ({ width: [...text].length * 7 }), fillText: (text, x, y) => texts.push({ text, x, y, font: ctx.font, color: ctx.fillStyle }), clearRect: (...rect) => clears.push(rect), drawImage: (...args) => images.push(args) };
    for (const name of ['beginPath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'closePath', 'fill', 'stroke', 'save', 'restore', 'rect', 'clip', 'ellipse', 'arc', 'translate', 'scale']) ctx[name] = () => {};
    ctx.fill = () => fills.push({ color: ctx.fillStyle, shadow: ctx.shadowColor });
    return ctx;
}
function tap(ui, node) { const r = node.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; assert.equal(ui.onPointerStart(x, y), true); assert.equal(ui.onPointerEnd(x, y), true); }
const skins = {
    none: { id: 'none', name: '原味奶蛙', price: 0 }, nurse: { id: 'nurse', name: '护理员', price: 800 }, bandit: { id: 'bandit', name: '小偷', price: 1200 },
    mushroom: { id: 'mushroom', name: '蘑菇观察员', category: 'weird', price: 2800 }, ufo: { id: 'ufo', name: '外星临时工', category: 'weird', price: 3600 },
};

test('native lobby draws readable statistics and all five menu buttons fit 330/375/390 screens', () => {
    for (const [w, h] of [[330, 640], [375, 667], [390, 844]]) {
        const ui = new UIManager(), ctx = context(); let start = 0;
        ui.showLobby({ coins: 1500, highScore: 1234, currentMap: { name: '奶茶泡泡港', stageTitle: '奶茶', stageSubtitle: '泡泡港' } });
        ui.dom.btnStartRun.addEventListener('click', () => start++); ui.draw(ctx, w, h);
        assert.ok(ctx.texts.some(x => x.text === '1,500')); assert.ok(ctx.texts.some(x => x.text === '1234m'));
        for (const id of ['btnStartRun', 'btnChangeMap', 'btnOpenMaps', 'btnOpenWardrobe', 'btnOpenAchievements', 'btnOpenRank', 'btnOpenDaily']) {
            const r = ui.dom[id].getBoundingClientRect(); assert.ok(r.width > 0); assert.ok(r.left >= 0 && r.right <= w && r.top >= 0 && r.bottom <= h, id);
        }
        tap(ui, ui.dom.btnStartRun); assert.equal(start, 1); assert.equal(ui.elements, ui.dom);
    }
});

test('preview cards remain selectable when locked, prices and purchase gating follow engine state', () => {
    const ui = new UIManager(), ctx = context(); let preview = null, purchases = 0;
    ui.renderOutfitSkins(skins, 'none', 'none', id => preview = id, { outfits: ['none'], wings: ['none'] });
    ui.showWardrobeModal(); ui.updateWardrobePreview({ name: '护理员', owned: false, price: 800, coins: 799 });
    ui.dom.btnEquipWardrobe.addEventListener('click', () => purchases++); ui.draw(ctx, 375, 667);
    const locked = ui.clothesCards.find(n => n.skin.id === 'nurse'); assert.equal(locked.dataset.owned, 'false'); assert.equal(locked.disabled, false);
    tap(ui, locked); assert.equal(preview, 'nurse'); assert.equal(ui.dom.btnEquipWardrobe.textContent, '还差 1 金币');
    tap(ui, ui.dom.btnEquipWardrobe); assert.equal(purchases, 0);
    ui.updateWardrobePreview({ name: '护理员', owned: false, price: 800, coins: 800 }); ui.draw(ctx, 375, 667);
    tap(ui, ui.dom.btnEquipWardrobe); assert.equal(purchases, 1); assert.equal(ui.dom.wardrobeCoins.textContent, '800');
    // UI delegates spending to the engine; tapping never changes its displayed wallet itself.
});

test('wardrobe keeps fitting viewport transparent and all rotate/purchase controls visible on small devices', () => {
    for (const [w, h] of [[330, 640], [375, 667]]) {
        const ui = new UIManager(), ctx = context(); ui.showWardrobeModal(); ui.renderOutfitSkins(skins, 'none', 'nurse', () => {}, { outfits: ['none'] });
        ui.updateWardrobePreview({ name: '护理员', owned: false, price: 800, coins: 800 }); ui.draw(ctx, w, h);
        const preview = ui.dom.wardrobePreview.getBoundingClientRect(); assert.ok(preview.width > 24 && preview.height > 76);
        assert.ok(ctx.clears.some(r => r[0] === preview.left + 12 && r[1] === preview.top && r[2] === preview.width - 24 && r[3] === preview.height - 76));
        for (const id of ['btnWardrobeLeft', 'btnWardrobeRight', 'btnWardrobeReset', 'btnEquipWardrobe', 'btnCloseWardrobeModal']) {
            const r = ui.dom[id].getBoundingClientRect(); assert.ok(r.width > 0 && r.right <= w && r.bottom <= h, id);
        }
    }
});

test('dragging a fitting model dispatches captured pointer protocol outside the original rectangle', () => {
    const ui = new UIManager(), events = []; ui.showWardrobeModal(); ui.draw(context(), 375, 667);
    for (const type of ['pointerdown', 'pointermove', 'pointerup']) ui.dom.wardrobePreview.addEventListener(type, e => events.push(e));
    assert.equal(ui.onPointerStart(180, 220), true); assert.equal(ui.onPointerMove(410, 250), true); assert.equal(ui.onPointerEnd(410, 250), true);
    assert.deepEqual(events.map(e => e.type), ['pointerdown', 'pointermove', 'pointerup']);
    assert.ok(events.every(e => e.pointerId === 1 && e.target.closest('button') === null && typeof e.preventDefault === 'function'));
    let closes = 0; ui.onWardrobeClose = () => closes++; ui.hideWardrobeModal(); ui.hideWardrobeModal(); assert.equal(closes, 1);
});

test('wardrobe category tabs stay below fitting and rotation controls, and above the catalog on every device', () => {
    for (const [w, h] of [[320, 568], [330, 640], [375, 667], [390, 844]]) for (const homeInset of [0, 34]) {
        const menuBottom = h === 568 ? 88 : 72;
        const wxApi = { getMenuButtonBoundingClientRect: () => ({ bottom: menuBottom }), getWindowInfo: () => ({ statusBarHeight: 36, safeArea: { bottom: h - homeInset } }) };
        const ui = new UIManager(wxApi), ctx = context(); let modelDrags = 0;
        ui.renderOutfitSkins(skins, 'none', 'none', () => {}, { outfits: ['none'] });
        ui.renderWingSkins({ cream: { id: 'cream', name: '奶油云翼', price: 25000 } }, 'none', () => {});
        ui.dom.btnWardrobeClothes.addEventListener('click', () => ui.showWardrobeTab('clothes'));
        ui.dom.btnWardrobeWings.addEventListener('click', () => ui.showWardrobeTab('wings'));
        ui.dom.wardrobePreview.addEventListener('pointerdown', () => modelDrags++);
        ui.showWardrobeModal(); ui.draw(ctx, w, h);
        const preview = ui.dom.wardrobePreview.getBoundingClientRect();
        assert.ok(preview.top > menuBottom);
        assert.ok(preview.height - 76 >= (h === 568 ? 100 : 120));
        for (const id of ['btnWardrobeClothes', 'btnWardrobeWings']) {
            const tab = ui.dom[id].getBoundingClientRect(), text = ctx.texts.find(t => t.text === (id === 'btnWardrobeClothes' ? '衣服' : '翅膀'));
            assert.ok(tab.top >= preview.bottom, `${id} below preview`);
            for (const rotateId of ['btnWardrobeLeft', 'btnWardrobeRight', 'btnWardrobeReset']) assert.ok(tab.top > ui.dom[rotateId].getBoundingClientRect().bottom, `${id} below rotation`);
            assert.ok(tab.bottom < ui.filterNodes[0].getBoundingClientRect().top);
            assert.ok(ui.contains(tab, text.x, text.y), `${id} text and touch region agree`);
        }
        assert.ok(ui.filterNodes[0].getBoundingClientRect().bottom < ui.clothesCards[0].getBoundingClientRect().top);
        assert.ok(ui.dom.btnEquipWardrobe.getBoundingClientRect().bottom <= h - homeInset);
        tap(ui, ui.dom.btnWardrobeWings); assert.equal(ui.wardrobeTab, 'wings'); ui.draw(ctx, w, h);
        assert.ok(ui.wingCards[0].getBoundingClientRect().top > ui.dom.btnWardrobeWings.getBoundingClientRect().bottom);
        tap(ui, ui.dom.btnWardrobeClothes); assert.equal(ui.wardrobeTab, 'clothes'); assert.equal(modelDrags, 0);
    }
});

test('every catalog item can be reached by swipe or filters and expensive wing price stays visible', () => {
    const ui = new UIManager(); ui.renderOutfitSkins(skins, 'none', 'none', () => {}, { outfits: ['none'] }); ui.showWardrobeModal(); ui.draw(context(), 330, 640);
    const area = ui.scrollArea; ui.onPointerStart(280, area.top + 20); ui.onPointerMove(150, area.top + 20); ui.onPointerEnd(150, area.top + 20); assert.equal(ui.outfitPage, 1);
    ui.draw(context(), 330, 640); tap(ui, ui.filterNodes[2]); ui.draw(context(), 330, 640); assert.equal(ui.outfitFilter, 'weird'); assert.equal(ui.outfitPages, 1);
    ui.showWardrobeTab('wings'); ui.renderWingSkins({ cream: { id: 'cream', name: '奶油云翼', price: 25000 } }, 'none', () => {}, 'cream', { wings: ['none'] });
    ui.updateWardrobePreview({ name: '奶油云翼', owned: false, price: 25000, coins: 27000 }); const ctx = context(); ui.draw(ctx, 330, 640);
    assert.ok(ctx.texts.some(t => t.text === '25,000 金币')); assert.equal(ui.dom.btnEquipWardrobe.dataset.action, 'purchase'); assert.equal(ui.dom.btnEquipWardrobe.disabled, false);
});

test('native controls clear the WeChat capsule and bottom home indicator without blocking the character', () => {
    for (const [w, h] of [[330, 640], [375, 667], [390, 844]]) {
        const menu = { left: w - 97, top: 40, width: 87, height: 32, bottom: 72 };
        const wxApi = { getMenuButtonBoundingClientRect: () => menu, getWindowInfo: () => ({ windowWidth: w, windowHeight: h, statusBarHeight: 36, safeArea: { top: 36, bottom: h - 34 } }) };
        const ui = new UIManager(wxApi), ctx = context(); let touches = 0;
        ui.showLobby({ coins: 27, currentMap: { name: '埃及·砂岩集市', startHint: '顺着引桥冲上车顶，穿过砂岩集市！' } });
        ui.dom.characterTouchZone.addEventListener('click', () => touches++); ui.draw(ctx, w, h);
        assert.ok(ui.dom.btnMute.rect.top >= menu.bottom + 8);
        assert.ok(ctx.texts.some(t => t.text === '顺着引桥冲上车顶，穿过砂岩集市！'));
        const model = ui.lobbyModelRect, switchMap = ui.dom.btnChangeMap.getBoundingClientRect();
        assert.ok(model.height >= 160); assert.ok(model.top > ui.dom.speechBubble.getBoundingClientRect().bottom);
        assert.ok(model.top + model.height < switchMap.top);
        for (const id of ['btnOpenMaps', 'btnOpenWardrobe', 'btnOpenAchievements', 'btnOpenRank', 'btnOpenDaily']) assert.ok(ui.dom[id].getBoundingClientRect().bottom <= h - 34, id);
        tap(ui, ui.dom.characterTouchZone); assert.equal(touches, 1);
        ui.showWardrobeModal(); ui.draw(ctx, w, h);
        const fitting = ui.dom.wardrobePreview.getBoundingClientRect();
        assert.ok(fitting.top > menu.bottom); assert.ok(fitting.height - 76 >= 120);
        assert.ok(ui.dom.btnWardrobeLeft.rect.top >= fitting.top + fitting.height - 76);
        assert.ok(ui.dom.btnEquipWardrobe.getBoundingClientRect().bottom <= h - 34);
    }
});

test('asynchronous native images replace fallback vectors while wallet and tap behavior stay usable', () => {
    const pending = [], wxApi = { createImage: () => { const image = {}; pending.push(image); return image; } };
    const ui = new UIManager(wxApi), ctx = context(); let starts = 0;
    ui.showLobby({ coins: 99, highScore: 256 }); ui.dom.btnStartRun.addEventListener('click', () => starts++);
    ui.draw(ctx, 375, 667); assert.equal(ctx.images.length, 0); tap(ui, ui.dom.btnStartRun); assert.equal(starts, 1);
    for (const image of pending) image.onload(); ui.draw(ctx, 375, 667);
    assert.ok(ctx.images.length >= 8); assert.ok(ctx.texts.some(t => t.text === '99'));
    tap(ui, ui.dom.btnStartRun); assert.equal(starts, 2);
    const failedHost = new UIManager({ createImage: () => { throw new Error('image unavailable'); } });
    assert.doesNotThrow(() => failedHost.draw(context(), 330, 640));
});

test('a short 320×568 screen keeps wardrobe rotation touches separate from filters below a tall capsule', () => {
    for (const homeInset of [0, 34]) {
        const wxApi = { getMenuButtonBoundingClientRect: () => ({ bottom: 88 }), getWindowInfo: () => ({ statusBarHeight: 44, safeArea: { bottom: 568 - homeInset } }) };
        const ui = new UIManager(wxApi), ctx = context(); let left = 0, right = 0, reset = 0, preview = null, purchases = 0;
        ui.renderOutfitSkins(skins, 'none', 'nurse', id => preview = id, { outfits: ['none'] });
        ui.showWardrobeModal(); ui.updateWardrobePreview({ name: '护理员', owned: false, price: 800, coins: 800 });
        ui.dom.btnWardrobeLeft.addEventListener('click', () => left++); ui.dom.btnWardrobeRight.addEventListener('click', () => right++); ui.dom.btnWardrobeReset.addEventListener('click', () => reset++); ui.dom.btnEquipWardrobe.addEventListener('click', () => purchases++);
        ui.draw(ctx, 320, 568);
        const filterTop = ui.filterNodes[0].getBoundingClientRect().top, fitting = ui.dom.wardrobePreview.getBoundingClientRect();
        assert.ok(fitting.top > 88 && fitting.height - 76 >= 100);
        for (const id of ['btnWardrobeLeft', 'btnWardrobeRight', 'btnWardrobeReset']) assert.ok(ui.dom[id].getBoundingClientRect().bottom < filterTop, id);
        tap(ui, ui.dom.btnWardrobeLeft); assert.equal(left, 1);
        assert.equal(ui.outfitFilter, 'all'); tap(ui, ui.dom.btnWardrobeRight); tap(ui, ui.dom.btnWardrobeReset); assert.equal(right, 1); assert.equal(reset, 1);
        tap(ui, ui.filterNodes[2]); ui.draw(ctx, 320, 568); assert.equal(ui.outfitFilter, 'weird'); tap(ui, ui.clothesCards.find(n => n.skin.id === 'mushroom')); assert.equal(preview, 'mushroom');
        tap(ui, ui.dom.btnEquipWardrobe); assert.equal(purchases, 1); assert.ok(ui.dom.btnEquipWardrobe.getBoundingClientRect().bottom <= 568 - homeInset);
    }
});

test('map/rank scroll keeps rows inside their viewport and tap changes map via engine callback', () => {
    const ui = new UIManager(), maps = Array.from({ length: 8 }, (_, i) => ({ id: String(i), name: `世界${i}`, stageTitle: `地图${i}`, available: true, themeColor: '#456' })); let selected;
    ui.renderMapList(maps, '0', id => selected = id); ui.showMapModal(); ui.draw(context(), 375, 667);
    ui.onPointerStart(200, 400); ui.onPointerMove(200, 160); ui.onPointerEnd(200, 160); assert.equal(ui.mapScroll, 240); ui.draw(context(), 375, 667);
    const visible = ui.hits.find(node => node.id === 'map-3'); tap(ui, visible); assert.equal(selected, '3'); assert.equal(ui.activeModal(), null);
    ui.showRankModal({ bestDistance: 1000, totalRuns: 22, entries: Array.from({ length: 20 }, (_, i) => ({ distance: 1000 - i, coins: i, mapName: '测试世界', finishedAt: '2026-10-07T12:00:00Z' })) }); ui.draw(context(), 375, 667);
    ui.onPointerStart(200, 500); ui.onPointerMove(200, 250); ui.onPointerEnd(200, 250); assert.equal(ui.rankScroll, 250);
});

test('playing gestures pass through while UI pause touch and disabled daily reward are consumed', () => {
    const ui = new UIManager(); ui.hideLobby(); ui.draw(context(), 375, 667);
    assert.equal(ui.onPointerStart(180, 420), false); assert.equal(ui.onPointerMove(250, 420), false); assert.equal(ui.onPointerEnd(250, 420), false);
    let paused = 0; ui.dom.pauseBtn.addEventListener('click', () => paused++); tap(ui, ui.dom.pauseBtn); assert.equal(paused, 1);
    ui.showDailyModal(); ui.updateDailyAvailability({ claimed: true }); ui.draw(context(), 375, 667); let rewards = 0; ui.dom.btnClaimDaily.addEventListener('click', () => rewards++); tap(ui, ui.dom.btnClaimDaily); assert.equal(rewards, 0);
});

test('running speed card matches browser units, hierarchy, dark panel and bottom position without consuming swipes', () => {
    for (const [w, h, homeInset] of [[330, 640, 0], [375, 667, 0], [390, 844, 34]]) {
        const wxApi = { getWindowInfo: () => ({ safeArea: { bottom: h - homeInset } }) };
        const ui = new UIManager(wxApi), ctx = context();
        ui.hideLobby(); ui.updateHUD({ score: 15, coins: 2, speed: 26.9, player: { props: { milk: 0 }, isFlying: false }, challenge: null }); ui.draw(ctx, w, h);
        const card = ui.dom.hudSpeed.getBoundingClientRect();
        assert.equal(card.left, 18); assert.equal(card.height, 64); assert.equal(h - card.bottom, 96); assert.ok(card.right <= w - 18);
        assert.ok(ctx.fills.some(f => f.color === 'rgba(18,28,38,.78)' && f.shadow === 'rgba(0,0,0,.35)'));
        const speed = ctx.texts.find(t => t.text === '26'), unit = ctx.texts.find(t => t.text === 'm/s'), status = ctx.texts.find(t => t.text === '极限巡航');
        assert.match(speed.font, /^900 26px /); assert.equal(speed.color, '#ffffff'); assert.match(unit.font, /^700 13px /); assert.equal(unit.color, '#bdc3c7');
        assert.equal(speed.y, unit.y); assert.ok(unit.x > speed.x); assert.ok(status.y > speed.y); assert.match(status.font, /^800 12px /); assert.equal(status.color, '#78e08f');
        const touchX = card.left + card.width / 2, touchY = card.top + card.height / 2;
        assert.equal(ui.onPointerStart(touchX, touchY), false); assert.equal(ui.onPointerEnd(touchX, touchY), false);
        ui.showLobby(); assert.equal(ui.dom.hudSpeed.style.display, 'none');
    }
});

test('speed status follows browser flight, milk, challenge, roof and map feature priority with matching colors', () => {
    const ui = new UIManager(); ui.applyMap({ name: '奶茶', roofLabel: '杯顶疾跑' }); ui.hideLobby();
    const base = { props: { milk: 0, flight: 0 }, isFlying: false, isOnRoof: false };
    const cases = [
        [{ isFlying: true, props: { milk: 3, flight: 6 } }, '翅膀飞行', '#f6dda1', 'status-wing'],
        [{ props: { milk: 3 }, mapChallengeLabel: '挑战疾跑' }, '奶瓶暴走', '#ff4757', 'status-flame'],
        [{ mapChallengeLabel: '挑战疾跑', isOnRoof: true }, '挑战疾跑', '#f6dda1', 'status-challenge'],
        [{ isOnRoof: true, mapFeatureLabel: '泡泡弹跳' }, '杯顶疾跑', '#00d2d3', 'status-bolt'],
        [{ mapFeatureLabel: '泡泡弹跳' }, '泡泡弹跳', '#a6edc2', 'status-feature'],
        [{}, '极限巡航', '#78e08f', ''],
    ];
    for (const [overrides, text, color, statusIcon] of cases) {
        ui.updateHUD({ score: 1, coins: 0, speed: 28, player: { ...base, ...overrides }, challenge: null }); const ctx = context(); ui.draw(ctx, 375, 667);
        assert.equal(ui.dom.statusTag.textContent, text); assert.equal(ui.dom.statusTag.style.color, color); assert.equal(ui.dom.statusTag.dataset.icon, statusIcon);
        assert.ok(ctx.texts.some(t => t.text === text && t.color === color));
    }
});

test('native labels preserve achievement values, personal history and flying challenge without browser nodes', () => {
    const ui = new UIManager(), ctx = context(); ui.showAchievementsModal({ bestDistance: 1111, lifetimeCoins: 35000, jumps: 24, slides: 19 }); ui.draw(ctx, 375, 667);
    assert.ok(ctx.texts.some(x => x.text === '35,000')); ui.hideAllModals(); ui.hideLobby();
    ui.updateHUD({ score: 250, coins: 11, speed: 30, player: { props: { flight: 6 }, isFlying: true }, challenge: null }); ui.draw(context(), 375, 667);
    assert.equal(ui.challenge.title, '云翼飞行'); assert.equal(ui.challenge.remaining, 6);
    ui.showGameOver(250, 11, '肚皮歇一下'); assert.equal(ui.activeModal(), 'gameOverModal'); ui.showLobby({ coins: 11 }); assert.equal(ui.activeModal(), null);
});
