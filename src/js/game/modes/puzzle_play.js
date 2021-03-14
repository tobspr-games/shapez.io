import { GameMode } from "../game_mode";

export class PuzzlePlayGameMode extends GameMode {
    static getId() {
        return "PuzzlePlay";
    }

    constructor(root) {
        super(root);
    }
}
