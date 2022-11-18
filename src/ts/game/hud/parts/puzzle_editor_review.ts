import { globalConfig, THIRDPARTY_URLS } from "../../../core/config";
import { createLogger } from "../../../core/logging";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementInput, FormElementItemChooser } from "../../../core/modal_dialog_forms";
import { STOP_PROPAGATION } from "../../../core/signal";
import { fillInLinkIntoTranslation, makeDiv } from "../../../core/utils";
import { PuzzleSerializer } from "../../../savegame/puzzle_serializer";
import { T } from "../../../translations";
import { ConstantSignalComponent } from "../../components/constant_signal";
import { GoalAcceptorComponent } from "../../components/goal_acceptor";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { ShapeItem } from "../../items/shape_item";
import { ShapeDefinition } from "../../shape_definition";
import { BaseHUDPart } from "../base_hud_part";
const trim: any = require("trim");
const logger: any = createLogger("puzzle-review");
export class HUDPuzzleEditorReview extends BaseHUDPart {

    constructor(root) {
        super(root);
    }
    createElements(parent: any): any {
        const key: any = this.root.gameMode.getId();
        this.element = makeDiv(parent, "ingame_HUD_PuzzleEditorReview");
        this.button = document.createElement("button");
        this.button.classList.add("button");
        this.button.textContent = T.puzzleMenu.reviewPuzzle;
        this.element.appendChild(this.button);
        this.trackClicks(this.button, this.startReview);
    }
    initialize(): any { }
    startReview(): any {
        const validationError: any = this.validatePuzzle();
        if (validationError) {
            this.root.hud.parts.dialogs.showWarning(T.puzzleMenu.validation.title, validationError);
            return;
        }
        const closeLoading: any = this.root.hud.parts.dialogs.showLoadingDialog(T.puzzleMenu.validatingPuzzle);
        // Wait a bit, so the user sees the puzzle actually got validated
        setTimeout((): any => {
            // Manually simulate ticks
            this.root.logic.clearAllBeltsAndItems();
            const maxTicks: any = this.root.gameMode.getFixedTickrate() * globalConfig.puzzleValidationDurationSeconds;
            const deltaMs: any = this.root.dynamicTickrate.deltaMs;
            logger.log("Simulating up to", maxTicks, "ticks, start=", this.root.time.now().toFixed(1));
            const now: any = performance.now();
            let simulatedTicks: any = 0;
            for (let i: any = 0; i < maxTicks; ++i) {
                // Perform logic tick
                this.root.time.performTicks(deltaMs, this.root.gameState.core.boundInternalTick);
                simulatedTicks++;
                if (simulatedTicks % 100 == 0 && !this.validatePuzzle()) {
                    break;
                }
            }
            const duration: any = performance.now() - now;
            logger.log("Simulated", simulatedTicks, "ticks, end=", this.root.time.now().toFixed(1), "duration=", duration.toFixed(2), "ms");
            console.log("duration: " + duration);
            closeLoading();
            //if it took so little ticks that it must have autocompeted
            if (simulatedTicks <= 500) {
                this.root.hud.parts.dialogs.showWarning(T.puzzleMenu.validation.title, T.puzzleMenu.validation.autoComplete);
                return;
            }
            //if we reached maximum ticks and the puzzle still isn't completed
            const validationError: any = this.validatePuzzle();
            if (simulatedTicks == maxTicks && validationError) {
                this.root.hud.parts.dialogs.showWarning(T.puzzleMenu.validation.title, validationError);
                return;
            }
            this.startSubmit();
        }, 750);
    }
    startSubmit(title: any = "", shortKey: any = ""): any {
        const regex: any = /^[a-zA-Z0-9_\- ]{4,20}$/;
        const nameInput: any = new FormElementInput({
            id: "nameInput",
            label: T.dialogs.submitPuzzle.descName,
            placeholder: T.dialogs.submitPuzzle.placeholderName,
            defaultValue: title,
            validator: (val: any): any => trim(val).match(regex) && trim(val).length > 0,
        });
        let items: any = new Set();
        const acceptors: any = this.root.entityMgr.getAllWithComponent(GoalAcceptorComponent);
        for (const acceptor: any of acceptors) {
            const item: any = acceptor.components.GoalAcceptor.item;
            if (item.getItemType() === "shape") {
                items.add(item);
            }
        }
        while (items.size < 8) {
            // add some randoms
            const item: any = this.root.hubGoals.computeFreeplayShape(Math.round(10 + Math.random() * 10000));
            items.add(new ShapeItem(item));
        }
        const itemInput: any = new FormElementItemChooser({
            id: "signalItem",
            label: fillInLinkIntoTranslation(T.dialogs.submitPuzzle.descIcon, THIRDPARTY_URLS.shapeViewer),
            items: Array.from(items),
        });
        const shapeKeyInput: any = new FormElementInput({
            id: "shapeKeyInput",
            label: null,
            placeholder: "CuCuCuCu",
            defaultValue: shortKey,
            validator: (val: any): any => ShapeDefinition.isValidShortKey(trim(val)),
        });
        const dialog: any = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.submitPuzzle.title,
            desc: "",
            formElements: [nameInput, itemInput, shapeKeyInput],
            buttons: ["ok:good:enter"],
        });
        itemInput.valueChosen.add((value: any): any => {
            shapeKeyInput.setValue(value.definition.getHash());
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);
        dialog.buttonSignals.ok.add((): any => {
            const title: any = trim(nameInput.getValue());
            const shortKey: any = trim(shapeKeyInput.getValue());
            this.doSubmitPuzzle(title, shortKey);
        });
    }
    doSubmitPuzzle(title: any, shortKey: any): any {
        const serialized: any = new PuzzleSerializer().generateDumpFromGameRoot(this.root);
        logger.log("Submitting puzzle, title=", title, "shortKey=", shortKey);
        if (G_IS_DEV) {
            logger.log("Serialized data:", serialized);
        }
        const closeLoading: any = this.root.hud.parts.dialogs.showLoadingDialog(T.puzzleMenu.submittingPuzzle);
        this.root.app.clientApi
            .apiSubmitPuzzle({
            title,
            shortKey,
            data: serialized,
        })
            .then((): any => {
            closeLoading();
            const { ok }: any = this.root.hud.parts.dialogs.showInfo(T.dialogs.puzzleSubmitOk.title, T.dialogs.puzzleSubmitOk.desc);
            ok.add((): any => this.root.gameState.moveToState("PuzzleMenuState"));
        }, (err: any): any => {
            closeLoading();
            logger.warn("Failed to submit puzzle:", err);
            const signals: any = this.root.hud.parts.dialogs.showWarning(T.dialogs.puzzleSubmitError.title, T.dialogs.puzzleSubmitError.desc + " " + err, ["cancel", "retry:good"]);
            signals.retry.add((): any => this.startSubmit(title, shortKey));
        });
    }
    validatePuzzle(): any {
        // Check there is at least one constant producer and goal acceptor
        const producers: any = this.root.entityMgr.getAllWithComponent(ConstantSignalComponent);
        const acceptors: any = this.root.entityMgr.getAllWithComponent(GoalAcceptorComponent);
        if (producers.length === 0) {
            return T.puzzleMenu.validation.noProducers;
        }
        if (acceptors.length === 0) {
            return T.puzzleMenu.validation.noGoalAcceptors;
        }
        // Check if all acceptors satisfy the constraints
        for (const acceptor: any of acceptors) {
            const goalComp: any = acceptor.components.GoalAcceptor;
            if (!goalComp.item) {
                return T.puzzleMenu.validation.goalAcceptorNoItem;
            }
            const required: any = globalConfig.goalAcceptorItemsRequired;
            if (goalComp.currentDeliveredItems < required) {
                return T.puzzleMenu.validation.goalAcceptorRateNotMet;
            }
        }
        // Check if all buildings are within the area
        const entities: any = this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent);
        for (const entity: any of entities) {
            if (this.root.systemMgr.systems.zone.prePlacementCheck(entity) === STOP_PROPAGATION) {
                return T.puzzleMenu.validation.buildingOutOfBounds;
            }
        }
    }
}
