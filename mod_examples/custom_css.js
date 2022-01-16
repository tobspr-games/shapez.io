/**
 * This example shows how to add custom css
 */
registerMod(() => {
    return class ModImpl extends shapez.Mod {
        constructor(app, modLoader) {
            super(
                app,
                {
                    website: "https://tobspr.io",
                    author: "tobspr",
                    name: "Mod Example: Add custom CSS",
                    version: "1",
                    id: "custom-css",
                    description: "Shows how to add custom css",
                },
                modLoader
            );
        }

        init() {
            // Notice that, since the UI is scaled dynamically, every pixel value
            // should be wrapped in '$scaled()' (see below)

            this.modInterface.registerCss(`
                * {
                    font-family: "Comic Sans", "Comic Sans MS", "ComicSans", Tahoma !important;
                }

                #state_MainMenuState {
                    background: #9dc499 url('${RESOURCES["cat.png"]}') top left repeat !important;
                }

                #state_MainMenuState .fullscreenBackgroundVideo {
                    display: none !important;
                }

                #state_MainMenuState .mainContainer, #state_MainMenuState .modsOverview {
                    border: $scaled(5px) solid #000 !important;
                }
            `);
        }
    };
});

const RESOURCES = {
    "cat.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAGxAAABsQFhmCgOAAAE8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTAxLTE1VDEzOjI3OjU1KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMS0xNVQxMzozMDowMyswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMS0xNVQxMzozMDowMyswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTI2OGI2OWUtYTQ2Ni00YmNkLWJjNGYtM2VlNmUwOGI2NzA2IiB4bXBNTTpEb2N1bWVudElE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",
};
