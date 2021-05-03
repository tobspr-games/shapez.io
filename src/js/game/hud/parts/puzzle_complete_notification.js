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

export class HUDPuzzleCompleteNotification extends BaseHUDPart {
    initialize() {
        this.visible = false;

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });

        this.root.signals.puzzleComplete.add(this.show, this);

        this.userDidLikePuzzle = false;
        this.timeOfCompletion = 0;
    }

    createElements(parent) {
        this.inputReciever = new InputReceiver("puzzle-complete");

        this.element = makeDiv(parent, "ingame_HUD_PuzzleCompleteNotification", ["noBlur"]);

        const dialog = makeDiv(this.element, null, ["dialog"]);

        this.elemTitle = makeDiv(dialog, null, ["title"], T.ingame.puzzleCompletion.title);
        this.elemContents = makeDiv(dialog, null, ["contents"]);
        this.elemActions = makeDiv(dialog, null, ["actions"]);

        const stepLike = makeDiv(this.elemContents, null, ["step", "stepLike"]);
        makeDiv(stepLike, null, ["title"], T.ingame.puzzleCompletion.titleLike);

        const likeButtons = makeDiv(stepLike, null, ["buttons"]);

        this.buttonLikeYes = document.createElement("button");
        this.buttonLikeYes.classList.add("liked-yes");
        likeButtons.appendChild(this.buttonLikeYes);
        this.trackClicks(this.buttonLikeYes, () => {
            this.userDidLikePuzzle = !this.userDidLikePuzzle;
            this.updateState();
        });

        this.btnClose = document.createElement("button");
        this.btnClose.classList.add("close", "styledButton");
        this.btnClose.innerText = T.ingame.puzzleCompletion.buttonSubmit;
        dialog.appendChild(this.btnClose);

        this.trackClicks(this.btnClose, this.close);
    }

    updateState() {
        this.buttonLikeYes.classList.toggle("active", this.userDidLikePuzzle === true);
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
            .trackCompleted(this.userDidLikePuzzle, Math.round(this.timeOfCompletion))
            .then(() => {
                // this.root.gameState.moveToState("PuzzleMenuState");
                this.visible = false;
                this.cleanup();
            });
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
