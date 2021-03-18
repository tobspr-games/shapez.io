/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { globalConfig } from "../../core/config";
import { types } from "../../savegame/serialization";
import { HUDPinnedShapes } from "../hud/parts/pinned_shapes";
import { enumGameModeTypes, GameMode } from "../game_mode";

export class PuzzleGameMode extends GameMode {
    static getType() {
        return enumGameModeTypes.puzzle;
    }

    static getSchema() {
        return {
            hiddenHudParts: types.keyValueMap(types.bool),
            zoneHeight: types.uint,
            zoneWidth: types.uint,
        };
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);
    }

    initialize() {
        const data = this.getSaveData();

        this.type = this.getType();
        this.hiddenHudParts = data.hiddenHudParts || this.getDefaultHiddenHudParts();
        // this.excludedHudParts = data.hiddenHudParts || this.getDefaultHiddenHudParts();
        this.zoneHeight = data.zoneHeight || 3 * globalConfig.tileSize;
        this.zoneWidth = data.zoneWidth || 4 * globalConfig.tileSize;
        this.boundaryHeight = this.zoneHeight * 2;
        this.boundaryWidth = this.zoneWidth * 2;
    }

    getSaveData() {
        const save = this.root.savegame.getCurrentDump();

        if (!save) {
            return {};
        }

        return save.gameMode.data;
    }

    getDefaultHiddenHudParts() {
        return {
            [HUDPinnedShapes.name]: true,
        };
    }

    isHudPartHidden(name) {
        return this.hiddenHudParts[name];
    }

    hasZone() {
        return true;
    }

    hasHints() {
        return false;
    }

    hasHub() {
        return false;
    }

    hasResources() {
        return false;
    }

    hasBoundaries() {
        return true;
    }

    getMinimumZoom() {
        return 1;
    }

    getBoundaryWidth() {
        return this.boundaryWidth;
    }

    getBoundaryHeight() {
        return this.boundaryHeight;
    }

    getZoneWidth() {
        return this.zoneWidth;
    }

    getZoneHeight() {
        return this.zoneHeight;
    }
}
