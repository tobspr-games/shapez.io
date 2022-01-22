// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Custom Sub Shapes",
    version: "1",
    id: "custom-sub-shapes",
    description: "Shows how to add custom sub shapes",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        // Add a new type of sub shape ("Line", short code "L")
        this.modInterface.registerSubShapeType({
            id: "line",
            shortCode: "L",

            // Make it spawn on the map
            weightComputation: distanceToOriginInChunks =>
                Math.round(20 + Math.max(Math.min(distanceToOriginInChunks, 30), 0)),

            // This defines how to draw it
            draw: ({ context, quadrantSize, layerScale }) => {
                const quadrantHalfSize = quadrantSize / 2;
                context.beginPath();
                context.moveTo(-quadrantHalfSize, quadrantHalfSize);
                context.arc(
                    -quadrantHalfSize,
                    quadrantHalfSize,
                    quadrantSize * layerScale,
                    -Math.PI * 0.25,
                    0
                );
                context.closePath();
                context.fill();
                context.stroke();
            },
        });

        // Modify the goal of the first level to add our goal
        this.signals.modifyLevelDefinitions.add(definitions => {
            definitions[0].shape = "LuLuLuLu";
        });
    }
}
