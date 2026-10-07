import test from 'node:test';
import assert from 'node:assert/strict';
import { WardrobeInventory, WARDROBE_INVENTORY_STORAGE_KEY } from '../game/wardrobeInventory.js';

const CATALOGS = {
    outfits: { nurse: { price: 120 }, bandit: { price: 180 }, complimentary: { price: 0 } },
    wings: { cream: { price: 300 } },
};

function storageFixture(initial = null) {
    let value = initial;
    const writes = [];
    return {
        writes,
        getStorage(key, fallback) {
            assert.equal(key, WARDROBE_INVENTORY_STORAGE_KEY);
            return value ?? fallback;
        },
        setStorage(key, saved) {
            assert.equal(key, WARDROBE_INVENTORY_STORAGE_KEY);
            value = structuredClone(saved);
            writes.push(value);
            return true;
        },
    };
}

test('new inventory migrates the old balance without granting previously free equipped paid items', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 500 });
    assert.deepEqual(inventory.snapshot(), { outfits: ['none'], wings: ['none'] });
    assert.equal(inventory.coins, 500);
    assert.equal(inventory.isOwned('clothes', 'nurse'), false);
    assert.equal(inventory.isOwned('wings', 'cream'), false);
    assert.equal(storage.writes.length, 0, 'initial migration waits for a save boundary');
    assert.equal(inventory.save(), true);
    assert.deepEqual(storage.writes[0], { version: 1, coins: 500, outfits: ['none'], wings: ['none'], dailyClaimDay: null });
    assert.equal(inventory.save(), false);
});

test('none is always free and explicitly free catalog options can be equipped without purchase', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, CATALOGS);
    assert.equal(inventory.isOwned('clothes', 'complimentary'), true);
    assert.equal(inventory.getPrice('clothes', 'none'), 0);
    assert.equal(inventory.getPrice('wings', 'none'), 0);
    assert.deepEqual(inventory.purchase('clothes', 'none'), { ok: true, status: 'already-owned', coins: 0, cost: 0 });
    assert.deepEqual(inventory.purchase('clothes', 'complimentary'), { ok: true, status: 'already-owned', coins: 0, cost: 0 });
    assert.equal(storage.writes.length, 0);
});

test('purchase commits ownership and the exact deducted balance together before mutating memory', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 500 });
    assert.deepEqual(inventory.purchase('clothes', 'nurse'), { ok: true, status: 'purchased', coins: 380, cost: 120 });
    assert.equal(inventory.isOwned('clothes', 'nurse'), true);
    assert.equal(inventory.coins, 380);
    assert.equal(inventory.dirty, false);
    assert.equal(storage.writes.length, 1);
    assert.deepEqual(storage.writes[0], { version: 1, coins: 380, outfits: ['none', 'nurse'], wings: ['none'], dailyClaimDay: null });
    assert.equal(new WardrobeInventory(storage, { ...CATALOGS, coins: 500 }).coins, 380,
        'a crash before the legacy coin mirror updates cannot restore the pre-purchase balance');
});

test('owned purchases never deduct twice and canonical coins take priority over a stale wallet mirror', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 500 });
    inventory.purchase('clothes', 'nurse');
    inventory.addCoins(100);
    inventory.save();
    const restored = new WardrobeInventory(storage, { ...CATALOGS, coins: 500 });
    assert.equal(restored.coins, 480);
    assert.deepEqual(restored.purchase('clothes', 'nurse'), { ok: true, status: 'already-owned', coins: 480, cost: 0 });
    assert.deepEqual(restored.purchase('wings', 'cream', 500), { ok: false, status: 'invalid', coins: 480, cost: 300 });
    assert.equal(storage.writes.length, 2);
    assert.deepEqual(restored.purchase('wings', 'cream', 480), { ok: true, status: 'purchased', coins: 180, cost: 300 });
});

test('insufficient funds, unknown items, invalid types and invalid balances never change ownership or write storage', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 119 });
    assert.deepEqual(inventory.purchase('clothes', 'nurse'), { ok: false, status: 'insufficient', coins: 119, cost: 120 });
    for (const invalid of [-1, NaN, Infinity, 1.5, '500', null, Number.MAX_SAFE_INTEGER + 1, 500]) {
        assert.deepEqual(inventory.purchase('clothes', 'nurse', invalid), { ok: false, status: 'invalid', coins: 119, cost: 120 });
    }
    for (const [type, id] of [['outfits', 'nurse'], ['unknown', 'cream'], ['clothes', 'missing'], ['clothes', {}]]) {
        assert.equal(inventory.purchase(type, id).status, 'invalid');
        assert.equal(inventory.isOwned(type, id), false);
        assert.equal(inventory.getPrice(type, id), null);
    }
    assert.deepEqual(inventory.snapshot(), { outfits: ['none'], wings: ['none'] });
    assert.equal(inventory.coins, 119);
    assert.equal(storage.writes.length, 0);
});

