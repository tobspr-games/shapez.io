import { GameRoot } from "./root";
import { ShapeDefinition } from "./shape_definition";
import { globalConfig } from "../core/config";

/** @enum {string} */
export const enumAnalyticsDataSource = {
    produced: "produced",
    stored: "stored",
    delivered: "delivered",
};

export class ProductionAnalytics {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.history = {
            [enumAnalyticsDataSource.produced]: [],
            [enumAnalyticsDataSource.stored]: [],
            [enumAnalyticsDataSource.delivered]: [],
        };

        for (let i = 0; i < globalConfig.statisticsGraphSlices; ++i) {
            this.startNewSlice();
        }

        this.root.signals.shapeDelivered.add(this.onShapeDelivered, this);
        this.root.signals.shapeProduced.add(this.onShapeProduced, this);

        this.lastAnalyticsSlice = 0;
    }

    /**
     * @param {ShapeDefinition} definition
     */
    onShapeDelivered(definition) {
        const key = definition.getHash();
        const entry = this.history[enumAnalyticsDataSource.delivered];
        entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
    }

    /**
     * @param {ShapeDefinition} definition
     */
    onShapeProduced(definition) {
        const key = definition.getHash();
        const entry = this.history[enumAnalyticsDataSource.produced];
        entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
    }

    /**
     * Starts a new time slice
     */
    startNewSlice() {
        for (const key in this.history) {
            if (key === enumAnalyticsDataSource.stored) {
                // Copy stored data
                this.history[key].push(Object.assign({}, this.root.hubGoals.storedShapes));
            } else {
                this.history[key].push({});
            }
            while (this.history[key].length > globalConfig.statisticsGraphSlices) {
                this.history[key].shift();
            }
        }
    }

    /**
     * @param {ShapeDefinition} definition
     */
    getCurrentShapeProductionRate(definition) {
        const slices = this.history[enumAnalyticsDataSource.produced];
        return slices[slices.length - 2][definition.getHash()] || 0;
    }

    /**
     * @param {ShapeDefinition} definition
     */
    getCurrentShapeDeliverRate(definition) {
        const slices = this.history[enumAnalyticsDataSource.delivered];
        return slices[slices.length - 2][definition.getHash()] || 0;
    }
    /**
     * @param {enumAnalyticsDataSource} dataSource
     * @param {ShapeDefinition} definition
     */
    getCurrentShapeRate(dataSource, definition) {
        const slices = this.history[dataSource];
        return slices[slices.length - 2][definition.getHash()] || 0;
    }

    /**
     *
     * @param {enumAnalyticsDataSource} dataSource
     * @param {ShapeDefinition} definition
     * @param {number} historyOffset
     */
    getPastShapeRate(dataSource, definition, historyOffset) {
        assertAlways(
            historyOffset >= 0 && historyOffset < globalConfig.statisticsGraphSlices,
            "Invalid slice offset: " + historyOffset
        );

        const slices = this.history[dataSource];
        return slices[slices.length - 1 - historyOffset][definition.getHash()] || 0;
    }

    update() {
        if (this.root.time.now() - this.lastAnalyticsSlice > globalConfig.analyticsSliceDurationSeconds) {
            this.lastAnalyticsSlice = this.root.time.now();
            this.startNewSlice();
        }
    }
}
