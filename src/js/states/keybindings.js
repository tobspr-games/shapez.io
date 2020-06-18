import { TextualGameState } from "../core/textual_game_state";
import { SOUNDS } from "../platform/sound";
import { T } from "../translations";
import { KEYMAPPINGS, getStringForKeyCode } from "../game/key_action_mapper";
import { Dialog } from "../core/modal_dialog_elements";
import { IS_DEMO } from "../core/config";

export class KeybindingsState extends TextualGameState {
    constructor() {
        super("KeybindingsState");
    }

    getStateHeaderTitle() {
        return T.keybindings.title;
    }

    getMainContentHTML() {
        return `

            <div class="topEntries">
                <span class="hint">${T.keybindings.hint}</span>
                <button class="styledButton resetBindings">${T.keybindings.resetKeybindings}</button>
            
            </div>

            <div class="keybindings">

            </div>
        `;
    }

    addEditField(elem, keybindingId, index = 0, builtin) {
        if (index) {
            keybindingId += "_" + index;
        }
        const mappingDiv = document.createElement("span");
        mappingDiv.classList.add("mapping", "mapping_" + index);

        const editBtn = document.createElement("button");
        editBtn.classList.add("styledButton", "editKeybinding", "editKeybinding_" + index);

        if (builtin) {
            editBtn.classList.add("disabled");
        } else {
            this.trackClicks(editBtn, () => this.editKeybinding(keybindingId));
        }
        elem.querySelector(".resetKeybinding,.addKeybinding").before(mappingDiv, editBtn);
    }

    onEnter() {
        const keybindingsElem = this.htmlElement.querySelector(".keybindings");

        this.trackClicks(this.htmlElement.querySelector(".resetBindings"), this.resetBindings);

        for (const category in KEYMAPPINGS) {
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("category");
            keybindingsElem.appendChild(categoryDiv);

            const labelDiv = document.createElement("strong");
            labelDiv.innerText = T.keybindings.categoryLabels[category] || `unset(${category})`;
            labelDiv.classList.add("categoryLabel");
            categoryDiv.appendChild(labelDiv);

            for (const keybindingId in KEYMAPPINGS[category]) {
                const mapped = KEYMAPPINGS[category][keybindingId];

                const elem = document.createElement("div");
                elem.classList.add("entry");
                elem.setAttribute("data-keybinding", keybindingId);
                categoryDiv.appendChild(elem);

                const title = document.createElement("span");
                title.classList.add("title");
                title.innerText = T.keybindings.mappings[keybindingId] || `unset(${keybindingId})`;
                elem.appendChild(title);

                const addBtn = document.createElement("button");
                addBtn.classList.add("styledButton", "addKeybinding");
                this.trackClicks(addBtn, () => {
                    let index = mapped.keyCodes.length;
                    mapped.keyCodes.push(0);
                    this.addEditField(elem, keybindingId, index, mapped.builtin);
                    this.editKeybinding(keybindingId + "_" + index);
                });
                elem.appendChild(addBtn);

                const resetBtn = document.createElement("button");
                resetBtn.classList.add("styledButton", "resetKeybinding");
                if (mapped.builtin) {
                    resetBtn.classList.add("disabled");
                } else {
                    this.trackClicks(resetBtn, () => this.resetKeybinding(keybindingId));
                }
                elem.appendChild(resetBtn);

                mapped.keyCodes = mapped.keyCodes.filter(Boolean);
                for (let i = 0; i < mapped.keyCodes.length; i++) {
                    this.addEditField(elem, keybindingId, i, mapped.builtin);
                }
            }
        }
        this.updateKeybindings();
    }

    editKeybinding(id) {
        // if (IS_DEMO) {
        //     this.dialogs.showFeatureRestrictionInfo(T.demo.features.customizeKeybindings);
        //     return;
        // }

        const dialog = new Dialog({
            app: this.app,
            title: T.dialogs.editKeybinding.title,
            contentHTML: T.dialogs.editKeybinding.desc,
            buttons: ["cancel:good"],
            type: "info",
        });

        dialog.inputReciever.keydown.add(({ keyCode, shift, alt, event }) => {
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
                keyCode === 13 ||
                // TAB
                keyCode === 9
            ) {
                // Ignore builtins
                return;
            }

            this.app.settings.updateKeybindingOverride(id, keyCode);

            this.dialogs.closeDialog(dialog);
            this.updateKeybindings();
        });

        dialog.inputReciever.backButton.add(() => {});
        this.dialogs.internalShowDialog(dialog);

        this.app.sound.playUiSound(SOUNDS.dialogOk);
    }

    updateKeybindings() {
        const overrides = this.app.settings.getKeybindingOverrides();
        for (const category in KEYMAPPINGS) {
            for (const keybindingId in KEYMAPPINGS[category]) {
                const mapped = KEYMAPPINGS[category][keybindingId];

                const container = this.htmlElement.querySelector("[data-keybinding='" + keybindingId + "']");
                assert(container, "Container for keybinding not found: " + keybindingId);

                let allRaw = true;
                for (let i = 0; i < mapped.keyCodes.length; i++) {
                    let raw = mapped.keyCodes[i];
                    let kid = keybindingId + (!i ? "" : "_" + i);
                    let over = overrides[kid];
                    let mappingDiv = container.querySelector(".mapping_" + i);
                    mappingDiv.innerHTML = getStringForKeyCode(over || raw);
                    mappingDiv.classList.toggle("changed", over != raw);
                    if (over && over != raw) {
                        allRaw = false;
                    }
                }

                const resetBtn = container.querySelector("button.resetKeybinding");
                resetBtn.classList.toggle("disabled", allRaw);
            }
        }
    }

    resetKeybinding(id) {
        this.app.settings.resetKeybindingOverride(id);
        this.updateKeybindings();
    }

    resetBindings() {
        const { reset } = this.dialogs.showWarning(
            T.dialogs.resetKeybindingsConfirmation.title,
            T.dialogs.resetKeybindingsConfirmation.desc,
            ["cancel:good", "reset:bad"]
        );

        reset.add(() => {
            this.app.settings.resetKeybindingOverrides();
            this.updateKeybindings();

            this.dialogs.showInfo(T.dialogs.keybindingsResetOk.title, T.dialogs.keybindingsResetOk.desc);
        });
    }

    getDefaultPreviousState() {
        return "SettingsState";
    }
}
