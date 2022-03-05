// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: New Item Type (Fluids)",
    version: "1",
    id: "new-item-type",
    description: "Shows how to add a new item type (fluid)",
    minimumGameVersion: ">=1.5.0",
};

// Define which fluid types there are
const enumFluidType = {
    water: "water",
    oil: "oil",
};

// Define which color they should have on the map
const fluidColors = {
    [enumFluidType.water]: "#477be7",
    [enumFluidType.oil]: "#bc483a",
};

// The fluid item class (also see ColorItem and ShapeItem)
class FluidItem extends shapez.BaseItem {
    static getId() {
        return "fluid";
    }

    static getSchema() {
        return shapez.types.enum(enumFluidType);
    }

    serialize() {
        return this.fluidType;
    }

    deserialize(data) {
        this.fluidType = data;
    }

    getItemType() {
        return "fluid";
    }

    /**
     * @returns {string}
     */
    getAsCopyableKey() {
        return this.fluidType;
    }

    /**
     * @param {BaseItem} other
     */
    equalsImpl(other) {
        return this.fluidType === /** @type {FluidItem} */ (other).fluidType;
    }

    /**
     * @param {enumFluidType} fluidType
     */
    constructor(fluidType) {
        super();
        this.fluidType = fluidType;
    }

    getBackgroundColorAsResource() {
        return fluidColors[this.fluidType];
    }

    /**
     * Draws the item to a canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} size
     */
    drawFullSizeOnCanvas(context, size) {
        if (!this.cachedSprite) {
            this.cachedSprite = shapez.Loader.getSprite(`sprites/fluids/${this.fluidType}.png`);
        }
        this.cachedSprite.drawCentered(context, size / 2, size / 2, size);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     * @param {DrawParameters} parameters
     */
    drawItemCenteredClipped(x, y, parameters, diameter = shapez.globalConfig.defaultItemDiameter) {
        const realDiameter = diameter * 0.6;
        if (!this.cachedSprite) {
            this.cachedSprite = shapez.Loader.getSprite(`sprites/fluids/${this.fluidType}.png`);
        }
        this.cachedSprite.drawCachedCentered(parameters, x, y, realDiameter);
    }
}

/**
 * Singleton instances.
 *
 * NOTICE: The game tries to instantiate as few instances as possible.
 * Which means that if you have two types of fluids in this case, there should
 * ONLY be 2 instances of FluidItem at *any* time.
 *
 * This works by having a map from fluid type to the FluidItem singleton.
 * Additionally, all items are and should be immutable.
 * @type {Object<enumFluidType, FluidItem>}
 */
const FLUID_ITEM_SINGLETONS = {};

for (const fluidType in enumFluidType) {
    FLUID_ITEM_SINGLETONS[fluidType] = new FluidItem(fluidType);
}

class Mod extends shapez.Mod {
    init() {
        // Register the sprites
        this.modInterface.registerSprite("sprites/fluids/oil.png", RESOURCES["oil.png"]);
        this.modInterface.registerSprite("sprites/fluids/water.png", RESOURCES["water.png"]);

        // Make the item spawn on the map
        this.modInterface.runAfterMethod(shapez.MapChunk, "generatePatches", function ({
            rng,
            chunkCenter,
            distanceToOriginInChunks,
        }) {
            // Generate a simple patch
            // ALWAYS use rng and NEVER use Math.random() otherwise the map will look different
            // every time you resume the game
            if (rng.next() > 0.8) {
                const fluidType = rng.choice(Array.from(Object.keys(enumFluidType)));
                this.internalGeneratePatch(rng, 4, FLUID_ITEM_SINGLETONS[fluidType]);
            }
        });

        this.modInterface.registerItem(FluidItem, itemData => FLUID_ITEM_SINGLETONS[itemData]);
    }
}

///////////////////////////////////////

const RESOURCES = {
    "oil.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAOxAAADsQH1g+1JAAAE8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTAxLTE3VDEyOjIyOjUxKzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMS0xN1QxMjoyMzozMCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMS0xN1QxMjoyMzozMCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Y2EzMGQxMDEtZWU5Yy00Mzc2LTgyOGEtZDM5ZmFkN2ViZTYyIiB4bXBNTTpEb2N1bWVudElE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",

    "water.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAATEAAAExAE8zNSDAAAE8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTAxLTE3VDEyOjI0OjA3KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMS0xN1QxMjoyNTowNiswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMS0xN1QxMjoyNTowNiswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NmU3YjM1ZDctOTAyNi00ZjNlLTkxNGItZTc0NjJhMzM3MGE4IiB4bXBNTTpEb2N1bWVudElE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",
};
