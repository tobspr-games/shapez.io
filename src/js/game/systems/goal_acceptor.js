/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { THIRDPARTY_URLS, globalConfig } from "../../core/config";
import { DialogWithForm } from "../../core/modal_dialog_elements";
import { FormElementInput, FormElementItemChooser } from "../../core/modal_dialog_forms";
import { fillInLinkIntoTranslation } from "../../core/utils";
import { T } from "../../translations";
import { GoalAcceptorComponent } from "../components/goal_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
// import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../items/boolean_item";
// import { COLOR_ITEM_SINGLETONS } from "../items/color_item";

export class GoalAcceptorSystem extends GameSystemWithFilter {
    /** @param {GameRoot} root */
    constructor(root) {
        super(root, [GoalAcceptorComponent]);

        this.root.signals.entityManuallyPlaced.add(this.editGoal, this);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const goalComp = entity.components.GoalAcceptor;
            const readerComp = entity.components.BeltReader;

            // Check against goals (set on placement)
        }

        // Check if goal criteria has been met for all goals
    }

    drawChunk(parameters, chunk) {
        /*
         *const contents = chunk.containedEntitiesByLayer.regular;
         *for (let i = 0; i < contents.length; ++i) {}
         */
    }

    editGoal(entity) {
        if (!entity.components.GoalAcceptor) {
            return;
        }

        const uid = entity.uid;
        const goalComp = entity.components.GoalAcceptor;

        const itemInput = new FormElementInput({
            id: "goalItemInput",
            label: fillInLinkIntoTranslation(T.dialogs.editGoalAcceptor.desc, THIRDPARTY_URLS.shapeViewer),
            placeholder: "CuCuCuCu",
            defaultValue: "CuCuCuCu",
            validator: val => this.parseItem(val),
        });

        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.editGoalAcceptor.title,
            desc: "",
            formElements: [itemInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false,
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        const closeHandler = () => {
            if (this.isEntityStale(uid)) {
                return;
            }

            goalComp.item = this.parseItem(itemInput.getValue());
        };

        dialog.buttonSignals.ok.add(closeHandler);
        dialog.buttonSignals.cancel.add(() => {
            if (this.isEntityStale(uid)) {
                return;
            }

            this.root.logic.tryDeleteBuilding(entity);
        });
    }

    parseRate(value) {
        return Number(value);
    }

    parseItem(value) {
        return this.root.systemMgr.systems.constantSignal.parseSignalCode(value);
    }

    isEntityStale(uid) {
        if (!this.root || !this.root.entityMgr) {
            return true;
        }

        const entity = this.root.entityMgr.findByUid(uid, false);
        if (!entity) {
            return true;
        }

        const goalComp = entity.components.GoalAcceptor;
        if (!goalComp) {
            return true;
        }

        return false;
    }
}
