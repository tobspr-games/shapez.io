import { THIRDPARTY_URLS } from "../../../core/config";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementInput, FormElementItemChooser } from "../../../core/modal_dialog_forms";
import { STOP_PROPAGATION } from "../../../core/signal";
import { fillInLinkIntoTranslation } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { BaseItem } from "../../base_item";
import { enumMouseButton } from "../../camera";
import { Entity } from "../../entity";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../../items/boolean_item";
import { COLOR_ITEM_SINGLETONS } from "../../items/color_item";
import { BaseHUDPart } from "../base_hud_part";
import trim from "trim";
import { enumColors } from "../../colors";
import { ShapeDefinition } from "../../shape_definition";

/** @type {{
 * [x: string]: (entity: Entity) => BaseItem
 * }} */
export const MODS_ADDITIONAL_CONSTANT_SIGNAL_RESOLVER = {};

export class HUDConstantSignalEdit extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        if (this.root.currentLayer !== "wires") {
            return;
        }

        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (contents) {
            const constantComp = contents.components.ConstantSignal;
            if (constantComp) {
                if (button === enumMouseButton.left) {
                    this.editConstantSignal(contents, {
                        deleteOnCancel: false,
                    });
                    return STOP_PROPAGATION;
                }
            }
        }
    }

    /**
     * Asks the entity to enter a valid signal code
     * @param {Entity} entity
     * @param {object} param0
     * @param {boolean=} param0.deleteOnCancel
     */
    editConstantSignal(entity, { deleteOnCancel = true }) {
        if (!entity.components.ConstantSignal) {
            return;
        }

        // Ok, query, but also save the uid because it could get stale
        const uid = entity.uid;

        const signal = entity.components.ConstantSignal.signal;
        const signalValueInput = new FormElementInput({
            id: "signalValue",
            label: fillInLinkIntoTranslation(T.dialogs.editSignal.descShortKey, THIRDPARTY_URLS.shapeViewer),
            placeholder: "",
            defaultValue: signal ? signal.getAsCopyableKey() : "",
            validator: val => this.parseSignalCode(entity, val),
        });

        const items = [...Object.values(COLOR_ITEM_SINGLETONS)];

        if (entity.components.WiredPins) {
            items.unshift(BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON);
            items.push(
                this.root.shapeDefinitionMgr.getShapeItemFromShortKey(
                    this.root.gameMode.getBlueprintShapeKey()
                )
            );
        } else {
            // producer which can produce virtually anything
            const shapes = ["CuCuCuCu", "RuRuRuRu", "WuWuWuWu", "SuSuSuSu"];
            items.unshift(
                ...shapes.reverse().map(key => this.root.shapeDefinitionMgr.getShapeItemFromShortKey(key))
            );
        }

        if (this.root.gameMode.hasHub()) {
            items.push(
                this.root.shapeDefinitionMgr.getShapeItemFromDefinition(
                    this.root.hubGoals.currentGoal.definition
                )
            );
        }

        if (this.root.hud.parts.pinnedShapes) {
            items.push(
                ...this.root.hud.parts.pinnedShapes.pinnedShapes.map(key =>
                    this.root.shapeDefinitionMgr.getShapeItemFromShortKey(key)
                )
            );
        }

        const itemInput = new FormElementItemChooser({
            id: "signalItem",
            label: null,
            items,
        });

        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.editConstantProducer.title,
            desc: T.dialogs.editSignal.descItems,
            formElements: [itemInput, signalValueInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false,
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // When confirmed, set the signal
        const closeHandler = () => {
            if (!this.root || !this.root.entityMgr) {
                // Game got stopped
                return;
            }

            const entityRef = this.root.entityMgr.findByUid(uid, false);
            if (!entityRef) {
                // outdated
                return;
            }

            const constantComp = entityRef.components.ConstantSignal;
            if (!constantComp) {
                // no longer interesting
                return;
            }

            if (itemInput.chosenItem) {
                constantComp.signal = itemInput.chosenItem;
            } else {
                constantComp.signal = this.parseSignalCode(entity, signalValueInput.getValue());
            }
        };

        dialog.buttonSignals.ok.add(() => {
            closeHandler();
        });
        dialog.valueChosen.add(() => {
            dialog.closeRequested.dispatch();
            closeHandler();
        });

        // When cancelled, destroy the entity again
        if (deleteOnCancel) {
            dialog.buttonSignals.cancel.add(() => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                const constantComp = entityRef.components.ConstantSignal;
                if (!constantComp) {
                    // no longer interesting
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }

    /**
     * Tries to parse a signal code
     * @param {Entity} entity
     * @param {string} code
     * @returns {BaseItem}
     */
    parseSignalCode(entity, code) {
        if (!this.root || !this.root.shapeDefinitionMgr) {
            // Stale reference
            return null;
        }

        code = trim(code);
        const codeLower = code.toLowerCase();

        if (MODS_ADDITIONAL_CONSTANT_SIGNAL_RESOLVER[codeLower]) {
            return MODS_ADDITIONAL_CONSTANT_SIGNAL_RESOLVER[codeLower].apply(this, [entity]);
        }

        if (enumColors[codeLower]) {
            return COLOR_ITEM_SINGLETONS[codeLower];
        }

        if (entity.components.WiredPins) {
            if (code === "1" || codeLower === "true") {
                return BOOL_TRUE_SINGLETON;
            }

            if (code === "0" || codeLower === "false") {
                return BOOL_FALSE_SINGLETON;
            }
        }

        if (ShapeDefinition.isValidShortKey(code)) {
            return this.root.shapeDefinitionMgr.getShapeItemFromShortKey(code);
        }

        return null;
    }
}
