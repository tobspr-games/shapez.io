/* typehints:start */
import { GameRoot } from "../game/root";
import { PuzzleGameMode } from "../game/modes/puzzle";
/* typehints:end */
import { enumConstantSignalType } from "../game/components/constant_signal";
import { StaticMapEntityComponent } from "../game/components/static_map_entity";
import { ShapeItem } from "../game/items/shape_item";
import { Vector } from "../core/vector";
import { MetaConstantProducerBuilding } from "../game/buildings/constant_producer";
import { defaultBuildingVariant } from "../game/meta_building";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { MetaGoalAcceptorBuilding } from "../game/buildings/goal_acceptor";
import { createLogger } from "../core/logging";
import { BaseItem } from "../game/base_item";
import trim from "trim";
import { enumColors } from "../game/colors";
import { COLOR_ITEM_SINGLETONS } from "../game/items/color_item";
import { ShapeDefinition } from "../game/shape_definition";
import { MetaBlockBuilding } from "../game/buildings/block";

const logger = createLogger("puzzle-serializer");

export class PuzzleSerializer {
    /**
     * Serializes the game root into a dump
     * @param {GameRoot} root
     * @returns {import("./savegame_typedefs").PuzzleGameData}
     */
    generateDumpFromGameRoot(root) {
        console.log("serializing", root);

        /**
         * @type {import("./savegame_typedefs").PuzzleGameData["buildings"]}
         */
        let buildings = [];

        for (const entity of root.entityMgr.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp = entity.components.StaticMapEntity;
            const signalComp = entity.components.ConstantSignal;

            if (signalComp) {
                assert(signalComp.type === enumConstantSignalType.wireless, "not a wireless signal");
                assert(["shape", "color"].includes(signalComp.signal.getItemType()), "not a shape signal");
                buildings.push({
                    type: "emitter",
                    item: signalComp.signal.getAsCopyableKey(),
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
                    item: goalComp.item.getAsCopyableKey(),
                    pos: {
                        x: staticComp.origin.x,
                        y: staticComp.origin.y,
                        r: staticComp.rotation,
                    },
                });
                continue;
            }

            if (staticComp.getMetaBuilding().id === gMetaBuildingRegistry.findByClass(MetaBlockBuilding).id) {
                buildings.push({
                    type: "block",
                    pos: {
                        x: staticComp.origin.x,
                        y: staticComp.origin.y,
                        r: staticComp.rotation,
                    },
                });
            }
        }

        const mode = /** @type {PuzzleGameMode} */ (root.gameMode);

        return {
            version: 1,
            buildings,
            bounds: {
                w: mode.zoneWidth,
                h: mode.zoneHeight,
            },
        };
    }

    /**
     * Tries to parse a signal code
     * @param {GameRoot} root
     * @param {string} code
     * @returns {BaseItem}
     */
    parseItemCode(root, code) {
        if (!root || !root.shapeDefinitionMgr) {
            // Stale reference
            return null;
        }

        code = trim(code);
        const codeLower = code.toLowerCase();

        if (enumColors[codeLower]) {
            return COLOR_ITEM_SINGLETONS[codeLower];
        }

        if (ShapeDefinition.isValidShortKey(code)) {
            return root.shapeDefinitionMgr.getShapeItemFromShortKey(code);
        }

        return null;
    }
    /**
     * @param {GameRoot} root
     * @param {import("./savegame_typedefs").PuzzleGameData} puzzle
     */
    deserializePuzzle(root, puzzle) {
        if (puzzle.version !== 1) {
            return "invalid-version";
        }

        for (const building of puzzle.buildings) {
            switch (building.type) {
                case "emitter": {
                    const item = this.parseItemCode(root, building.item);
                    if (!item) {
                        return "bad-item:" + building.item;
                    }

                    const entity = root.logic.tryPlaceBuilding({
                        origin: new Vector(building.pos.x, building.pos.y),
                        building: gMetaBuildingRegistry.findByClass(MetaConstantProducerBuilding),
                        originalRotation: building.pos.r,
                        rotation: building.pos.r,
                        rotationVariant: 0,
                        variant: defaultBuildingVariant,
                    });
                    if (!entity) {
                        logger.warn("Failed to place emitter:", building);
                        return "failed-to-place-emitter";
                    }

                    entity.components.ConstantSignal.signal = item;
                    break;
                }
                case "goal": {
                    const item = this.parseItemCode(root, building.item);
                    if (!item) {
                        return "bad-item:" + building.item;
                    }
                    const entity = root.logic.tryPlaceBuilding({
                        origin: new Vector(building.pos.x, building.pos.y),
                        building: gMetaBuildingRegistry.findByClass(MetaGoalAcceptorBuilding),
                        originalRotation: building.pos.r,
                        rotation: building.pos.r,
                        rotationVariant: 0,
                        variant: defaultBuildingVariant,
                    });
                    if (!entity) {
                        logger.warn("Failed to place goal:", building);
                        return "failed-to-place-goal";
                    }

                    entity.components.GoalAcceptor.item = item;
                    break;
                }
                case "block": {
                    const entity = root.logic.tryPlaceBuilding({
                        origin: new Vector(building.pos.x, building.pos.y),
                        building: gMetaBuildingRegistry.findByClass(MetaBlockBuilding),
                        originalRotation: building.pos.r,
                        rotation: building.pos.r,
                        rotationVariant: 0,
                        variant: defaultBuildingVariant,
                    });
                    if (!entity) {
                        logger.warn("Failed to place block:", building);
                        return "failed-to-place-block";
                    }
                    break;
                }
                default: {
                    // @ts-ignore
                    return "invalid-building-type: " + building.type;
                }
            }
        }
    }
}
