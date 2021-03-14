import { RegularGameSpeed } from "./time/regular_game_speed";
import { gGameSpeedRegistry } from "../core/global_registries";
import { PausedGameSpeed } from "./time/paused_game_speed";

export function initGameSpeedRegistry() {
    gGameSpeedRegistry.register(RegularGameSpeed);
    gGameSpeedRegistry.register(PausedGameSpeed);

    // Others are disabled for now
}
