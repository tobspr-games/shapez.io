/* typehints:start */
import { Entity } from "../entity";
/* typehints:end */

import { MetaBuilding } from "../meta_building";

export class MetaBlockBuilding extends MetaBuilding {
    constructor() {
        super("block");
    }

    getSilhouetteColor() {
        return "#333";
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
     * @param {import("../../savegame/savegame_serializer").GameRoot} root
     * @returns {boolean}
     */
    getIsPuzzleRemovable(root) {
        return false;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {}
}
