import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";
import { GameTime } from "../time/game_time";

export class ItemCounterComponent extends Component {
    static getId() {
        return "Counter";
    }

    static getSchema() {
        return {
            inputSlots: types.array(
                types.structured({
                    item: types.obj(gItemRegistry),
                    sourceSlot: types.uint,
                })
            ),
        };
    }

    duplicateWithoutContents() {
        return new ItemCounterComponent();
    }

    constructor() {
        super();

        /**
         * Our current inputs
         * @type {Array<{ item: BaseItem, sourceSlot: number }>}
         */
        this.inputSlots = [];

        this.currentCount = 0;

        this.lastResetTime = 0;

        /** @typedef {object} TickCount
         * @property {number} gameTimeSeconds
         * @property {number} count
         */
        /** @type {TickCount[]} */
        this.tickHistory = [];

        this.averageItemsPerSecond = 0;
    }

    /**
     * Called every time an item leaves the counter
     */
    countNewItem() {
        this.currentCount++;
    }

    /**
     * Called on every counter entity .update() call
     * @param {GameTime} gameTime
     */
    tick(gameTime) {
        const count = this.currentCount;
        this.currentCount = 0;

        this.tickHistory.push({
            gameTimeSeconds: gameTime.timeSeconds,
            count: count,
        });

        // Only keep history for the last second.
        this.tickHistory = this.tickHistory.filter(tick => gameTime.timeSeconds - tick.gameTimeSeconds <= 1);

        const delta = gameTime.timeSeconds - this.lastResetTime;
        if (delta > 1) {
            const sum = this.tickHistory.reduce((a, b) => a + b.count, 0);
            this.averageItemsPerSecond = sum;
            this.lastResetTime = gameTime.timeSeconds;
        }
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     * @param {number} sourceSlot
     */
    tryTakeItem(item, sourceSlot) {
        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}
