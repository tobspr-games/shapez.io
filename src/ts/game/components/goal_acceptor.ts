import { globalConfig } from "../../core/config";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";
export class GoalAcceptorComponent extends Component {
    static getId(): any {
        return "GoalAcceptor";
    }
    static getSchema(): any {
        return {
            item: typeItemSingleton,
        };
    }
    public item: BaseItem | undefined = item;

        constructor({ item = null, rate = null }) {
        super();
        this.clear();
    }
    clear(): any {
        /**
         * The last item we delivered
         */
        this.lastDelivery = null;
        // The amount of items we delivered so far
        this.currentDeliveredItems = 0;
        // Used for animations
        this.displayPercentage = 0;
    }
    /**
     * Clears items but doesn't instantly reset the progress bar
     */
    clearItems(): any {
        this.lastDelivery = null;
        this.currentDeliveredItems = 0;
    }
    getRequiredSecondsPerItem(): any {
        return (globalConfig.goalAcceptorsPerProducer /
            (globalConfig.puzzleModeSpeed * globalConfig.beltSpeedItemsPerSecond));
    }
    /**
     * Copy the current state to another component
     */
    copyAdditionalStateTo(otherComponent: GoalAcceptorComponent): any {
        otherComponent.item = this.item;
    }
}
