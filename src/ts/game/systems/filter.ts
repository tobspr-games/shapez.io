import { globalConfig } from "../../core/config";
import { BaseItem } from "../base_item";
import { FilterComponent } from "../components/filter";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_TRUE_SINGLETON } from "../items/boolean_item";
const MAX_ITEMS_IN_QUEUE: any = 2;
export class FilterSystem extends GameSystemWithFilter {

    constructor(root) {
        super(root, [FilterComponent]);
    }
    update(): any {
        const progress: any = this.root.dynamicTickrate.deltaSeconds *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts;
        const requiredProgress: any = 1 - progress;
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const filterComp: any = entity.components.Filter;
            const ejectorComp: any = entity.components.ItemEjector;
            // Process payloads
            const slotsAndLists: any = [filterComp.pendingItemsToLeaveThrough, filterComp.pendingItemsToReject];
            for (let slotIndex: any = 0; slotIndex < slotsAndLists.length; ++slotIndex) {
                const pendingItems: any = slotsAndLists[slotIndex];
                for (let j: any = 0; j < pendingItems.length; ++j) {
                    const nextItem: any = pendingItems[j];
                    // Advance next item
                    nextItem.progress = Math.min(requiredProgress, nextItem.progress + progress);
                    // Check if it's ready to eject
                    if (nextItem.progress >= requiredProgress - 1e-5) {
                        if (ejectorComp.tryEject(slotIndex, nextItem.item)) {
                            pendingItems.shift();
                        }
                    }
                }
            }
        }
    }
        tryAcceptItem(entity: Entity, slot: number, item: BaseItem): any {
        const network: any = entity.components.WiredPins.slots[0].linkedNetwork;
        if (!network || !network.hasValue()) {
            // Filter is not connected
            return false;
        }
        const value: any = network.currentValue;
        const filterComp: any = entity.components.Filter;
        assert(filterComp, "entity is no filter");
        // Figure out which list we have to check
        let listToCheck: any;
        if (value.equals(BOOL_TRUE_SINGLETON) || value.equals(item)) {
            listToCheck = filterComp.pendingItemsToLeaveThrough;
        }
        else {
            listToCheck = filterComp.pendingItemsToReject;
        }
        if (listToCheck.length >= MAX_ITEMS_IN_QUEUE) {
            // Busy
            return false;
        }
        // Actually accept item
        listToCheck.push({
            item,
            progress: 0.0,
        });
        return true;
    }
}
