import { enumConstantSignalType } from "../game/components/constant_signal";
import { StaticMapEntityComponent } from "../game/components/static_map_entity";
import { ShapeItem } from "../game/items/shape_item";
import { GameRoot } from "../game/root";

export class PuzzleSerializer {
    /**
     * Serializes the game root into a dump
     * @param {GameRoot} root
     * @param {boolean=} sanityChecks Whether to check for validity
     * @returns {object}
     */
    generateDumpFromGameRoot(root, sanityChecks = true) {
        console.log("serializing", root);

        let buildings = [];

        for (const entity of root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp = entity.components.StaticMapEntity;
            const signalComp = entity.components.ConstantSignal;

            if (signalComp) {
                assert(signalComp.type === enumConstantSignalType.wireless, "not a wireless signal");
                assert(signalComp.signal.getItemType() === "shape", "not a shape signal");
                buildings.push({
                    type: "emitter",
                    item: /** @type {ShapeItem} */ (signalComp.signal).definition.getHash(),
                    pos: {
                        x: staticComp.origin.x,
                        y: staticComp.origin.y,
                        r: staticComp.rotation,
                    },
                });
                continue;
            }

            const goalComp = entity.components.GoalAcceptor;
            if (goalComp) {
                assert(goalComp.item, "goals is missing item");
                assert(goalComp.item.getItemType() === "shape", "goal is not an item");
                buildings.push({
                    type: "goal",
                    item: /** @type {ShapeItem} */ (goalComp.item).definition.getHash(),
                    pos: {
                        x: staticComp.origin.x,
                        y: staticComp.origin.y,
                        r: staticComp.rotation,
                    },
                });
                continue;
            }
        }

        return {
            buildings,
            bounds: root.gameMode.getBuildableZones()[0],
        };
    }
}
