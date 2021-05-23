/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { Signal, STOP_PROPAGATION } from "./signal";
import { arrayDeleteValue, waitNextFrame } from "./utils";
import { ClickDetector } from "./click_detector";
import { SOUNDS } from "../platform/sound";
import { InputReceiver } from "./input_receiver";
import { FormElement } from "./modal_dialog_forms";
import { globalConfig } from "./config";
import { getStringForKeyCode } from "../game/key_action_mapper";
import { createLogger } from "./logging";
import { T } from "../translations";

/*
 * ***************************************************
 *
 *  LEGACY CODE WARNING
 *
 *  This is old code from yorg3.io and needs to be refactored
 *  @TODO
 *
 * ***************************************************
 */

const kbEnter = 13;
const kbCancel = 27;

const logger = createLogger("dialogs");

/**
 * Basic text based dialog
 */
export class Dialog {
    /**
     *
     * Constructs a new dialog with the given options
     * @param {object} param0
     * @param {Application} param0.app
     * @param {string} param0.title Title of the dialog
     * @param {string} param0.contentHTML Inner dialog html
     * @param {Array<string>} param0.buttons
     *  Button list, each button contains of up to 3 parts separated by ':'.
     *  Part 0: The id, one of the one defined in dialog_buttons.yaml
     *  Part 1: The style, either good, bad or misc
     *  Part 2 (optional): Additional parameters separated by '/', available are:
     *    timeout: This button is only available after some waiting time
     *    kb_enter: This button is triggered by the enter key
     *    kb_escape This button is triggered by the escape key
     * @param {string=} param0.type The dialog type, either "info" or "warn"
     * @param {boolean=} param0.closeButton Whether this dialog has a close button
     */
    constructor({ app, title, contentHTML, buttons, type = "info", closeButton = false }) {
        this.app = app;
        this.title = title;
        this.contentHTML = contentHTML;
        this.type = type;
        this.buttonIds = buttons;
        this.closeButton = closeButton;

        this.closeRequested = new Signal();
        this.buttonSignals = {};

        for (let i = 0; i < buttons.length; ++i) {
            if (G_IS_DEV && globalConfig.debug.disableTimedButtons) {
                this.buttonIds[i] = this.buttonIds[i].replace(":timeout", "");
            }

            const buttonId = this.buttonIds[i].split(":")[0];
            this.buttonSignals[buttonId] = new Signal();
        }

        this.valueChosen = new Signal();

        this.timeouts = [];
        this.clickDetectors = [];

        this.inputReciever = new InputReceiver("dialog-" + this.title);

        this.inputReciever.keydown.add(this.handleKeydown, this);

        this.enterHandler = null;
        this.escapeHandler = null;
    }

    /**
     * Internal keydown handler
     * @param {object} param0
     * @param {number} param0.keyCode
     * @param {boolean} param0.shift
     * @param {boolean} param0.alt
     */
    handleKeydown({ keyCode, shift, alt }) {
        if (keyCode === kbEnter && this.enterHandler) {
            this.internalButtonHandler(this.enterHandler);
            return STOP_PROPAGATION;
        }

        if (keyCode === kbCancel && this.escapeHandler) {
            this.internalButtonHandler(this.escapeHandler);
            return STOP_PROPAGATION;
        }
    }

    internalButtonHandler(id, ...payload) {
        this.app.inputMgr.popReciever(this.inputReciever);

        if (id !== "close-button") {
            this.buttonSignals[id].dispatch(...payload);
        }
        this.closeRequested.dispatch();
    }

