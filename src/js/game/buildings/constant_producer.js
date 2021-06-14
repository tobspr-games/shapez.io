/* typehints:start */
import { Entity } from "../entity";
/* typehints:end */

import { enumDirection, Vector } from "../../core/vector";
import { ConstantSignalComponent } from "../components/constant_signal";
import { ItemEjectorComponent } from "../components/item_ejector";
import { ItemProducerComponent } from "../components/item_producer";
import { MetaBuilding } from "../meta_building";

export class MetaConstantProducerBuilding extends MetaBuilding {
    constructor() {
        super("constant_producer");
    }

    getSilhouetteColor() {
        return "#bfd630";
    }

    /**
     *
     * @param {import("../../savegame/savegame_serializer").GameRoot} root
     * @returns
     */
    getIsRemovable(root) {
        return root.gameMode.getIsEditor();
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(new ItemProducerComponent({}));
        entity.addComponent(new ConstantSignalComponent({}));
    }
}
