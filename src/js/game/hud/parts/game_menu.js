import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDGameMenu extends BaseHUDPart {
    initialize() {}
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_GameMenu");

        const buttons = [
            {
                id: "shop",
                label: "Upgrades",
                handler: () => this.root.hud.parts.shop.show(),
                keybinding: "menu_open_shop",
            },
            {
                id: "stats",
                label: "Stats",
                handler: () => null,
                keybinding: "menu_open_stats",
            },
        ];

        buttons.forEach(({ id, label, handler, keybinding }) => {
            const button = document.createElement("button");
            button.setAttribute("data-button-id", id);
            this.element.appendChild(button);
            this.trackClicks(button, handler);

            if (keybinding) {
                const binding = this.root.gameState.keyActionMapper.getBinding(keybinding);
                binding.add(handler);
                binding.appendLabelToElement(button);
            }
        });

        const menuButtons = makeDiv(this.element, null, ["menuButtons"]);

        this.musicButton = makeDiv(menuButtons, null, ["button", "music"]);
        this.sfxButton = makeDiv(menuButtons, null, ["button", "sfx"]);
        this.settingsButton = makeDiv(menuButtons, null, ["button", "settings"]);
    }
}