    createElement() {
        const elem = document.createElement("div");
        elem.classList.add("ingameDialog");

        this.dialogElem = document.createElement("div");
        this.dialogElem.classList.add("dialogInner");

        if (this.type) {
            this.dialogElem.classList.add(this.type);
        }
        elem.appendChild(this.dialogElem);

        const title = document.createElement("h1");
        title.innerText = this.title;
        title.classList.add("title");
        this.dialogElem.appendChild(title);

        if (this.closeButton) {
            this.dialogElem.classList.add("hasCloseButton");

            const closeBtn = document.createElement("button");
            closeBtn.classList.add("closeButton");

            this.trackClicks(closeBtn, () => this.internalButtonHandler("close-button"), {
                applyCssClass: "pressedSmallElement",
            });

            title.appendChild(closeBtn);
            this.inputReciever.backButton.add(() => this.internalButtonHandler("close-button"));
        }

        const content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = this.contentHTML;
        this.dialogElem.appendChild(content);

        if (this.buttonIds.length > 0) {
            const buttons = document.createElement("div");
            buttons.classList.add("buttons");

            // Create buttons
            for (let i = 0; i < this.buttonIds.length; ++i) {
                const [buttonId, buttonStyle, rawParams] = this.buttonIds[i].split(":");

                const button = document.createElement("button");
                button.classList.add("button");
                button.classList.add("styledButton");
                button.classList.add(buttonStyle);
                button.innerText = T.dialogs.buttons[buttonId];

                const params = (rawParams || "").split("/");
                const useTimeout = params.indexOf("timeout") >= 0;

                const isEnter = params.indexOf("enter") >= 0;
                const isEscape = params.indexOf("escape") >= 0;

                if (isEscape && this.closeButton) {
                    logger.warn("Showing dialog with close button, and additional cancel button");
                }

                if (useTimeout) {
                    button.classList.add("timedButton");
                    const timeout = setTimeout(() => {
                        button.classList.remove("timedButton");
                        arrayDeleteValue(this.timeouts, timeout);
                    }, 3000);
                    this.timeouts.push(timeout);
                }
                if (isEnter || isEscape) {
                    // if (this.app.settings.getShowKeyboardShortcuts()) {
                    // Show keybinding
                    const spacer = document.createElement("code");
                    spacer.classList.add("keybinding");
                    spacer.innerHTML = getStringForKeyCode(isEnter ? kbEnter : kbCancel);
                    button.appendChild(spacer);
                    // }

                    if (isEnter) {
                        this.enterHandler = buttonId;
                    }
                    if (isEscape) {
                        this.escapeHandler = buttonId;
                    }
                }

                this.trackClicks(button, () => this.internalButtonHandler(buttonId));
                buttons.appendChild(button);
            }

            this.dialogElem.appendChild(buttons);
        } else {
            this.dialogElem.classList.add("buttonless");
        }

        this.element = elem;
        this.app.inputMgr.pushReciever(this.inputReciever);

        return this.element;
    }

    setIndex(index) {
        this.element.style.zIndex = index;
    }

    destroy() {
        if (!this.element) {
            assert(false, "Tried to destroy dialog twice");
            return;
        }
        // We need to do this here, because if the backbutton event gets
        // dispatched to the modal dialogs, it will not call the internalButtonHandler,
        // and thus our receiver stays attached the whole time
        this.app.inputMgr.destroyReceiver(this.inputReciever);

        for (let i = 0; i < this.clickDetectors.length; ++i) {
            this.clickDetectors[i].cleanup();
        }
        this.clickDetectors = [];

        this.element.remove();
        this.element = null;

        for (let i = 0; i < this.timeouts.length; ++i) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
    }

    hide() {
        this.element.classList.remove("visible");
    }

    show() {
        this.element.classList.add("visible");
    }

    /**
     * Helper method to track clicks on an element
     * @param {Element} elem
     * @param {function():void} handler
     * @param {import("./click_detector").ClickDetectorConstructorArgs=} args
     * @returns {ClickDetector}
     */
    trackClicks(elem, handler, args = {}) {
        const detector = new ClickDetector(elem, args);
        detector.click.add(handler, this);
        this.clickDetectors.push(detector);
        return detector;
    }
}

/**
 * Dialog which simply shows a loading spinner
 */
export class DialogLoading extends Dialog {
    constructor(app, text = "") {
        super({
            app,
            title: "",
            contentHTML: "",
            buttons: [],
            type: "loading",
        });

        // Loading dialog can not get closed with back button
        this.inputReciever.backButton.removeAll();
        this.inputReciever.context = "dialog-loading";

        this.text = text;
    }

    createElement() {
        const elem = document.createElement("div");
        elem.classList.add("ingameDialog");
        elem.classList.add("loadingDialog");
        this.element = elem;

        if (this.text) {
            const text = document.createElement("div");
            text.classList.add("text");
            text.innerText = this.text;
            elem.appendChild(text);
        }

        const loader = document.createElement("div");
        loader.classList.add("prefab_LoadingTextWithAnim");
        loader.classList.add("loadingIndicator");
        elem.appendChild(loader);

        this.app.inputMgr.pushReciever(this.inputReciever);

        return elem;
    }
}

