// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Pasting",
    version: "1",
    id: "pasting",
    description: "Shows how to properly receive paste events ingame",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        this.signals.gameInitialized.add(root => {
            root.gameState.inputReciever.paste.add(event => {
                event.preventDefault();

                const data = event.clipboardData.getData("text");
                this.dialogs.showInfo("Pasted", `You pasted: '${data}'`);
            });
        });
    }
}
