import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { createLogger } from "../../../core/logging";
import { STOP_PROPAGATION } from "../../../core/signal";
import { formatBigNumberFull } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { ACHIEVEMENTS } from "../../../platform/achievement_provider";
import { T } from "../../../translations";
import { Blueprint } from "../../blueprint";
import { enumMouseButton } from "../../camera";
import { Entity } from "../../entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { THEME } from "../../theme";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { BaseHUDPart } from "../base_hud_part";
const logger: any = createLogger("hud/mass_selector");
export class HUDMassSelector extends BaseHUDPart {
    createElements(parent: any): any { }
    initialize(): any {
        this.currentSelectionStartWorld = null;
        this.currentSelectionEnd = null;
        this.selectedUids = new Set();
        this.root.signals.entityQueuedForDestroy.add(this.onEntityDestroyed, this);
        this.root.hud.signals.pasteBlueprintRequested.add(this.clearSelection, this);
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.onMouseUp, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.general.back).addToTop(this.onBack, this);
        this.root.keyMapper
            .getBinding(KEYMAPPINGS.massSelect.confirmMassDelete)
            .add(this.confirmDelete, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectCut).add(this.confirmCut, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectCopy).add(this.startCopy, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectClear).add(this.clearBelts, this);
        this.root.hud.signals.selectedPlacementBuildingChanged.add(this.clearSelection, this);
        this.root.signals.editModeChanged.add(this.clearSelection, this);
    }
    /**
     * Handles the destroy callback and makes sure we clean our list
     */
    onEntityDestroyed(entity: Entity): any {
        if (this.root.bulkOperationRunning) {
            return;
        }
        this.selectedUids.delete(entity.uid);
    }
    
    onBack(): any {
        // Clear entities on escape
        if (this.selectedUids.size > 0) {
            this.selectedUids = new Set();
            return STOP_PROPAGATION;
        }
    }
    /**
     * Clears the entire selection
     */
    clearSelection(): any {
        this.selectedUids = new Set();
    }
    confirmDelete(): any {
        if (!this.root.app.settings.getAllSettings().disableCutDeleteWarnings &&
            this.selectedUids.size > 100) {
            const { ok }: any = this.root.hud.parts.dialogs.showWarning(T.dialogs.massDeleteConfirm.title, T.dialogs.massDeleteConfirm.desc.replace("<count>", "" + formatBigNumberFull(this.selectedUids.size)), ["cancel:good:escape", "ok:bad:enter"]);
            ok.add((): any => this.doDelete());
        }
        else {
            this.doDelete();
        }
    }
    doDelete(): any {
        const entityUids: any = Array.from(this.selectedUids);
        // Build mapping from uid to entity
                const mapUidToEntity: Map<number, Entity> = this.root.entityMgr.getFrozenUidSearchMap();
        let count: any = 0;
        this.root.logic.performBulkOperation((): any => {
            for (let i: any = 0; i < entityUids.length; ++i) {
                const uid: any = entityUids[i];
                const entity: any = mapUidToEntity.get(uid);
                if (!entity) {
                    logger.error("Entity not found by uid:", uid);
                    continue;
                }
                if (!this.root.logic.tryDeleteBuilding(entity)) {
                    logger.error("Error in mass delete, could not remove building");
                }
                else {
                    count++;
                }
            }
            this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.destroy1000, count);
        });
        // Clear uids later
        this.selectedUids = new Set();
    }
    showBlueprintsNotUnlocked(): any {
        this.root.hud.parts.dialogs.showInfo(T.dialogs.blueprintsNotUnlocked.title, T.dialogs.blueprintsNotUnlocked.desc);
    }
    startCopy(): any {
        if (this.selectedUids.size > 0) {
            if (!this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
                this.showBlueprintsNotUnlocked();
                return;
            }
            this.root.hud.signals.buildingsSelectedForCopy.dispatch(Array.from(this.selectedUids));
            this.selectedUids = new Set();
            this.root.soundProxy.playUiClick();
        }
        else {
            this.root.soundProxy.playUiError();
        }
    }
    clearBelts(): any {
        for (const uid: any of this.selectedUids) {
            const entity: any = this.root.entityMgr.findByUid(uid);
            for (const component: any of Object.values(entity.components)) {
                component as Component).clear();
            }
        }
        this.selectedUids = new Set();
    }
    confirmCut(): any {
        if (!this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_blueprints)) {
            this.showBlueprintsNotUnlocked();
        }
        else if (!this.root.app.settings.getAllSettings().disableCutDeleteWarnings &&
            this.selectedUids.size > 100) {
            const { ok }: any = this.root.hud.parts.dialogs.showWarning(T.dialogs.massCutConfirm.title, T.dialogs.massCutConfirm.desc.replace("<count>", "" + formatBigNumberFull(this.selectedUids.size)), ["cancel:good:escape", "ok:bad:enter"]);
            ok.add((): any => this.doCut());
        }
        else {
            this.doCut();
        }
    }
    doCut(): any {
        if (this.selectedUids.size > 0) {
            const entityUids: any = Array.from(this.selectedUids);
            const cutAction: any = (): any => {
                // copy code relies on entities still existing, so must copy before deleting.
                this.root.hud.signals.buildingsSelectedForCopy.dispatch(entityUids);
                for (let i: any = 0; i < entityUids.length; ++i) {
                    const uid: any = entityUids[i];
                    const entity: any = this.root.entityMgr.findByUid(uid);
                    if (!this.root.logic.tryDeleteBuilding(entity)) {
                        logger.error("Error in mass cut, could not remove building");
                        this.selectedUids.delete(uid);
                    }
                }
            };
            const blueprint: any = Blueprint.fromUids(this.root, entityUids);
            if (blueprint.canAfford(this.root)) {
                cutAction();
            }
            else {
                const { cancel, ok }: any = this.root.hud.parts.dialogs.showWarning(T.dialogs.massCutInsufficientConfirm.title, T.dialogs.massCutInsufficientConfirm.desc, ["cancel:good:escape", "ok:bad:enter"]);
                ok.add(cutAction);
            }
            this.root.soundProxy.playUiClick();
        }
        else {
            this.root.soundProxy.playUiError();
        }
    }
    /**
     * mouse down pre handler
     */
    onMouseDown(pos: Vector, mouseButton: enumMouseButton): any {
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
     */
    onMouseMove(pos: Vector): any {
        if (this.currentSelectionStartWorld) {
            this.currentSelectionEnd = pos.copy();
        }
    }
    onMouseUp(): any {
        if (this.currentSelectionStartWorld) {
            const worldStart: any = this.currentSelectionStartWorld;
            const worldEnd: any = this.root.camera.screenToWorld(this.currentSelectionEnd);
            const tileStart: any = worldStart.toTileSpace();
            const tileEnd: any = worldEnd.toTileSpace();
            const realTileStart: any = tileStart.min(tileEnd);
            const realTileEnd: any = tileStart.max(tileEnd);
            for (let x: any = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y: any = realTileStart.y; y <= realTileEnd.y; ++y) {
                    const contents: any = this.root.map.getLayerContentXY(x, y, this.root.currentLayer);
                    if (contents && this.root.logic.canDeleteBuilding(contents)) {
                        const staticComp: any = contents.components.StaticMapEntity;
                        if (!staticComp.getMetaBuilding().getIsRemovable(this.root)) {
                            continue;
                        }
                        this.selectedUids.add(contents.uid);
                    }
                }
            }
            this.currentSelectionStartWorld = null;
            this.currentSelectionEnd = null;
        }
    }
        draw(parameters: DrawParameters): any {
        const boundsBorder: any = 2;
        if (this.currentSelectionStartWorld) {
            const worldStart: any = this.currentSelectionStartWorld;
            const worldEnd: any = this.root.camera.screenToWorld(this.currentSelectionEnd);
            const realWorldStart: any = worldStart.min(worldEnd);
            const realWorldEnd: any = worldStart.max(worldEnd);
            const tileStart: any = worldStart.toTileSpace();
            const tileEnd: any = worldEnd.toTileSpace();
            const realTileStart: any = tileStart.min(tileEnd);
            const realTileEnd: any = tileStart.max(tileEnd);
            parameters.context.lineWidth = 1;
            parameters.context.fillStyle = THEME.map.selectionBackground;
            parameters.context.strokeStyle = THEME.map.selectionOutline;
            parameters.context.beginPath();
            parameters.context.rect(realWorldStart.x, realWorldStart.y, realWorldEnd.x - realWorldStart.x, realWorldEnd.y - realWorldStart.y);
            parameters.context.fill();
            parameters.context.stroke();
            parameters.context.fillStyle = THEME.map.selectionOverlay;
            parameters.context.beginPath();
            const renderedUids: any = new Set();
            for (let x: any = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y: any = realTileStart.y; y <= realTileEnd.y; ++y) {
                    const contents: any = this.root.map.getLayerContentXY(x, y, this.root.currentLayer);
                    if (contents && this.root.logic.canDeleteBuilding(contents)) {
                        // Prevent rendering the overlay twice
                        const uid: any = contents.uid;
                        if (renderedUids.has(uid)) {
                            continue;
                        }
                        renderedUids.add(uid);
                        const staticComp: any = contents.components.StaticMapEntity;
                        if (!staticComp.getMetaBuilding().getIsRemovable(this.root)) {
                            continue;
                        }
                        const bounds: any = staticComp.getTileSpaceBounds();
                        parameters.context.rect(bounds.x * globalConfig.tileSize + boundsBorder, bounds.y * globalConfig.tileSize + boundsBorder, bounds.w * globalConfig.tileSize - 2 * boundsBorder, bounds.h * globalConfig.tileSize - 2 * boundsBorder);
                    }
                }
            }
            parameters.context.fill();
        }
        parameters.context.fillStyle = THEME.map.selectionOverlay;
        parameters.context.beginPath();
        this.selectedUids.forEach((uid: any): any => {
            const entity: any = this.root.entityMgr.findByUid(uid);
            const staticComp: any = entity.components.StaticMapEntity;
            const bounds: any = staticComp.getTileSpaceBounds();
            parameters.context.rect(bounds.x * globalConfig.tileSize + boundsBorder, bounds.y * globalConfig.tileSize + boundsBorder, bounds.w * globalConfig.tileSize - 2 * boundsBorder, bounds.h * globalConfig.tileSize - 2 * boundsBorder);
        });
        parameters.context.fill();
    }
}
