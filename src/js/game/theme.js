import { MODS } from "../mods/modloader";

export const THEMES = {
    dark: require("./themes/dark.json"),
    light: require("./themes/light.json"),
};

export let THEME = THEMES.light;

export function applyGameTheme(id) {
    THEME = THEMES[id];
    MODS.callHook("preprocessTheme", { id, theme: THEME });
}
