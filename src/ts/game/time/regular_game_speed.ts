import { BaseGameSpeed } from "./base_game_speed";
export class RegularGameSpeed extends BaseGameSpeed {
    static getId(): any {
        return "regular";
    }
    getTimeMultiplier(): any {
        return 1;
    }
}
