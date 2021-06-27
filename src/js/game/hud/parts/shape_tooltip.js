import { DrawParameters } from "../../../core/draw_parameters";
import { createLogger } from "../../../core/logging";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { Entity } from "../../entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";

const logger = createLogger("hud/mass_selector");

export class HUDShapeTooltip extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        /** @type {Vector} */
        this.currentTile = null;

        /** @type {Entity} */
        this.currentEntity = null;

        /** @type {Array<import("../../../core/global_registries").BaseItem>} */
        this.cachedItems = null;

        this.isPlacingBuilding = false;
        this.active = false;

        this.root.camera.movePreHandler.add(this.onMouseMove, this);

        const keyActionMapper = this.root.keyMapper;

        keyActionMapper.getBinding(KEYMAPPINGS.placement.pipette).add(this.clear, this);

        this.root.hud.signals.pasteBlueprintRequested.add(this.clear, this);
        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedPlacementBuildingChanged,
            this
        );
        this.root.hud.signals.buildingsSelectedForCopy.add(this.clear, this);
        this.root.signals.entityQueuedForDestroy.add(this.clear, this);
        this.root.signals.editModeChanged.add(this.clear, this);
    }

    update() {
        // need to make sure not to show when anything else is active

        this.active =
            this.currentTile &&
            !this.isPlacingBuilding &&
            this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.showShapeTooltip).pressed &&
            !this.root.hud.parts.massSelector.currentSelectionStartWorld &&
            this.root.hud.parts.massSelector.selectedUids.size < 1;
    }

    /**
     *  Called when the selected meta building was changed
     * @param {import("../../../core/global_registries").MetaBuilding} metaBuilding
     */
    onSelectedPlacementBuildingChanged(metaBuilding) {
        if (metaBuilding) {
            this.isPlacingBuilding = true;
            this.clear();
        } else {
            this.isPlacingBuilding = false;
        }
    }

    /**
     * Clears everything
     */
    clear() {
        this.currentTile = null;
        this.currentEntity = null;
        this.cachedItems = null;
    }

    /**
     * mouse move pre handler
     * @param {Vector} pos
     */
    onMouseMove(pos) {
        const newTile = this.root.camera.screenToWorld(pos.copy()).toTileSpace();

        if (!(this.currentTile && newTile.equals(this.currentTile))) {
            this.currentTile = newTile;

            const entity = this.root.map.getLayerContentXY(
                this.currentTile.x,
                this.currentTile.y,
                this.root.currentLayer
            );

            if (!(entity && entity.components.ItemProcessor && entity.components.ItemEjector)) {
                this.clear();
                return;
            }

            this.currentEntity = entity;
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.active && this.currentEntity) {
            const ejectorComp = this.currentEntity.components.ItemEjector;
            const staticComp = this.currentEntity.components.StaticMapEntity;

            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];

                if (!slot.lastItem || slot.lastItem._type != "shape") {
                    continue;
                }

                /** @type {Vector} */
                let drawPos = null;
                if (ejectorComp.slots.length == 1) {
                    drawPos = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
                } else {
                    drawPos = staticComp.localTileToWorld(slot.pos).toWorldSpaceCenterOfTile();
                }

                slot.lastItem.drawItemCenteredClipped(drawPos.x, drawPos.y, parameters, 25);
            }
        }
    }
}
