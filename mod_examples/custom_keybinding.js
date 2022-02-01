// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Custom Keybindings",
    version: "1",
    id: "base",
    description: "Shows how to add a new keybinding",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        // Register keybinding
        this.modInterface.registerIngameKeybinding({
            id: "demo_mod_binding",
            keyCode: shapez.keyToKeyCode("F"),
            translation: "Do something (always with SHIFT)",
            modifiers: {
                shift: true,
            },
            handler: root => {
                this.dialogs.showInfo("Mod Message", "It worked!");
                return shapez.STOP_PROPAGATION;
            },
        });
    }
}
