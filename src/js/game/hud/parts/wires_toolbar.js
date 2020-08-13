import { enumLayer } from "../../root";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaWireBuilding } from "../../buildings/wire";
import { MetaConstantSignalBuilding } from "../../buildings/constant_signal";
import { MetaLogicGateBuilding } from "../../buildings/logic_gate";

const supportedBuildings = [MetaWireBuilding, MetaConstantSignalBuilding, MetaLogicGateBuilding];

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
