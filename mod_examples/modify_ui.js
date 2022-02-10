// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Modify UI",
    version: "1",
    id: "modify-ui",
    description: "Shows how to modify a builtin game state, in this case the main menu",
    minimumGameVersion: ">=1.5.0",

    // You can specify this parameter if savegames will still work
    // after your mod has been uninstalled
    doesNotAffectSavegame: true,
};

class Mod extends shapez.Mod {
    init() {
        // Add fancy sign to main menu
        this.signals.stateEntered.add(state => {
            if (state.key === "MainMenuState") {
                const element = document.createElement("div");
                element.id = "demo_mod_hello_world_element";
                document.body.appendChild(element);

                const button = document.createElement("button");
                button.classList.add("styledButton");
                button.innerText = "Hello!";
                button.addEventListener("click", () => {
                    this.dialogs.showInfo("Mod Message", "Button clicked!");
                });
                element.appendChild(button);
            }
        });

        this.modInterface.registerCss(`
                #demo_mod_hello_world_element {
                    position: absolute;
                    top: calc(10px * var(--ui-scale));
                    left: calc(10px * var(--ui-scale));
                    color: red;
                    z-index: 0;
                }

            `);
    }
}
