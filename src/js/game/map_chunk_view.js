import { MapChunk } from "./map_chunk";
import { GameRoot } from "./root";
import { DrawParameters } from "../core/draw_parameters";

export class MapChunkView extends MapChunk {
    /**
     *
     * @param {GameRoot} root
     * @param {number} x
     * @param {number} y
     */
    constructor(root, x, y) {
        super(root, x, y);

        /**
         * Whenever something changes, we increase this number - so we know we need to redraw
         */
        this.renderIteration = 0;

        this.markDirty();
    }

    /**
     * Marks this chunk as dirty, rerendering all caches
     */
    markDirty() {
        ++this.renderIteration;
        this.renderKey = this.x + "/" + this.y + "@" + this.renderIteration;
    }

    /**
     * Draws the background layer
     * @param {DrawParameters} parameters
     */
    drawBackgroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.mapResources.drawChunk(parameters, this);
        systems.belt.drawChunk(parameters, this);
    }

    /**
     * Draws the foreground layer
     * @param {DrawParameters} parameters
     */
    drawForegroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.miner.drawChunk(parameters, this);
        systems.staticMapEntities.drawChunk(parameters, this);
    }

    /**
     * Draws the wires layer
     * @param {DrawParameters} parameters
     */
    drawWiresLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.belt.drawWiresChunk(parameters, this);
    }

    /**
     * Draws the wires layer
     * @param {DrawParameters} parameters
     */
    drawWiresForegroundLayer(parameters) {
        const systems = this.root.systemMgr.systems;
        systems.staticMapEntities.drawWiresChunk(parameters, this);
    }
}
