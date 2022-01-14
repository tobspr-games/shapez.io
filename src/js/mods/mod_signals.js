/* typehints:start */
import { BaseHUDPart } from "../game/hud/base_hud_part";
import { GameRoot } from "../game/root";
/* typehints:end */

import { Signal } from "../core/signal";

// Single file to avoid circular deps

export const MOD_SIGNALS = {
    postInit: new Signal(),
    platformInstancesInitialized: new Signal(),

    preprocessTheme: /** @type {TypedSignal<[Object]>} */ (new Signal()),
    modifyLevelDefinitions: /** @type {TypedSignal<[Array[Object]]>} */ (new Signal()),
    modifyUpgrades: /** @type {TypedSignal<[Object]>} */ (new Signal()),

    hudElementInitialized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),
    hudElementFinalized: /** @type {TypedSignal<[BaseHUDPart]>} */ (new Signal()),

    gameStarted: /** @type {TypedSignal<[GameRoot]>} */ (new Signal()),
};
