import { Dialog } from "../core/modal_dialog_elements";
import { TextualGameState } from "../core/textual_game_state";
import { getStringForKeyCode, KEYMAPPINGS } from "../game/key_action_mapper";
import { SOUNDS } from "../platform/sound";
import { T } from "../translations";
export class KeybindingsState extends TextualGameState {

    constructor() {
        super("KeybindingsState");
    }
    getStateHeaderTitle(): any {
        return T.keybindings.title;
    }
    getMainContentHTML(): any {
        return `

            <div class="topEntries">
                <span class="hint">${T.keybindings.hint}</span>
                <button class="styledButton resetBindings">${T.keybindings.resetKeybindings}</button>

            </div>

            <div class="keybindings">

            </div>
        `;
    }
    onEnter(): any {
        const keybindingsElem: any = this.htmlElement.querySelector(".keybindings");
        this.trackClicks(this.htmlElement.querySelector(".resetBindings"), this.resetBindings);
        for (const category: any in KEYMAPPINGS) {
            if (Object.keys(KEYMAPPINGS[category]).length === 0) {
                continue;
            }
            const categoryDiv: any = document.createElement("div");
            categoryDiv.classList.add("category");
            keybindingsElem.appendChild(categoryDiv);
            const labelDiv: any = document.createElement("strong");
            labelDiv.innerText = T.keybindings.categoryLabels[category];
            labelDiv.classList.add("categoryLabel");
            categoryDiv.appendChild(labelDiv);
            for (const keybindingId: any in KEYMAPPINGS[category]) {
                const mapped: any = KEYMAPPINGS[category][keybindingId];
                const elem: any = document.createElement("div");
                elem.classList.add("entry");
                elem.setAttribute("data-keybinding", keybindingId);
                categoryDiv.appendChild(elem);
                const title: any = document.createElement("span");
                title.classList.add("title");
                title.innerText = T.keybindings.mappings[keybindingId];
                elem.appendChild(title);
                const mappingDiv: any = document.createElement("span");
                mappingDiv.classList.add("mapping");
                elem.appendChild(mappingDiv);
                const editBtn: any = document.createElement("button");
                editBtn.classList.add("styledButton", "editKeybinding");
                const resetBtn: any = document.createElement("button");
                resetBtn.classList.add("styledButton", "resetKeybinding");
                if (mapped.builtin) {
                    editBtn.classList.add("disabled");
                    resetBtn.classList.add("disabled");
                }
                else {
                    this.trackClicks(editBtn, (): any => this.editKeybinding(keybindingId));
                    this.trackClicks(resetBtn, (): any => this.resetKeybinding(keybindingId));
                }
                elem.appendChild(editBtn);
                elem.appendChild(resetBtn);
            }
        }
        this.updateKeybindings();
    }
    editKeybinding(id: any): any {
        const dialog: any = new Dialog({
            app: this.app,
            title: T.dialogs.editKeybinding.title,
            contentHTML: T.dialogs.editKeybinding.desc,
            buttons: ["cancel:good"],
            type: "info",
        });
        dialog.inputReciever.keydown.add(({ keyCode, shift, alt, event }: any): any => {
            if (keyCode === 27) {
                this.dialogs.closeDialog(dialog);
                return;
            }
            if (event) {
                event.preventDefault();
            }
            if (event.target && event.target.tagName === "BUTTON" && keyCode === 1) {
                return;
            }
            if (
            // Enter
            keyCode === 13) {
                // Ignore builtins
                return;
            }
            this.app.settings.updateKeybindingOverride(id, keyCode);
            this.dialogs.closeDialog(dialog);
            this.updateKeybindings();
        });
        dialog.inputReciever.backButton.add((): any => { });
        this.dialogs.internalShowDialog(dialog);
        this.app.sound.playUiSound(SOUNDS.dialogOk);
    }
    updateKeybindings(): any {
        const overrides: any = this.app.settings.getKeybindingOverrides();
        for (const category: any in KEYMAPPINGS) {
            for (const keybindingId: any in KEYMAPPINGS[category]) {
                const mapped: any = KEYMAPPINGS[category][keybindingId];
                const container: any = this.htmlElement.querySelector("[data-keybinding='" + keybindingId + "']");
                assert(container, "Container for keybinding not found: " + keybindingId);
                let keyCode: any = mapped.keyCode;
                if (overrides[keybindingId]) {
                    keyCode = overrides[keybindingId];
                }
                const mappingDiv: any = container.querySelector(".mapping");
                let modifiers: any = "";
                if (mapped.modifiers && mapped.modifiers.shift) {
                    modifiers += "⇪ ";
                }
                if (mapped.modifiers && mapped.modifiers.alt) {
                    modifiers += T.global.keys.alt + " ";
                }
                if (mapped.modifiers && mapped.modifiers.ctrl) {
                    modifiers += T.global.keys.control + " ";
                }
                mappingDiv.innerHTML = modifiers + getStringForKeyCode(keyCode);
                mappingDiv.classList.toggle("changed", !!overrides[keybindingId]);
                const resetBtn: any = container.querySelector("button.resetKeybinding");
                resetBtn.classList.toggle("disabled", mapped.builtin || !overrides[keybindingId]);
            }
        }
    }
    resetKeybinding(id: any): any {
        this.app.settings.resetKeybindingOverride(id);
        this.updateKeybindings();
    }
    resetBindings(): any {
        const { reset }: any = this.dialogs.showWarning(T.dialogs.resetKeybindingsConfirmation.title, T.dialogs.resetKeybindingsConfirmation.desc, ["cancel:good", "reset:bad"]);
        reset.add((): any => {
            this.app.settings.resetKeybindingOverrides();
            this.updateKeybindings();
            this.dialogs.showInfo(T.dialogs.keybindingsResetOk.title, T.dialogs.keybindingsResetOk.desc);
        });
    }
    getDefaultPreviousState(): any {
        return "SettingsState";
    }
}
