// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Class Extensions",
    version: "1",
    id: "class-extensions",
    description: "Shows how to extend builtin classes",
    minimumGameVersion: ">=1.5.0",
};

const BeltExtension = ({ $super, $old }) => ({
    getShowWiresLayerPreview() {
        // Access the old method
        return !$old.getShowWiresLayerPreview();
    },

    getIsReplaceable(variant, rotationVariant) {
        // Instead of super, use $super
        return $super.getIsReplaceable.call(this, variant, rotationVariant);
    },

    getIsRemoveable() {
        return false;
    },
});

class Mod extends shapez.Mod {
    init() {
        this.modInterface.extendClass(shapez.MetaBeltBuilding, BeltExtension);
    }
}
