import { enumDirection, Vector } from "../../core/vector";
import { enumItemAcceptorItemFilter, ItemAcceptorComponent } from "../components/item_acceptor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { ItemProcessorComponent, enumItemProcessorTypes } from "../components/item_processor";
import { globalConfig } from "../../core/config";
import { UnremovableComponent } from "../components/unremovable";
import { HubComponent } from "../components/hub";

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

    getName() {
        return "Hub";
    }

    getDescription() {
        return "Your central hub, deliver shapes to it to unlock new buildings.";
    }

    isRotateable() {
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
        entity.addComponent(new UnremovableComponent());
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.top, enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.top],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(2, 0),
                        directions: [enumDirection.top],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(3, 0),
                        directions: [enumDirection.top, enumDirection.right],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: [enumDirection.bottom, enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 3),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(2, 3),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: [enumDirection.bottom, enumDirection.right],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 2),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(0, 3),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(3, 1),
                        directions: [enumDirection.right],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(3, 2),
                        directions: [enumDirection.right],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(3, 3),
                        directions: [enumDirection.right],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                ],
            })
        );
    }
}
