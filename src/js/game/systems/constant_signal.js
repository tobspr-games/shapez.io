import trim from "trim";
import { DialogWithForm } from "../../core/modal_dialog_elements";
import { FormElementInput } from "../../core/modal_dialog_forms";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { ConstantSignalComponent } from "../components/constant_signal";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../items/boolean_item";
import { COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { ShapeDefinition } from "../shape_definition";

export class ConstantSignalSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ConstantSignalComponent]);

        this.root.signals.entityManuallyPlaced.add(this.querySigalValue, this);
    }

    update() {
        // Set signals
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const pinsComp = entity.components.WiredPins;
            const signalComp = entity.components.ConstantSignal;
            pinsComp.slots[0].value = signalComp.signal;
        }
    }

    /**
     * Asks the entity to enter a valid signal code
     * @param {Entity} entity
     */
    querySigalValue(entity) {
        if (!entity.components.ConstantSignal) {
            return;
        }

        // Ok, query, but also save the uid because it could get stale
        const uid = entity.uid;

        const signalValueInput = new FormElementInput({
            id: "signalValue",
            label: null,
            placeholder: "",
            defaultValue: "",
            validator: val => this.parseSignalCode(val),
        });
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: "Set Signal",
            desc: "Enter a shape code, color or '0' or '1'",
            formElements: [signalValueInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // When confirmed, set the signal
        dialog.buttonSignals.ok.add(() => {
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

            constantComp.signal = this.parseSignalCode(signalValueInput.getValue());
        });

        // When cancelled, destroy the entity again
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

    /**
     * Tries to parse a signal code
     * @param {string} code
     * @returns {BaseItem}
     */
    parseSignalCode(code) {
        code = trim(code);
        const codeLower = code.toLowerCase();

        if (enumColors[codeLower]) {
            return COLOR_ITEM_SINGLETONS[codeLower];
        }
        if (code === "1" || codeLower === "true") {
            return BOOL_TRUE_SINGLETON;
        }

        if (code === "0" || codeLower === "false") {
            return BOOL_FALSE_SINGLETON;
        }

        if (ShapeDefinition.isValidShortKey(code)) {
            return this.root.shapeDefinitionMgr.getShapeItemFromShortKey(code);
        }

        return null;
    }
}
