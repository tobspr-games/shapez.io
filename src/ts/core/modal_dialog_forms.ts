import { BaseItem } from "../game/base_item";
import { ClickDetector } from "./click_detector";
import { Signal } from "./signal";
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
export abstract class FormElement {
    public valueChosen = new Signal();

    constructor(public id: string, public label: string) {}

    abstract getHtml();

    getFormElement(parent: Element) {
        return parent.querySelector("[data-formId='" + this.id + "']") as HTMLFormElement;
    }

    abstract bindEvents(parent: Element, clickTrackers: ClickDetector[]);

    focus() {}

    isValid() {
        return true;
    }

    abstract getValue(): any;
}

export class FormElementInput extends FormElement {
    public placeholder: string;
    public defaultValue: string;
    public inputType: string;
    public validator: (str: string) => boolean;
    public element: HTMLFormElement = null;

    constructor({
        id,
        label = null,
        placeholder,
        defaultValue = "",
        inputType = "text",
        validator = null,
    }: {
        id: string;
        label?: string;
        placeholder: string;
        defaultValue?: string;
        inputType?: string;
        validator: (str: string) => boolean;
    }) {
        super(id, label);

        this.placeholder = placeholder;
        this.defaultValue = defaultValue;
        this.inputType = inputType;
        this.validator = validator;
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

    setValue(value) {
        this.element.value = value;
        this.updateErrorState();
    }

    focus() {
        this.element.focus();
        this.element.select();
    }
}
export class FormElementCheckbox extends FormElement {
    public defaultValue: boolean;
    public value: boolean;
    public element: Element = null;

    constructor({ id, label, defaultValue = true }: { id: string; label: string; defaultValue?: boolean }) {
        super(id, label);
        this.defaultValue = defaultValue;
        this.value = this.defaultValue;
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

    bindEvents(parent: Element, clickTrackers: ClickDetector[]) {
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

    // focus(parent) { }
}

export class FormElementItemChooser extends FormElement {
    public element: Element = null;
    public chosenItem: BaseItem = null;
    public items: any[];

    constructor({ id, label, items = [] }) {
        super(id, label);

        this.items = items;
    }

    getHtml() {
        let classes = [];
        return `
            <div class="formElement">
                ${this.label ? `<label>${this.label}</label>` : ""}
                <div class="ingameItemChooser input" data-formId="${this.id}"></div>
            </div>
            `;
    }

    bindEvents(parent: HTMLElement, clickTrackers: Array<ClickDetector>) {
        this.element = this.getFormElement(parent);

        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];

            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext("2d");
            item.drawFullSizeOnCanvas(context, 128);
            this.element.appendChild(canvas);
            const detector = new ClickDetector(canvas, {});

            clickTrackers.push(detector);
            detector.click.add(() => {
                this.chosenItem = item;
                this.valueChosen.dispatch(item);
            });
        }
    }

    isValid() {
        return true;
    }

    getValue() {
        return null;
    }

    focus() {}
}
