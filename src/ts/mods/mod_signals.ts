/* typehints:start */
import type { BaseHUDPart } from "../game/hud/base_hud_part";
import type { GameRoot } from "../game/root";
import type { GameState } from "../core/game_state";
import type { InGameState } from "../states/ingame";
/* typehints:end */
import { Signal } from "../core/signal";
// Single file to avoid circular deps
export const MOD_SIGNALS: any = {
    // Called when the application has booted and instances like the app settings etc are available
    appBooted: new Signal(),
    modifyLevelDefinitions: new Signal() as TypedSignal<[
        Array[Object]
    ]>),
    modifyUpgrades: new Signal() as TypedSignal<[
        Object
    ]>),
    hudElementInitialized: new Signal() as TypedSignal<[
        BaseHUDPart
    ]>),
    hudElementFinalized: new Signal() as TypedSignal<[
        BaseHUDPart
    ]>),
    hudInitializer: new Signal() as TypedSignal<[
        GameRoot
    ]>),
    gameInitialized: new Signal() as TypedSignal<[
        GameRoot
    ]>),
    gameLoadingStageEntered: new Signal() as TypedSignal<[
        InGameState,
        string
    ]>),
    gameStarted: new Signal() as TypedSignal<[
        GameRoot
    ]>),
    stateEntered: new Signal() as TypedSignal<[
        GameState
    ]>),
    gameSerialized:  (new Signal() as TypedSignal<[
        GameRoot,
        import("../savegame/savegame_typedefs").SerializedGame
    ]>),
    gameDeserialized:  (new Signal() as TypedSignal<[
        GameRoot,
        import("../savegame/savegame_typedefs").SerializedGame
    ]>),
};
