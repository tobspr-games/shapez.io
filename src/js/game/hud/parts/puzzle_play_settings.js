import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { createLogger } from "../../../core/logging";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { MetaBlockBuilding } from "../../buildings/block";
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
                        <button class="styledButton clear items">${T.ingame.puzzleEditorSettings.clearItems}</button>
                        <button class="styledButton clear buildings">Clear Buildings</button>

                `
            );

            bind("button.items", this.clearItems);
            bind("button.buildings", this.clearBuildings);
        }
    }

    clearItems() {
        this.root.logic.clearAllBeltsAndItems();
    }

    clearBuildings() {
        for (const entity of this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp = entity.components.StaticMapEntity;
            const signalComp = entity.components.ConstantSignal;
            const goalComp = entity.components.GoalAcceptor;

            if (
                signalComp ||
                goalComp ||
                staticComp.getMetaBuilding().id === gMetaBuildingRegistry.findByClass(MetaBlockBuilding).id
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
