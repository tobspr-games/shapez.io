export const THEMES = {
    dark: require("./themes/dark.json"),
    light: require("./themes/light.json"),
};

export let THEME = THEMES.light;
let currentThemePreference = "light";

if (G_IS_STANDALONE) {
    THEMES.system = THEMES.light;
    ipcRenderer.on("system-theme-updated", detectSystemTheme);
}

export function detectSystemTheme() {
    if (!G_IS_STANDALONE) {
        return;
    }

    return ipcRenderer
        .invoke("get-system-theme")
        .then(theme => (THEMES.system = THEMES[theme]))
        .catch(() => (THEMES.system = THEMES.light))
        .then(() => {
            // Re-apply the theme, this only affects system
            applyGameTheme();
        });
}

export function applyGameTheme(id) {
    if (id === undefined) {
        id = currentThemePreference;
    }

    const isSystem = id === "system";
    const themeId = isSystem ? THEMES.system.id : id;

    if (!isSystem && id === undefined) {
        // Re-applying light/dark themes is not needed
        return;
    }

    if (document.body.id != "state_InGameState") {
        // Only set the theme if not playing, otherwise this causes bugs
        // Main menu re-applies the theme anyway
        THEME = THEMES[themeId];
        document.documentElement.setAttribute("data-theme", themeId);
    }

    // Keep the theme to re-apply system theme
    currentThemePreference = id;
}
