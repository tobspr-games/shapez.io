import { BaseGameSpeed } from "./base_game_speed";
export class PausedGameSpeed extends BaseGameSpeed {
    static getId(): any {
        return "paused";
    }
    getTimeMultiplier(): any {
        return 0;
    }
    getMaxLogicStepsInQueue(): any {
        return 0;
    }
}
