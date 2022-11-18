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
export class FormElement {
    public id = id;
    public label = label;
    public valueChosen = new Signal();

    constructor(id, label) {
    }
    getHtml(): any {
        abstract;
        return "";
    }
    getFormElement(parent: any): any {
        return parent.querySelector("[data-formId='" + this.id + "']");
    }
    bindEvents(parent: any, clickTrackers: any): any {
        abstract;
    }
    focus(): any { }
    isValid(): any {
        return true;
    }
    /** {} */
    getValue(): any {
        abstract;
    }
}
export class FormElementInput extends FormElement {
    public placeholder = placeholder;
    public defaultValue = defaultValue;
    public inputType = inputType;
    public validator = validator;
    public element = null;

    constructor({ id, label = null, placeholder, defaultValue = "", inputType = "text", validator = null }) {
        super(id, label);
    }
    getHtml(): any {
        let classes: any = [];
        let inputType: any = "text";
        let maxlength: any = 256;
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
    bindEvents(parent: any, clickTrackers: any): any {
        this.element = this.getFormElement(parent);
        this.element.addEventListener("input", (event: any): any => this.updateErrorState());
        this.updateErrorState();
    }
    updateErrorState(): any {
        this.element.classList.toggle("errored", !this.isValid());
    }
    isValid(): any {
        return !this.validator || this.validator(this.element.value);
    }
    getValue(): any {
        return this.element.value;
    }
    setValue(value: any): any {
        this.element.value = value;
        this.updateErrorState();
    }
    focus(): any {
        this.element.focus();
        this.element.select();
    }
}
export class FormElementCheckbox extends FormElement {
    public defaultValue = defaultValue;
    public value = this.defaultValue;
    public element = null;

    constructor({ id, label, defaultValue = true }) {
        super(id, label);
    }
    getHtml(): any {
        return `
            <div class="formElement checkBoxFormElem">
            ${this.label ? `<label>${this.label}</label>` : ""}
                <div class="checkbox ${this.defaultValue ? "checked" : ""}" data-formId='${this.id}'>
                    <span class="knob"></span >
                </div >
            </div>
        `;
    }
    bindEvents(parent: any, clickTrackers: any): any {
        this.element = this.getFormElement(parent);
        const detector: any = new ClickDetector(this.element, {
            consumeEvents: false,
            preventDefault: false,
        });
        clickTrackers.push(detector);
        detector.click.add(this.toggle, this);
    }
    getValue(): any {
        return this.value;
    }
    toggle(): any {
        this.value = !this.value;
        this.element.classList.toggle("checked", this.value);
    }
    focus(parent: any): any { }
}
export class FormElementItemChooser extends FormElement {
    public items = items;
    public element = null;
    public chosenItem: BaseItem = null;

        constructor({ id, label, items = [] }) {
        super(id, label);
    }
    getHtml(): any {
        let classes: any = [];
        return `
            <div class="formElement">
                ${this.label ? `<label>${this.label}</label>` : ""}
                <div class="ingameItemChooser input" data-formId="${this.id}"></div>
            </div>
            `;
    }
        bindEvents(parent: HTMLElement, clickTrackers: Array<ClickDetector>): any {
        this.element = this.getFormElement(parent);
        for (let i: any = 0; i < this.items.length; ++i) {
            const item: any = this.items[i];
            const canvas: any = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const context: any = canvas.getContext("2d");
            item.drawFullSizeOnCanvas(context, 128);
            this.element.appendChild(canvas);
            const detector: any = new ClickDetector(canvas, {});
            clickTrackers.push(detector);
            detector.click.add((): any => {
                this.chosenItem = item;
                this.valueChosen.dispatch(item);
            });
        }
    }
    isValid(): any {
        return true;
    }
    getValue(): any {
        return null;
    }
    focus(): any { }
}
