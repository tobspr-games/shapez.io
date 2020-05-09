import { BaseGameSpeed } from "./base_game_speed";

export class PausedGameSpeed extends BaseGameSpeed {
    static getId() {
        return "paused";
    }

    getTimeMultiplier() {
        return 0;
    }

    getMaxLogicStepsInQueue() {
        return 0;
    }
}
