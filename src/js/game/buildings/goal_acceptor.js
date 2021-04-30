/* typehints:start */
import { Entity } from "../entity";
/* typehints:end */

import { enumDirection, Vector } from "../../core/vector";
import { enumBeltReaderType, BeltReaderComponent } from "../components/belt_reader";
import { GoalAcceptorComponent } from "../components/goal_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { MetaBuilding } from "../meta_building";

export class MetaGoalAcceptorBuilding extends MetaBuilding {
    constructor() {
        super("goal_acceptor");
    }

    getSilhouetteColor() {
        return "#ce418a";
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
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: "shape",
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                processorType: enumItemProcessorTypes.goal,
            })
        );

        entity.addComponent(new GoalAcceptorComponent({}));
    }
}
