import { randomChoice } from "../core/utils";
import { T } from "../translations";

const hintsShown = [];

/**
 * Finds a new hint to show about the game which the user hasn't seen within this session
 */
export function getRandomHint() {
    let maxTries = 100 * T.tips.length;

    while (maxTries-- > 0) {
        const hint = randomChoice(T.tips);
        if (!hintsShown.includes(hint)) {
            hintsShown.push(hint);
            return hint;
        }
    }

    // All tips shown so far
    return randomChoice(T.tips);
}
