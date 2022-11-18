/* typehints:start */
import type { Entity } from "../entity";
/* typehints:end */
import { enumDirection, Vector } from "../../core/vector";
import { GoalAcceptorComponent } from "../components/goal_acceptor";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
export class MetaGoalAcceptorBuilding extends MetaBuilding {

    constructor() {
        super("goal_acceptor");
    }
    static getAllVariantCombinations() {
        return [
            {
                internalId: 63,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor() {
        return "#ce418a";
    }
    /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {import("../../savegame/
     */
    g /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {import("../../savegame/
     */
    g /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} root
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {import("../../savegame/savegame_serializer").GameRoot} root
     * @returns
     */
    getIsRemovable(root: import("../../savegame/savegame_serializer").GameRoot) {
        return root.gameMode.getIsEditor();
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity) {
        entity.addComponent(new ItemAcceptorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    filter: "shape",
                },
            ],
        }));
        entity.addComponent(new ItemProcessorComponent({
            processorType: enumItemProcessorTypes.goal,
        }));
        entity.addComponent(new GoalAcceptorComponent({}));
    }
}
