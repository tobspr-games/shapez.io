import { BaseItem } from "../base_item";
import { FilterComponent } from "../components/filter";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_TRUE_SINGLETON } from "../items/boolean_item";

const MAX_ITEMS_IN_QUEUE = 2;

export class FilterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [FilterComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const filterComp = entity.components.Filter;
            const acceptorComp = entity.components.ItemAcceptor;
            const ejectorComp = entity.components.ItemEjector;

            // Take items from acceptor
            const input = acceptorComp.completedInputs.get(0);
            if (input && this.tryAcceptItem(entity, input)) {
                acceptorComp.completedInputs.delete(0);
            }

            // Output to ejector
            const slotsAndLists = [filterComp.pendingItemsToLeaveThrough, filterComp.pendingItemsToReject];
            for (let slotIndex = 0; slotIndex < slotsAndLists.length; ++slotIndex) {
                const pendingItems = slotsAndLists[slotIndex];

                for (let j = 0; j < pendingItems.length; ++j) {
                    const nextItem = pendingItems[j];
                    if (ejectorComp.tryEject(slotIndex, nextItem.item)) {
                        pendingItems.shift();
                    }
                }
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {Object} param0
     * @param {BaseItem} param0.item
     * @param {number} param0.extraProgress
     */
    tryAcceptItem(entity, { item, extraProgress }) {
        const network = entity.components.WiredPins.slots[0].linkedNetwork;
        if (!network || !network.hasValue()) {
            // Filter is not connected
            return false;
        }

        const value = network.currentValue;
        const filterComp = entity.components.Filter;
        assert(filterComp, "entity is no filter");

        // Figure out which list we have to check
        let listToCheck;
        if (value.equals(BOOL_TRUE_SINGLETON) || value.equals(item)) {
            listToCheck = filterComp.pendingItemsToLeaveThrough;
        } else {
            listToCheck = filterComp.pendingItemsToReject;
        }

        if (listToCheck.length >= MAX_ITEMS_IN_QUEUE) {
            // Busy
            return false;
        }

        // Actually accept item
        listToCheck.push({
            item,
            extraProgress,
        });
        return true;
    }
}
