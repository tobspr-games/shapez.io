import { globalConfig } from "../../../core/config";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { createLogger } from "../../../core/logging";
import { Rectangle } from "../../../core/rectangle";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { MetaBlockBuilding } from "../../buildings/block";
import { MetaConstantProducerBuilding } from "../../buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "../../buildings/goal_acceptor";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { PuzzleGameMode } from "../../modes/puzzle";
import { BaseHUDPart } from "../base_hud_part";
const logger: any = createLogger("puzzle-editor");
export class HUDPuzzleEditorSettings extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorSettings");
        if (this.root.gameMode.getBuildableZones()) {
            const bind: any = (selector: any, handler: any): any => this.trackClicks(this.element.querySelector(selector), handler);
            this.zone = makeDiv(this.element, null, ["section", "zone"], `
                <label>${T.ingame.puzzleEditorSettings.zoneTitle}</label>

                <div class="buttons">
                    <div class="zoneWidth plusMinus">
                        <label>${T.ingame.puzzleEditorSettings.zoneWidth}</label>
                        <button class="styledButton minus">-</button>
                        <span class="value"></span>
                        <button class="styledButton plus">+</button>
                    </div>

                     <div class="zoneHeight plusMinus">
                        <label>${T.ingame.puzzleEditorSettings.zoneHeight}</label>
                        <button class="styledButton minus">-</button>
                        <span class="value"></span>
                        <button class="styledButton plus">+</button>
                    </div>

                    <div class="buttonBar">
                        <button class="styledButton trim">${T.ingame.puzzleEditorSettings.trimZone}</button>
                        <button class="styledButton clearItems">${T.ingame.puzzleEditorSettings.clearItems}</button>
                    </div>

                    <div class="buildingsButton">
                        <button class="styledButton resetPuzzle">${T.ingame.puzzleEditorSettings.resetPuzzle}</button>
                    </div>

                </div>`);
            bind(".zoneWidth .minus", (): any => this.modifyZone(-1, 0));
            bind(".zoneWidth .plus", (): any => this.modifyZone(1, 0));
            bind(".zoneHeight .minus", (): any => this.modifyZone(0, -1));
            bind(".zoneHeight .plus", (): any => this.modifyZone(0, 1));
            bind("button.trim", this.trim);
            bind("button.clearItems", this.clearItems);
            bind("button.resetPuzzle", this.resetPuzzle);
        }
    }
    clearItems(): any {
        this.root.logic.clearAllBeltsAndItems();
    }
    resetPuzzle(): any {
        for (const entity: any of this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp: any = entity.components.StaticMapEntity;
            const goalComp: any = entity.components.GoalAcceptor;
            if (goalComp) {
                goalComp.clear();
            }
            if ([MetaGoalAcceptorBuilding, MetaConstantProducerBuilding, MetaBlockBuilding]
                .map((metaClass: any): any => gMetaBuildingRegistry.findByClass(metaClass).id)
                .includes(staticComp.getMetaBuilding().id)) {
                continue;
            }
            this.root.map.removeStaticEntity(entity);
            this.root.entityMgr.destroyEntity(entity);
        }
        this.root.entityMgr.processDestroyList();
    }
    trim(): any {
        // Now, find the center
        const buildings: any = this.root.entityMgr.entities.slice();
        if (buildings.length === 0) {
            // nothing to do
            return;
        }
        let minRect: any = null;
        for (const building: any of buildings) {
            const staticComp: any = building.components.StaticMapEntity;
            const bounds: any = staticComp.getTileSpaceBounds();
            if (!minRect) {
                minRect = bounds;
            }
            else {
                minRect = minRect.getUnion(bounds);
            }
        }
        const mode: any = (this.root.gameMode as PuzzleGameMode);
        const moveByInverse: any = minRect.getCenter().round();
        // move buildings
        if (moveByInverse.length() > 0) {
            // increase area size
            mode.zoneWidth = globalConfig.puzzleMaxBoundsSize;
            mode.zoneHeight = globalConfig.puzzleMaxBoundsSize;
            // First, remove any items etc
            this.root.logic.clearAllBeltsAndItems();
            this.root.logic.performImmutableOperation((): any => {
                // 1. remove all buildings
                for (const building: any of buildings) {
                    if (!this.root.logic.tryDeleteBuilding(building)) {
                        assertAlways(false, "Failed to remove building in trim");
                    }
                }
                // 2. place them again, but centered
                for (const building: any of buildings) {
                    const staticComp: any = building.components.StaticMapEntity;
                    const result: any = this.root.logic.tryPlaceBuilding({
                        origin: staticComp.origin.sub(moveByInverse),
                        building: staticComp.getMetaBuilding(),
                        originalRotation: staticComp.originalRotation,
                        rotation: staticComp.rotation,
                        rotationVariant: staticComp.getRotationVariant(),
                        variant: staticComp.getVariant(),
                    });
                    if (!result) {
                        this.root.bulkOperationRunning = false;
                        assertAlways(false, "Failed to re-place building in trim");
                    }
                    for (const key: any in building.components) {
                        building
                            .components[key] as import("../../../core/global_registries").Component).copyAdditionalStateTo(result.components[key]);
                    }
                }
            });
        }
        // 3. Actually trim
        let w: any = mode.zoneWidth;
        let h: any = mode.zoneHeight;
        while (!this.anyBuildingOutsideZone(w - 1, h)) {
            --w;
        }
        while (!this.anyBuildingOutsideZone(w, h - 1)) {
            --h;
        }
        mode.zoneWidth = w;
        mode.zoneHeight = h;
        this.updateZoneValues();
    }
    initialize(): any {
        this.visible = true;
        this.updateZoneValues();
    }
    anyBuildingOutsideZone(width: any, height: any): any {
        if (Math.min(width, height) < globalConfig.puzzleMinBoundsSize) {
            return true;
        }
        const newZone: any = Rectangle.centered(width, height);
        const entities: any = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);
        for (const entity: any of entities) {
            const staticComp: any = entity.components.StaticMapEntity;
            const bounds: any = staticComp.getTileSpaceBounds();
            if (!newZone.intersectsFully(bounds)) {
                return true;
            }
        }
    }
    modifyZone(deltaW: any, deltaH: any): any {
        const mode: any = (this.root.gameMode as PuzzleGameMode);
        const newWidth: any = mode.zoneWidth + deltaW;
        const newHeight: any = mode.zoneHeight + deltaH;
        if (Math.min(newWidth, newHeight) < globalConfig.puzzleMinBoundsSize) {
            return;
        }
        if (Math.max(newWidth, newHeight) > globalConfig.puzzleMaxBoundsSize) {
            return;
        }
        if (this.anyBuildingOutsideZone(newWidth, newHeight)) {
            this.root.hud.parts.dialogs.showWarning(T.dialogs.puzzleResizeBadBuildings.title, T.dialogs.puzzleResizeBadBuildings.desc);
            return;
        }
        mode.zoneWidth = newWidth;
        mode.zoneHeight = newHeight;
        this.updateZoneValues();
    }
    updateZoneValues(): any {
        const mode: any = (this.root.gameMode as PuzzleGameMode);
        this.element.querySelector(".zoneWidth > .value").textContent = String(mode.zoneWidth);
        this.element.querySelector(".zoneHeight > .value").textContent = String(mode.zoneHeight);
    }
}
