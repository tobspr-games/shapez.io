import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, removeAllChildren } from "../../../core/utils";
import { globalConfig } from "../../../core/config";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDEntityDebugger extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_EntityDebugger",
            [],
            `
            <label>Entity Debugger</label>
            <span class="hint">Use F8 to toggle this overlay</span>

            <div class="propertyTable">
                <div>Tile below cursor</div> <span class="mousePos"></span>
                <div>Chunk below cursor</div> <span class="chunkPos"></span>
                <div class="entityComponents"></div>
            </div>
        `
        );

        /** @type {HTMLElement} */
        this.mousePosElem = this.element.querySelector(".mousePos");
        /** @type {HTMLElement} */
        this.chunkPosElem = this.element.querySelector(".chunkPos");
        this.componentsElem = this.element.querySelector(".entityComponents");
    }

    initialize() {
        this.root.gameState.inputReciever.keydown.add(key => {
            if (key.keyCode === 119) {
                // F8
                this.toggle();
            }
        });

        this.root.camera.downPreHandler.add(this.onMouseDown, this);

        this.visible = !G_IS_DEV;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    toggle() {
        this.visible = !this.visible;
    }

    propertyToHTML(name, val, indent = 0, recursion = []) {
        if (val !== null && typeof val === "object") {
            // Array is displayed like object, with indexes
            recursion.push(val);

            // Get type class name (like Array, Object, Vector...)
            const typeName = `(${val.constructor ? val.constructor.name : "unknown"})`;
            const colorStyle = `color: hsl(${30 * indent}, 100%, 80%)`;

            let html = `<details class="object" style="${colorStyle}">
                            <summary>${name} ${typeName}</summary>
                            <div>`;

            for (const property in val) {
                const isRoot = val[property] == this.root;
                const isRecursive = recursion.includes(val[property]);

                let hiddenValue = isRoot ? "<root>" : null;
                if (isRecursive) {
                    // Avoid recursion by not "expanding" object more than once
                    hiddenValue = "<recursion>";
                }

                html += this.propertyToHTML(
                    property,
                    hiddenValue ? hiddenValue : val[property],
                    indent + 1,
                    [...recursion] // still expand same value in other "branches"
                );
            }

            html += "</div></details>";

            return html;
        }

        const displayValue = (val + "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
        return `<label>${name}</label> <span>${displayValue}</span>`;
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
            removeAllChildren(this.componentsElem);
            let html = "";

            const property = (strings, val) => `<label>${strings[0]}</label> <span>${val}</span>`;

            html += property`registered ${entity.registered}`;
            html += property`uid ${entity.uid}`;
            html += property`destroyed ${entity.destroyed}`;

            for (const componentId in entity.components) {
                const data = entity.components[componentId];
                html += "<details class='object'>";
                html += "<summary>" + componentId + "</summary><div>";

                for (const property in data) {
                    // Put entity into recursion list, so it won't get "expanded"
                    html += this.propertyToHTML(property, data[property], 0, [entity]);
                }

                html += "</div></details>";
            }

            this.componentsElem.innerHTML = html;
        }

        this.domAttach.update(this.visible);
    }

    onMouseDown() {
        // On click, update current entity

        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const worldPos = this.root.camera.screenToWorld(mousePos);
        const worldTile = worldPos.toTileSpace();
    }
}
