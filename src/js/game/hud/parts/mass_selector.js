import { BaseHUDPart } from "../base_hud_part";
import { Vector } from "../../../core/vector";
import { STOP_PROPAGATION } from "../../../core/signal";
import { DrawParameters } from "../../../core/draw_parameters";
import { Entity } from "../../entity";
import { Loader } from "../../../core/loader";
import { globalConfig } from "../../../core/config";
import { makeDiv } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { createLogger } from "../../../core/logging";
import { enumMouseButton } from "../../camera";

const logger = createLogger("hud/mass_selector");

export class HUDMassSelector extends BaseHUDPart {
    createElements(parent) {
        const removalKeybinding = this.root.gameState.keyActionMapper
            .getBinding("confirm_mass_delete")
            .getKeyCodeString();
        const abortKeybinding = this.root.gameState.keyActionMapper.getBinding("back").getKeyCodeString();

        this.element = makeDiv(
            parent,
            "ingame_HUD_MassSelector",
            [],
            `
            Press <code class="keybinding">${removalKeybinding}</code> to remove selected buildings
            and <code class="keybinding">${abortKeybinding}</code> to cancel.
        `
        );
    }

    initialize() {
        this.deletionMarker = Loader.getSprite("sprites/misc/deletion_marker.png");

        this.currentSelectionStart = null;
        this.currentSelectionEnd = null;
        this.entityUidsMarkedForDeletion = new Set();

        this.root.signals.entityQueuedForDestroy.add(this.onEntityDestroyed, this);

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.onMouseUp, this);

        this.root.gameState.keyActionMapper.getBinding("back").add(this.onBack, this);
        this.root.gameState.keyActionMapper.getBinding("confirm_mass_delete").add(this.confirmDelete, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    /**
     * Handles the destroy callback and makes sure we clean our list
     * @param {Entity} entity
     */
    onEntityDestroyed(entity) {
        this.entityUidsMarkedForDeletion.delete(entity.uid);
    }

    /**
     *
     */
    onBack() {
        // Clear entities on escape
        if (this.entityUidsMarkedForDeletion.size > 0) {
            this.entityUidsMarkedForDeletion = new Set();
            return STOP_PROPAGATION;
        }
    }

    confirmDelete() {
        const entityUids = Array.from(this.entityUidsMarkedForDeletion);
        for (let i = 0; i < entityUids.length; ++i) {
            const uid = entityUids[i];
            const entity = this.root.entityMgr.findByUid(uid);
            if (!this.root.logic.tryDeleteBuilding(entity)) {
                logger.error("Error in mass delete, could not remove building");
                this.entityUidsMarkedForDeletion.delete(uid);
            }
        }
    }

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} mouseButton
     */
    onMouseDown(pos, mouseButton) {
        if (!this.root.app.inputMgr.ctrlIsDown) {
            return;
        }

        if (mouseButton !== enumMouseButton.left) {
            return;
        }

        if (!this.root.app.inputMgr.shiftIsDown) {
            // Start new selection
            this.entityUidsMarkedForDeletion = new Set();
        }

        this.currentSelectionStart = pos.copy();
        this.currentSelectionEnd = pos.copy();
        return STOP_PROPAGATION;
    }

    /**
     * mouse move pre handler
     * @param {Vector} pos
     */
    onMouseMove(pos) {
        if (this.currentSelectionStart) {
            this.currentSelectionEnd = pos.copy();
        }
    }

    onMouseUp() {
        if (this.currentSelectionStart) {
            const worldStart = this.root.camera.screenToWorld(this.currentSelectionStart);
            const worldEnd = this.root.camera.screenToWorld(this.currentSelectionEnd);

            const tileStart = worldStart.toTileSpace();
            const tileEnd = worldEnd.toTileSpace();

            const realTileStart = tileStart.min(tileEnd);
            const realTileEnd = tileStart.max(tileEnd);

            for (let x = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y = realTileStart.y; y <= realTileEnd.y; ++y) {
                    const contents = this.root.map.getTileContentXY(x, y);
                    if (contents && this.root.logic.canDeleteBuilding(contents)) {
                        this.entityUidsMarkedForDeletion.add(contents.uid);
                    }
                }
            }

            this.currentSelectionStart = null;
            this.currentSelectionEnd = null;
        }
    }

    update() {
        this.domAttach.update(this.entityUidsMarkedForDeletion.size > 0);
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.currentSelectionStart) {
            const worldStart = this.root.camera.screenToWorld(this.currentSelectionStart);
            const worldEnd = this.root.camera.screenToWorld(this.currentSelectionEnd);

            const realWorldStart = worldStart.min(worldEnd);
            const realWorldEnd = worldStart.max(worldEnd);

            const tileStart = worldStart.toTileSpace();
            const tileEnd = worldEnd.toTileSpace();

            const realTileStart = tileStart.min(tileEnd);
            const realTileEnd = tileStart.max(tileEnd);

            parameters.context.lineWidth = 1;
            parameters.context.fillStyle = "rgba(255, 127, 127, 0.2)";
            parameters.context.strokeStyle = "rgba(255, 127, 127, 0.5)";
            parameters.context.beginPath();
            parameters.context.rect(
                realWorldStart.x,
                realWorldStart.y,
                realWorldEnd.x - realWorldStart.x,
                realWorldEnd.y - realWorldStart.y
            );
            parameters.context.fill();
            parameters.context.stroke();

            for (let x = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y = realTileStart.y; y <= realTileEnd.y; ++y) {
                    const contents = this.root.map.getTileContentXY(x, y);
                    if (contents && this.root.logic.canDeleteBuilding(contents)) {
                        const staticComp = contents.components.StaticMapEntity;
                        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
                        this.deletionMarker.drawCachedCentered(
                            parameters,
                            center.x,
                            center.y,
                            globalConfig.tileSize * 0.5
                        );
                    }
                }
            }
        }

        this.entityUidsMarkedForDeletion.forEach(uid => {
            const entity = this.root.entityMgr.findByUid(uid);
            const staticComp = entity.components.StaticMapEntity;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

            this.deletionMarker.drawCachedCentered(
                parameters,
                center.x,
                center.y,
                globalConfig.tileSize * 0.5
            );
        });
    }
}
