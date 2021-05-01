import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { enumColors } from "../../colors";
import { ColorItem } from "../../items/color_item";
import { PuzzlePlayGameMode } from "../../modes/puzzle_play";
import { finalGameShape, rocketShape } from "../../modes/regular";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

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

        const stepLike = makeDiv(this.elemContents, null, ["step", "stepLike"]);
        makeDiv(stepLike, null, ["title"], T.ingame.puzzleCompletion.titleLike);

        const buttons = makeDiv(stepLike, null, ["buttons"]);

        this.buttonLikeYes = document.createElement("button");
        this.buttonLikeYes.classList.add("liked-yes");
        buttons.appendChild(this.buttonLikeYes);
        this.trackClicks(this.buttonLikeYes, () => {
            this.selectionLiked = true;
            this.updateState();
        });

        this.buttonLikeNo = document.createElement("button");
        this.buttonLikeNo.classList.add("liked-no");
        buttons.appendChild(this.buttonLikeNo);
        this.trackClicks(this.buttonLikeNo, () => {
            this.selectionLiked = false;
            this.updateState();
        });

        const stepDifficulty = makeDiv(this.elemContents, null, ["step", "stepDifficulty"]);
        makeDiv(stepDifficulty, null, ["title"], T.ingame.puzzleCompletion.titleRating);

        const shapeContainer = makeDiv(stepDifficulty, null, ["shapes"]);
        const items = [
            new ColorItem(enumColors.red),
            this.root.shapeDefinitionMgr.getShapeItemFromShortKey("CuCuCuCu"),
            this.root.shapeDefinitionMgr.getShapeItemFromShortKey("WwWwWwWw"),
            this.root.shapeDefinitionMgr.getShapeItemFromShortKey("WrRgWrRg:CwCrCwCr:SgSgSgSg"),
            this.root.shapeDefinitionMgr.getShapeItemFromShortKey(finalGameShape),
            this.root.shapeDefinitionMgr.getShapeItemFromShortKey(rocketShape),
        ];

        this.difficultyCanvases = [];
        let index = 0;
        for (const shape of items) {
            const localIndex = index;
            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext("2d");
            shape.drawFullSizeOnCanvas(context, 128);
            shapeContainer.appendChild(canvas);
            this.trackClicks(canvas, () => {
                this.selectionDifficulty = localIndex;
                this.updateState();
            });
            this.difficultyCanvases.push(canvas);
            ++index;
        }

        this.btnClose = document.createElement("button");
        this.btnClose.classList.add("close", "styledButton");
        this.btnClose.innerText = T.ingame.puzzleCompletion.buttonSubmit;
        dialog.appendChild(this.btnClose);

        this.trackClicks(this.btnClose, this.close);
    }

    updateState() {
        this.buttonLikeYes.classList.toggle("active", this.selectionLiked === true);
        this.buttonLikeNo.classList.toggle("active", this.selectionLiked === false);
        this.difficultyCanvases.forEach((canvas, index) =>
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
