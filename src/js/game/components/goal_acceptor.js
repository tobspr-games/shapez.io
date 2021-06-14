import { globalConfig } from "../../core/config";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { typeItemSingleton } from "../item_resolver";

export class GoalAcceptorComponent extends Component {
    static getId() {
        return "GoalAcceptor";
    }

    static getSchema() {
        return {
            item: typeItemSingleton,
        };
    }

    /**
     * @param {object} param0
     * @param {BaseItem=} param0.item
     * @param {number=} param0.rate
     */
    constructor({ item = null, rate = null }) {
        super();

        // ths item to produce
        /** @type {BaseItem | undefined} */
        this.item = item;

        this.clear();
    }

    clear() {
        // the last items we delivered
        /** @type {{ item: BaseItem; time: number; }[]} */
        this.deliveryHistory = [];

        // Used for animations
        this.displayPercentage = 0;
    }

    getRequiredDeliveryHistorySize() {
        return (
            (globalConfig.puzzleModeSpeed *
                globalConfig.goalAcceptorMinimumDurationSeconds *
                globalConfig.beltSpeedItemsPerSecond) /
            globalConfig.goalAcceptorsPerProducer
        );
    }
}
