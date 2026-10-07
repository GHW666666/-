/** Historical totals survive new runs, map changes, and spending coins. */
export const ACHIEVEMENT_STORAGE_KEY = 'naiwa_achievements';

const STAT_KEYS = ['bestDistance', 'lifetimeCoins', 'jumps', 'slides'];

function count(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value));
}

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export class AchievementProgress {
    constructor(storage, legacy = {}) {
        this.storage = storage;
        let saved = null;
        try {
            saved = storage.getStorage(ACHIEVEMENT_STORAGE_KEY, null);
        } catch {
            // An unavailable storage backend should not prevent starting a run.
        }
        const source = isRecord(saved) ? saved : {};
        this.stats = Object.fromEntries(STAT_KEYS.map(key => [key, count(source[key])]));
        this.dirty = source.version !== 1 || STAT_KEYS.some(key => source[key] !== this.stats[key]);
        this.mergeLegacy(legacy);
    }

    /** The old balance is the only available lower bound for historical earnings. */
    mergeLegacy({ highScore, coins } = {}) {
        const bestDistance = Math.max(this.stats.bestDistance, count(highScore));
        const lifetimeCoins = Math.max(this.stats.lifetimeCoins, count(coins));
        const changed = bestDistance !== this.stats.bestDistance || lifetimeCoins !== this.stats.lifetimeCoins;
        if (changed) {
            this.stats.bestDistance = bestDistance;
            this.stats.lifetimeCoins = lifetimeCoins;
            this.dirty = true;
        }
        return changed;
    }

    recordDistance(distance) {
        const bestDistance = count(distance);
        if (bestDistance <= this.stats.bestDistance) return false;
        this.stats.bestDistance = bestDistance;
        this.dirty = true;
        return true;
    }

    addCoins(amount) {
        return this.addCount('lifetimeCoins', count(amount));
    }

    /** Called once after an accepted jump lands or a slide finishes. */
    completeAction(type) {
        if (type === 'jump') return this.addCount('jumps', 1);
        if (type === 'slide') return this.addCount('slides', 1);
        return false;
    }

    addCount(key, amount) {
        const next = Math.min(Number.MAX_SAFE_INTEGER, this.stats[key] + amount);
        if (next === this.stats[key]) return false;
        this.stats[key] = next;
        this.dirty = true;
        return true;
    }

    snapshot() {
        return { ...this.stats };
    }

    /** The engine chooses flush boundaries instead of writing every render frame. */
    save() {
        if (!this.dirty) return false;
        try {
            const saved = this.storage.setStorage(ACHIEVEMENT_STORAGE_KEY, { version: 1, ...this.snapshot() });
            if (saved === false) return false;
            this.dirty = false;
            return true;
        } catch {
            return false;
        }
    }
}
