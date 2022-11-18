/* typehints:start */
import type { GameRoot } from "../root";
/* typehints:end */
import { Rectangle } from "../../core/rectangle";
import { types } from "../../savegame/serialization";
import { enumGameModeTypes, GameMode } from "../game_mode";
import { HUDPuzzleBackToMenu } from "../hud/parts/puzzle_back_to_menu";
import { HUDPuzzleDLCLogo } from "../hud/parts/puzzle_dlc_logo";
import { HUDMassSelector } from "../hud/parts/mass_selector";
export class PuzzleGameMode extends GameMode {
    static getType() {
        return enumGameModeTypes.puzzle;
    }
    /** {} */
    static getSchema(): object {
        return {
            zoneHeight: types.uint,
            zoneWidth: types.uint,
        };
    }
    public additionalHudParts = {
        puzzleBackToMenu: HUDPuzzleBackToMenu,
        puzzleDlcLogo: HUDPuzzleDLCLogo,
        massSelector: HUDMassSelector,
    };
    public zoneWidth = data.zoneWidth || 8;
    public zoneHeight = data.zoneHeight || 6;

        constructor(root) {
        super(root);
        const data = this.getSaveData();
    }
        isBuildingExcluded(building: typeof import("../meta_building").MetaBuilding) {
        return this.hiddenBuildings.indexOf(building) >= 0;
    }
    getSaveData() {
        const save = this.root.savegame.getCurrentDump();
        if (!save) {
            return {};
        }
        return save.gameMode.data;
    }
    getCameraBounds() {
        return Rectangle.centered(this.zoneWidth + 20, this.zoneHeight + 20);
    }
    getBuildableZones() {
        return [Rectangle.centered(this.zoneWidth, this.zoneHeight)];
    }
    hasHub() {
        return false;
    }
    hasResources() {
        return false;
    }
    getMinimumZoom() {
        return 1;
    }
    getMaximumZoom() {
        return 4;
    }
    getIsSaveable() {
        return false;
    }
    getHasFreeCopyPaste() {
        return true;
    }
    throughputDoesNotMatter() {
        return true;
    }
    getSupportsWires() {
        return false;
    }
    getFixedTickrate() {
        return 300;
    }
    getIsDeterministic() {
        return true;
    }
    /** {} */
    getIsFreeplayAvailable(): boolean {
        return true;
    }
}
