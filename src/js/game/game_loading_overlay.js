/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export class GameLoadingOverlay {
    /**
     *
     * @param {Application} app
     * @param {HTMLElement} parent
     */
    constructor(app, parent) {
        this.app = app;
        this.parent = parent;

        /** @type {HTMLElement} */
        this.element = null;
    }

    /**
     * Removes the overlay if its currently visible
     */
    removeIfAttached() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    /**
     * Returns if the loading overlay is attached
     */
    isAttached() {
        return this.element;
    }

    /**
     * Shows a super basic overlay
     */
    showBasic() {
        assert(!this.element, "Loading overlay already visible, cant show again");
        this.element = document.createElement("div");
        this.element.classList.add("gameLoadingOverlay");
        this.parent.appendChild(this.element);
        this.internalAddSpinnerAndText(this.element);
    }

    /**
     * Adds a text with 'loading' and a spinner
     * @param {HTMLElement} element
     */
    internalAddSpinnerAndText(element) {
        const inner = document.createElement("span");
        inner.classList.add("prefab_LoadingTextWithAnim");
        inner.innerText = "Loading";
        element.appendChild(inner);
    }
}
