/* typehints:start */
import type { GameRoot } from "../root";
/* typehints:end */
import { enumGameModeIds } from "../game_mode";
import { PuzzleGameMode } from "./puzzle";
import { MetaStorageBuilding } from "../buildings/storage";
import { MetaReaderBuilding } from "../buildings/reader";
import { MetaFilterBuilding } from "../buildings/filter";
import { MetaDisplayBuilding } from "../buildings/display";
import { MetaLeverBuilding } from "../buildings/lever";
import { MetaItemProducerBuilding } from "../buildings/item_producer";
import { MetaMinerBuilding } from "../buildings/miner";
import { MetaWireBuilding } from "../buildings/wire";
import { MetaWireTunnelBuilding } from "../buildings/wire_tunnel";
import { MetaConstantSignalBuilding } from "../buildings/constant_signal";
import { MetaLogicGateBuilding } from "../buildings/logic_gate";
import { MetaVirtualProcessorBuilding } from "../buildings/virtual_processor";
import { MetaAnalyzerBuilding } from "../buildings/analyzer";
import { MetaComparatorBuilding } from "../buildings/comparator";
import { MetaTransistorBuilding } from "../buildings/transistor";
import { MetaConstantProducerBuilding } from "../buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "../buildings/goal_acceptor";
import { PuzzleSerializer } from "../../savegame/puzzle_serializer";
import { T } from "../../translations";
import { HUDPuzzlePlayMetadata } from "../hud/parts/puzzle_play_metadata";
import { createLogger } from "../../core/logging";
import { HUDPuzzleCompleteNotification } from "../hud/parts/puzzle_complete_notification";
import { HUDPuzzlePlaySettings } from "../hud/parts/puzzle_play_settings";
import { MetaBlockBuilding } from "../buildings/block";
import { MetaBuilding } from "../meta_building";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { HUDPuzzleNextPuzzle } from "../hud/parts/next_puzzle";
const logger: any = createLogger("puzzle-play");
const copy: any = require("clipboard-copy");
export class PuzzlePlayGameMode extends PuzzleGameMode {
    static getId(): any {
        return enumGameModeIds.puzzlePlay;
    }
    public hiddenBuildings = excludedBuildings;
    public puzzle = puzzle;
    public nextPuzzles: Array<number> = nextPuzzles || [];
    

    constructor(root, { puzzle, nextPuzzles }) {
        super(root);
                let excludedBuildings: Array<typeof MetaBuilding> = [
            MetaConstantProducerBuilding,
            MetaGoalAcceptorBuilding,
            MetaBlockBuilding,
            MetaStorageBuilding,
            MetaReaderBuilding,
            MetaFilterBuilding,
            MetaDisplayBuilding,
            MetaLeverBuilding,
            MetaItemProducerBuilding,
            MetaMinerBuilding,
            MetaWireBuilding,
            MetaWireTunnelBuilding,
            MetaConstantSignalBuilding,
            MetaLogicGateBuilding,
            MetaVirtualProcessorBuilding,
            MetaAnalyzerBuilding,
            MetaComparatorBuilding,
            MetaTransistorBuilding,
        ];
        if (puzzle.game.excludedBuildings) {
                        const puzzleHidden: any = puzzle.game.excludedBuildings
                .map((id: any): any => {
                if (!gMetaBuildingRegistry.hasId(id)) {
                    return;
                }

                return gMetaBuildingRegistry.findById(id).constructor;
            })
                .filter((x: any): any => !!x);
            excludedBuildings = excludedBuildings.concat(puzzleHidden);
        }
        this.additionalHudParts.puzzlePlayMetadata = HUDPuzzlePlayMetadata;
        this.additionalHudParts.puzzlePlaySettings = HUDPuzzlePlaySettings;
        this.additionalHudParts.puzzleCompleteNotification = HUDPuzzleCompleteNotification;
        root.signals.postLoadHook.add(this.loadPuzzle, this);
        if (this.nextPuzzles.length > 0) {
            this.additionalHudParts.puzzleNext = HUDPuzzleNextPuzzle;
        }
    }
    loadPuzzle(): any {
        let errorText: any;
        logger.log("Loading puzzle", this.puzzle);
        try {
            this.zoneWidth = this.puzzle.game.bounds.w;
            this.zoneHeight = this.puzzle.game.bounds.h;
            errorText = new PuzzleSerializer().deserializePuzzle(this.root, this.puzzle.game);
        }
        catch (ex: any) {
            errorText = ex.message || ex;
        }
        if (errorText) {
            this.root.gameState.moveToState("PuzzleMenuState", {
                error: {
                    title: T.dialogs.puzzleLoadError.title,
                    desc: T.dialogs.puzzleLoadError.desc + " " + errorText,
                },
            });
            // const signals = this.root.hud.parts.dialogs.showWarning(
            //     T.dialogs.puzzleLoadError.title,
            //     T.dialogs.puzzleLoadError.desc + " " + errorText
            // );
            // signals.ok.add(() => this.root.gameState.moveToState("PuzzleMenuState"));
        }
    }
        trackCompleted(liked: boolean, time: number): any {
        const closeLoading: any = this.root.hud.parts.dialogs.showLoadingDialog();
        return this.root.app.clientApi
            .apiCompletePuzzle(this.puzzle.meta.id, {
            time,
            liked,
        })
            .catch((err: any): any => {
            logger.warn("Failed to complete puzzle:", err);
        })
            .then((): any => {
            closeLoading();
        });
    }
    sharePuzzle(): any {
        copy(this.puzzle.meta.shortKey);
        this.root.hud.parts.dialogs.showInfo(T.dialogs.puzzleShare.title, T.dialogs.puzzleShare.desc.replace("<key>", this.puzzle.meta.shortKey));
    }
    reportPuzzle(): any {
        const { optionSelected }: any = this.root.hud.parts.dialogs.showOptionChooser(T.dialogs.puzzleReport.title, {
            options: [
                { value: "profane", text: T.dialogs.puzzleReport.options.profane },
                { value: "unsolvable", text: T.dialogs.puzzleReport.options.unsolvable },
                { value: "trolling", text: T.dialogs.puzzleReport.options.trolling },
            ],
        });
        return new Promise((resolve: any): any => {
            optionSelected.add((option: any): any => {
                const closeLoading: any = this.root.hud.parts.dialogs.showLoadingDialog();
                this.root.app.clientApi.apiReportPuzzle(this.puzzle.meta.id, option).then((): any => {
                    closeLoading();
                    const { ok }: any = this.root.hud.parts.dialogs.showInfo(T.dialogs.puzzleReportComplete.title, T.dialogs.puzzleReportComplete.desc);
                    ok.add(resolve);
                }, (err: any): any => {
                    closeLoading();
                    const { ok }: any = this.root.hud.parts.dialogs.showInfo(T.dialogs.puzzleReportError.title, T.dialogs.puzzleReportError.desc + " " + err);
                });
            });
        });
    }
}
