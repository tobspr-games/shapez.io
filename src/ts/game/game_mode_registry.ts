import { gGameModeRegistry } from "../core/global_registries";
import { PuzzleEditGameMode } from "./modes/puzzle_edit";
import { PuzzlePlayGameMode } from "./modes/puzzle_play";
import { RegularGameMode } from "./modes/regular";
export function initGameModeRegistry(): any {
    gGameModeRegistry.register(PuzzleEditGameMode);
    gGameModeRegistry.register(PuzzlePlayGameMode);
    gGameModeRegistry.register(RegularGameMode);
}
