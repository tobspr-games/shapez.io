import { Component } from "../game/component";
import { Entity } from "../game/entity";
import { globalConfig } from "./config";
import { createLogger } from "./logging";
import { Rectangle } from "./rectangle";
const logger = createLogger("stale_areas");
export class StaleAreaDetector {
    public root = root;
    public name = name;
    public recomputeMethod = recomputeMethod;
    public staleArea: Rectangle = null;

        constructor({ root, name, recomputeMethod }) {
    }
    /**
     * Invalidates the given area
     */
    invalidate(area: Rectangle) {
        // logger.log(this.name, "invalidated", area.toString());
        if (this.staleArea) {
            this.staleArea = this.staleArea.getUnion(area);
        }
        else {
            this.staleArea = area.clone();
        }
    }
    /**
     * Makes this detector recompute the area of an entity whenever
     * it changes in any way
     */
    recomputeOnComponentsChanged(components: Array<typeof Component>, tilesAround: number) {
        const componentIds = components.map(component => component.getId());
        /**
         * Internal checker method
         */
        const checker = (entity: Entity) => {
            if (!this.root.gameInitialized) {
                return;
            }
            // Check for all components
            for (let i = 0; i < componentIds.length; ++i) {
                if (entity.components[componentIds[i]]) {
                    // Entity is relevant, compute affected area
                    const area = entity.components.StaticMapEntity.getTileSpaceBounds().expandedInAllDirections(tilesAround);
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
            if (G_IS_DEV && globalConfig.debug.renderChanges) {
                logger.log(this.name, "is recomputing", this.staleArea.toString());
                this.root.hud.parts.changesDebugger.renderChange(this.name, this.staleArea, "#fd145b");
            }
            this.recomputeMethod(this.staleArea);
            this.staleArea = null;
        }
    }
}
