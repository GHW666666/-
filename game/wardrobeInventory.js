/** The authoritative coin balance and wardrobe ownership share one atomic save. */
export const WARDROBE_INVENTORY_STORAGE_KEY = 'naiwa_wardrobe_inventory';

const TYPE_FIELDS = { clothes: 'outfits', wings: 'wings' };

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isAmount(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isDayKey(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1 || month < 1 || month > 12 || day < 1) return false;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day <= days[month - 1];
}

function catalogPrices(catalog) {
    const prices = new Map([['none', 0]]);
    if (!isRecord(catalog)) return prices;
    for (const [id, item] of Object.entries(catalog)) {
        if (id !== 'none' && isRecord(item) && isAmount(item.price)) prices.set(id, item.price);
    }
    return prices;
}

export class WardrobeInventory {
    constructor(storage, { outfits, wings, coins = 0 } = {}) {
        this.storage = storage;
        this.prices = { clothes: catalogPrices(outfits), wings: catalogPrices(wings) };
        let saved = null;
        try {
            saved = storage.getStorage(WARDROBE_INVENTORY_STORAGE_KEY, null);
        } catch {
            // Missing storage does not grant previously equipped paid items.
        }
        const source = isRecord(saved) && saved.version === 1 ? saved : {};
        this.coins = isAmount(source.coins) ? source.coins : isAmount(coins) ? coins : 0;
        this.owned = { clothes: new Set(['none']), wings: new Set(['none']) };
        for (const [type, field] of Object.entries(TYPE_FIELDS)) {
            if (!Array.isArray(source[field])) continue;
            for (const id of source[field]) {
                if (typeof id === 'string' && this.getPrice(type, id) !== null) this.owned[type].add(id);
            }
        }
        this.dailyClaimDay = isDayKey(source.dailyClaimDay) ? source.dailyClaimDay : null;
        const inventory = this.snapshot();
        this.dirty = source.coins !== this.coins || source.version !== 1
            || (source.dailyClaimDay ?? null) !== this.dailyClaimDay
            || Object.values(TYPE_FIELDS).some(field => !Array.isArray(source[field])
                || source[field].length !== inventory[field].length
                || source[field].some((id, index) => id !== inventory[field][index]));
    }

    getPrice(type, id) {
        if (!Object.prototype.hasOwnProperty.call(TYPE_FIELDS, type) || typeof id !== 'string') return null;
        return this.prices[type].get(id) ?? null;
    }

    isOwned(type, id) {
        const price = this.getPrice(type, id);
        return price !== null && (price === 0 || this.owned[type].has(id));
    }

    snapshot() {
        return { outfits: [...this.owned.clothes], wings: [...this.owned.wings] };
    }

    purchase(type, id, balance = this.coins) {
        const price = this.getPrice(type, id);
        const response = (ok, status, coins = this.coins, cost = price ?? 0) => ({ ok, status, coins, cost });
        if (price === null || !isAmount(balance) || balance !== this.coins) return response(false, 'invalid');
        if (this.isOwned(type, id)) return response(true, 'already-owned', this.coins, 0);
        if (this.coins < price) return response(false, 'insufficient');

        const coins = this.coins - price;
        const inventory = this.snapshot();
        inventory[TYPE_FIELDS[type]].push(id);
        if (!this.write(inventory, coins)) return response(false, 'storage-error');
        this.owned[type].add(id);
        this.coins = coins;
        this.dirty = false;
        return response(true, 'purchased');
    }

    /** Earned coins stay in memory until the engine chooses a save boundary. */
    addCoins(amount) {
        if (!isAmount(amount) || amount === 0) return false;
        const coins = Math.min(Number.MAX_SAFE_INTEGER, this.coins + amount);
        if (coins === this.coins) return false;
        this.coins = coins;
        this.dirty = true;
        return true;
    }

    hasClaimedDaily(dayKey) {
        return isDayKey(dayKey) && this.dailyClaimDay === dayKey;
    }

    claimDaily(dayKey, amount = 100) {
        const response = (ok, status, credited = 0) => ({ ok, status, coins: this.coins, amount: credited });
        if (!isDayKey(dayKey) || !isAmount(amount) || amount === 0) return response(false, 'invalid');
        if (this.hasClaimedDaily(dayKey)) return response(false, 'already-claimed');
        const coins = Math.min(Number.MAX_SAFE_INTEGER, this.coins + amount);
        if (!this.write(this.snapshot(), coins, dayKey)) return response(false, 'storage-error');
        const credited = coins - this.coins;
        this.coins = coins;
        this.dailyClaimDay = dayKey;
        this.dirty = false;
        return response(true, 'claimed', credited);
    }

    save() {
        if (!this.dirty) return false;
        if (!this.write(this.snapshot(), this.coins)) return false;
        this.dirty = false;
        return true;
    }

    write(inventory, coins, dailyClaimDay = this.dailyClaimDay) {
        try {
            return this.storage.setStorage(WARDROBE_INVENTORY_STORAGE_KEY, {
                version: 1,
                coins,
                outfits: [...inventory.outfits],
                wings: [...inventory.wings],
                dailyClaimDay,
            }) !== false;
        } catch {
            return false;
        }
    }
}
