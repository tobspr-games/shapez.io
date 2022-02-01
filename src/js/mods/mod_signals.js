/* typehints:start */
import { BaseHUDPart } from "../game/hud/base_hud_part";
import { GameRoot } from "../game/root";
import { GameState } from "../core/game_state";
import { InGameState } from "../states/ingame";
/* typehints:end */

import { Signal } from "../core/signal";

// Single file to avoid circular deps

export const MOD_SIGNALS = {
    // Called when the application has booted and instances like the app settings etc are available
    appBooted: new Signal(),

    modifyLevelDefinitions: /** @type {TypedSignal<[Array[Object]]>} */ (new Signal()),
    modifyUpgrades: /** @type {TypedSignal<[Object]>} */ (new Signal()),

    hudElementInitialized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),
    hudElementFinalized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),

    hudInitializer: /** @type {TypedSignal<[GameRoot]>} */ (new Signal()),

    gameInitialized: /** @type {TypedSignal<[GameRoot]>} */ (new Signal()),
    gameLoadingStageEntered: /** @type {TypedSignal<[InGameState, string]>} */ (new Signal()),

    gameStarted: /** @type {TypedSignal<[GameRoot]>} */ (new Signal()),

    stateEntered: /** @type {TypedSignal<[GameState]>} */ (new Signal()),

    gameSerialized: /** @type {TypedSignal<[GameRoot, import("../savegame/savegame_typedefs").SerializedGame]>} */ (new Signal()),
    gameDeserialized: /** @type {TypedSignal<[GameRoot, import("../savegame/savegame_typedefs").SerializedGame]>} */ (new Signal()),
};
