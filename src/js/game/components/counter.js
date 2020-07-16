/** @typedef {object} TickCount
 * @property {number} gameTimeSeconds
 * @property {number} count
 */

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

        /** @type {number} a count of items that have passed through the component since the last tick */
        this.currentCount = 0;

        /**
         * Maintained every game tick, this aray contains the item counts for every tick in the past 1 second.
         * @type {TickCount[]}
         */
        this.tickHistory = [];

        /** @type {number} Calculated and set every second. This is a read only property. */
        this.averageItemsPerSecond = 0;

        /** @type {number} - Last time the averageItemsPerSecond property was reset. */
        this.lastResetTime = 0;
    }

    /**
     * Called every time an item leaves the counter building
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
        // Reset the count
        this.currentCount = 0;

        this.tickHistory.push({
            gameTimeSeconds: gameTime.timeSeconds,
            count: count,
        });

        // Only keep history for the last second.
        // TODO: Possible optimisation to replace with a for loop. Unsure if the logic within the loop will
        // counteract any speed gained by not using .filter
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
