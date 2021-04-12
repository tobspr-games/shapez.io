import { BaseItem } from "../base_item";
import { Component } from "../component";

export class GoalAcceptorComponent extends Component {
    static getId() {
        return "GoalAcceptor";
    }

    /**
     * @param {object} param0
     * @param {BaseItem=} param0.item
     * @param {number=} param0.rate
     */
    constructor({ item = null, rate = null }) {
        super();
        this.item = item;
        this.rate = rate;

        this.achieved = false;
        this.achievedOnce = false;
    }
}
