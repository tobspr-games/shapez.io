import { ConstantSignalComponent } from "../components/constant_signal";
import { GameSystemWithFilter } from "../game_system_with_filter";

export class ConstantSignalSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ConstantSignalComponent]);

        this.root.signals.entityManuallyPlaced.add(entity => {
            const editorHud = this.root.hud.parts.constantSignalEdit;
            if (editorHud) {
                editorHud.editConstantSignal(entity, { deleteOnCancel: true });
            }
        });
    }

    update() {
        // Set signals
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const signalComp = entity.components.ConstantSignal;
            const pinsComp = entity.components.WiredPins;

            if (pinsComp) {
                pinsComp.slots[0].value = signalComp.signal;
            }
        }
    }
}
