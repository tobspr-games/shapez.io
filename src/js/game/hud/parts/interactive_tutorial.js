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
const tutorialsByLevel = [
    // Level 1
    [
        // 1.1. place an extractor
        {
            id: "1_1_extractor",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr.getAllWithComponent(MinerComponent).length === 0,
        },
        // 1.2. connect to hub
        {
            id: "1_2_conveyor",
            condition: /** @param {GameRoot} root */ root => {
                const paths = root.systemMgr.systems.belt.beltPaths;
                const miners = root.entityMgr.getAllWithComponent(MinerComponent);
                for (let i = 0; i < paths.length; i++) {
                    const path = paths[i];
                    const acceptingEntity = path.computeAcceptingEntityAndSlot().entity;
                    if (!acceptingEntity || !acceptingEntity.components.Hub) {
                        continue;
                    }
                    // Find a miner which delivers to this belt path
                    for (let k = 0; k < miners.length; ++k) {
                        const miner = miners[k];
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
            condition: /** @param {GameRoot} root */ root => true,
        },
    ],
    // Level 2
    [
        // 2.1 place a cutter
        {
            id: "2_1_place_cutter",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr
                    .getAllWithComponent(ItemProcessorComponent)
                    .filter(e => e.components.ItemProcessor.type === enumItemProcessorTypes.cutter).length ===
                0,
        },
        // 2.2 place trash
        {
            id: "2_2_place_trash",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr
                    .getAllWithComponent(ItemProcessorComponent)
                    .filter(e => e.components.ItemProcessor.type === enumItemProcessorTypes.trash).length ===
                0,
        },
        // 2.3 place more cutters
        {
            id: "2_3_more_cutters",
            condition: /** @param {GameRoot} root */ root => true,
        },
    ],

    // Level 3
    [
        // 3.1. rectangles
        {
            id: "3_1_rectangles",
            condition: /** @param {GameRoot} root */ root =>
                // 4 miners placed above rectangles and 10 delivered
                root.hubGoals.getCurrentGoalDelivered() < 10 ||
                root.entityMgr.getAllWithComponent(MinerComponent).filter(entity => {
                    const tile = entity.components.StaticMapEntity.origin;
                    const below = root.map.getLowerLayerContentXY(tile.x, tile.y);
                    if (below && below.getItemType() === "shape") {
                        const shape = /** @type {ShapeItem} */ (below).definition.getHash();
                        return shape === "RuRuRuRu";
                    }
                    return false;
                }).length < 4,
        },
    ],

    [], // Level 4
    [], // Level 5
    [], // Level 6
    [], // Level 7
    [], // Level 8
    [], // Level 9
    [], // Level 10
    [], // Level 11
    [], // Level 12
    [], // Level 13
    [], // Level 14
    [], // Level 15
    [], // Level 16
    [], // Level 17
    [], // Level 18
    [], // Level 19
    [], // Level 20

    // Level 21
    [
        // 21.1 place quad painter
        {
            id: "21_1_place_quad_painter",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr
                    .getAllWithComponent(ItemProcessorComponent)
                    .filter(e => e.components.ItemProcessor.type === enumItemProcessorTypes.painterQuad)
                    .length === 0,
        },

        // 21.2 switch to wires layer
        {
            id: "21_2_switch_to_wires",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr.getAllWithComponent(WireComponent).length < 5,
        },

        // 21.3 place button
        {
            id: "21_3_place_button",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr.getAllWithComponent(LeverComponent).length === 0,
        },

        // 21.4 activate button
        {
            id: "21_4_press_button",
            condition: /** @param {GameRoot} root */ root =>
                root.entityMgr.getAllWithComponent(LeverComponent).some(e => !e.components.Lever.toggled),
        },
    ],
];

export class HUDInteractiveTutorial extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_InteractiveTutorial",
            ["animEven"],
            `
            <strong class="title">${T.ingame.interactiveTutorial.title}</strong>
            `
        );

        this.elementDescription = makeDiv(this.element, null, ["desc"]);
        this.elementGif = makeDiv(this.element, null, ["helperGif"]);
    }

    cleanup() {
        document.documentElement.setAttribute("data-tutorial-step", "");
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element, { trackHover: true });
        this.currentHintId = new TrackedState(this.onHintChanged, this);

        document.documentElement.setAttribute("data-tutorial-step", "");
    }

    onHintChanged(hintId) {
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

    update() {
        // Compute current hint
        const thisLevelHints = tutorialsByLevel[this.root.hubGoals.level - 1];
        let targetHintId = null;

        if (thisLevelHints) {
            for (let i = 0; i < thisLevelHints.length; ++i) {
                const hint = thisLevelHints[i];
                if (hint.condition(this.root)) {
                    targetHintId = hint.id;
                    break;
                }
            }
        }

        this.currentHintId.set(targetHintId);
        this.domAttach.update(!!targetHintId);
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const animation = smoothPulse(this.root.time.now());
        const currentBuilding = this.root.hud.parts.buildingPlacer.currentMetaBuilding.get();

        if (["1_1_extractor"].includes(this.currentHintId.get())) {
            if (
                currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaMinerBuilding).getId()
            ) {
                // Find closest circle patch to hub

                let closest = null;
                let closestDistance = 1e10;

                for (let i = 0; i > -globalConfig.mapChunkSize; --i) {
                    for (let j = 0; j < globalConfig.mapChunkSize; ++j) {
                        const resourceItem = this.root.map.getLowerLayerContentXY(i, j);
                        if (
                            resourceItem instanceof ShapeItem &&
                            resourceItem.definition.getHash() === "CuCuCuCu"
                        ) {
                            let distance = Math.hypot(i, j);
                            if (!closest || distance < closestDistance) {
                                const tile = new Vector(i, j);
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
                    parameters.context.beginRoundedRect(
                        closest.x * globalConfig.tileSize - 2 * animation,
                        closest.y * globalConfig.tileSize - 2 * animation,
                        globalConfig.tileSize + 4 * animation,
                        globalConfig.tileSize + 4 * animation,
                        3
                    );
                    parameters.context.fill();
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                }
            }
        }

        if (this.currentHintId.get() === "1_2_conveyor") {
            if (
                currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaBeltBuilding).getId()
            ) {
                // Find closest miner
                const miners = this.root.entityMgr.getAllWithComponent(MinerComponent);

                let closest = null;
                let closestDistance = 1e10;

                for (let i = 0; i < miners.length; i++) {
                    const miner = miners[i];
                    const distance = miner.components.StaticMapEntity.origin.lengthSquare();

                    if (![0, 90].includes(miner.components.StaticMapEntity.rotation)) {
                        continue;
                    }
                    if (!closest || distance < closestDistance) {
                        closest = miner;
                    }
                }

                if (closest) {
                    // draw line from miner to hub -> But respect orientation

                    const staticComp = closest.components.StaticMapEntity;

                    const offset = staticComp.rotation === 0 ? new Vector(0.5, 0) : new Vector(1, 0.5);

                    const anchor =
                        staticComp.rotation === 0
                            ? new Vector(staticComp.origin.x + 0.5, 0.5)
                            : new Vector(-0.5, staticComp.origin.y + 0.5);

                    const target = staticComp.rotation === 0 ? new Vector(-2.1, 0.5) : new Vector(-0.5, 2.1);

                    parameters.context.globalAlpha = 0.1 + animation * 0.1;
                    parameters.context.strokeStyle = "rgb(74, 237, 134)";
                    parameters.context.lineWidth = globalConfig.tileSize / 2;
                    parameters.context.beginPath();
                    parameters.context.moveTo(
                        (staticComp.origin.x + offset.x) * globalConfig.tileSize,
                        (staticComp.origin.y + offset.y) * globalConfig.tileSize
                    );
                    parameters.context.lineTo(
                        anchor.x * globalConfig.tileSize,
                        anchor.y * globalConfig.tileSize
                    );
                    parameters.context.lineTo(
                        target.x * globalConfig.tileSize,
                        target.y * globalConfig.tileSize
                    );
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;

                    const arrowSprite = this.root.hud.parts.buildingPlacer.lockIndicatorSprites.regular;

                    let arrows = [];

                    let pos = staticComp.origin.add(offset);
                    let delta = anchor.sub(pos).normalize();
                    let maxIter = 999;

                    while (pos.distanceSquare(anchor) > 1 && maxIter-- > 0) {
                        pos = pos.add(delta);
                        arrows.push({
                            pos: pos.sub(offset),
                            rotation: staticComp.rotation,
                        });
                    }

                    pos = anchor.copy();
                    delta = target.sub(pos).normalize();
                    const localDelta =
                        staticComp.rotation === 0 ? new Vector(-1.5, -0.5) : new Vector(-0.5, 0.5);
                    while (pos.distanceSquare(target) > 1 && maxIter-- > 0) {
                        pos = pos.add(delta);
                        arrows.push({
                            pos: pos.add(localDelta),
                            rotation: 90 - staticComp.rotation,
                        });
                    }

                    for (let i = 0; i < arrows.length; i++) {
                        const { pos, rotation } = arrows[i];
                        const worldPos = pos.toWorldSpaceCenterOfTile();
                        const angle = Math.radians(rotation);

                        parameters.context.translate(worldPos.x, worldPos.y);
                        parameters.context.rotate(angle);
                        parameters.context.drawImage(
                            arrowSprite,
                            -6,
                            -globalConfig.halfTileSize -
                                clamp((this.root.time.realtimeNow() * 1.5) % 1.0, 0, 1) *
                                    1 *
                                    globalConfig.tileSize +
                                globalConfig.halfTileSize -
                                6,
                            12,
                            12
                        );
                        parameters.context.rotate(-angle);
                        parameters.context.translate(-worldPos.x, -worldPos.y);
                    }

                    parameters.context.fillStyle = THEME.map.tutorialDragText;
                    parameters.context.font = "15px GameFont";

                    if (staticComp.rotation === 0) {
                        const pos = staticComp.origin.toWorldSpace().subScalars(2, 10);
                        parameters.context.translate(pos.x, pos.y);
                        parameters.context.rotate(-Math.radians(90));
                        parameters.context.fillText(
                            T.ingame.interactiveTutorial.hints["1_2_hold_and_drag"],
                            0,
                            0
                        );
                        parameters.context.rotate(Math.radians(90));
                        parameters.context.translate(-pos.x, -pos.y);
                    } else {
                        const pos = staticComp.origin.toWorldSpace().addScalars(40, 50);
                        parameters.context.fillText(
                            T.ingame.interactiveTutorial.hints["1_2_hold_and_drag"],
                            pos.x,
                            pos.y
                        );
                    }
                }
            }
        }

        if (this.currentHintId.get() === "2_2_place_trash") {
            // Find cutters
            if (
                currentBuilding &&
                currentBuilding.getId() === gMetaBuildingRegistry.findByClass(MetaTrashBuilding).getId()
            ) {
                const entities = this.root.entityMgr.getAllWithComponent(ItemProcessorComponent);
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];
                    if (entity.components.ItemProcessor.type !== enumItemProcessorTypes.cutter) {
                        continue;
                    }

                    const slot = entity.components.StaticMapEntity.localTileToWorld(
                        new Vector(1, -1)
                    ).toWorldSpace();
                    parameters.context.fillStyle = "rgba(74, 237, 134, " + (0.5 - animation * 0.2) + ")";
                    parameters.context.strokeStyle = "rgb(74, 237, 134)";
                    parameters.context.lineWidth = 2;
                    parameters.context.beginRoundedRect(
                        slot.x - 2 * animation,
                        slot.y - 2 * animation,
                        globalConfig.tileSize + 4 * animation,
                        globalConfig.tileSize + 4 * animation,
                        3
                    );
                    parameters.context.fill();
                    parameters.context.stroke();
                    parameters.context.globalAlpha = 1;
                }
            }
        }
    }
}
