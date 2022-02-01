// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Sandbox",
    version: "1",
    id: "sandbox",
    description: "Blueprints are always unlocked and cost no money, also all buildings are unlocked",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        this.modInterface.replaceMethod(shapez.Blueprint, "getCost", function () {
            return 0;
        });
        this.modInterface.replaceMethod(shapez.HubGoals, "isRewardUnlocked", function () {
            return true;
        });
    }
}
