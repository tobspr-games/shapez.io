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
    static getType(): any {
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
        const data: any = this.getSaveData();
    }
        isBuildingExcluded(building: typeof import("../meta_building").MetaBuilding): any {
        return this.hiddenBuildings.indexOf(building) >= 0;
    }
    getSaveData(): any {
        const save: any = this.root.savegame.getCurrentDump();
        if (!save) {
            return {};
        }
        return save.gameMode.data;
    }
    getCameraBounds(): any {
        return Rectangle.centered(this.zoneWidth + 20, this.zoneHeight + 20);
    }
    getBuildableZones(): any {
        return [Rectangle.centered(this.zoneWidth, this.zoneHeight)];
    }
    hasHub(): any {
        return false;
    }
    hasResources(): any {
        return false;
    }
    getMinimumZoom(): any {
        return 1;
    }
    getMaximumZoom(): any {
        return 4;
    }
    getIsSaveable(): any {
        return false;
    }
    getHasFreeCopyPaste(): any {
        return true;
    }
    throughputDoesNotMatter(): any {
        return true;
    }
    getSupportsWires(): any {
        return false;
    }
    getFixedTickrate(): any {
        return 300;
    }
    getIsDeterministic(): any {
        return true;
    }
    /** {} */
    getIsFreeplayAvailable(): boolean {
        return true;
    }
}
