import { InputReceiver } from "../../../core/input_receiver";
import { TrackedState } from "../../../core/tracked_state";
import { makeDiv } from "../../../core/utils";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { T } from "../../../translations";

const tutorialVideos = [2, 3, 4, 5, 6, 7, 9, 10, 11];

export class HUDPartTutorialHints extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_TutorialHints",
            [],
            `
        <div class="header">
            <span>${T.ingame.tutorialHints.title}</span>
            <button class="styledButton toggleHint">
                <span class="show">${T.ingame.tutorialHints.showHint}</span>
                <span class="hide">${T.ingame.tutorialHints.hideHint}</span>
            </button>
        </div>

        <video autoplay muted loop class="fullscreenBackgroundVideo">
            <source type="video/webm">
        </video>
        `
        );

        this.videoElement = this.element.querySelector("video");
    }

    shouldPauseGame() {
        return this.enlarged;
    }

    initialize() {
        this.trackClicks(this.element.querySelector(".toggleHint"), this.toggleHintEnlarged);

        this.videoAttach = new DynamicDomAttach(this.root, this.videoElement, {
            timeToKeepSeconds: 0.3,
        });

        this.videoAttach.update(false);
        this.enlarged = false;

        this.inputReciever = new InputReceiver("tutorial_hints");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);
        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.currentShownLevel = new TrackedState(this.updateVideoUrl, this);
    }

    updateVideoUrl(level) {
        if (tutorialVideos.indexOf(level) < 0) {
            this.videoElement.querySelector("source").setAttribute("src", "");
            this.videoElement.pause();
        } else {
            this.videoElement
                .querySelector("source")
                .setAttribute("src", "https://static.shapez.io/tutorial_videos/level_" + level + ".webm");
            this.videoElement.currentTime = 0;
            this.videoElement.load();
        }
    }

    close() {
        this.enlarged = false;
        this.element.classList.remove("enlarged", "noBlur");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    show() {
        this.element.classList.add("enlarged", "noBlur");
        this.enlarged = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.update();

        this.videoElement.currentTime = 0;
        this.videoElement.play();
    }

    update() {
        this.videoAttach.update(this.enlarged);

        this.currentShownLevel.set(this.root.hubGoals.level);

        const tutorialVisible = tutorialVideos.indexOf(this.root.hubGoals.level) >= 0;
        this.domAttach.update(tutorialVisible);
    }

    toggleHintEnlarged() {
        if (this.enlarged) {
            this.close();
        } else {
            this.show();
        }
    }
}
