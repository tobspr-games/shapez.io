import "./core/polyfills";
import "./core/assert";

import "./mods/modloader";

import { createLogger, logSection } from "./core/logging";
import { Application } from "./application";
import { IS_DEBUG } from "./core/config";
import { initComponentRegistry } from "./game/component_registry";
import { initDrawUtils } from "./core/draw_utils";
import { initItemRegistry } from "./game/item_registry";
import { initMetaBuildingRegistry } from "./game/meta_building_registry";
import { initGameModeRegistry } from "./game/game_mode_registry";
import { initGameSpeedRegistry } from "./game/game_speed_registry";

const logger = createLogger("main");

if (window.coreThreadLoadedCb) {
    logger.log("Javascript parsed, calling html thread");
    window.coreThreadLoadedCb();
}

console.log(
    `%cshapez.io ️%c\n© 2022 tobspr Games\nCommit %c${G_BUILD_COMMIT_HASH}%c on %c${new Date(
        G_BUILD_TIME
    ).toLocaleString()}\n`,
    "font-size: 35px; font-family: Arial;font-weight: bold; padding: 10px 0;",
    "color: #aaa",
    "color: #7f7",
    "color: #aaa",
    "color: #7f7"
);

console.log("Environment: %c" + G_APP_ENVIRONMENT, "color: #fff");

if (G_IS_DEV && IS_DEBUG) {
    console.log("\n%c🛑 DEBUG ENVIRONMENT 🛑\n", "color: #f77");
}

/* typehints:start */
// @ts-ignore
throw new Error("typehints built in, this should never be the case!");
/* typehints:end */

/* dev:start */
console.log("%cDEVCODE BUILT IN", "color: #f77");
/* dev:end */

logSection("Boot Process", "#f9a825");

initDrawUtils();
initComponentRegistry();
initItemRegistry();
initMetaBuildingRegistry();
initGameModeRegistry();
initGameSpeedRegistry();

let app = null;

function bootApp() {
    logger.log("Page Loaded");
    app = new Application();
    app.boot();
}

if (G_IS_STANDALONE) {
    window.addEventListener("load", bootApp);
} else {
    bootApp();
}
