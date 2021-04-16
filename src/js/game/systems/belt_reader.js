import { GameSystemWithFilter } from "../game_system_with_filter";
import { BeltReaderComponent } from "../components/belt_reader";
import { globalConfig } from "../../core/config";
import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "../items/boolean_item";

export class BeltReaderSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltReaderComponent]);
    }

    update() {
        const now = this.root.time.now();
        const minimumTime = now - globalConfig.readerAnalyzeIntervalSeconds;
        const minimumTimeForThroughput = now - 1;
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const readerComp = entity.components.BeltReader;
            const lastItemTimes = readerComp.lastItemTimes;
            const pinsComp = entity.components.WiredPins;

            // Remove outdated items
            while (lastItemTimes[0] < minimumTime) {
                readerComp.lastRemovedItemTime = lastItemTimes.shift();
            }
            
            if (now - readerComp.lastThroughputComputation > 0.5) {
                // Compute throughput
                readerComp.lastThroughputComputation = now;

                const oneItem = lastItemTimes.length == 1;
                let throughput = 0;
                if (lastItemTimes.length > 0) {
                    let averageSpacing = oneItem ? lastItemTimes[0] - readerComp.lastRemovedItemTime : 0;
                    let averageSpacingNum = oneItem ? 1 : 0;
                    for (let i = 0; i < lastItemTimes.length - 1; ++i) {
                        averageSpacing += lastItemTimes[i + 1] - lastItemTimes[i];
                        ++averageSpacingNum;
                    }

                    throughput = 1 / (averageSpacing / averageSpacingNum) + 0.01;
                }

                readerComp.lastThroughput = Math.min(globalConfig.beltSpeedItemsPerSecond, throughput);
            }

            if (readerComp.lastThroughput > 0) {
                pinsComp.slots[0].value = BOOL_TRUE_SINGLETON;
                pinsComp.slots[1].value = readerComp.lastItem;
            } else {
                pinsComp.slots[0].value = BOOL_FALSE_SINGLETON;
                pinsComp.slots[1].value = null;
            }
        }
    }
}
