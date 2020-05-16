import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";

/** @enum {string} */
export const enumMinerVariants = { chainable: "chainable" };

export class MetaMinerBuilding extends MetaBuilding {
    constructor() {
        super("miner");
    }

    getName() {
        return "Extract";
    }

    getSilhouetteColor() {
        return "#b37dcd";
    }

    getDescription() {
        return "Place over a shape or color to extract it. Six extractors fill exactly one belt.";
    }

    getAvailableVariants(root) {
        return [defaultBuildingVariant, enumMinerVariants.chainable];
    }

    /**
     * @param {GameRoot} root
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     */
    performAdditionalPlacementChecks(root, { origin, rotation, rotationVariant, variant }) {
        // Make sure its placed above a resource
        const lowerLayer = root.map.getLowerLayerContentXY(origin.x, origin.y);
        if (!lowerLayer) {
            return false;
        }
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new MinerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {*} variant
     */
    updateVariant(entity, variant) {
        entity.components.Miner.chainable = variant === enumMinerVariants.chainable;
    }
}
