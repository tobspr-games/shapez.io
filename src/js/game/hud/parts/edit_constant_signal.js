import { STOP_PROPAGATION } from "../../../core/signal";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { BaseHUDPart } from "../base_hud_part";
import { FormElementInput, FormElementItemChooser } from "../../../core/modal_dialog_forms";
import { fillInLinkIntoTranslation } from "../../../core/utils";
import { T } from "../../../translations";
import { THIRDPARTY_URLS } from "../../../core/config";
import { BaseItem } from "../../base_item";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../../items/boolean_item";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { COLOR_ITEM_SINGLETONS } from "../../items/color_item";
import { blueprintShape } from "../../upgrades";
import trim from "trim";
import { ShapeDefinition } from "../../shape_definition";
import { enumColors } from "../../colors";

export class HUDEditConstantSignal extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const entity = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (entity) {
            const signalComp = entity.components.ConstantSignal;
            if (signalComp) {
                if (button === enumMouseButton.left) {
                    if (!entity.components.ConstantSignal) {
                        return;
                    }

                    // Ok, query, but also save the uid because it could get stale
                    const uid = entity.uid;

                    const signalValueInput = new FormElementInput({
                        id: "signalValue",
                        label: fillInLinkIntoTranslation(
                            T.dialogs.editSignal.descShortKey,
                            THIRDPARTY_URLS.shapeViewer
                        ),
                        placeholder: "",
                        defaultValue: signalComp.signal ? signalComp.signal.getAsCopyableKey() : "",
                        validator: val => this.root.systemMgr.systems.constantSignal.parseSignalCode(val),
                    });

                    const itemInput = new FormElementItemChooser({
                        id: "signalItem",
                        label: null,
                        items: [
                            BOOL_FALSE_SINGLETON,
                            BOOL_TRUE_SINGLETON,
                            ...Object.values(COLOR_ITEM_SINGLETONS),
                            this.root.shapeDefinitionMgr.getShapeItemFromShortKey(blueprintShape),
                        ],
                    });

                    const dialog = new DialogWithForm({
                        app: this.root.app,
                        title: T.dialogs.editSignal.title,
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
                            console.log(itemInput.chosenItem);
                            constantComp.signal = itemInput.chosenItem;
                        } else {
                            constantComp.signal = this.root.systemMgr.systems.constantSignal.parseSignalCode(signalValueInput.getValue());
                        }
                    };

                    dialog.buttonSignals.ok.add(closeHandler);
                    dialog.valueChosen.add(closeHandler);
                    
                    return STOP_PROPAGATION;
                } else if (button === enumMouseButton.right) {
                    this.root.logic.tryDeleteBuilding(entity);
                    return STOP_PROPAGATION;
                }
            }
        }
    }
}
