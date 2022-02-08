import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";

export const inputFilterId = "InputFilter";

export class InputFilterComponent extends Component {
    /**
     * @param {(item: BaseItem, entity: Entity, slot: number) => boolean} canAcceptItem
     */
    constructor(canAcceptItem = () => true) {
        super();
        this.canAcceptItem = canAcceptItem;
    }

    static getId() {
        return inputFilterId;
    }
}
