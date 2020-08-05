import { Vector } from "../../core/vector";
import { enumItemType } from "../base_item";
import { HubComponent } from "../components/hub";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { UnremovableComponent } from "../components/unremovable";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";

export class MetaHubBuilding extends MetaBuilding {
    constructor() {
        super("hub");
    }

    getDimensions() {
        return new Vector(4, 4);
    }

    getSilhouetteColor() {
        return "#eb5555";
    }

    isRotateable() {
        return false;
    }

    getBlueprintSprite() {
        return null;
    }

    getSprite() {
        // We render it ourself
        return null;
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

        entity.addComponent(new UnremovableComponent());
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: ["top", "left"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: ["top"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: ["top"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(3, 0),
                        directions: ["top", "right"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: ["bottom", "left"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 3),
                        directions: ["bottom"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(2, 3),
                        directions: ["bottom"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: ["bottom", "right"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: ["left"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 2),
                        directions: ["left"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: ["left"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(3, 1),
                        directions: ["right"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(3, 2),
                        directions: ["right"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: ["right"],
                        filter: enumItemType.shape,
                    },
                ],
            })
        );
    }
}
