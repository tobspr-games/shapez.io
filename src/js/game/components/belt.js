import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem } from "../base_item";
import { Vector, enumDirection } from "../../core/vector";
import { Math_PI, Math_sin, Math_cos } from "../../core/builtins";
import { globalConfig } from "../../core/config";

export class BeltComponent extends Component {
    static getId() {
        return "Belt";
    }

    static getSchema() {
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
                return new Vector(0, 0.5 - progress);

            case enumDirection.right: {
                const arcProgress = progress * 0.5 * Math_PI;
                return new Vector(0.5 - 0.5 * Math_cos(arcProgress), 0.5 - 0.5 * Math_sin(arcProgress));
            }
            case enumDirection.left: {
                const arcProgress = progress * 0.5 * Math_PI;
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
    canAcceptItem(leftoverProgress = 0.0) {
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
        if (G_IS_DEV && !globalConfig.debug.disableBeltAsserts) {
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
