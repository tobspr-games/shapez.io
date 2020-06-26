import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem } from "../base_item";
import { Vector, enumDirection } from "../../core/vector";
import { Math_PI, Math_sin, Math_cos } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { Entity } from "../entity";
import { BeltPath } from "../belt_path";

export const curvedBeltLength = /* Math_PI / 4 */ 0.78;

export class BeltComponent extends Component {
    static getId() {
        return "Belt";
    }

    static getSchema() {
        // The followUpCache field is not serialized.
        return {
            direction: types.string,
            sortedItems: types.array(types.pair(types.float, types.obj(gItemRegistry))),
        };
    }

    duplicateWithoutContents() {
        return new BeltComponent({ direction: this.direction });
    }

    /**
     *
     * @param {object} param0
     * @param {enumDirection=} param0.direction The direction of the belt
     */
    constructor({ direction = enumDirection.top }) {
        super();

        this.direction = direction;

        /** @type {Array<[number, BaseItem]>} */
        this.sortedItems = [];

        /** @type {Entity} */
        this.followUpCache = null;

        /**
         * The path this belt is contained in, not serialized
         * @type {BeltPath}
         */
        this.assignedPath = null;
    }

    /**
     * Returns the effective length of this belt in tile space
     * @returns {number}
     */
    getEffectiveLengthTiles() {
        return this.direction === enumDirection.top ? 1.0 : curvedBeltLength;
    }

    /**
     * Converts from belt space (0 = start of belt ... 1 = end of belt) to the local
     * belt coordinates (-0.5|-0.5 to 0.5|0.5)
     * @param {number} progress
     * @returns {Vector}
     */
    transformBeltToLocalSpace(progress) {
        switch (this.direction) {
            case enumDirection.top:
                assert(progress <= 1.02, "Invalid progress: " + progress);
                return new Vector(0, 0.5 - progress);

            case enumDirection.right: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 2: " + progress);
                const arcProgress = (progress / curvedBeltLength) * 0.5 * Math_PI;
                return new Vector(0.5 - 0.5 * Math_cos(arcProgress), 0.5 - 0.5 * Math_sin(arcProgress));
            }
            case enumDirection.left: {
                assert(progress <= curvedBeltLength + 0.02, "Invalid progress 3: " + progress);
                const arcProgress = (progress / curvedBeltLength) * 0.5 * Math_PI;
                return new Vector(-0.5 + 0.5 * Math_cos(arcProgress), 0.5 - 0.5 * Math_sin(arcProgress));
            }
            default:
                assertAlways(false, "Invalid belt direction: " + this.direction);
                return new Vector(0, 0);
        }
    }

    /**
     *  Returns if the belt can currently accept an item from the given direction
     */
    canAcceptItem() {
        const firstItem = this.sortedItems[0];
        if (!firstItem) {
            return true;
        }

        return firstItem[0] > globalConfig.itemSpacingOnBelts;
    }

    /**
     * Pushes a new item to the belt
     * @param {BaseItem} item
     */
    takeItem(item, leftoverProgress = 0.0) {
        if (G_IS_DEV) {
            assert(
                this.sortedItems.length === 0 ||
                    leftoverProgress <= this.sortedItems[0][0] - globalConfig.itemSpacingOnBelts + 0.001,
                "Invalid leftover: " +
                    leftoverProgress +
                    " items are " +
                    this.sortedItems.map(item => item[0])
            );
            assert(leftoverProgress < 1.0, "Invalid leftover: " + leftoverProgress);
        }
        this.sortedItems.unshift([leftoverProgress, item]);
    }

    /**
     * Returns how much space there is to the first item
     */
    getDistanceToFirstItemCenter() {
        const firstItem = this.sortedItems[0];
        if (!firstItem) {
            return 1;
        }
        return firstItem[0];
    }
}
