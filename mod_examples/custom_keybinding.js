// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Custom Keybindings",
    version: "1",
    id: "base",
    description: "Shows how to add a new keybinding",
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
