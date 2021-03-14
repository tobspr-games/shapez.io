import { GameMode } from "../game_mode";

export class PuzzleEditGameMode extends GameMode {
    static getId() {
        return "PuzzleEdit";
    }

    constructor(root) {
        super(root);
    }
}
