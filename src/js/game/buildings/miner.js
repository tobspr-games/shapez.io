import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";

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
}
