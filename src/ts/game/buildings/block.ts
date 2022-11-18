/* typehints:start */
import type { Entity } from "../entity";
/* typehints:end */
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
export class MetaBlockBuilding extends MetaBuilding {

    constructor() {
        super("block");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 64,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#333";
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
    setupEntityComponents(entity: Entity): any { }
}
