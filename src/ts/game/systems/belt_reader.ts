import { GameSystemWithFilter } from "../game_system_with_filter";
import { BeltReaderComponent } from "../components/belt_reader";
import { globalConfig } from "../../core/config";
import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON } from "../items/boolean_item";
export class BeltReaderSystem extends GameSystemWithFilter {

    constructor(root) {
        super(root, [BeltReaderComponent]);
    }
    update(): any {
        const now: any = this.root.time.now();
        const minimumTime: any = now - globalConfig.readerAnalyzeIntervalSeconds;
        const minimumTimeForThroughput: any = now - 1;
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const readerComp: any = entity.components.BeltReader;
            const pinsComp: any = entity.components.WiredPins;
            // Remove outdated items
            while (readerComp.lastItemTimes[0] < minimumTime) {
                readerComp.lastItemTimes.shift();
            }
            if (pinsComp) {
                pinsComp.slots[1].value = readerComp.lastItem;
                pinsComp.slots[0].value =
                    (readerComp.lastItemTimes[readerComp.lastItemTimes.length - 1] || 0) >
                        minimumTimeForThroughput
                        ? BOOL_TRUE_SINGLETON
                        : BOOL_FALSE_SINGLETON;
            }
            if (now - readerComp.lastThroughputComputation > 0.5) {
                // Compute throughput
                readerComp.lastThroughputComputation = now;
                let throughput: any = 0;
                if (readerComp.lastItemTimes.length < 2) {
                    throughput = 0;
                }
                else {
                    let averageSpacing: any = 0;
                    let averageSpacingNum: any = 0;
                    for (let i: any = 0; i < readerComp.lastItemTimes.length - 1; ++i) {
                        averageSpacing += readerComp.lastItemTimes[i + 1] - readerComp.lastItemTimes[i];
                        ++averageSpacingNum;
                    }
                    throughput = 1 / (averageSpacing / averageSpacingNum);
                }
                readerComp.lastThroughput = Math.min(globalConfig.beltSpeedItemsPerSecond * 23.9, throughput);
            }
        }
    }
}
