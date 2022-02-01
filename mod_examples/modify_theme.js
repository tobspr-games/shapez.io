// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Modify Builtin Themes",
    version: "1",
    id: "modify-theme",
    description: "Shows how to modify builtin themes",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        shapez.THEMES.light.map.background = "#eee";
        shapez.THEMES.light.items.outline = "#000";

        shapez.THEMES.dark.map.background = "#245";
        shapez.THEMES.dark.items.outline = "#fff";
    }
}
