import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
import { enumItemProcessorRequirements } from "../components/item_processor";
import { Entity } from "../entity";
import { isTrueItem } from "../items/boolean_item";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { smoothPulse } from "../../core/utils";

export class ItemProcessorOverlaysSystem extends GameSystem {
    constructor(root) {
        super(root);

        this.spriteDisabled = Loader.getSprite("sprites/misc/processor_disabled.png");
        this.spriteDisconnected = Loader.getSprite("sprites/misc/processor_disconnected.png");

        this.drawnUids = new Set();

        this.root.signals.gameFrameStarted.add(this.clearDrawnUids, this);
    }

    clearDrawnUids() {
        this.drawnUids.clear();
    }

    /**
     *
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const processorComp = entity.components.ItemProcessor;
            if (!processorComp) {
                continue;
            }

            const requirement = processorComp.processingRequirement;
            if (!requirement) {
                continue;
            }

            if (this.drawnUids.has(entity.uid)) {
                continue;
            }

            this.drawnUids.add(entity.uid);

            switch (requirement) {
                case enumItemProcessorRequirements.painterQuad: {
                    this.drawConnectedSlotRequirement(parameters, entity);
                    break;
                }
                case enumItemProcessorRequirements.filter: {
                    this.drawConnectedSlotRequirement(parameters, entity);
                    break;
                }
            }
        }
    }

    /**
     *
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {Entity} entity
     */
    drawConnectedSlotRequirement(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const pinsComp = entity.components.WiredPins;

        let anySlotConnected = false;

        // Check if any slot has a value
        for (let i = 0; i < pinsComp.slots.length; ++i) {
            const slot = pinsComp.slots[i];
            const network = slot.linkedNetwork;
            if (network && network.currentValue) {
                anySlotConnected = true;

                if (isTrueItem(network.currentValue)) {
                    // No need to draw anything
                    return;
                }
            }
        }

        const pulse = smoothPulse(this.root.time.now());
        parameters.context.globalAlpha = 0.6 + 0.4 * pulse;
        const sprite = anySlotConnected ? this.spriteDisabled : this.spriteDisconnected;
        sprite.drawCachedCentered(
            parameters,
            (staticComp.origin.x + 0.5) * globalConfig.tileSize,
            (staticComp.origin.y + 0.5) * globalConfig.tileSize,
            globalConfig.tileSize * (0.7 + 0.2 * pulse)
        );

        parameters.context.globalAlpha = 1;
    }
}
