// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Modify existing building",
    version: "1",
    id: "modify-existing-building",
    description: "Shows how to modify an existing building",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        // Make Rotator always unlocked
        this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getIsUnlocked", function () {
            return true;
        });

        // Add some custom stats to the info panel when selecting the building
        this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getAdditionalStatistics", function (
            root,
            variant
        ) {
            return [["Awesomeness", 5]];
        });
    }
}
