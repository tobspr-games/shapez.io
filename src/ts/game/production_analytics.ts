import { GameRoot } from "./root";
import { ShapeDefinition } from "./shape_definition";
import { globalConfig } from "../core/config";
import { BaseItem } from "./base_item";
import { ShapeItem } from "./items/shape_item";
import { BasicSerializableObject } from "../savegame/serialization";
/** @enum {string} */
export const enumAnalyticsDataSource: any = {
    produced: "produced",
    stored: "stored",
    delivered: "delivered",
};
export class ProductionAnalytics extends BasicSerializableObject {
    static getId(): any {
        return "ProductionAnalytics";
    }
    public root = root;
    public history = {
        [enumAnalyticsDataSource.produced]: [],
        [enumAnalyticsDataSource.stored]: [],
        [enumAnalyticsDataSource.delivered]: [],
    };
    public lastAnalyticsSlice = 0;

        constructor(root) {
        super();
        for (let i: any = 0; i < globalConfig.statisticsGraphSlices; ++i) {
            this.startNewSlice();
        }
        this.root.signals.shapeDelivered.add(this.onShapeDelivered, this);
        this.root.signals.itemProduced.add(this.onItemProduced, this);
    }
        onShapeDelivered(definition: ShapeDefinition): any {
        const key: any = definition.getHash();
        const entry: any = this.history[enumAnalyticsDataSource.delivered];
        entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
    }
        onItemProduced(item: BaseItem): any {
        if (item.getItemType() === "shape") {
            const definition: any = (item as ShapeItem).definition;
            const key: any = definition.getHash();
            const entry: any = this.history[enumAnalyticsDataSource.produced];
            entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
        }
    }
    /**
     * Starts a new time slice
     */
    startNewSlice(): any {
        for (const key: any in this.history) {
            if (key === enumAnalyticsDataSource.stored) {
                // Copy stored data
                this.history[key].push(Object.assign({}, this.root.hubGoals.storedShapes));
            }
            else {
                this.history[key].push({});
            }
            while (this.history[key].length > globalConfig.statisticsGraphSlices) {
                this.history[key].shift();
            }
        }
    }
    /**
     * Returns the current rate of a given shape
     */
    getCurrentShapeRateRaw(dataSource: enumAnalyticsDataSource, definition: ShapeDefinition): any {
        const slices: any = this.history[dataSource];
        return slices[slices.length - 2][definition.getHash()] || 0;
    }
    /**
     * Returns the rate of a given shape, <historyOffset> frames ago
     */
    getPastShapeRate(dataSource: enumAnalyticsDataSource, definition: ShapeDefinition, historyOffset: number): any {
        assertAlways(historyOffset >= 0 && historyOffset < globalConfig.statisticsGraphSlices - 1, "Invalid slice offset: " + historyOffset);
        const slices: any = this.history[dataSource];
        return slices[slices.length - 2 - historyOffset][definition.getHash()] || 0;
    }
    /**
     * Returns the rates of all shapes
     */
    getCurrentShapeRatesRaw(dataSource: enumAnalyticsDataSource): any {
        const slices: any = this.history[dataSource];
        // First, copy current slice
        const baseValues: any = Object.assign({}, slices[slices.length - 2]);
        // Add past values
        for (let i: any = 0; i < 10; ++i) {
            const pastValues: any = slices[slices.length - i - 3];
            for (const key: any in pastValues) {
                baseValues[key] = baseValues[key] || 0;
            }
        }
        return baseValues;
    }
    update(): any {
        if (this.root.time.now() - this.lastAnalyticsSlice > globalConfig.analyticsSliceDurationSeconds) {
            this.lastAnalyticsSlice = this.root.time.now();
            this.startNewSlice();
        }
    }
}
