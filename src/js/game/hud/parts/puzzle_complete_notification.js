/* typehints:start */
import { PuzzlePlayGameMode } from "../../modes/puzzle_play";
/* typehints:end */

import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { enumColors } from "../../colors";
import { ColorItem } from "../../items/color_item";
import { finalGameShape, rocketShape } from "../../modes/regular";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { ShapeItem } from "../../items/shape_item";
import { ShapeDefinition } from "../../shape_definition";

export const PUZZLE_RATINGS = [
    new ColorItem(enumColors.red),
    new ShapeItem(ShapeDefinition.fromShortKey("CuCuCuCu")),
    new ShapeItem(ShapeDefinition.fromShortKey("WwWwWwWw")),
    new ShapeItem(ShapeDefinition.fromShortKey(finalGameShape)),
    new ShapeItem(ShapeDefinition.fromShortKey(rocketShape)),
];

export class HUDPuzzleCompleteNotification extends BaseHUDPart {
    initialize() {
        this.visible = false;

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });

        this.root.signals.puzzleComplete.add(this.show, this);

        this.selectionLiked = null;
        this.selectionDifficulty = null;
        this.timeOfCompletion = 0;
    }

    createElements(parent) {
        this.inputReciever = new InputReceiver("puzzle-complete");

        this.element = makeDiv(parent, "ingame_HUD_PuzzleCompleteNotification", ["noBlur"]);

        const dialog = makeDiv(this.element, null, ["dialog"]);

        this.elemTitle = makeDiv(dialog, null, ["title"], T.ingame.puzzleCompletion.title);
        this.elemContents = makeDiv(dialog, null, ["contents"]);
        this.elemActions = makeDiv(dialog, null, ["actions"]);

        const reportBtn = document.createElement("button");
        reportBtn.classList.add("styledButton", "report");
        reportBtn.innerHTML = T.ingame.puzzleEditorSettings.report;
        this.elemActions.appendChild(reportBtn);
        this.trackClicks(reportBtn, this.report);

        const shareBtn = document.createElement("button");
        shareBtn.classList.add("styledButton", "share");
        shareBtn.innerHTML = T.ingame.puzzleEditorSettings.share;
        this.elemActions.appendChild(shareBtn);
        this.trackClicks(shareBtn, this.share);

        const stepLike = makeDiv(this.elemContents, null, ["step", "stepLike"]);
        makeDiv(stepLike, null, ["title"], T.ingame.puzzleCompletion.titleLike);

        const likeButtons = makeDiv(stepLike, null, ["buttons"]);

        this.buttonLikeYes = document.createElement("button");
        this.buttonLikeYes.classList.add("liked-yes");
        likeButtons.appendChild(this.buttonLikeYes);
        this.trackClicks(this.buttonLikeYes, () => {
            this.selectionLiked = true;
            this.updateState();
        });

        this.buttonLikeNo = document.createElement("button");
        this.buttonLikeNo.classList.add("liked-no");
        likeButtons.appendChild(this.buttonLikeNo);
        this.trackClicks(this.buttonLikeNo, () => {
            this.selectionLiked = false;
            this.updateState();
        });

        const stepDifficulty = makeDiv(this.elemContents, null, ["step", "stepDifficulty"]);
        makeDiv(stepDifficulty, null, ["title"], T.ingame.puzzleCompletion.titleRating);

        const shapeContainer = makeDiv(stepDifficulty, null, ["shapes"]);

        this.difficultyElements = [];
        let index = 0;
        for (const shape of PUZZLE_RATINGS) {
            const localIndex = index;

            const elem = document.createElement("div");
            elem.classList.add("rating");
            shapeContainer.appendChild(elem);

            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext("2d");
            shape.drawFullSizeOnCanvas(context, 128);
            elem.appendChild(canvas);

            this.trackClicks(elem, () => {
                this.selectionDifficulty = localIndex;
                this.updateState();
            });
            this.difficultyElements.push(elem);

            const desc = document.createElement("div");
            desc.classList.add("description");
            desc.innerText = T.ingame.puzzleCompletion.difficulties[localIndex];
            elem.appendChild(desc);
            ++index;
        }

        this.btnClose = document.createElement("button");
        this.btnClose.classList.add("close", "styledButton");
        this.btnClose.innerText = T.ingame.puzzleCompletion.buttonSubmit;
        dialog.appendChild(this.btnClose);

        this.trackClicks(this.btnClose, this.close);
    }

    share() {
        const mode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        mode.sharePuzzle();
    }

    report() {
        const mode = /** @type {PuzzlePlayGameMode} */ (this.root.gameMode);
        mode.reportPuzzle();
    }

    updateState() {
        this.buttonLikeYes.classList.toggle("active", this.selectionLiked === true);
        this.buttonLikeNo.classList.toggle("active", this.selectionLiked === false);
        this.difficultyElements.forEach((canvas, index) =>
            canvas.classList.toggle("active", index === this.selectionDifficulty)
        );

        this.btnClose.classList.toggle(
            "visible",
            typeof this.selectionDifficulty === "number" && typeof this.selectionLiked === "boolean"
        );
    }

    show() {
        this.root.soundProxy.playUi(SOUNDS.levelComplete);
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.visible = true;
        this.timeOfCompletion = this.root.time.now();
    }

    cleanup() {
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
    }

    isBlockingOverlay() {
        return this.visible;
    }

    close() {
        /** @type {PuzzlePlayGameMode} */ (this.root.gameMode)
            .trackCompleted(this.selectionLiked, this.selectionDifficulty, Math.round(this.timeOfCompletion))
            .then(() => {
                this.root.gameState.moveToState("PuzzleMenuState");
            });
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