export class DialogOptionChooser extends Dialog {
    constructor({ app, title, options }) {
        let html = "<div class='optionParent'>";

        options.options.forEach(({ value, text, desc = null, iconPrefix = null }) => {
            const descHtml = desc ? `<span class="desc">${desc}</span>` : "";
            let iconHtml = iconPrefix ? `<span class="icon icon-${iconPrefix}-${value}"></span>` : "";
            html += `
                <div class='option ${value === options.active ? "active" : ""} ${
                iconPrefix ? "hasIcon" : ""
            }' data-optionvalue='${value}'>
                    ${iconHtml}
                    <span class='title'>${text}</span>
                    ${descHtml}
                </div>
                `;
        });

        html += "</div>";
        super({
            app,
            title,
            contentHTML: html,
            buttons: [],
            type: "info",
            closeButton: true,
        });

        this.options = options;
        this.initialOption = options.active;

        this.buttonSignals.optionSelected = new Signal();
    }

    createElement() {
        const div = super.createElement();
        this.dialogElem.classList.add("optionChooserDialog");

        div.querySelectorAll("[data-optionvalue]").forEach(handle => {
            const value = handle.getAttribute("data-optionvalue");
            if (!handle) {
                logger.error("Failed to bind option value in dialog:", value);
                return;
            }
            // Need click detector here to forward elements, otherwise scrolling does not work
            const detector = new ClickDetector(handle, {
                consumeEvents: false,
                preventDefault: false,
                clickSound: null,
                applyCssClass: "pressedOption",
                targetOnly: true,
            });
            this.clickDetectors.push(detector);

            if (value !== this.initialOption) {
                detector.click.add(() => {
                    const selected = div.querySelector(".option.active");
                    if (selected) {
                        selected.classList.remove("active");
                    } else {
                        logger.warn("No selected option");
                    }
                    handle.classList.add("active");
                    this.app.sound.playUiSound(SOUNDS.uiClick);
                    this.internalButtonHandler("optionSelected", value);
                });
            }
        });
        return div;
    }
}

export class DialogWithForm extends Dialog {
    /**
     *
     * @param {object} param0
     * @param {Application} param0.app
     * @param {string} param0.title
     * @param {string} param0.desc
     * @param {array=} param0.buttons
     * @param {string=} param0.confirmButtonId
     * @param {string=} param0.extraButton
     * @param {boolean=} param0.closeButton
     * @param {Array<FormElement>} param0.formElements
     */
    constructor({
        app,
        title,
        desc,
        formElements,
        buttons = ["cancel", "ok:good"],
        confirmButtonId = "ok",
        closeButton = true,
    }) {
        let html = "";
        html += desc + "<br>";
        for (let i = 0; i < formElements.length; ++i) {
            html += formElements[i].getHtml();
        }

        super({
            app,
            title: title,
            contentHTML: html,
            buttons: buttons,
            type: "info",
            closeButton,
        });
        this.confirmButtonId = confirmButtonId;
        this.formElements = formElements;

        this.enterHandler = confirmButtonId;
    }

    internalButtonHandler(id, ...payload) {
        if (id === this.confirmButtonId) {
            if (this.hasAnyInvalid()) {
                this.dialogElem.classList.remove("errorShake");
                waitNextFrame().then(() => {
                    if (this.dialogElem) {
                        this.dialogElem.classList.add("errorShake");
                    }
                });
                this.app.sound.playUiSound(SOUNDS.uiError);
                return;
            }
        }

        super.internalButtonHandler(id, payload);
    }

    hasAnyInvalid() {
        for (let i = 0; i < this.formElements.length; ++i) {
            if (!this.formElements[i].isValid()) {
                return true;
            }
        }
        return false;
    }

    createElement() {
        const div = super.createElement();

        for (let i = 0; i < this.formElements.length; ++i) {
            const elem = this.formElements[i];
            elem.bindEvents(div, this.clickDetectors);
            // elem.valueChosen.add(this.closeRequested.dispatch, this.closeRequested);
            elem.valueChosen.add(this.valueChosen.dispatch, this.valueChosen);
        }

        waitNextFrame().then(() => {
            this.formElements[this.formElements.length - 1].focus();
        });

        return div;
    }
}
