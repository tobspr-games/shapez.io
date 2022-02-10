// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Custom Game Theme",
    version: "1",
    id: "custom-theme",
    description: "Shows how to add a custom game theme",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        this.modInterface.registerGameTheme({
            id: "my-theme",
            name: "My fancy theme",
            theme: RESOURCES["my-theme.json"],
        });
    }
}

const RESOURCES = {
    "my-theme.json": {
        map: {
            background: "#abc",
            grid: "#ccc",
            gridLineWidth: 1,

            selectionOverlay: "rgba(74, 163, 223, 0.7)",
            selectionOutline: "rgba(74, 163, 223, 0.5)",
            selectionBackground: "rgba(74, 163, 223, 0.2)",

            chunkBorders: "rgba(0, 30, 50, 0.03)",

            directionLock: {
                regular: {
                    color: "rgb(74, 237, 134)",
                    background: "rgba(74, 237, 134, 0.2)",
                },
                wires: {
                    color: "rgb(74, 237, 134)",
                    background: "rgba(74, 237, 134, 0.2)",
                },
                error: {
                    color: "rgb(255, 137, 137)",
                    background: "rgba(255, 137, 137, 0.2)",
                },
            },

            colorBlindPickerTile: "rgba(50, 50, 50, 0.4)",

            resources: {
                shape: "#eaebec",
                red: "#ffbfc1",
                green: "#cbffc4",
                blue: "#bfdaff",
            },

            chunkOverview: {
                empty: "#a6afbb",
                filled: "#c5ccd6",
                beltColor: "#777",
            },

            wires: {
                overlayColor: "rgba(97, 161, 152, 0.75)",
                previewColor: "rgb(97, 161, 152, 0.4)",
                highlightColor: "rgba(72, 137, 255, 1)",
            },

            connectedMiners: {
                overlay: "rgba(40, 50, 60, 0.5)",
                textColor: "#fff",
                textColorCapped: "#ef5072",
                background: "rgba(40, 50, 60, 0.8)",
            },

            zone: {
                borderSolid: "rgba(23, 192, 255, 1)",
                outerColor: "rgba(240, 240, 255, 0.5)",
            },
        },

        items: {
            outline: "#55575a",
            outlineWidth: 0.75,
            circleBackground: "rgba(40, 50, 65, 0.1)",
        },

        shapeTooltip: {
            background: "#dee1ea",
            outline: "#54565e",
        },
    },
};
