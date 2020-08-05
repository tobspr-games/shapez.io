import { Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";

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

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
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
                        directions: ["bottom"],
                        layer: "wires",
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: "top", layer: "wires" },
                    { pos: new Vector(0, 0), direction: "right", layer: "wires" },
                ]);

                break;
            }
            case enumWireCrossingVariants.merger: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: ["top"],
                        layer: "wires",
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: ["right"],
                        layer: "wires",
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: "bottom", layer: "wires" },
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