test('catalog prices must be explicit safe nonnegative integers and none is always free', () => {
    const outfits = { none: { price: 999 } };
    for (const [index, price] of [undefined, -1, 1.5, NaN, Infinity, '12', Number.MAX_VALUE].entries()) outfits[`bad-${index}`] = { price };
    const inventory = new WardrobeInventory(storageFixture(), { outfits, coins: 100 });
    assert.equal(inventory.getPrice('clothes', 'none'), 0);
    assert.equal(inventory.getPrice('wings', 'none'), 0);
    for (let index = 0; index < 7; index++) {
        assert.equal(inventory.getPrice('clothes', `bad-${index}`), null);
        assert.equal(inventory.purchase('clothes', `bad-${index}`).status, 'invalid');
    }
});

test('false or thrown commit failures grant no item and keep the balance and any dirty earned income', () => {
    for (const failure of [() => false, () => { throw new Error('disk full'); }]) {
        const storage = storageFixture({ version: 1, coins: 400, outfits: ['none'], wings: ['none'] });
        const write = storage.setStorage.bind(storage);
        const inventory = new WardrobeInventory(storage, CATALOGS);
        inventory.addCoins(100);
        storage.setStorage = failure;
        assert.deepEqual(inventory.purchase('wings', 'cream'), { ok: false, status: 'storage-error', coins: 500, cost: 300 });
        assert.equal(inventory.isOwned('wings', 'cream'), false);
        assert.equal(inventory.coins, 500);
        assert.equal(inventory.dirty, true);
        assert.equal(new WardrobeInventory(storage, CATALOGS).coins, 400);
        storage.setStorage = write;
        assert.equal(inventory.save(), true);
        assert.equal(new WardrobeInventory(storage, CATALOGS).coins, 500);
        assert.equal(new WardrobeInventory(storage, CATALOGS).isOwned('wings', 'cream'), false);
    }
});

test('coin income waits for explicit saves and failed saves can retry without losing progress', () => {
    const storage = storageFixture({ version: 1, coins: 10, outfits: ['none'], wings: ['none'] });
    const write = storage.setStorage.bind(storage);
    const inventory = new WardrobeInventory(storage, CATALOGS);
    assert.equal(inventory.dirty, false);
    assert.equal(inventory.save(), false);
    for (let index = 0; index < 50; index++) assert.equal(inventory.addCoins(1), true);
    assert.equal(storage.writes.length, 0);
    assert.equal(inventory.coins, 60);
    storage.setStorage = () => false;
    assert.equal(inventory.save(), false);
    inventory.addCoins(5);
    assert.equal(inventory.coins, 65);
    assert.equal(inventory.dirty, true);
    storage.setStorage = write;
    assert.equal(inventory.save(), true);
    assert.equal(inventory.dirty, false);
    assert.equal(storage.writes.length, 1);
    assert.equal(new WardrobeInventory(storage, { ...CATALOGS, coins: 999 }).coins, 65);
});

test('a successful purchase includes all unsaved earned coins in its single atomic commit', () => {
    const storage = storageFixture({ version: 1, coins: 100, outfits: ['none'], wings: ['none'] });
    const inventory = new WardrobeInventory(storage, CATALOGS);
    inventory.addCoins(25);
    inventory.addCoins(18);
    assert.deepEqual(inventory.purchase('clothes', 'nurse'), { ok: true, status: 'purchased', coins: 23, cost: 120 });
    assert.equal(storage.writes.length, 1);
    assert.equal(storage.writes[0].coins, 23);
    assert.equal(inventory.save(), false);
    assert.equal(new WardrobeInventory(storage, CATALOGS).isOwned('clothes', 'nurse'), true);
});

test('corrupt inventory fields are sanitized without granting unknown catalog items', () => {
    const storage = storageFixture({ version: 1, coins: '200', outfits: ['nurse', 'nurse', 'missing', null, 99], wings: 'cream' });
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 200 });
    assert.deepEqual(inventory.snapshot(), { outfits: ['none', 'nurse'], wings: ['none'] });
    assert.equal(inventory.coins, 200);
    assert.equal(inventory.dirty, true);
    inventory.save();
    assert.deepEqual(storage.writes[0], { version: 1, coins: 200, outfits: ['none', 'nurse'], wings: ['none'], dailyClaimDay: null });
    for (const malformed of [null, 'broken json', [], 12, { version: 2, coins: 999, outfits: ['nurse'] }]) {
        const restored = new WardrobeInventory(storageFixture(malformed), { ...CATALOGS, coins: 50 });
        assert.deepEqual(restored.snapshot(), { outfits: ['none'], wings: ['none'] });
        assert.equal(restored.coins, 50);
    }
    const throwing = { getStorage() { throw new Error('blocked'); }, setStorage() { return false; } };
    const unavailable = new WardrobeInventory(throwing, { ...CATALOGS, coins: 5 });
    assert.equal(unavailable.isOwned('clothes', 'nurse'), false);
    assert.equal(unavailable.coins, 5);
    assert.equal(unavailable.save(), false);
});

