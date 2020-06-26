import { ClickDetector } from "./click_detector";

export class FormElement {
    constructor(id, label) {
        this.id = id;
        this.label = label;
    }

    getHtml() {
        abstract;
        return "";
    }

    getFormElement(parent) {
        return parent.querySelector("[data-formId='" + this.id + "']");
    }

    bindEvents(parent, clickTrackers) {
        abstract;
    }

    focus() {}

    isValid() {
        return true;
    }

    /** @returns {any} */
    getValue() {
        abstract;
    }
}

export class FormElementInput extends FormElement {
    constructor({ id, label = null, placeholder, defaultValue = "", inputType = "text", validator = null }) {
        super(id, label);
        this.placeholder = placeholder;
        this.defaultValue = defaultValue;
        this.inputType = inputType;
        this.validator = validator;

        this.element = null;
    }

    getHtml() {
        let classes = [];
        let inputType = "text";
        let maxlength = 256;
        switch (this.inputType) {
            case "text": {
                classes.push("input-text");
                break;
            }

            case "email": {
                classes.push("input-email");
                inputType = "email";
                break;
            }

            case "token": {
                classes.push("input-token");
                inputType = "text";
                maxlength = 4;
                break;
            }
        }

        return `
            <div class="formElement input">
                ${this.label ? `<label>${this.label}</label>` : ""}
                <input
                    type="${inputType}"
                    value="${this.defaultValue.replace(/["\\]+/gi, "")}"
                    maxlength="${maxlength}"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="${classes.join(" ")}"
                    placeholder="${this.placeholder.replace(/["\\]+/gi, "")}"
                    data-formId="${this.id}">
            </div>
        `;
    }

    bindEvents(parent, clickTrackers) {
        this.element = this.getFormElement(parent);
        this.element.addEventListener("input", event => this.updateErrorState());
        this.updateErrorState();
    }

    updateErrorState() {
        this.element.classList.toggle("errored", !this.isValid());
    }

    isValid() {
        return !this.validator || this.validator(this.element.value);
    }

    getValue() {
        return this.element.value;
    }

    focus() {
        this.element.focus();
    }
}

export class FormElementCheckbox extends FormElement {
    constructor({ id, label, defaultValue = true }) {
        super(id, label);
        this.defaultValue = defaultValue;
        this.value = this.defaultValue;

        this.element = null;
    }

    getHtml() {
        return `
            <div class="formElement checkBoxFormElem">
            ${this.label ? `<label>${this.label}</label>` : ""}
                <div class="checkbox ${this.defaultValue ? "checked" : ""}" data-formId='${this.id}'>
                    <span class="knob"></span >
                </div >
            </div>
        `;
    }

    bindEvents(parent, clickTrackers) {
        this.element = this.getFormElement(parent);
        const detector = new ClickDetector(this.element, {
            consumeEvents: false,
            preventDefault: false,
        });
        clickTrackers.push(detector);
        detector.click.add(this.toggle, this);
    }

    getValue() {
        return this.value;
    }

    toggle() {
        this.value = !this.value;
        this.element.classList.toggle("checked", this.value);
    }

    focus(parent) {}
}
