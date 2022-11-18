import { DrawParameters } from "../../../core/draw_parameters";
import { enumDirectionToVector, Vector } from "../../../core/vector";
import { Entity } from "../../entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { THEME } from "../../theme";
import { BaseHUDPart } from "../base_hud_part";
export class HUDShapeTooltip extends BaseHUDPart {
    createElements(parent: any): any { }
    initialize(): any {
                this.currentTile = new Vector(0, 0);
                this.currentEntity = null;
        this.isPlacingBuilding = false;
        this.root.signals.entityQueuedForDestroy.add((): any => {
            this.currentEntity = null;
        }, this);
        this.root.hud.signals.selectedPlacementBuildingChanged.add((metaBuilding: any): any => {
            this.isPlacingBuilding = metaBuilding;
        }, this);
    }
    isActive(): any {
        const hudParts: any = this.root.hud.parts;
        const active: any = this.root.app.settings.getSetting("shapeTooltipAlwaysOn") ||
            this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.showShapeTooltip).pressed;
        // return false if any other placer is active
        return (active &&
            !this.isPlacingBuilding &&
            !hudParts.massSelector.currentSelectionStartWorld &&
            hudParts.massSelector.selectedUids.size < 1 &&
            !hudParts.blueprintPlacer.currentBlueprint.get());
    }
        draw(parameters: DrawParameters): any {
        if (this.isActive()) {
            const mousePos: any = this.root.app.mousePosition;
            if (mousePos) {
                const tile: any = this.root.camera.screenToWorld(mousePos.copy()).toTileSpace();
                if (!tile.equals(this.currentTile)) {
                    this.currentTile = tile;
                    const entity: any = this.root.map.getLayerContentXY(tile.x, tile.y, this.root.currentLayer);
                    if (entity && entity.components.ItemProcessor && entity.components.ItemEjector) {
                        this.currentEntity = entity;
                    }
                    else {
                        this.currentEntity = null;
                    }
                }
            }
            if (!this.currentEntity) {
                return;
            }
            const ejectorComp: any = this.currentEntity.components.ItemEjector;
            const staticComp: any = this.currentEntity.components.StaticMapEntity;
            const bounds: any = staticComp.getTileSize();
            const totalArea: any = bounds.x * bounds.y;
            const maxSlots: any = totalArea < 2 ? 1 : 1e10;
            let slotsDrawn: any = 0;
            for (let i: any = 0; i < ejectorComp.slots.length; ++i) {
                const slot: any = ejectorComp.slots[i];
                if (!slot.lastItem) {
                    continue;
                }
                if (++slotsDrawn > maxSlots) {
                    continue;
                }
                                const drawPos: Vector = staticComp.localTileToWorld(slot.pos).toWorldSpaceCenterOfTile();
                slot.lastItem.drawItemCenteredClipped(drawPos.x, drawPos.y, parameters, 25);
            }
        }
    }
}
