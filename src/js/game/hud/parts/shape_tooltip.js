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

        // return false if any other placer is active
        return (
            this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.showShapeTooltip).pressed &&
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

            const context = parameters.context;

            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];

                if (!slot.lastItem || slot.lastItem._type != "shape") {
                    continue;
                }

                const drawPos = staticComp
                    .localTileToWorld(slot.pos.add(enumDirectionToVector[slot.direction].multiplyScalar(1)))
                    .toWorldSpaceCenterOfTile();

                const slotCenterPos = staticComp
                    .localTileToWorld(slot.pos.add(enumDirectionToVector[slot.direction].multiplyScalar(0.2)))
                    .toWorldSpaceCenterOfTile();

                context.fillStyle = THEME.shapeTooltip.outline;
                context.strokeStyle = THEME.shapeTooltip.outline;

                context.lineWidth = 1.5;
                context.beginPath();
                context.moveTo(slotCenterPos.x, slotCenterPos.y);
                context.lineTo(drawPos.x, drawPos.y);
                context.stroke();

                context.beginCircle(slotCenterPos.x, slotCenterPos.y, 3.5);
                context.fill();

                context.fillStyle = THEME.shapeTooltip.background;
                context.strokeStyle = THEME.shapeTooltip.outline;

                context.lineWidth = 1.2;
                context.beginCircle(drawPos.x, drawPos.y, 11 + 1.2 / 2);
                context.fill();
                context.stroke();
                slot.lastItem.drawItemCenteredClipped(drawPos.x, drawPos.y, parameters, 22);
            }
        }
    }
}
