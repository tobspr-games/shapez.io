const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Class Extensions",
    version: "1",
    id: "class-extensions",
    description: "Shows how to extend builtin classes",
};

class Mod extends shapez.Mod {
    init() {
        this.modInterface.extendClass(shapez.MetaBeltBuilding, {
            // this replaces a regular method
            getShowWiresLayerPreview() {
                return true;
            },

            // Instead of super, use this.$super()
            getIsReplaceable() {
                return this.$super.getIsReplaceable.call(this);
            },

            getIsRemoveable() {
                return false;
            },
        });
    }
}
