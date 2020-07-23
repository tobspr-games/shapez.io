import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, removeAllChildren } from "../../../core/utils";
import { globalConfig } from "../../../core/config";

export class HUDEntityDebugger extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_EntityDebugger",
            [],
            `
            Tile below cursor: <span class="mousePos"></span><br>
            Chunk below cursor: <span class="chunkPos"></span><br>
            <div class="entityInfo"></div>
        `
        );

        /** @type {HTMLElement} */
        this.mousePosElem = this.element.querySelector(".mousePos");
        /** @type {HTMLElement} */
        this.chunkPosElem = this.element.querySelector(".chunkPos");
        this.entityInfoElem = this.element.querySelector(".entityInfo");
    }

    initialize() {
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
    }

    update() {
        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const worldPos = this.root.camera.screenToWorld(mousePos);
        const worldTile = worldPos.toTileSpace();

        const chunk = worldTile.divideScalar(globalConfig.mapChunkSize).floor();
        this.mousePosElem.innerText = worldTile.x + " / " + worldTile.y;
        this.chunkPosElem.innerText = chunk.x + " / " + chunk.y;

        const entity = this.root.map.getTileContent(worldTile, this.root.currentLayer);
        if (entity) {
            removeAllChildren(this.entityInfoElem);
            let html = "Entity";

            const flag = (name, val) =>
                `<span class='flag' data-value='${val ? "1" : "0"}'><u>${name}</u> ${val}</span>`;

            html += "<div class='entityFlags'>";
            html += flag("registered", entity.registered);
            html += flag("uid", entity.uid);
            html += flag("destroyed", entity.destroyed);
            html += "</div>";

            html += "<div class='components'>";

            for (const componentId in entity.components) {
                const data = entity.components[componentId];
                html += "<div class='component'>";
                html += "<strong class='name'>" + componentId + "</strong>";
                html += "<textarea class='data'>" + JSON.stringify(data.serialize(), null, 2) + "</textarea>";

                html += "</div>";
            }

            html += "</div>";

            this.entityInfoElem.innerHTML = html;
        }
    }

    onMouseDown() {}
}
