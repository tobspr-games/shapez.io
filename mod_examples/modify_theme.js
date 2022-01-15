/**
 * This example shows how to modify the builtin themes. If you want to create your own theme,
 * be sure to check out the "custom_theme" example
 */
registerMod(() => {
    return class ModImpl extends shapez.Mod {
        constructor(app, modLoader) {
            super(
                app,
                {
                    website: "https://tobspr.io",
                    author: "tobspr",
                    name: "Mod Example: Modify Builtin Themes",
                    version: "1",
                    id: "modify-theme",
                    description: "Shows how to modify builtin themes",
                },
                modLoader
            );
        }

        init() {
            shapez.THEMES.light.map.background = "#eee";
            shapez.THEMES.light.items.outline = "#000";

            shapez.THEMES.dark.map.background = "#245";
            shapez.THEMES.dark.items.outline = "#fff";
        }
    };
});
