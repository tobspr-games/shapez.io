// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Modify Builtin Themes",
    version: "1",
    id: "modify-theme",
    description: "Shows how to modify builtin themes",
};

class Mod extends shapez.Mod {
    init() {
        shapez.THEMES.light.map.background = "#eee";
        shapez.THEMES.light.items.outline = "#000";

        shapez.THEMES.dark.map.background = "#245";
        shapez.THEMES.dark.items.outline = "#fff";
    }
}