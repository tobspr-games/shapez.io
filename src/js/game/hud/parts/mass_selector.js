import { BaseHUDPart } from "../base_hud_part";
import { Vector } from "../../../core/vector";
import { STOP_PROPAGATION } from "../../../core/signal";
import { DrawParameters } from "../../../core/draw_parameters";
import { Entity } from "../../entity";
import { Loader } from "../../../core/loader";
import { globalConfig } from "../../../core/config";
import { makeDiv, formatBigNumber, formatBigNumberFull } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { createLogger } from "../../../core/logging";
import { enumMouseButton } from "../../camera";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { THEME } from "../../theme";
import { enumHubGoalRewards } from "../../tutorial_goals";

const logger = createLogger("hud/mass_selector");

export class HUDMassSelector extends BaseHUDPart {
    createElements(parent) {
        const removalKeybinding = this.root.keyMapper
            .getBinding(KEYMAPPINGS.massSelect.confirmMassDelete)
            .getKeyCodeString();
        const abortKeybinding = this.root.keyMapper.getBinding(KEYMAPPINGS.general.back).getKeyCodeString();
        const copyKeybinding = this.root.keyMapper
            .getBinding(KEYMAPPINGS.massSelect.massSelectCopy)
            .getKeyCodeString();

        this.element = makeDiv(
            parent,
            "ingame_HUD_MassSelector",
            [],
            T.ingame.massSelect.infoText
                .replace("<keyDelete>", `<code class='keybinding'>${removalKeybinding}</code>`)
                .replace("<keyCopy>", `<code class='keybinding'>${copyKeybinding}</code>`)
                .replace("<keyCancel>", `<code class='keybinding'>${abortKeybinding}</code>`)
        );
    }

    initialize() {
        this.deletionMarker = Loader.getSprite("sprites/misc/deletion_marker.png");

        this.currentSelectionStart = null;
        this.currentSelectionEnd = null;
        this.selectedUids = new Set();

        this.root.signals.entityQueuedForDestroy.add(this.onEntityDestroyed, this);

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.onMouseUp, this);

        this.root.keyMapper.getBinding(KEYMAPPINGS.general.back).add(this.onBack, this);
        this.root.keyMapper
            .getBinding(KEYMAPPINGS.massSelect.confirmMassDelete)
            .add(this.confirmDelete, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectCopy).add(this.startCopy, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    /**
     * Handles the destroy callback and makes sure we clean our list
     * @param {Entity} entity
     */
    onEntityDestroyed(entity) {
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

    confirmDelete() {
        if (this.selectedUids.size > 100) {
            const { ok } = this.root.hud.parts.dialogs.showWarning(
                T.dialogs.massDeleteConfirm.title,
                T.dialogs.massDeleteConfirm.desc.replace(
                    "<count>",
                    "" + formatBigNumberFull(this.selectedUids.size)
                ),
                ["cancel:good", "ok:bad"]
            );
            ok.add(() => this.doDelete());
        } else {
            this.doDelete();
        }
    }

    doDelete() {
        const entityUids = Array.from(this.selectedUids);
        for (let i = 0; i < entityUids.length; ++i) {
            const uid = entityUids[i];
            const entity = this.root.entityMgr.findByUid(uid);
            if (!this.root.logic.tryDeleteBuilding(entity)) {
                logger.error("Error in mass delete, could not remove building");
                this.selectedUids.delete(uid);
            }
        }
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

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} mouseButton
     */
    onMouseDown(pos, mouseButton) {
        if (!this.root.keyMapper.getBinding(KEYMAPPINGS.massSelect.massSelectStart).isCurrentlyPressed()) {
            return;
        }

        if (mouseButton !== enumMouseButton.left) {
            return;
        }

        if (
            !this.root.keyMapper
                .getBinding(KEYMAPPINGS.massSelect.massSelectSelectMultiple)
                .isCurrentlyPressed()
        ) {
            // Start new selection
            this.selectedUids = new Set();
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
                        this.selectedUids.add(contents.uid);
                    }
                }
            }

            this.currentSelectionStart = null;
            this.currentSelectionEnd = null;
        }
    }

    update() {
        this.domAttach.update(this.selectedUids.size > 0);
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const boundsBorder = 2;

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

            parameters.context.fillStyle = THEME.map.selectionOverlay;

            for (let x = realTileStart.x; x <= realTileEnd.x; ++x) {
                for (let y = realTileStart.y; y <= realTileEnd.y; ++y) {
                    const contents = this.root.map.getTileContentXY(x, y);
                    if (contents && this.root.logic.canDeleteBuilding(contents)) {
                        const staticComp = contents.components.StaticMapEntity;
                        const bounds = staticComp.getTileSpaceBounds();
                        parameters.context.beginRoundedRect(
                            bounds.x * globalConfig.tileSize + boundsBorder,
                            bounds.y * globalConfig.tileSize + boundsBorder,
                            bounds.w * globalConfig.tileSize - 2 * boundsBorder,
                            bounds.h * globalConfig.tileSize - 2 * boundsBorder,
                            2
                        );
                        parameters.context.fill();
                    }
                }
            }
        }

        parameters.context.fillStyle = THEME.map.selectionOverlay;
        this.selectedUids.forEach(uid => {
            const entity = this.root.entityMgr.findByUid(uid);
            const staticComp = entity.components.StaticMapEntity;
            const bounds = staticComp.getTileSpaceBounds();
            parameters.context.beginRoundedRect(
                bounds.x * globalConfig.tileSize + boundsBorder,
                bounds.y * globalConfig.tileSize + boundsBorder,
                bounds.w * globalConfig.tileSize - 2 * boundsBorder,
                bounds.h * globalConfig.tileSize - 2 * boundsBorder,
                2
            );
            parameters.context.fill();
        });
    }
}
