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
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_EntityDebugger", [], `
            <label>Entity Debugger</label>
            <span class="hint">Use F8 to toggle this overlay</span>

            <div class="propertyTable">
                <div class="entityComponents"></div>
            </div>
        `);
        this.componentsElem = this.element.querySelector(".entityComponents");
    }
    initialize(): any {
        this.root.gameState.inputReciever.keydown.add((key: any): any => {
            if (key.keyCode === 119) {
                // F8
                this.pickEntity();
            }
        });
        /**
         * The currently selected entity
         */
        this.selectedEntity = null;
        this.lastUpdate = 0;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }
    pickEntity(): any {
        const mousePos: any = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const worldPos: any = this.root.camera.screenToWorld(mousePos);
        const worldTile: any = worldPos.toTileSpace();
        const entity: any = this.root.map.getTileContent(worldTile, this.root.currentLayer);
        this.selectedEntity = entity;
        if (entity) {
            this.rerenderFull(entity);
        }
    }
        propertyToHTML(name: string, val: any, indent: number = 0, recursion: Array = []): any {
        if (indent > 20) {
            return;
        }
        if (val !== null && typeof val === "object") {
            // Array is displayed like object, with indexes
            recursion.push(val);
            // Get type class name (like Array, Object, Vector...)


            let typeName: any = `(${val.constructor ? val.constructor.name : "unknown"})`;
            if (Array.isArray(val)) {
                typeName = `(Array[${val.length}])`;
            }
            if (val instanceof Vector) {
                typeName = `(Vector[${val.x}, ${val.y}])`;
            }
            const colorStyle: any = `color: hsl(${30 * indent}, 100%, 80%)`;
            let html: any = `<details class="object" style="${colorStyle}">
                            <summary>${name} ${typeName}</summary>
                            <div>`;
            for (const property: any in val) {
                let hiddenValue: any = null;
                if (val[property] == this.root) {
                    hiddenValue = "<root>";
                }
                else if (val[property] instanceof Node) {

                    hiddenValue = `<${val[property].constructor.name}>`;
                }
                else if (recursion.includes(val[property])) {
                    // Avoid recursion by not "expanding" object more than once
                    hiddenValue = "<recursion>";
                }
                html += this.propertyToHTML(property, hiddenValue ? hiddenValue : val[property], indent + 1, [...recursion] // still expand same value in other "branches"
                );
            }
            html += "</div></details>";
            return html;
        }
        const displayValue: any = (val + "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
        return `<label>${name}</label> <span>${displayValue}</span>`;
    }
    /**
     * Rerenders the whole container
     */
    rerenderFull(entity: Entity): any {
        removeAllChildren(this.componentsElem);
        let html: any = "";
        const property: any = (strings: any, val: any): any => `<label>${strings[0]}</label> <span>${val}</span>`;
        html += property `registered ${!!entity.registered}`;
        html += property `uid ${entity.uid}`;
        html += property `destroyed ${!!entity.destroyed}`;
        for (const componentId: any in entity.components) {
            const data: any = entity.components[componentId];
            html += "<details class='object'>";
            html += "<summary>" + componentId + "</summary><div>";
            for (const property: any in data) {
                // Put entity into recursion list, so it won't get "expanded"
                html += this.propertyToHTML(property, data[property], 0, [entity]);
            }
            html += "</div></details>";
        }
        this.componentsElem.innerHTML = html;
    }
    update(): any {
        this.domAttach.update(!!this.selectedEntity);
    }
}
/* dev:end */
