// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Mod Settings",
    version: "1",
    id: "mod-settings",
    description: "Shows how to add settings to your mod",
    minimumGameVersion: ">=1.5.0",

    settings: {
        timesLaunched: 0,
    },
};

class Mod extends shapez.Mod {
    init() {
        // Increment the setting every time we launch the mod
        this.settings.timesLaunched++;
        this.saveSettings();

        // Show a dialog in the main menu with the settings
        this.signals.stateEntered.add(state => {
            if (state instanceof shapez.MainMenuState) {
                this.dialogs.showInfo(
                    "Welcome back",
                    `You have launched this mod ${this.settings.timesLaunched} times`
                );
            }
        });
    }
}
