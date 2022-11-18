/* typehints:start */
import type { PuzzlePlayGameMode } from "../../modes/puzzle_play";
/* typehints:end */
import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
export class HUDPuzzleCompleteNotification extends BaseHUDPart {
    initialize(): any {
        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });
        this.root.signals.puzzleComplete.add(this.show, this);
        this.userDidLikePuzzle = false;
        this.timeOfCompletion = 0;
    }
    createElements(parent: any): any {
        this.inputReciever = new InputReceiver("puzzle-complete");
        this.element = makeDiv(parent, "ingame_HUD_PuzzleCompleteNotification", ["noBlur"]);
        const dialog: any = makeDiv(this.element, null, ["dialog"]);
        this.elemTitle = makeDiv(dialog, null, ["title"], T.ingame.puzzleCompletion.title);
        this.elemContents = makeDiv(dialog, null, ["contents"]);
        this.elemActions = makeDiv(dialog, null, ["actions"]);
        const stepLike: any = makeDiv(this.elemContents, null, ["step", "stepLike"]);
        makeDiv(stepLike, null, ["title"], T.ingame.puzzleCompletion.titleLike);
        const likeButtons: any = makeDiv(stepLike, null, ["buttons"]);
        this.buttonLikeYes = document.createElement("button");
        this.buttonLikeYes.classList.add("liked-yes");
        likeButtons.appendChild(this.buttonLikeYes);
        this.trackClicks(this.buttonLikeYes, (): any => {
            this.userDidLikePuzzle = !this.userDidLikePuzzle;
            this.updateState();
        });
        const buttonBar: any = document.createElement("div");
        buttonBar.classList.add("buttonBar");
        this.elemContents.appendChild(buttonBar);
        this.continueBtn = document.createElement("button");
        this.continueBtn.classList.add("continue", "styledButton");
        this.continueBtn.innerText = T.ingame.puzzleCompletion.continueBtn;
        buttonBar.appendChild(this.continueBtn);
        this.trackClicks(this.continueBtn, (): any => {
            this.close(false);
        });
        this.menuBtn = document.createElement("button");
        this.menuBtn.classList.add("menu", "styledButton");
        this.menuBtn.innerText = T.ingame.puzzleCompletion.menuBtn;
        buttonBar.appendChild(this.menuBtn);
        this.trackClicks(this.menuBtn, (): any => {
            this.close(true);
        });
        const gameMode: any = (this.root.gameMode as PuzzlePlayGameMode);
        if (gameMode.nextPuzzles.length > 0) {
            this.nextPuzzleBtn = document.createElement("button");
            this.nextPuzzleBtn.classList.add("nextPuzzle", "styledButton");
            this.nextPuzzleBtn.innerText = T.ingame.puzzleCompletion.nextPuzzle;
            buttonBar.appendChild(this.nextPuzzleBtn);
            this.trackClicks(this.nextPuzzleBtn, (): any => {
                this.nextPuzzle();
            });
        }
    }
    updateState(): any {
        this.buttonLikeYes.classList.toggle("active", this.userDidLikePuzzle === true);
    }
    show(): any {
        this.root.soundProxy.playUi(SOUNDS.levelComplete);
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.visible = true;
        this.timeOfCompletion = this.root.time.now();
    }
    cleanup(): any {
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
    }
    isBlockingOverlay(): any {
        return this.visible;
    }
    nextPuzzle(): any {
        const gameMode: any = (this.root.gameMode as PuzzlePlayGameMode);
        gameMode.trackCompleted(this.userDidLikePuzzle, Math.round(this.timeOfCompletion)).then((): any => {
            this.root.gameState.moveToState("PuzzleMenuState", {
                continueQueue: gameMode.nextPuzzles,
            });
        });
    }
    close(toMenu: any): any {
        this.root.gameMode as PuzzlePlayGameMode)
            .trackCompleted(this.userDidLikePuzzle, Math.round(this.timeOfCompletion))
            .then((): any => {
            if (toMenu) {
                this.root.gameState.moveToState("PuzzleMenuState");
            }
            else {
                this.visible = false;
                this.cleanup();
            }
        });
    }
    update(): any {
        this.domAttach.update(this.visible);
    }
}
