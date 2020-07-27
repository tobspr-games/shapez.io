import { enumDirection, Vector } from "../../core/vector";
import { enumItemType } from "../base_item";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { enumLayer, GameRoot } from "../root";

/** @enum {string} */
export const enumWireCrossingVariants = {
    // Default = splitter
    merger: "merger",
};

export class MetaWireCrossingsBuilding extends MetaBuilding {
    constructor() {
        super("wire_crossings");
    }

    getDimensions(variant) {
        return new Vector(1, 1);
    }

    getSilhouetteColor() {
        return "#c425d7";
    }

    getLayer() {
        return enumLayer.wires;
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumWireCrossingVariants.merger];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.splitterWires,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [], // set later
                instantEject: true,
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        layer: enumLayer.wires,
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top, layer: enumLayer.wires },
                    { pos: new Vector(0, 0), direction: enumDirection.right, layer: enumLayer.wires },
                ]);

                break;
            }
            case enumWireCrossingVariants.merger: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.top],
                        layer: enumLayer.wires,
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.right],
                        layer: enumLayer.wires,
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.bottom, layer: enumLayer.wires },
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
