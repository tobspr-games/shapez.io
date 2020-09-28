import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

export class HUDPerformanceWarning extends BaseHUDPart {
    initialize() {
        this.warningShown = false;
        this.root.signals.entityManuallyPlaced.add(this.checkAfterPlace, this);
    }

    checkAfterPlace() {
        if (!this.warningShown && this.root.entityMgr.entities.length > 10000) {
            this.root.hud.parts.dialogs.showInfo(T.dialogs.entityWarning.title, T.dialogs.entityWarning.desc);
            this.warningShown = true;
        }
    }
}
