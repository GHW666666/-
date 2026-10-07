/** Personal completed runs; the engine owns the once-per-run completion boundary. */
export const RUN_RECORDS_STORAGE_KEY = 'naiwa_run_records';
export const RUN_RECORDS_LIMIT = 20;

const RECORD_FIELDS = ['id', 'legacy', 'distance', 'coins', 'mapId', 'mapName', 'finishedAt'];
const MAX_TIMESTAMP = 8.64e15;

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function count(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value));
}

function text(value, maxLength) {
    if (typeof value !== 'string') return null;
    return value.trim().slice(0, maxLength) || null;
}

function timestamp(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
    return Math.min(MAX_TIMESTAMP, Math.floor(value));
}

function legacyRecord(distance) {
    return { id: 'legacy-best', legacy: true, distance, coins: null, mapId: null, mapName: null, finishedAt: null };
}

function compareRecords(a, b) {
    return b.distance - a.distance
        || (b.coins ?? -1) - (a.coins ?? -1)
        || (b.finishedAt ?? -1) - (a.finishedAt ?? -1)
        || b.id.localeCompare(a.id, 'en', { numeric: true });
}

export class RunRecords {
    constructor(storage, { bestDistance = 0 } = {}) {
        this.storage = storage;
        let saved = null;
        try {
            saved = storage.getStorage(RUN_RECORDS_STORAGE_KEY, null);
        } catch {
            // Records remain usable in memory when local storage is unavailable.
        }
        const source = isRecord(saved) ? saved : {};
        const candidates = Array.isArray(source.entries) ? source.entries : [];
        const seen = new Set();
        let legacyBest = count(bestDistance);
        const actual = [];
        for (let index = 0; index < candidates.length; index++) {
            const candidate = candidates[index];
            if (!isRecord(candidate)) continue;
            const distance = count(candidate.distance);
            if (distance === 0) continue;
            if (candidate.legacy === true) {
                legacyBest = Math.max(legacyBest, distance);
                continue;
            }
            let id = text(candidate.id, 96) || `recovered-${index}`;
            if (id === 'legacy-best') id = `recovered-${index}`;
            if (seen.has(id)) continue;
            seen.add(id);
            actual.push({
                id,
                legacy: false,
                distance,
                coins: count(candidate.coins),
                mapId: text(candidate.mapId, 64),
                mapName: text(candidate.mapName, 120),
                finishedAt: timestamp(candidate.finishedAt),
            });
        }
        const actualBest = actual.reduce((best, entry) => Math.max(best, entry.distance), 0);
        this.bestDistance = Math.max(legacyBest, actualBest);
        this.totalRuns = Math.max(count(source.totalRuns), actual.length);
        if (legacyBest > actualBest) actual.push(legacyRecord(legacyBest));
        this.entries = actual.sort(compareRecords).slice(0, RUN_RECORDS_LIMIT);
        const unchanged = source.version === 1 && source.totalRuns === this.totalRuns
            && Array.isArray(source.entries) && source.entries.length === this.entries.length
            && source.entries.every((entry, index) => isRecord(entry)
                && RECORD_FIELDS.every(key => entry[key] === this.entries[index][key]));
        this.dirty = !unchanged && (saved !== null || this.entries.length > 0);
        if (this.dirty) this.save();
    }

    recordRun(run = {}) {
        if (!isRecord(run)) return null;
        const distance = count(run.distance);
        if (distance === 0) return null;
        const finishedAt = timestamp(run.finishedAt === undefined ? Date.now() : run.finishedAt);
        this.totalRuns = Math.min(Number.MAX_SAFE_INTEGER, this.totalRuns + 1);
        const prefix = `run-${this.totalRuns}-${finishedAt ?? 'unknown'}`;
        let id = prefix;
        let suffix = 0;
        while (this.entries.some(entry => entry.id === id)) id = `${prefix}-${++suffix}`;
        const record = {
            id,
            legacy: false,
            distance,
            coins: count(run.coins),
            mapId: text(run.mapId, 64),
            mapName: text(run.mapName, 120),
            finishedAt,
        };
        this.bestDistance = Math.max(this.bestDistance, distance);
        this.entries = [...this.entries, record]
            .filter(entry => !entry.legacy || distance < entry.distance)
            .sort(compareRecords).slice(0, RUN_RECORDS_LIMIT);
        this.dirty = true;
        this.save();
        return { ...record };
    }

    snapshot() {
        return {
            entries: this.entries.map(entry => ({ ...entry })),
            bestDistance: this.bestDistance,
            totalRuns: this.totalRuns,
        };
    }

    save() {
        if (!this.dirty) return false;
        try {
            const saved = this.storage.setStorage(RUN_RECORDS_STORAGE_KEY, {
                version: 1,
                entries: this.entries.map(entry => ({ ...entry })),
                totalRuns: this.totalRuns,
            });
            if (saved === false) return false;
            this.dirty = false;
            return true;
        } catch {
            return false;
        }
    }
}
