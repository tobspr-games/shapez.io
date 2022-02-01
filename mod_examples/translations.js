// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Translations",
    version: "1",
    id: "translations",
    description: "Shows how to add and modify translations",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        // Replace an existing translation in the english language
        this.modInterface.registerTranslations("en", {
            ingame: {
                interactiveTutorial: {
                    title: "Hello",
                    hints: {
                        "1_1_extractor": "World!",
                    },
                },
            },
        });

        // Replace an existing translation in german
        this.modInterface.registerTranslations("de", {
            ingame: {
                interactiveTutorial: {
                    title: "Hallo",
                    hints: {
                        "1_1_extractor": "Welt!",
                    },
                },
            },
        });

        // Add an entirely new translation which is localized in german and english
        this.modInterface.registerTranslations("en", {
            mods: {
                mymod: {
                    test: "Test Translation",
                },
            },
        });
        this.modInterface.registerTranslations("de", {
            mods: {
                mymod: {
                    test: "Test Übersetzung",
                },
            },
        });

        // Show a dialog in the main menu
        this.signals.stateEntered.add(state => {
            if (state instanceof shapez.MainMenuState) {
                // Will show differently based on the selected language
                this.dialogs.showInfo("My translation", shapez.T.mods.mymod.test);
            }
        });
    }
}
