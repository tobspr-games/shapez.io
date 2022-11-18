import { BaseGameSpeed } from "./base_game_speed";
import { globalConfig } from "../../core/config";
export class FastForwardGameSpeed extends BaseGameSpeed {
    static getId(): any {
        return "fast-forward";
    }
    getTimeMultiplier(): any {
        return globalConfig.fastForwardSpeed;
    }
    getMaxLogicStepsInQueue(): any {
        return 3 * globalConfig.fastForwardSpeed;
    }
}
