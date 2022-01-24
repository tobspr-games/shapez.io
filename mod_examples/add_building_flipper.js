// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Add a flipper building",
    version: "1",
    id: "add-building-extended",
    description:
        "Shows how to add a new building with logic, in this case it flips/mirrors shapez from top to down",
    minimumGameVersion: ">=1.5.0",
};

// Declare a new type of item processor
shapez.enumItemProcessorTypes.flipper = "flipper";

// For now, flipper always has the same speed
shapez.MOD_ITEM_PROCESSOR_SPEEDS.flipper = () => 10;

// Declare a handler for the processor so we define the "flip" operation
shapez.MOD_ITEM_PROCESSOR_HANDLERS.flipper = function (payload) {
    const shapeDefinition = payload.items.get(0).definition;

    // Flip bottom with top on a new, cloned item (NEVER modify the incoming item!)
    const newLayers = shapeDefinition.getClonedLayers();
    newLayers.forEach(layer => {
        const tr = layer[shapez.TOP_RIGHT];
        const br = layer[shapez.BOTTOM_RIGHT];
        const bl = layer[shapez.BOTTOM_LEFT];
        const tl = layer[shapez.TOP_LEFT];

        layer[shapez.BOTTOM_LEFT] = tl;
        layer[shapez.BOTTOM_RIGHT] = tr;

        layer[shapez.TOP_LEFT] = bl;
        layer[shapez.TOP_RIGHT] = br;
    });

    const newDefinition = new shapez.ShapeDefinition({ layers: newLayers });
    payload.outItems.push({
        item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(newDefinition),
    });
};

// Create the building
class MetaModFlipperBuilding extends shapez.ModMetaBuilding {
    constructor() {
        super("modFlipperBuilding");
    }

    static getAllVariantCombinations() {
        return [
            {
                name: "Flipper",
                description: "Flipps/Mirrors shapez from top to bottom",
                variant: shapez.defaultBuildingVariant,

                regularImageBase64: RESOURCES["flipper.png"],
                blueprintImageBase64: RESOURCES["flipper.png"],
                tutorialImageBase64: RESOURCES["flipper.png"],
            },
        ];
    }

    getSilhouetteColor() {
        return "red";
    }

    getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(shapez.enumItemProcessorTypes.flipper);
        return [[shapez.T.ingame.buildingPlacement.infoTexts.speed, shapez.formatItemsPerSecond(speed)]];
    }

    getIsUnlocked(root) {
        return true;
    }

    setupEntityComponents(entity) {
        // Accept shapes from the bottom
        entity.addComponent(
            new shapez.ItemAcceptorComponent({
                slots: [
                    {
                        pos: new shapez.Vector(0, 0),
                        direction: shapez.enumDirection.bottom,
                        filter: "shape",
                    },
                ],
            })
        );

        // Process those shapes with tye processor type "flipper" (which we added above)
        entity.addComponent(
            new shapez.ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: shapez.enumItemProcessorTypes.flipper,
            })
        );

        // Eject the result to the top
        entity.addComponent(
            new shapez.ItemEjectorComponent({
                slots: [{ pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.top }],
            })
        );
    }
}

class Mod extends shapez.Mod {
    init() {
        // Register the new building
        this.modInterface.registerNewBuilding({
            metaClass: MetaModFlipperBuilding,
            buildingIconBase64: RESOURCES["flipper.png"],
        });

        // Add it to the regular toolbar
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: MetaModFlipperBuilding,
        });
    }
}

////////////////////////////////////////////////////////////////////////

const RESOURCES = {
    "flipper.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZDMkFGQkY5NkUyQTExRUM5QUY0OTQyNUQyODU2NURGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZDMkFGQkZBNkUyQTExRUM5QUY0OTQyNUQyODU2NURGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkMyQUZCRjc2RTJBMTFFQzlBRjQ5NDI1RDI4NTY1REYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkMyQUZCRjg2RTJBMTFFQzlBRjQ5NDI1RDI4NTY1REYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz43izVKAAATMklEQVR42uzd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",
};
