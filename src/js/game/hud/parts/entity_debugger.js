/* dev:start */
import { makeDiv, removeAllChildren } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { Entity } from "../../entity";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

/**
 * Allows to inspect entities by pressing F8 while hovering them
 */
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
                <div class="entityComponents"></div>
            </div>
        `
        );
        this.componentsElem = this.element.querySelector(".entityComponents");
    }

    initialize() {
        this.root.gameState.inputReciever.keydown.add(key => {
            if (key.keyCode === 119) {
                // F8
                this.pickEntity();
            }
        });

        /**
         * The currently selected entity
         * @type {Entity}
         */
        this.selectedEntity = null;

        this.lastUpdate = 0;

        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    pickEntity() {
        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const worldPos = this.root.camera.screenToWorld(mousePos);
        const worldTile = worldPos.toTileSpace();
        const entity = this.root.map.getTileContent(worldTile, this.root.currentLayer);

        this.selectedEntity = entity;
        if (entity) {
            this.rerenderFull(entity);
        }
    }

    /**
     *
     * @param {string} name
     * @param {any} val
     * @param {number} indent
     * @param {Array} recursion
     */
    propertyToHTML(name, val, indent = 0, recursion = []) {
        if (indent > 20) {
            return;
        }

        if (val !== null && typeof val === "object") {
            // Array is displayed like object, with indexes
            recursion.push(val);

            // Get type class name (like Array, Object, Vector...)
            let typeName = `(${val.constructor ? val.constructor.name : "unknown"})`;

            if (Array.isArray(val)) {
                typeName = `(Array[${val.length}])`;
            }

            if (val instanceof Vector) {
                typeName = `(Vector[${val.x}, ${val.y}])`;
            }

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

    /**
     * Rerenders the whole container
     * @param {Entity} entity
     */
    rerenderFull(entity) {
        removeAllChildren(this.componentsElem);
        let html = "";

        const property = (strings, val) => `<label>${strings[0]}</label> <span>${val}</span>`;

        html += property`registered ${!!entity.registered}`;
        html += property`uid ${entity.uid}`;
        html += property`destroyed ${!!entity.destroyed}`;

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

    update() {
        this.domAttach.update(!!this.selectedEntity);
    }
}

/* dev:end */
