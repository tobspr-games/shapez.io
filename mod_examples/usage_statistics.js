// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Usage Statistics",
    version: "1",
    id: "usage-statistics",
    description:
        "Shows how to add a new component to the game, how to save additional data and how to add custom logic and drawings",

    minimumGameVersion: ">=1.5.0",
};

/**
 * Quick info on how this mod works:
 *
 * It tracks how many ticks a building was idle within X seconds to compute
 * the usage percentage.
 *
 * Every tick the logic checks if the building is idle, if so, it increases aggregatedIdleTime.
 * Once X seconds are over, the aggregatedIdleTime is copied to computedUsage which
 * is displayed on screen via the UsageStatisticsSystem
 */

const MEASURE_INTERVAL_SECONDS = 5;

class UsageStatisticsComponent extends shapez.Component {
    static getId() {
        return "UsageStatistics";
    }

    static getSchema() {
        // Here you define which properties should be saved to the savegame
        // and get automatically restored
        return {
            lastTimestamp: shapez.types.float,
            computedUsage: shapez.types.float,
            aggregatedIdleTime: shapez.types.float,
        };
    }

    constructor() {
        super();
        this.lastTimestamp = 0;
        this.computedUsage = 0;
        this.aggregatedIdleTime = 0;
    }
}

class UsageStatisticsSystem extends shapez.GameSystemWithFilter {
    constructor(root) {
        // By specifying the list of components, `this.allEntities` will only
        // contain entities which have *all* of the specified components
        super(root, [UsageStatisticsComponent, shapez.ItemProcessorComponent]);
    }

    update() {
        const now = this.root.time.now();
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const processorComp = entity.components.ItemProcessor;
            const usageComp = entity.components.UsageStatistics;

            if (now - usageComp.lastTimestamp > MEASURE_INTERVAL_SECONDS) {
                usageComp.computedUsage = shapez.clamp(
                    1 - usageComp.aggregatedIdleTime / MEASURE_INTERVAL_SECONDS
                );
                usageComp.aggregatedIdleTime = 0;
                usageComp.lastTimestamp = now;
            }

            if (processorComp.ongoingCharges.length === 0) {
                usageComp.aggregatedIdleTime += this.root.dynamicTickrate.deltaSeconds;
            }
        }
    }

    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const usageComp = entity.components.UsageStatistics;
            if (!usageComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            const context = parameters.context;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

            // Culling for better performance
            if (parameters.visibleRect.containsCircle(center.x, center.y, 40)) {
                // Background badge
                context.fillStyle = "rgba(250, 250, 250, 0.8)";
                context.beginRoundedRect(center.x - 10, center.y + 3, 20, 8, 2);

                context.fill();

                // Text
                const usage = usageComp.computedUsage * 100.0;
                if (usage > 99.99) {
                    context.fillStyle = "green";
                } else if (usage > 70) {
                    context.fillStyle = "orange";
                } else {
                    context.fillStyle = "red";
                }

                context.textAlign = "center";
                context.font = "7px GameFont";
                context.fillText(Math.round(usage) + "%", center.x, center.y + 10);
            }
        }
    }
}

class Mod extends shapez.Mod {
    init() {
        // Register the component
        this.modInterface.registerComponent(UsageStatisticsComponent);

        // Add our new component to all item processor buildings so we can see how many items it processed.
        // You can also inspect the entity with F8
        const buildings = [
            shapez.MetaBalancerBuilding,
            shapez.MetaCutterBuilding,
            shapez.MetaRotaterBuilding,
            shapez.MetaStackerBuilding,
            shapez.MetaMixerBuilding,
            shapez.MetaPainterBuilding,
        ];

        buildings.forEach(metaClass => {
            this.modInterface.runAfterMethod(metaClass, "setupEntityComponents", function (entity) {
                entity.addComponent(new UsageStatisticsComponent());
            });
        });

        // Register our game system so we can update and draw stuff
        this.modInterface.registerGameSystem({
            id: "demo_mod",
            systemClass: UsageStatisticsSystem,
            before: "belt",
            drawHooks: ["staticAfter"],
        });
    }
}
