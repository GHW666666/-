import { CONFIG } from './config.js';
import { Coin3D, PropItem3D } from './obstacles3d.js';

/** Feathers activate cosmetic wings; sky rewards share the existing coin batch. */
export class WingFlightRoute3D {
    constructor(world, random = Math.random) { this.world = world; this.random = random; this.reset(); }
    reset() {
        this.active = false; this.nextAirCoinZ = 0;
        // A rare reward after the opening run, with a fresh cadence on each retry.
        this.nextPickupZ = this.randomDistance(600, 900);
    }
    randomDistance(min, max) { return min + Math.floor(this.random() * (max - min + 1)); }
    update(player, speed) {
        const w = this.world;
        while (this.nextPickupZ < player.z + 180) {
            const occupied = w.challenges.find(segment => this.nextPickupZ >= segment.startZ - 20 && this.nextPickupZ <= segment.endZ + 25);
            if (occupied) { this.nextPickupZ = occupied.endZ + 50; continue; }
            w.props.push(new PropItem3D(w.scene, 0, this.nextPickupZ, 'flight'));
            this.nextPickupZ += this.randomDistance(1100, 1600);
        }
        for (const prop of w.props) if (prop.type === 'flight' && !prop.collected) this.clearHazards(prop.z - 40, prop.z + 12);
        if (player.isFlying) {
            if (!this.active) this.nextAirCoinZ = player.z + Math.max(18, speed * .75);
            this.active = true;
            if (player.props.flight > 1.2) {
                const horizon = player.z + Math.min(100, speed * Math.max(0, player.props.flight - .9));
                while (this.nextAirCoinZ < horizon) {
                    for (const lane of [-1, 0, 1]) {
                        const coin = new Coin3D(w.scene, lane, this.nextAirCoinZ, CONFIG.FLIGHT.HEIGHT + .4);
                        coin.airborne = true; w.coins.push(coin);
                    }
                    this.nextAirCoinZ += 6;
                }
            } else this.clearHazards(player.z - 12, player.z + speed * 1.8 + 25);
        } else if (this.active) {
            this.clearHazards(player.z - 12, player.z + speed * 1.8 + 25);
            w.coins = w.coins.filter(coin => { if (coin.airborne) { coin.destroy(); return false; } return true; });
            this.active = false;
        }
    }
    clearHazards(startZ, endZ) {
        const w = this.world;
        for (const key of ['trains', 'barriers', 'ramps']) {
            w[key] = w[key].filter(entity => {
                if (entity.safeSupport) return true;
                const start = entity.startZ ?? entity.z;
                const end = entity.endZ ?? entity.z + (entity.length || 1);
                if (start <= endZ && end >= startZ) { entity.destroy(); return false; }
                return true;
            });
        }
    }
}
