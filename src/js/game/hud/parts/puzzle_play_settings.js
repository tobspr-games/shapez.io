import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { createLogger } from "../../../core/logging";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { MetaBlockBuilding } from "../../buildings/block";
import { MetaConstantProducerBuilding } from "../../buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "../../buildings/goal_acceptor";
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
                        <button class="styledButton clearBuildings">${T.ingame.puzzleEditorSettings.resetPuzzle}</button>

                `
            );

            bind("button.clearItems", this.clearItems);
            bind("button.clearBuildings", this.clearBuildings);
        }
    }

    clearItems() {
        this.root.logic.clearAllBeltsAndItems();
    }

    clearBuildings() {
        for (const entity of this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp = entity.components.StaticMapEntity;

            if (
                [MetaGoalAcceptorBuilding, MetaConstantProducerBuilding, MetaBlockBuilding]
                    .map(metaClass => gMetaBuildingRegistry.findByClass(metaClass).id)
                    .includes(staticComp.getMetaBuilding().id)
            ) {
                continue;
            }

            this.root.map.removeStaticEntity(entity);
            this.root.entityMgr.destroyEntity(entity);
        }
        this.root.entityMgr.processDestroyList();
    }

    initialize() {
        this.visible = true;
    }
}
