// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: custom drawing",
    version: "1",
    id: "base",
    description: "Displays an indicator on every item processing building when its working",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class ItemProcessorStatusGameSystem extends shapez.GameSystem {
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const processorComp = entity.components.ItemProcessor;
            if (!processorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;

            const context = parameters.context;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

            // Culling for better performance
            if (parameters.visibleRect.containsCircle(center.x, center.y, 40)) {
                // Circle
                context.fillStyle = processorComp.ongoingCharges.length === 0 ? "#aaa" : "#53cf47";
                context.strokeStyle = "#000";
                context.lineWidth = 1;

                context.beginCircle(center.x + 5, center.y + 5, 4);
                context.fill();
                context.stroke();
            }
        }
    }
}

class Mod extends shapez.Mod {
    init() {
        // Register our game system
        this.modInterface.registerGameSystem({
            id: "item_processor_status",
            systemClass: ItemProcessorStatusGameSystem,

            // Specify at which point the update method will be called,
            // in this case directly before the belt system. You can use
            // before: "end" to make it the last system
            before: "belt",

            // Specify where our drawChunk method should be called, check out
            // map_chunk_view
            drawHooks: ["staticAfter"],
        });
    }
}
