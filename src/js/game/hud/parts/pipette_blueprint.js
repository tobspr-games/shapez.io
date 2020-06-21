import { Vector } from "../../../core/vector";
import { Entity } from "../../entity";
import { Blueprint } from "./blueprint";

export class PipetteBlueprint extends Blueprint {
    /**
     * @see Blueprint.getCost
     */
    getCost() {
        // Its free
        return 0;
    }

    /**
     * Creates a new pipetted blueprint from a given entity
     * @param {Entity} entity
     */
    static fromEntity(entity) {
        const clone = entity.duplicateWithoutContents();
        clone.components.StaticMapEntity.origin = new Vector(0, 0);
        return new PipetteBlueprint([clone]);
    }
}
