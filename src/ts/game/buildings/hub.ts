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
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 26,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getDimensions(): any {
        return new Vector(4, 4);
    }
    getSilhouetteColor(): any {
        return "#eb5555";
    }
    getIsRotateable(): any {
        return false;
    }
    getBlueprintSprite(): any {
        return null;
    }
    getSprite(): any {
        // We render it ourself
        return null;
    }
    getIsRemovable(): any {
        return false;
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new HubComponent());
        entity.addComponent(new ItemProcessorComponent({
            inputsPerCharge: 1,
            processorType: enumItemProcessorTypes.hub,
        }));
        entity.addComponent(new WiredPinsComponent({
            slots: [
                {
                    pos: new Vector(0, 2),
                    type: enumPinSlotType.logicalEjector,
                    direction: enumDirection.left,
                },
            ],
        }));
                const slots: Array<import("../components/item_acceptor").ItemAcceptorSlotConfig> = [];
        for (let i: any = 0; i < 4; ++i) {
            slots.push({ pos: new Vector(i, 0), direction: enumDirection.top, filter: "shape" }, { pos: new Vector(i, 3), direction: enumDirection.bottom, filter: "shape" }, { pos: new Vector(0, i), direction: enumDirection.left, filter: "shape" }, { pos: new Vector(3, i), direction: enumDirection.right, filter: "shape" });
        }
        entity.addComponent(new ItemAcceptorComponent({
            slots,
        }));
    }
}
