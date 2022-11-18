/* typehints:start */
import type { Entity } from "../entity";
/* typehints:end */
import { enumDirection, Vector } from "../../core/vector";
import { ConstantSignalComponent } from "../components/constant_signal";
import { ItemEjectorComponent } from "../components/item_ejector";
import { ItemProducerComponent } from "../components/item_producer";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
export class MetaConstantProducerBuilding extends MetaBuilding {

    constructor() {
        super("constant_producer");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 62,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#bfd630";
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
    getIsRemovable(root: import("../../savegame/savegame_serializer").GameRoot): any {
        return root.gameMode.getIsEditor();
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new ItemEjectorComponent({
            slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
        }));
        entity.addComponent(new ItemProducerComponent({}));
        entity.addComponent(new ConstantSignalComponent({}));
    }
}
