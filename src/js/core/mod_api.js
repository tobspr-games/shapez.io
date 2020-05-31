/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { globalLog, globalError } from "./logging";
import { GameRoot } from "../game/root";

export class ModApi {
    /**
     *
     * @param {Application} app
     */
    constructor(app) {
        this._loadedMods = [];
        this._activeModInstances = [];
        this.app = app;
    }

    /**
     * Registers a new mod function
     * @param {function} mod
     */
    registerModImplementation(mod) {
        globalLog(this, "🧪 Registering new mod");
        this._loadedMods.push(mod);
    }

    /**
     * Loads all mods
     * @param {GameRoot} root
     */
    _instantiateMods(root) {
        if (this._loadedMods.length > 0) {
            globalLog(this, "🧪 Instantiating", this._loadedMods.length, "mods");
            for (let i = 0; i < this._loadedMods.length; ++i) {
                const mod = this._loadedMods[i];
                try {
                    mod(root);
                } catch (err) {
                    globalError(this, "🧪 Failed to initialize mod:", err);
                }
            }
        }

        root.signals.aboutToDestruct.add(() => {
            for (let i = 0; i < this._modClickDetectors.length; ++i) {
                this._modClickDetectors[i].cleanup();
            }
            this._modClickDetectors = [];
        });
    }

    /**
     * Injects css into the page
     * @param {string} css
     */
    injectCss(css) {
        const styleElement = document.createElement("style");
        styleElement.textContent = css;
        styleElement.type = "text/css";
        styleElement.media = "all";
        document.head.appendChild(styleElement);
    }
}
