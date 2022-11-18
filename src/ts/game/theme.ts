export const THEMES: any = {
    dark: require("./themes/dark.json"),
    light: require("./themes/light.json"),
};
export let THEME: any = THEMES.light;
export function applyGameTheme(id: any): any {
    THEME = THEMES[id];
}
