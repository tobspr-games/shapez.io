/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { Rectangle } from "../../core/rectangle";
import { types } from "../../savegame/serialization";
import { enumGameModeTypes, GameMode } from "../game_mode";
import { HUDGameMenu } from "../hud/parts/game_menu";
import { HUDInteractiveTutorial } from "../hud/parts/interactive_tutorial";
import { HUDKeybindingOverlay } from "../hud/parts/keybinding_overlay";
import { HUDPartTutorialHints } from "../hud/parts/tutorial_hints";
import { HUDPinnedShapes } from "../hud/parts/pinned_shapes";
import { HUDWaypoints } from "../hud/parts/waypoints";

export class PuzzleGameMode extends GameMode {
    static getType() {
        return enumGameModeTypes.puzzle;
    }

    /** @returns {object} */
    static getSchema() {
        return {
            zoneHeight: types.uint,
            zoneWidth: types.uint,
        };
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);

        const data = this.getSaveData();

        this.setHudParts({
            [HUDGameMenu.name]: false,
            [HUDInteractiveTutorial.name]: false,
            [HUDKeybindingOverlay.name]: false,
            [HUDPartTutorialHints.name]: false,
            [HUDPinnedShapes.name]: false,
            [HUDWaypoints.name]: false,
        });

        this.setDimensions(data.zoneWidth, data.zoneHeight);
    }

    setDimensions(w = 16, h = 9) {
        this.zoneWidth = w < 2 ? 2 : w;
        this.zoneHeight = h < 2 ? 2 : h;
        this.boundsHeight = this.zoneHeight < 8 ? 8 : this.zoneHeight;
        this.boundsWidth = this.zoneWidth < 8 ? 8 : this.zoneWidth;
    }

    getSaveData() {
        const save = this.root.savegame.getCurrentDump();

        if (!save) {
            return {};
        }

        return save.gameMode.data;
    }

    createCenteredRectangle(width, height) {
        return new Rectangle(-Math.ceil(width / 2), -Math.ceil(height / 2), width, height);
    }

    getBounds() {
        if (this.bounds) {
            return this.bounds;
        }

        this.bounds = this.createCenteredRectangle(this.boundsWidth, this.boundsHeight);

        return this.bounds;
    }

    getZone() {
        if (this.zone) {
            return this.zone;
        }

        this.zone = this.createCenteredRectangle(this.zoneWidth, this.zoneHeight);

        return this.zone;
    }

    /**
     * Overrides GameMode's implementation to treat buildings like a whitelist
     * instead of a blacklist by default.
     * @param {string} name - Class name of building
     * @returns {boolean}
     */
    isBuildingExcluded(name) {
        return this.buildings[name] !== true;
    }

    isInBounds(x, y) {
        return this.bounds.containsPoint(x, y);
    }

    isInZone(x, y) {
        return this.zone.containsPoint(x, y);
    }

    hasZone() {
        return true;
    }

    hasHub() {
        return false;
    }

    hasResources() {
        return false;
    }

    hasBounds() {
        return true;
    }

    getMinimumZoom() {
        return 1;
    }

    /** @returns {boolean} */
    getIsFreeplayAvailable() {
        return true;
    }
}
