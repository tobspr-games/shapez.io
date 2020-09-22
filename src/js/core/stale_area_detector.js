import { Component } from "../game/component";
import { Entity } from "../game/entity";
import { globalConfig } from "./config";
import { createLogger } from "./logging";
import { Rectangle } from "./rectangle";

const logger = createLogger("stale_areas");

export class StaleAreaDetector {
    /**
     *
     * @param {object} param0
     * @param {import("../game/root").GameRoot} param0.root
     * @param {string} param0.name The name for reference
     * @param {(Rectangle) => void} param0.recomputeMethod Method which recomputes the given area
     */
    constructor({ root, name, recomputeMethod }) {
        this.root = root;
        this.name = name;
        this.recomputeMethod = recomputeMethod;

        /** @type {Rectangle} */
        this.staleArea = null;
    }

    /**
     * Invalidates the given area
     * @param {Rectangle} area
     */
    invalidate(area) {
        // logger.log(this.name, "invalidated", area.toString());
        if (this.staleArea) {
            this.staleArea = this.staleArea.getUnion(area);
        } else {
            this.staleArea = area.clone();
        }
    }

    /**
     * Makes this detector recompute the area of an entity whenever
     * it changes in any way
     * @param {Array<typeof Component>} components
     * @param {number} tilesAround How many tiles arround to expand the area
     */
    recomputeOnComponentsChanged(components, tilesAround) {
        const componentIds = components.map(component => component.getId());

        /**
         * Internal checker method
         * @param {Entity} entity
         */
        const checker = entity => {
            if (!this.root.gameInitialized) {
                return;
            }

            // Check for all components
            for (let i = 0; i < componentIds.length; ++i) {
                if (entity.components[componentIds[i]]) {
                    // Entity is relevant, compute affected area
                    const area = entity.components.StaticMapEntity.getTileSpaceBounds().expandedInAllDirections(
                        tilesAround
                    );
                    this.invalidate(area);
                    return;
                }
            }
        };

        this.root.signals.entityAdded.add(checker);
        this.root.signals.entityChanged.add(checker);
        this.root.signals.entityComponentRemoved.add(checker);
        this.root.signals.entityGotNewComponent.add(checker);
        this.root.signals.entityDestroyed.add(checker);
    }

    /**
     * Updates the stale area
     */
    update() {
        if (this.staleArea) {
            logger.log(this.name, "is recomputing", this.staleArea.toString());
            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                this.root.hud.parts.changesDebugger.renderChange(this.name, this.staleArea, "#fd145b");
            }
            this.recomputeMethod(this.staleArea);
            this.staleArea = null;
        }
    }
}
