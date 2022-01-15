/**
 * This is the minimal structure of a mod
 */
registerMod(() => {
    return class ModImpl extends shapez.Mod {
        constructor(app, modLoader) {
            super(
                app,
                {
                    website: "https://tobspr.io",
                    author: "tobspr",
                    name: "Mod Example: Base",
                    version: "1",
                    id: "base",
                    description: "The most basic mod",
                },
                modLoader
            );
        }

        init() {
            // Start the modding here
        }
    };
});
