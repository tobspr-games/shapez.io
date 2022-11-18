import { ConstantSignalComponent } from "../components/constant_signal";
import { GameSystemWithFilter } from "../game_system_with_filter";
export class ConstantSignalSystem extends GameSystemWithFilter {

    constructor(root) {
        super(root, [ConstantSignalComponent]);
        this.root.signals.entityManuallyPlaced.add((entity: any): any => {
            const editorHud: any = this.root.hud.parts.constantSignalEdit;
            if (editorHud) {
                editorHud.editConstantSignal(entity, { deleteOnCancel: true });
            }
        });
    }
    update(): any {
        // Set signals
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const signalComp: any = entity.components.ConstantSignal;
            const pinsComp: any = entity.components.WiredPins;
            if (pinsComp) {
                pinsComp.slots[0].value = signalComp.signal;
            }
        }
    }
}
