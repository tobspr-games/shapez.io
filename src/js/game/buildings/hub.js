import { enumDirection, Vector } from "../../core/vector";
import { HubComponent } from "../components/hub";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";

export class MetaHubBuilding extends MetaBuilding {
    constructor() {
        super("hub");
    }

    static getAllVariantCombinations() {
        return [
            {
                internalId: 26,
                variant: defaultBuildingVariant,
            },
        ];
    }

    getDimensions() {
        return new Vector(4, 4);
    }

    getSilhouetteColor() {
        return "#eb5555";
    }

    getIsRotateable() {
        return false;
    }

    getBlueprintSprite() {
        return null;
    }

    getSprite() {
        // We render it ourself
        return null;
    }

    getIsRemovable() {
        return false;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new HubComponent());
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.hub,
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 2),
                        type: enumPinSlotType.logicalEjector,
                        direction: enumDirection.left,
                    },
                ],
            })
        );

        /**
         * @type {Array<import("../components/item_acceptor").ItemAcceptorSlotConfig>}
         */
        const slots = [];
        for (let i = 0; i < 4; ++i) {
            slots.push(
                { pos: new Vector(i, 0), direction: enumDirection.top, filter: "shape" },
                { pos: new Vector(i, 3), direction: enumDirection.bottom, filter: "shape" },
                { pos: new Vector(0, i), direction: enumDirection.left, filter: "shape" },
                { pos: new Vector(3, i), direction: enumDirection.right, filter: "shape" }
            );
        }

        entity.addComponent(
            new ItemAcceptorComponent({
                slots,
            })
        );
    }
}
