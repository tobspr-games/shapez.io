import { DrawParameters } from "../../../core/draw_parameters";
import { enumDirectionToVector, Vector } from "../../../core/vector";
import { Entity } from "../../entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { THEME } from "../../theme";
import { BaseHUDPart } from "../base_hud_part";

export class HUDShapeTooltip extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        /** @type {Vector} */
        this.currentTile = new Vector(0, 0);

        /** @type {Entity} */
        this.currentEntity = null;

        this.isPlacingBuilding = false;

        this.root.signals.entityQueuedForDestroy.add(() => {
            this.currentEntity = null;
        }, this);

        this.root.hud.signals.selectedPlacementBuildingChanged.add(metaBuilding => {
            this.isPlacingBuilding = metaBuilding;
        }, this);
    }

    isActive() {
        const hudParts = this.root.hud.parts;

        const active =
            this.root.app.settings.getSetting("shapeTooltipAlwaysOn") ||
            this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.showShapeTooltip).pressed;

        // return false if any other placer is active
        return (
            active &&
            !this.isPlacingBuilding &&
            !hudParts.massSelector.currentSelectionStartWorld &&
            hudParts.massSelector.selectedUids.size < 1 &&
            !hudParts.blueprintPlacer.currentBlueprint.get()
        );
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.isActive()) {
            const mousePos = this.root.app.mousePosition;

            if (mousePos) {
                const tile = this.root.camera.screenToWorld(mousePos.copy()).toTileSpace();
                if (!tile.equals(this.currentTile)) {
                    this.currentTile = tile;

                    const entity = this.root.map.getLayerContentXY(tile.x, tile.y, this.root.currentLayer);

                    if (entity && entity.components.ItemProcessor && entity.components.ItemEjector) {
                        this.currentEntity = entity;
                    } else {
                        this.currentEntity = null;
                    }
                }
            }

            if (!this.currentEntity) {
                return;
            }

            const ejectorComp = this.currentEntity.components.ItemEjector;
            const staticComp = this.currentEntity.components.StaticMapEntity;

            const bounds = staticComp.getTileSize();
            const totalArea = bounds.x * bounds.y;
            const maxSlots = totalArea < 2 ? 1 : 1e10;

            let slotsDrawn = 0;

            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];

                if (!slot.lastItem) {
                    continue;
                }

                if (++slotsDrawn > maxSlots) {
                    continue;
                }

                /** @type {Vector} */
                const drawPos = staticComp.localTileToWorld(slot.pos).toWorldSpaceCenterOfTile();

                slot.lastItem.drawItemCenteredClipped(drawPos.x, drawPos.y, parameters, 25);
            }
        }
    }
}
