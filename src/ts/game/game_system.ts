/* typehints:start */
import type { GameRoot } from "./root";
import type { DrawParameters } from "../core/draw_parameters";
/* typehints:end */
/**
 * A game system processes all entities which match a given schema, usually a list of
 * required components. This is the core of the game logic.
 */
export class GameSystem {
    public root = root;

        constructor(root) {
    }
    ///// PUBLIC API /////
    /**
     * Updates the game system, override to perform logic
     */
    update() { }
    /**
     * Override, do not call this directly, use startDraw()
     */
    draw(parameters: DrawParameters) { }
    /**
     * Should refresh all caches
     */
    refreshCaches() { }
    /**
     * @see GameSystem.draw Wrapper arround the draw method
     */
    startDraw(parameters: DrawParameters) {
        this.draw(parameters);
    }
}
