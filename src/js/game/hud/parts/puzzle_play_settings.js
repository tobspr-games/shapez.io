import { createLogger } from "../../../core/logging";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { BaseHUDPart } from "../base_hud_part";

const logger = createLogger("puzzle-play");

export class HUDPuzzlePlaySettings extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PuzzlePlaySettings");

        if (this.root.gameMode.getBuildableZones()) {
            const bind = (selector, handler) =>
                this.trackClicks(this.element.querySelector(selector), handler);
            makeDiv(
                this.element,
                null,
                ["section"],
                `
                        <button class="styledButton clearItems">${T.ingame.puzzleEditorSettings.clearItems}</button>
                        <button class="styledButton resetPuzzle">${T.ingame.puzzleEditorSettings.resetPuzzle}</button>

                `
            );

            bind("button.clearItems", this.clearItems);
            bind("button.resetPuzzle", this.resetPuzzle);
        }
    }

    clearItems() {
        this.root.logic.clearAllBeltsAndItems();
    }

    resetPuzzle() {
        for (const entity of this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp = entity.components.StaticMapEntity;
            const goalComp = entity.components.GoalAcceptor;

            if (goalComp) {
                goalComp.clear();
            }

            if (staticComp.getMetaBuilding().getIsRemovable(this.root)) {
                this.root.map.removeStaticEntity(entity);
                this.root.entityMgr.destroyEntity(entity);
            }
        }
        this.root.entityMgr.processDestroyList();
    }

    initialize() {
        this.visible = true;
    }
}
