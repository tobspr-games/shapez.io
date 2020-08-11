import { enumLayer } from "../../root";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaWireBuilding } from "../../buildings/wire";

const supportedBuildings = [MetaWireBuilding];

export class HUDWiresToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            supportedBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() && this.root.currentLayer === enumLayer.wires,
            htmlElementId: "ingame_HUD_wires_toolbar",
        });
    }
}
