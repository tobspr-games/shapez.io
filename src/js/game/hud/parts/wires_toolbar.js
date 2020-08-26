import { HUDBaseToolbar } from "./base_toolbar";
import { MetaWireBuilding } from "../../buildings/wire";
import { MetaConstantSignalBuilding } from "../../buildings/constant_signal";
import { MetaLogicGateBuilding } from "../../buildings/logic_gate";
import { MetaLeverBuilding } from "../../buildings/lever";
import { MetaWireTunnelBuilding } from "../../buildings/wire_tunnel";
import { MetaVirtualProcessorBuilding } from "../../buildings/virtual_processor";

const supportedBuildings = [
    MetaWireBuilding,
    MetaWireTunnelBuilding,
    MetaConstantSignalBuilding,
    MetaLogicGateBuilding,
    MetaLeverBuilding,
    MetaVirtualProcessorBuilding,
];

export class HUDWiresToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            supportedBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() && this.root.currentLayer === "wires",
            htmlElementId: "ingame_HUD_wires_toolbar",
        });
    }
}
