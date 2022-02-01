// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Patch Methods",
    version: "1",
    id: "patch-methods",
    description: "Shows how to patch existing methods to change the game by making the belts cost shapes",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        // Define our currency
        const CURRENCY = "CyCyCyCy:--------:CuCuCuCu";

        // Make sure the currency is always pinned
        this.modInterface.runAfterMethod(shapez.HUDPinnedShapes, "rerenderFull", function () {
            this.internalPinShape({
                key: CURRENCY,
                canUnpin: false,
                className: "currency",
            });
        });

        // Style it
        this.modInterface.registerCss(`
                #ingame_HUD_PinnedShapes .shape.currency::after {
                    content: " ";
                    position: absolute;
                    display: inline-block;
                    width: $scaled(8px);
                    height: $scaled(8px);
                    top: $scaled(4px);
                    left: $scaled(-7px);
                    background: url('${RESOURCES["currency.png"]}') center center / contain no-repeat;
                }

                .currencyIcon {
                    display: inline-block;
                    vertical-align: middle;
                    background: url('${RESOURCES["currency.png"]}') center center / contain no-repeat;
                }

                .currencyIcon.small {
                    width: $scaled(11px);
                    height: $scaled(11px);
                }
            `);

        // Make the player start with some currency
        this.modInterface.runAfterMethod(shapez.GameCore, "initNewGame", function () {
            this.root.hubGoals.storedShapes[CURRENCY] = 100;
        });

        // Make belts have a cost
        this.modInterface.replaceMethod(shapez.MetaBeltBuilding, "getAdditionalStatistics", function (
            $original,
            [root, variant]
        ) {
            const oldStats = $original(root, variant);
            oldStats.push(["Cost", "1 x <span class='currencyIcon small'></span>"]);
            return oldStats;
        });

        // Only allow placing an entity when there is enough currency
        this.modInterface.replaceMethod(shapez.GameLogic, "checkCanPlaceEntity", function (
            $original,
            [entity, options]
        ) {
            const storedCurrency = this.root.hubGoals.storedShapes[CURRENCY] || 0;
            return storedCurrency > 0 && $original(entity, options);
        });

        // Take shapes when placing a building
        this.modInterface.replaceMethod(shapez.GameLogic, "tryPlaceBuilding", function ($original, args) {
            const result = $original(...args);
            if (result && result.components.Belt) {
                this.root.hubGoals.storedShapes[CURRENCY]--;
            }
            return result;
        });
    }
}

const RESOURCES = {
    "currency.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAIAAAACAAF+ftPjAAAFwWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTAxLTE2VDE2OjAzOjE1KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMS0xNlQxNjowNDowMyswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMS0xNlQxNjowNDowMyswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M2IxMTM4ZjEtNzdmMi00MzcyLTg4ZDktZTgzN2I4NzlkNGUwIiB4bXBNTTpEb2N1bWVudElE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",
};
