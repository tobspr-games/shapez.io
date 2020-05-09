import { BaseGameSpeed } from "./base_game_speed";

export class RegularGameSpeed extends BaseGameSpeed {
    static getId() {
        return "regular";
    }

    getTimeMultiplier() {
        return 1;
    }
}
