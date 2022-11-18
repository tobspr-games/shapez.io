import { BaseHUDPart } from "../base_hud_part";
import { clamp, makeDiv, smoothPulse } from "../../../core/utils";
import { GameRoot } from "../../root";
import { MinerComponent } from "../../components/miner";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { TrackedState } from "../../../core/tracked_state";
import { cachebust } from "../../../core/cachebust";
import { T } from "../../../translations";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../../components/item_processor";
import { ShapeItem } from "../../items/shape_item";
import { WireComponent } from "../../components/wire";
import { LeverComponent } from "../../components/lever";
import { DrawParameters } from "../../../core/draw_parameters";
import { globalConfig } from "../../../core/config";
import { Vector } from "../../../core/vector";
import { MetaMinerBuilding } from "../../buildings/miner";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { MetaBeltBuilding } from "../../buildings/belt";
import { MetaTrashBuilding } from "../../buildings/trash";
import { SOUNDS } from "../../../platform/sound";
import { THEME } from "../../theme";
// @todo: Make dictionary
const tutorialsByLevel: any = [
    // Level 1
    [
        // 1.1. place an extractor
        {
            id: "1_1_extractor",
            condition: oot: GameRoot): any => root.entityMgr.getAllWithComponent(MinerComponent).length === 0,
        },
        // 1.2. connect to hub
        {
            id: "1_2_conveyor",
            condition: oot: GameRoot): any => {
                const paths: any = root.systemMgr.systems.belt.beltPaths;
                const miners: any = root.entityMgr.getAllWithComponent(MinerComponent);
                for (let i: any = 0; i < paths.length; i++) {
                    const path: any = paths[i];
                    const acceptingEntity: any = path.computeAcceptingEntityAndSlot().entity;
                    if (!acceptingEntity || !acceptingEntity.components.Hub) {
                        continue;
                    }
                    // Find a miner which delivers to this belt path
                    for (let k: any = 0; k < miners.length; ++k) {
                        const miner: any = miners[k];
                        if (miner.components.ItemEjector.slots[0].cachedBeltPath === path) {
                            return false;
                        }
                    }
                }
                return true;
            },
        },
        // 1.3 wait for completion
        {
            id: "1_3_expand",
            condition: oot: GameRoot): any => true,
        },
    ],
    // Level 2
    [
        // 2.1 place a cutter
        {
            id: "2_1_place_cutter",
            condition: oot: GameRoot): any => root.entityMgr
                .getAllWithComponent(ItemProcessorComponent)
                .filter((e: any): any => e.components.ItemProcessor.type === enumItemProcessorTypes.cutter).length ===
                0,
        },
        // 2.2 place trash
        {
            id: "2_2_place_trash",
            condition: oot: GameRoot): any => root.entityMgr
                .getAllWithComponent(ItemProcessorComponent)
                .filter((e: any): any => e.components.ItemProcessor.type === enumItemProcessorTypes.trash).length ===
                0,
        },
        // 2.3 place more cutters
        {
            id: "2_3_more_cutters",
            condition: oot: GameRoot): any => true,
        },
    ],
    // Level 3
    [
        // 3.1. rectangles
        {
            id: "3_1_rectangles",
            condition: oot: GameRoot): any => 
            // 4 miners placed above rectangles and 10 delivered
            root.hubGoals.getCurrentGoalDelivered() < 10 ||
                root.entityMgr.getAllWithComponent(MinerComponent).filter((entity: any): any => {
                    const tile: any = entity.components.StaticMapEntity.origin;
                    const below: any = root.map.getLowerLayerContentXY(tile.x, tile.y);
                    if (below && below.getItemType() === "shape") {
                        const shape: any = (below as ShapeItem).definition.getHash();
                        return shape === "RuRuRuRu";
                    }
                    return false;
                }).length < 4,
        },
    ],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    // Level 21
    [
        // 21.1 place quad painter
        {
            id: "21_1_place_quad_painter",
            condition: oot: GameRoot): any => root.entityMgr
                .getAllWithComponent(ItemProcessorComponent)
                .filter((e: any): any => e.components.ItemProcessor.type === enumItemProcessorTypes.painterQuad)
                .length === 0,
        },
        // 21.2 switch to wires layer
        {
            id: "21_2_switch_to_wires",
            condition: oot: GameRoot): any => root.entityMgr.getAllWithComponent(WireComponent).length < 5,
        },
        // 21.3 place button
        {
            id: "21_3_place_button",
            condition: oot: GameRoot): any => root.entityMgr.getAllWithComponent(LeverComponent).length === 0,
        },
        // 21.4 activate button
        {
            id: "21_4_press_button",
            condition: oot: GameRoot): any => root.entityMgr.getAllWithComponent(LeverComponent).some((e: any): any => !e.components.Lever.toggled),
        },
    ],
];
export class HUDInteractiveTutorial extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_InteractiveTutorial", ["animEven"], `
            <strong class="title">${T.ingame.interactiveTutorial.title}</strong>
            `);
        this.elementDescription = makeDiv(this.element, null, ["desc"]);
        this.elementGif = makeDiv(this.element, null, ["helperGif"]);
    }
    cleanup(): any {
        document.documentElement.setAttribute("data-tutorial-step", "");
    }
    initialize(): any {
        this.domAttach = new DynamicDomAttach(this.root, this.element, { trackHover: true });
        this.currentHintId = new TrackedState(this.onHintChanged, this);
        document.documentElement.setAttribute("data-tutorial-step", "");
    }
    onHintChanged(hintId: any): any {
        this.elementDescription.innerHTML = T.ingame.interactiveTutorial.hints[hintId];
        document.documentElement.setAttribute("data-tutorial-step", hintId);
        this.elementGif.style.backgroundImage =
            "url('" + cachebust("res/ui/interactive_tutorial.noinline/" + hintId + ".gif") + "')";
        this.element.classList.toggle("animEven");
        this.element.classList.toggle("animOdd");
        if (hintId) {
            this.root.app.sound.playUiSound(SOUNDS.tutorialStep);
        }
    }
    update(): any {
        // Compute current hint
        const thisLevelHints: any = tutorialsByLevel[this.root.hubGoals.level - 1];
        let targetHintId: any = null;
        if (thisLevelHints) {
            for (let i: any = 0; i < thisLevelHints.length; ++i) {
                const hint: any = thisLevelHints[i];
                if (hint.condition(this.root)) {
                    targetHintId = hint.id;
                    break;
                }
            }
        }
        this.currentHintId.set(targetHintId);
        this.domAttach.update(!!targetHintId);
    }
        draw(parameters: DrawParameters): any {
        const animation: any = smoothPulse(this.root.time.now());
        const currentBuilding: any = this.root.hud.parts.buildingPlacer.currentMetaBuilding.get();
        if (["1_1_extractor"].includes(this.currentHintId.get())) {
            if (currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaMinerBuilding).getId()) {
                // Find closest circle patch to hub
                let closest: any = null;
                let closestDistance: any = 1e10;
                for (let i: any = 0; i > -globalConfig.mapChunkSize; --i) {
                    for (let j: any = 0; j < globalConfig.mapChunkSize; ++j) {
                        const resourceItem: any = this.root.map.getLowerLayerContentXY(i, j);
                        if (resourceItem instanceof ShapeItem &&
                            resourceItem.definition.getHash() === "CuCuCuCu") {
                            let distance: any = Math.hypot(i, j);
                            if (!closest || distance < closestDistance) {
                                const tile: any = new Vector(i, j);
                                if (!this.root.map.getTileContent(tile, "regular")) {
                                    closest = tile;
                                    closestDistance = distance;
                                }
                            }
                        }
                    }
                }
                if (closest) {
                    parameters.context.fillStyle = "rgba(74, 237, 134, " + (0.5 - animation * 0.2) + ")";
                    parameters.context.strokeStyle = "rgb(74, 237, 134)";
                    parameters.context.lineWidth = 2;
                    parameters.context.beginRoundedRect(closest.x * globalConfig.tileSize - 2 * animation, closest.y * globalConfig.tileSize - 2 * animation, globalConfig.tileSize + 4 * animation, globalConfig.tileSize + 4 * animation, 3);
                    parameters.context.fill();
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                }
            }
        }
        if (this.currentHintId.get() === "1_2_conveyor") {
            if (currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaBeltBuilding).getId()) {
                // Find closest miner
                const miners: any = this.root.entityMgr.getAllWithComponent(MinerComponent);
                let closest: any = null;
                let closestDistance: any = 1e10;
                for (let i: any = 0; i < miners.length; i++) {
                    const miner: any = miners[i];
                    const distance: any = miner.components.StaticMapEntity.origin.lengthSquare();
                    if (![0, 90].includes(miner.components.StaticMapEntity.rotation)) {
                        continue;
                    }
                    if (!closest || distance < closestDistance) {
                        closest = miner;
                    }
                }
                if (closest) {
                    // draw line from miner to hub -> But respect orientation
                    const staticComp: any = closest.components.StaticMapEntity;
                    const offset: any = staticComp.rotation === 0 ? new Vector(0.5, 0) : new Vector(1, 0.5);
                    const anchor: any = staticComp.rotation === 0
                        ? new Vector(staticComp.origin.x + 0.5, 0.5)
                        : new Vector(-0.5, staticComp.origin.y + 0.5);
                    const target: any = staticComp.rotation === 0 ? new Vector(-2.1, 0.5) : new Vector(-0.5, 2.1);
                    parameters.context.globalAlpha = 0.1 + animation * 0.1;
                    parameters.context.strokeStyle = "rgb(74, 237, 134)";
                    parameters.context.lineWidth = globalConfig.tileSize / 2;
                    parameters.context.beginPath();
                    parameters.context.moveTo((staticComp.origin.x + offset.x) * globalConfig.tileSize, (staticComp.origin.y + offset.y) * globalConfig.tileSize);
                    parameters.context.lineTo(anchor.x * globalConfig.tileSize, anchor.y * globalConfig.tileSize);
                    parameters.context.lineTo(target.x * globalConfig.tileSize, target.y * globalConfig.tileSize);
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                    const arrowSprite: any = this.root.hud.parts.buildingPlacer.lockIndicatorSprites.regular;
                    let arrows: any = [];
                    let pos: any = staticComp.origin.add(offset);
                    let delta: any = anchor.sub(pos).normalize();
                    let maxIter: any = 999;
                    while (pos.distanceSquare(anchor) > 1 && maxIter-- > 0) {
                        pos = pos.add(delta);
                        arrows.push({
                            pos: pos.sub(offset),
                            rotation: staticComp.rotation,
                        });
                    }
                    pos = anchor.copy();
                    delta = target.sub(pos).normalize();
                    const localDelta: any = staticComp.rotation === 0 ? new Vector(-1.5, -0.5) : new Vector(-0.5, 0.5);
                    while (pos.distanceSquare(target) > 1 && maxIter-- > 0) {
                        pos = pos.add(delta);
                        arrows.push({
                            pos: pos.add(localDelta),
                            rotation: 90 - staticComp.rotation,
                        });
                    }
                    for (let i: any = 0; i < arrows.length; i++) {
                        const { pos, rotation }: any = arrows[i];
                        const worldPos: any = pos.toWorldSpaceCenterOfTile();
                        const angle: any = Math.radians(rotation);
                        parameters.context.translate(worldPos.x, worldPos.y);
                        parameters.context.rotate(angle);
                        parameters.context.drawImage(arrowSprite, -6, -globalConfig.halfTileSize -
                            clamp((this.root.time.realtimeNow() * 1.5) % 1.0, 0, 1) *
                                1 *
                                globalConfig.tileSize +
                            globalConfig.halfTileSize -
                            6, 12, 12);
                        parameters.context.rotate(-angle);
                        parameters.context.translate(-worldPos.x, -worldPos.y);
                    }
                    parameters.context.fillStyle = THEME.map.tutorialDragText;
                    parameters.context.font = "15px GameFont";
                    if (staticComp.rotation === 0) {
                        const pos: any = staticComp.origin.toWorldSpace().subScalars(2, 10);
                        parameters.context.translate(pos.x, pos.y);
                        parameters.context.rotate(-Math.radians(90));
                        parameters.context.fillText(T.ingame.interactiveTutorial.hints["1_2_hold_and_drag"], 0, 0);
                        parameters.context.rotate(Math.radians(90));
                        parameters.context.translate(-pos.x, -pos.y);
                    }
                    else {
                        const pos: any = staticComp.origin.toWorldSpace().addScalars(40, 50);
                        parameters.context.fillText(T.ingame.interactiveTutorial.hints["1_2_hold_and_drag"], pos.x, pos.y);
                    }
                }
            }
        }
        if (this.currentHintId.get() === "2_2_place_trash") {
            // Find cutters
            if (currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaTrashBuilding).getId()) {
                const entities: any = this.root.entityMgr.getAllWithComponent(ItemProcessorComponent);
                for (let i: any = 0; i < entities.length; i++) {
                    const entity: any = entities[i];
                    if (entity.components.ItemProcessor.type !== enumItemProcessorTypes.cutter) {
                        continue;
                    }
                    const slot: any = entity.components.StaticMapEntity.localTileToWorld(new Vector(1, -1)).toWorldSpace();
                    parameters.context.fillStyle = "rgba(74, 237, 134, " + (0.5 - animation * 0.2) + ")";
                    parameters.context.strokeStyle = "rgb(74, 237, 134)";
                    parameters.context.lineWidth = 2;
                    parameters.context.beginRoundedRect(slot.x - 2 * animation, slot.y - 2 * animation, globalConfig.tileSize + 4 * animation, globalConfig.tileSize + 4 * animation, 3);
                    parameters.context.fill();
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                }
            }
        }
    }
}
