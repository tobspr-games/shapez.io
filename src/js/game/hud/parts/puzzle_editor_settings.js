/* typehints:start */
import { PuzzleGameMode } from "../../modes/puzzle";
/* typehints:end */

import { globalConfig } from "../../../core/config";
import { createLogger } from "../../../core/logging";
import { Rectangle } from "../../../core/rectangle";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { BaseHUDPart } from "../base_hud_part";

const logger = createLogger("puzzle-editor");

export class HUDPuzzleEditorSettings extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorSettings");

        if (this.root.gameMode.getBuildableZones()) {
            const bind = (selector, handler) =>
                this.trackClicks(this.element.querySelector(selector), handler);
            this.zone = makeDiv(
                this.element,
                null,
                ["section", "zone"],
                `
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

                    <button class="styledButton trim">${T.ingame.puzzleEditorSettings.trimZone}</button>
                </div>`
            );

            bind(".zoneWidth .minus", () => this.modifyZone(-1, 0));
            bind(".zoneWidth .plus", () => this.modifyZone(1, 0));
            bind(".zoneHeight .minus", () => this.modifyZone(0, -1));
            bind(".zoneHeight .plus", () => this.modifyZone(0, 1));
            bind("button.trim", this.trim);
        }
    }

    trim() {
        const mode = /** @type {PuzzleGameMode} */ (this.root.gameMode);

        const sourceRect = Rectangle.centered(mode.zoneWidth, mode.zoneHeight);
        const entities = this.root.entityMgr.entities;

        if (entities.length == 0) {
            logger.log("Zone trim: no buildings found");
            return;
        }

        logger.log("Zone trim: Starts at", sourceRect.toString());

        const initialRect = entities[0].components.StaticMapEntity.getTileSpaceBounds();

        // Get union of all entity rectangles
        let destRect = entities.reduce((rect, current) => {
            const staticComp = current.components.StaticMapEntity;
            return rect.getUnion(staticComp.getTileSpaceBounds());
        }, initialRect);

        // Make sure the new zone matches min requirement
        const minRect = Rectangle.fromSquare(destRect.x, destRect.y, globalConfig.puzzleMinBoundsSize);
        destRect = destRect.getUnion(minRect);

        // Now find center of the new zone and align entities to (0, 0)
        const center = destRect.getCenter().ceil();

        // We need two loops to make sure entities don't corrupt each other
        for (const entity of entities) {
            this.root.map.removeStaticEntity(entity);
        }

        for (const entity of entities) {
            entity.components.StaticMapEntity.origin.subInplace(center);
            this.root.map.placeStaticEntity(entity);
        }

        logger.log("Zone trim: Finished at", destRect.toString());
        if (this.anyBuildingOutsideZone(destRect.w, destRect.h)) {
            logger.error("Trim: Zone is too small *after* trim");
            return;
        }

        mode.zoneWidth = destRect.w;
        mode.zoneHeight = destRect.h;
        this.updateZoneValues();
    }

    initialize() {
        this.visible = true;
        this.updateZoneValues();
    }

    anyBuildingOutsideZone(width, height) {
        if (Math.min(width, height) < globalConfig.puzzleMinBoundsSize) {
            return true;
        }
        const newZone = Rectangle.centered(width, height);
        const entities = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);

        for (const entity of entities) {
            const staticComp = entity.components.StaticMapEntity;
            const bounds = staticComp.getTileSpaceBounds();
            if (!newZone.intersectsFully(bounds)) {
                return true;
            }
        }
    }

    modifyZone(deltaW, deltaH) {
        const mode = /** @type {PuzzleGameMode} */ (this.root.gameMode);

        const newWidth = mode.zoneWidth + deltaW;
        const newHeight = mode.zoneHeight + deltaH;

        if (Math.min(newWidth, newHeight) < globalConfig.puzzleMinBoundsSize) {
            return;
        }

        if (Math.max(newWidth, newHeight) > globalConfig.puzzleMaxBoundsSize) {
            return;
        }

        if (this.anyBuildingOutsideZone(newWidth, newHeight)) {
            this.root.hud.parts.dialogs.showWarning(
                T.dialogs.puzzleResizeBadBuildings.title,
                T.dialogs.puzzleResizeBadBuildings.desc
            );
            return;
        }

        mode.zoneWidth = newWidth;
        mode.zoneHeight = newHeight;
        this.updateZoneValues();
    }

    updateZoneValues() {
        const mode = /** @type {PuzzleGameMode} */ (this.root.gameMode);

        this.element.querySelector(".zoneWidth > .value").textContent = String(mode.zoneWidth);
        this.element.querySelector(".zoneHeight > .value").textContent = String(mode.zoneHeight);
    }
}
