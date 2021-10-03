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
        const settings = root.hud.parts.puzzleEditorSettings;
        return settings ? !settings.getIsTestMode() : false;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {}
}
