import { BaseHUDPart } from "../base_hud_part";
import { Vector } from "../../../core/vector";
import { STOP_PROPAGATION } from "../../../core/signal";
import { DrawParameters } from "../../../core/draw_parameters";
import { Entity } from "../../entity";
import { Loader } from "../../../core/loader";
import { globalConfig } from "../../../core/config";
import { makeDiv, formatBigNumber, formatBigNumberFull } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { MapChunkView } from "../../map_chunk_view";
import { createLogger } from "../../../core/logging";
import { enumMouseButton } from "../../camera";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { THEME } from "../../theme";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { Blueprint } from "../../blueprint";

const logger = createLogger("hud/mass_selector");

export class HUDMassSelector extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        this.currentSelectionStartWorld = null;
        this.currentSelectionEnd = null;
        this.selectedUids = new Set();

        this.root.signals.entityQueuedForDestroy.add(this.onEntityDestroyed, this);
        this.root.hud.signals.pasteBlueprintRequested.add(this.clearSelection, this);

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.onMouseUp, this);

        this.root.keyMapper.getBinding(KEYMAPPINGS.general.back).add(this.onBack, this);
        this.root.keyMapper
            .getBinding(KEYMAPPINGS.massSelect.confirmMassDelete)
            .add(this.confirmDelete, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectCut).add(this.confirmCut, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectCopy).add(this.startCopy, this);

        this.root.hud.signals.selectedPlacementBuildingChanged.add(this.clearSelection, this);
        this.root.signals.editModeChanged.add(this.clearSelection, this);
    }

    /**
     * Handles the destroy callback and makes sure we clean our list
     * @param {Entity} entity
     */
    onEntityDestroyed(entity) {
        if (this.root.bulkOperationRunning) {
            return;
        }
        this.selectedUids.delete(entity.uid);
    }

    /**
     *
     */
    onBack() {
        // Clear entities on escape
        if (this.selectedUids.size > 0) {
            this.selectedUids = new Set();
            return STOP_PROPAGATION;
        }
    }

    /**
     * Clears the entire selection
     */
    clearSelection() {
        this.selectedUids = new Set();
    }

    confirmDelete() {
        if (
            !this.root.app.settings.getAllSettings().disableCutDeleteWarnings &&
            this.selectedUids.size > 100
        ) {
            const { ok } = this.root.hud.parts.dialogs.showWarning(
                T.dialogs.massDeleteConfirm.title,
                T.dialogs.massDeleteConfirm.desc.replace(
                    "<count>",
                    "" + formatBigNumberFull(this.selectedUids.size)
                ),
                ["cancel:good:escape", "ok:bad:enter"]
            );
            ok.add(() => this.doDelete());
        } else {
            this.doDelete();
        }
    }

    doDelete() {
        const entityUids = Array.from(this.selectedUids);

        // Build mapping from uid to entity
        /**
         * @type {Map<number, Entity>}
         */
        const mapUidToEntity = this.root.entityMgr.getFrozenUidSearchMap();

        this.root.logic.performBulkOperation(() => {
            for (let i = 0; i < entityUids.length; ++i) {
                const uid = entityUids[i];
                const entity = mapUidToEntity.get(uid);
                if (!entity) {
                    logger.error("Entity not found by uid:", uid);
                    continue;
                }

                if (!this.root.logic.tryDeleteBuilding(entity)) {
                    logger.error("Error in mass delete, could not remove building");
                }
            }
        });

        // Clear uids later
        this.selectedUids = new Set();
    }

    startCopy() {
        if (this.selectedUids.size > 0) {
            if (!this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
                this.root.hud.parts.dialogs.showInfo(
                    T.dialogs.blueprintsNotUnlocked.title,
                    T.dialogs.blueprintsNotUnlocked.desc
                );
                return;
            }
            this.root.hud.signals.buildingsSelectedForCopy.dispatch(Array.from(this.selectedUids));
            this.selectedUids = new Set();
            this.root.soundProxy.playUiClick();
        } else {
            this.root.soundProxy.playUiError();
        }
    }

    confirmCut() {
        if (!this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
            this.root.hud.parts.dialogs.showInfo(
                T.dialogs.blueprintsNotUnlocked.title,
                T.dialogs.blueprintsNotUnlocked.desc
            );
        } else if (
            !this.root.app.settings.getAllSettings().disableCutDeleteWarnings &&
            this.selectedUids.size > 100
        ) {
            const { ok } = this.root.hud.parts.dialogs.showWarning(
                T.dialogs.massCutConfirm.title,
                T.dialogs.massCutConfirm.desc.replace(
                    "<count>",
                    "" + formatBigNumberFull(this.selectedUids.size)
                ),
                ["cancel:good:escape", "ok:bad:enter"]
            );
            ok.add(() => this.doCut());
        } else {
            this.doCut();
        }
    }

    doCut() {
        if (this.selectedUids.size > 0) {
            const entityUids = Array.from(this.selectedUids);

            const cutAction = () => {
                // copy code relies on entities still existing, so must copy before deleting.
                this.root.hud.signals.buildingsSelectedForCopy.dispatch(entityUids);

                for (let i = 0; i < entityUids.length; ++i) {
                    const uid = entityUids[i];
                    const entity = this.root.entityMgr.findByUid(uid);
                    if (!this.root.logic.tryDeleteBuilding(entity)) {
                        logger.error("Error in mass cut, could not remove building");
                        this.selectedUids.delete(uid);
                    }
                }
            };

            const blueprint = Blueprint.fromUids(this.root, entityUids);
            if (blueprint.canAfford(this.root)) {
                cutAction();
            } else {
                const { cancel, ok } = this.root.hud.parts.dialogs.showWarning(
                    T.dialogs.massCutInsufficientConfirm.title,
                    T.dialogs.massCutInsufficientConfirm.desc,
                    ["cancel:good:escape", "ok:bad:enter"]
                );
                ok.add(cutAction);
            }

            this.root.soundProxy.playUiClick();
        } else {
            this.root.soundProxy.playUiError();
        }
    }

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} mouseButton
     */
    onMouseDown(pos, mouseButton) {
        if (!this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectStart).pressed) {
            return;
        }

        if (mouseButton !== enumMouseButton.left) {
            return;
        }

        if (!this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectSelectMultiple).pressed) {
            // Start new selection
            this.selectedUids = new Set();
        }

        this.currentSelectionStartWorld = this.root.camera.screenToWorld(pos.copy());
        this.currentSelectionEnd = pos.copy();
        return STOP_PROPAGATION;
    }

    /**
     * mouse move pre handler
     * @param {Vector} pos
     */
    onMouseMove(pos) {
        if (this.currentSelectionStartWorld) {
            this.currentSelectionEnd = pos.copy();
        }
    }

    onMouseUp() {
        if (this.currentSelectionStartWorld) {
            const worldStart = this.currentSelectionStartWorld;
            const worldEnd = this.root.camera.screenToWorld(this.currentSelectionEnd);

            const tileStart = worldStart.toTileSpace();
            const tileEnd = worldEnd.toTileSpace();

            const realTileStart = tileStart.min(tileEnd);
            const realTileEnd = tileStart.max(tileEnd);

            for (let x = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y = realTileStart.y; y <= realTileEnd.y; ++y) {
                    let entities = [];
                    if (
                        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectSelectMultiLayer)
                            .pressed
                    ) {
                        entities = this.root.map.getLayersContentsMultipleXY(x, y);
                    } else {
                        entities = [this.root.map.getLayerContentXY(x, y, this.root.currentLayer)];
                    }

                    for (let i = 0; i < entities.length; ++i) {
                        let entity = entities[i];
                        if (entity && this.root.logic.canDeleteBuilding(entity))
                            this.selectedUids.add(entity.uid);
                    }
                }
            }

            this.currentSelectionStartWorld = null;
            this.currentSelectionEnd = null;
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.currentSelectionStartWorld) {
            const worldStart = this.currentSelectionStartWorld;
            const worldEnd = this.root.camera.screenToWorld(this.currentSelectionEnd);

            const realWorldStart = worldStart.min(worldEnd);
            const realWorldEnd = worldStart.max(worldEnd);

            const tileStart = worldStart.toTileSpace();
            const tileEnd = worldEnd.toTileSpace();

            const realTileStart = tileStart.min(tileEnd);
            const realTileEnd = tileStart.max(tileEnd);

            parameters.context.lineWidth = 1;
            parameters.context.fillStyle = THEME.map.selectionBackground;
            parameters.context.strokeStyle = THEME.map.selectionOutline;
            parameters.context.beginPath();
            parameters.context.rect(
                realWorldStart.x,
                realWorldStart.y,
                realWorldEnd.x - realWorldStart.x,
                realWorldEnd.y - realWorldStart.y
            );
            parameters.context.fill();
            parameters.context.stroke();

            const renderedUids = new Set();

            const isMultiLayerPressed = this.root.keyMapper.getBinding(
                KEYMAPPINGS.massSelect.massSelectSelectMultiLayer
            ).pressed;

            for (let x = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y = realTileStart.y; y <= realTileEnd.y; ++y) {
                    let entities = [];
                    if (isMultiLayerPressed) {
                        entities = this.root.map.getLayersContentsMultipleXY(x, y);
                    } else {
                        entities = [this.root.map.getLayerContentXY(x, y, this.root.currentLayer)];
                    }

                    for (let i = 0; i < Math.min(1, entities.length); ++i) {
                        let entity = entities[i];
                        if (entity && this.root.logic.canDeleteBuilding(entity)) {
                            // Prevent rendering the overlay twice
                            const uid = entity.uid;
                            if (renderedUids.has(uid)) {
                                continue;
                            }
                            renderedUids.add(uid);

                            const staticComp = entity.components.StaticMapEntity;

                            const bounds = staticComp.getTileSpaceBounds();

                            this.RenderSelectonPreviewTile(parameters, bounds, entity);
                        }
                    }
                }
            }
        }
        const renderedPositions = new Set();
        this.selectedUids.forEach(uid => {
            const entity = this.root.entityMgr.findByUid(uid);
            const staticComp = entity.components.StaticMapEntity;
            const bounds = staticComp.getTileSpaceBounds();
            if (renderedPositions.has(bounds.toCompareableString())) {
                return;
            }
            renderedPositions.add(bounds.toCompareableString());
            this.RenderSelectonPreviewTile(parameters, bounds, entity);
        });
    }

    RenderSelectonPreviewTile(parameters, bounds, entity) {
        const boundsBorder = 2;

        parameters.context.beginPath();

        //if (this.root.currentLayer === "wires" || entity.layer === "regular") {
        parameters.context.fillStyle = THEME.map.selectionOverlay;
        parameters.context.beginRoundedRect(
            bounds.x * globalConfig.tileSize + boundsBorder,
            bounds.y * globalConfig.tileSize + boundsBorder,
            bounds.w * globalConfig.tileSize - 2 * boundsBorder,
            bounds.h * globalConfig.tileSize - 2 * boundsBorder,
            2
        );
        /*} else {
            MapChunkView.drawSingleWiresOverviewTile({
                context: parameters.context,
                x: bounds.x * globalConfig.tileSize + boundsBorder,
                y: bounds.y * globalConfig.tileSize + boundsBorder,
                entity: entity,
                tileSizePixels: globalConfig.tileSize * 1.01,
            });
        }*/
        parameters.context.fill();
    }
}
