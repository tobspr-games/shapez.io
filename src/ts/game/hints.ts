import { randomChoice } from "../core/utils";
import { T } from "../translations";
const hintsShown: any = [];
/**
 * Finds a new hint to show about the game which the user hasn't seen within this session
 */
export function getRandomHint(): any {
    let maxTries: any = 100 * T.tips.length;
    while (maxTries-- > 0) {
        const hint: any = randomChoice(T.tips);
        if (!hintsShown.includes(hint)) {
            hintsShown.push(hint);
            return hint;
        }
    }
    // All tips shown so far
    return randomChoice(T.tips);
}
