/* typehints:start */
import type { Application } from "../application";
import type { ModLoader } from "./modloader";
/* typehints:end */
import { MOD_SIGNALS } from "./mod_signals";
export class Mod {
    public app = app;
    public modLoader = modLoader;
    public metadata = meta;
    public signals = MOD_SIGNALS;
    public modInterface = modLoader.modInterface;
    public settings = settings;
    public saveSettings = saveSettings;

        constructor({ app, modLoader, meta, settings, saveSettings }) {
    }
    init(): any {
        // to be overridden
    }
    get dialogs() {
        return this.modInterface.dialogs;
    }
}
