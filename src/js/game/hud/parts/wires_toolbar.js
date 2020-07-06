import { MetaWireBaseBuilding } from "../../buildings/wire_base";
import { enumLayer } from "../../root";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaWireCrossingsBuilding } from "../../buildings/wire_crossings";

const supportedBuildings = [MetaWireBaseBuilding, MetaWireCrossingsBuilding];

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
