import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage = { getItem() { return null; }, setItem() {} };
const { GameEngine, GAME_STATE } = await import('../game/main.js');
const { WardrobeInventory } = await import('../game/wardrobeInventory.js');
const { AchievementProgress } = await import('../game/achievements.js');
const { OUTFIT_SKINS } = await import('../game/outfits3d.js');
const { WING_SKINS } = await import('../game/wings3d.js');
const { audio } = await import('../game/audio.js');
audio.isMuted = true; audio.initialized = true;

function fixture(coins = 30000) {
    const saved = new Map(); let fail = false;
    const storage = {
        getStorage(key, fallback) { return saved.get(key) ?? fallback; },
        setStorage(key, value) { if (fail) return false; saved.set(key, structuredClone(value)); return true; },
    };
    const inventory = new WardrobeInventory(storage, { outfits: OUTFIT_SKINS, wings: WING_SKINS, coins });
    const outfit = { skinId: 'nurse', equip(id) { this.skinId = id; } }, wings = { skinId: 'none', equip(id) { this.skinId = id; } };
    const lobbyCoins = { textContent: String(coins) };
    const ui = new Proxy({ dom: { lobbyCoins } }, { get(target, name) { return target[name] ?? (() => {}); } });
    const engine = Object.create(GameEngine.prototype);
    Object.assign(engine, {
        wardrobeInventory: inventory, coins, savedCoinBalance: coins,
        progress: new AchievementProgress(storage, { coins }), state: GAME_STATE.LOBBY,
        highScore: 0, savedHighScore: 0, equippedOutfitId: 'none', equippedWingId: 'none',
        wardrobeSession: { tab: 'clothes', clothes: 'nurse', wings: 'none' }, ui,
        player: { character: { outfits: outfit, wings }, setLobbyMode() {} },
        wardrobePreview: { close() {} }, world: { setLobbyCamera() {} },
    });
    engine.dailyDateKey = () => '2026-10-07';
    return { engine, storage, inventory, failWrites(value) { fail = value; } };
}

test('purchase and re-equip deduct once while preserving cumulative earnings', () => {
    const { engine, storage } = fixture();
    engine.equipWardrobeSelection();
    assert.equal(engine.coins, 29200);
    assert.equal(engine.equippedOutfitId, 'nurse');
    assert.equal(engine.ui.dom.lobbyCoins.textContent, 29200);
    assert.equal(engine.progress.stats.lifetimeCoins, 30000);
    engine.equipWardrobeSelection();
    assert.equal(engine.coins, 29200);
    const loaded = new WardrobeInventory(storage, { outfits: OUTFIT_SKINS, wings: WING_SKINS, coins: 30000 });
    assert.equal(loaded.coins, 29200, 'stale legacy wallet revived spent coins');
    assert.equal(loaded.isOwned('clothes', 'nurse'), true);
});

test('insufficient funds allow preview but prevent equip; close restores the original frog', () => {
    const { engine, inventory } = fixture(799);
    engine.equipWardrobeSelection();
    assert.equal(engine.coins, 799);
    assert.equal(engine.equippedOutfitId, 'none');
    assert.equal(inventory.isOwned('clothes', 'nurse'), false);
    assert.match(engine.wardrobeSession.purchaseMessage, /还差 1/);
    engine.closeWardrobe();
    assert.equal(engine.player.character.outfits.skinId, 'none');
    assert.equal(engine.player.character.wings.skinId, 'none');
});

test('wing purchase is independent from clothes and returning to owned cosmetics is free', () => {
    const { engine } = fixture();
    engine.equipWardrobeSelection();
    engine.wardrobeSession.tab = 'wings'; engine.wardrobeSession.wings = 'cream';
    engine.equipWardrobeSelection();
    const remainingCoins = 30000 - OUTFIT_SKINS.nurse.price - WING_SKINS.cream.price;
    assert.equal(engine.coins, remainingCoins);
    assert.equal(engine.equippedWingId, 'cream');
    assert.equal(engine.equippedOutfitId, 'nurse');
    engine.wardrobeSession.wings = 'none'; engine.equipWardrobeSelection();
    engine.wardrobeSession.wings = 'cream'; engine.equipWardrobeSelection();
    assert.equal(engine.coins, remainingCoins);
});

test('failed purchase neither spends nor equips; retry can purchase the same preview', () => {
    const { engine, inventory, failWrites } = fixture();
    failWrites(true); engine.equipWardrobeSelection();
    assert.equal(engine.coins, 30000);
    assert.equal(engine.equippedOutfitId, 'none');
    assert.equal(inventory.isOwned('clothes', 'nurse'), false);
    assert.match(engine.wardrobeSession.purchaseMessage, /没有保存/);
    failWrites(false); engine.equipWardrobeSelection();
    assert.equal(engine.coins, 29200);
    assert.equal(engine.equippedOutfitId, 'nurse');
});

test('daily reward counts once locally, persists, and cannot be claimed while running', () => {
    const { engine, storage } = fixture(500);
    engine.claimDaily(); engine.claimDaily();
    assert.equal(engine.coins, 600);
    assert.equal(engine.progress.stats.lifetimeCoins, 600);
    const loaded = new WardrobeInventory(storage, { outfits: OUTFIT_SKINS, wings: WING_SKINS, coins: 500 });
    assert.equal(loaded.coins, 600);
    assert.equal(loaded.hasClaimedDaily('2026-10-07'), true);
    engine.dailyDateKey = () => '2026-10-08'; engine.state = GAME_STATE.PLAYING;
    engine.claimDaily(); assert.equal(engine.coins, 600);
    engine.state = GAME_STATE.LOBBY; engine.claimDaily();
    assert.equal(engine.coins, 700);
    assert.equal(engine.progress.stats.lifetimeCoins, 700);
});

test('run earnings reach the same wallet as purchases and survive stale legacy reloads', () => {
    const { engine, storage } = fixture(800);
    engine.equipWardrobeSelection(); engine.state = GAME_STATE.PLAYING; engine.activeRun = { coins: 0 };
    engine.addCoins(18);
    assert.equal(engine.coins, 18);
    assert.equal(engine.activeRun.coins, 18);
    assert.equal(engine.progress.stats.lifetimeCoins, 818);
    const loaded = new WardrobeInventory(storage, { outfits: OUTFIT_SKINS, wings: WING_SKINS, coins: 800 });
    assert.equal(loaded.coins, 18);
    assert.equal(loaded.isOwned('clothes', 'nurse'), true);
});