test('invalid income is rejected, snapshots cannot unlock items, and balances remain safe integers', () => {
    const inventory = new WardrobeInventory(storageFixture(), { ...CATALOGS, coins: Number.MAX_SAFE_INTEGER - 10 });
    for (const invalid of [-1, 0, 1.5, NaN, Infinity, '5', null, undefined, Number.MAX_VALUE]) assert.equal(inventory.addCoins(invalid), false);
    const snapshot = inventory.snapshot();
    snapshot.outfits.push('nurse');
    snapshot.wings.length = 0;
    assert.equal(inventory.isOwned('clothes', 'nurse'), false);
    assert.equal(inventory.isOwned('wings', 'none'), true);
    assert.equal(inventory.addCoins(20), true);
    assert.equal(inventory.coins, Number.MAX_SAFE_INTEGER);
    assert.equal(inventory.addCoins(1), false);
    assert.equal(inventory.purchase('clothes', 'nurse').coins, Number.MAX_SAFE_INTEGER - 120);
});

test('daily reward can be claimed once per day, survives reload, and pays again on the next day', () => {
    const storage = storageFixture();
    const inventory = new WardrobeInventory(storage, { ...CATALOGS, coins: 20 });
    assert.equal(inventory.hasClaimedDaily('2026-10-07'), false);
    assert.deepEqual(inventory.claimDaily('2026-10-07'), { ok: true, status: 'claimed', coins: 120, amount: 100 });
    assert.equal(inventory.hasClaimedDaily('2026-10-07'), true);
    assert.deepEqual(inventory.claimDaily('2026-10-07'), { ok: false, status: 'already-claimed', coins: 120, amount: 0 });
    const restored = new WardrobeInventory(storage, { ...CATALOGS, coins: 20 });
    assert.equal(restored.hasClaimedDaily('2026-10-07'), true);
    assert.deepEqual(restored.claimDaily('2026-10-07'), { ok: false, status: 'already-claimed', coins: 120, amount: 0 });
    assert.deepEqual(restored.claimDaily('2026-10-08'), { ok: true, status: 'claimed', coins: 220, amount: 100 });
    assert.equal(storage.writes.length, 2);
    assert.equal(storage.writes[1].dailyClaimDay, '2026-10-08');
    restored.purchase('clothes', 'nurse');
    restored.addCoins(1);
    restored.save();
    assert.equal(new WardrobeInventory(storage, CATALOGS).hasClaimedDaily('2026-10-08'), true);
});

test('failed daily reward commits do not add coins or mark a day claimed and may retry', () => {
    for (const failure of [() => false, () => { throw new Error('disk full'); }]) {
        const storage = storageFixture({ version: 1, coins: 10, outfits: ['none'], wings: ['none'], dailyClaimDay: '2026-10-06' });
        const write = storage.setStorage.bind(storage);
        const inventory = new WardrobeInventory(storage, CATALOGS);
        inventory.addCoins(5);
        storage.setStorage = failure;
        assert.deepEqual(inventory.claimDaily('2026-10-07'), { ok: false, status: 'storage-error', coins: 15, amount: 0 });
        assert.equal(inventory.hasClaimedDaily('2026-10-07'), false);
        assert.equal(inventory.hasClaimedDaily('2026-10-06'), true);
        assert.equal(inventory.dirty, true);
        storage.setStorage = write;
        assert.deepEqual(inventory.claimDaily('2026-10-07'), { ok: true, status: 'claimed', coins: 115, amount: 100 });
        assert.equal(storage.writes[0].coins, 115);
        assert.equal(new WardrobeInventory(storage, CATALOGS).hasClaimedDaily('2026-10-07'), true);
    }
});

test('daily claims reject invalid dates or amounts and preserve valid calendar boundaries', () => {
    const storage = storageFixture({ version: 1, coins: 10, outfits: ['none'], wings: ['none'], dailyClaimDay: '2026-02-30' });
    const inventory = new WardrobeInventory(storage, CATALOGS);
    for (const day of ['', null, 20261007, '2026-2-01', '2026-02-29', '2026-04-31', '2026-13-01', '0000-01-01']) {
        assert.equal(inventory.claimDaily(day).status, 'invalid');
        assert.equal(inventory.hasClaimedDaily(day), false);
    }
    for (const invalid of [-1, 0, 1.5, NaN, Infinity, '100', null, Number.MAX_VALUE]) assert.equal(inventory.claimDaily('2026-10-07', invalid).status, 'invalid');
    assert.equal(storage.writes.length, 0);
    assert.equal(inventory.claimDaily('2028-02-29', 50).amount, 50);
    assert.equal(inventory.claimDaily('2100-02-29').status, 'invalid');
});
