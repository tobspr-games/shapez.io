import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { Signal } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { makeDiv } from "../../../core/utils";
import { MetaBeltBaseBuilding } from "../../buildings/belt_base";
import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaMinerBuilding } from "../../buildings/miner";
import { MetaMixerBuilding } from "../../buildings/mixer";
import { MetaPainterBuilding } from "../../buildings/painter";
import { MetaRotaterBuilding } from "../../buildings/rotater";
import { MetaSplitterBuilding } from "../../buildings/splitter";
import { MetaStackerBuilding } from "../../buildings/stacker";
import { MetaTrashBuilding } from "../../buildings/trash";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";
import { MetaBuilding } from "../../meta_building";
import { BaseHUDPart } from "../base_hud_part";
import { KEYMAPPINGS } from "../../key_action_mapper";

const toolbarBuildings = [
    MetaBeltBaseBuilding,
    MetaSplitterBuilding,
    MetaUndergroundBeltBuilding,
    MetaMinerBuilding,
    MetaCutterBuilding,
    MetaRotaterBuilding,
    MetaStackerBuilding,
    MetaMixerBuilding,
    MetaPainterBuilding,
    MetaTrashBuilding,
];

export class HUDBuildingsToolbar extends BaseHUDPart {
    constructor(root) {
        super(root);

        /** @type {Object.<string, {
         * metaBuilding: MetaBuilding,
         * unlocked: boolean,
         * selected: boolean,
         * element: HTMLElement,
         * index: number
         * }>} */
        this.buildingHandles = {};

        this.sigBuildingSelected = new Signal();

        this.trackedIsVisisible = new TrackedState(this.onVisibilityChanged, this);
    }

    onVisibilityChanged(visible) {
        this.element.classList.toggle("visible", visible);
    }

    /**
     * Should create all require elements
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_buildings_toolbar", [], "");
    }

    initialize() {
        const actionMapper = this.root.keyMapper;

        const items = makeDiv(this.element, null, ["buildings"]);

        for (let i = 0; i < toolbarBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(toolbarBuildings[i]);
            const binding = actionMapper.getBinding(KEYMAPPINGS.buildings[metaBuilding.getId()]);

            const itemContainer = makeDiv(items, null, ["building"]);
            itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");

            binding.add(() => this.selectBuildingForPlacement(metaBuilding));

            this.trackClicks(itemContainer, () => this.selectBuildingForPlacement(metaBuilding), {
                clickSound: null,
            });

            this.buildingHandles[metaBuilding.id] = {
                metaBuilding,
                element: itemContainer,
                unlocked: false,
                selected: false,
                index: i,
            };
        }

        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedPlacementBuildingChanged,
            this
        );

        this.lastSelectedIndex = 0;
        actionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildings).add(this.cycleBuildings, this);
        actionMapper.getBinding(KEYMAPPINGS.placement.pipette).add(this.usePipette, this);
    }

    update() {
        this.trackedIsVisisible.set(!this.root.camera.getIsMapOverlayActive());

        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            const newStatus = handle.metaBuilding.getIsUnlocked(this.root);
            if (handle.unlocked !== newStatus) {
                handle.unlocked = newStatus;
                handle.element.classList.toggle("unlocked", newStatus);
            }
        }
    }

    cycleBuildings() {
        let newIndex = this.lastSelectedIndex;
        for (let i = 0; i < toolbarBuildings.length; ++i, ++newIndex) {
            newIndex %= toolbarBuildings.length;
            const metaBuilding = gMetaBuildingRegistry.findByClass(toolbarBuildings[newIndex]);
            const handle = this.buildingHandles[metaBuilding.id];
            if (!handle.selected && handle.unlocked) {
                break;
            }
        }
        const metaBuildingClass = toolbarBuildings[newIndex];
        const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
        this.selectBuildingForPlacement(metaBuilding);
    }

    detectPippeted(entity) {
        const alike = [];
        for (let i = 0; i < toolbarBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(toolbarBuildings[i]);
            const handle = this.buildingHandles[metaBuilding.id];
            if (!handle.unlocked) {
                continue;
            }

            const availableVariants = metaBuilding.getAvailableVariants(this.root);
            checkVariant: for (let variant of availableVariants) {
                let unplaced = metaBuilding.createUnplacedEntity({ root: this.root, variant });
                // compare props
                for (let c in entity.components) {
                    if (
                        (entity.components[c] && !unplaced.components[c]) ||
                        (!entity.components[c] && unplaced.components[c])
                    ) {
                        continue checkVariant;
                    }
                }

                if (
                    entity.components.ItemProcessor &&
                    entity.components.ItemProcessor.type != unplaced.components.ItemProcessor.type
                ) {
                    continue checkVariant;
                }
                if (
                    entity.components.UndergroundBelt &&
                    entity.components.UndergroundBelt.tier != unplaced.components.UndergroundBelt.tier
                ) {
                    continue checkVariant;
                }
                // tecnically this one is enough without all others BUT ubelts
                if (
                    entity.components.StaticMapEntity.spriteKey !=
                        unplaced.components.StaticMapEntity.spriteKey &&
                    !entity.components.UndergroundBelt
                ) {
                    console.log("ignored %o cuz other sprite", unplaced);
                    continue checkVariant;
                }
                console.log("%O is probably %O (%s/%s)", entity, unplaced, metaBuilding.id, variant);
                alike.push({ metaBuilding, variant, unplaced });
            }
        }

        if (alike.length == 1) {
            let staticEntity = entity.components.StaticMapEntity;
            let key = staticEntity.spriteKey || staticEntity.blueprintSpriteKey;
            assertAlways(
                key &&
                    key.includes(alike[0].metaBuilding.id) &&
                    (alike[0].variant == "default" || key.includes(alike[0].variant))
            );
            return alike[0];
        }
        if (alike.length > 1) {
            console.warn("multiple alike buildings:", alike);
        }
        console.log("entity is unknown", entity);
        return null;
    }

    usePipette() {
        if (this.root.hud.parts.buildingPlacer.currentMetaBuilding.get()) {
            return;
        }
        if (this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }
        const worldPos = this.root.camera.screenToWorld(mousePos);
        const worldTile = worldPos.toTileSpace();

        const entity = this.root.map.getTileContent(worldTile);
        if (!entity) {
            const tileBelow = this.root.map.getLowerLayerContentXY(worldTile.x, worldTile.y);
            if (tileBelow) {
                let miner = gMetaBuildingRegistry.findByClass(MetaMinerBuilding);
                let variants = miner.getAvailableVariants(this.root);
                this.selectBuildingForPlacement(miner);
                this.root.hud.parts.buildingPlacer.currentVariant.set(variants.pop());
            }
            // TODO: play error sound
            return;
        }

        let detected = this.detectPippeted(entity);

        if (detected) {
            this.selectBuildingForPlacement(detected.metaBuilding);
            this.root.hud.parts.buildingPlacer.currentVariant.set(detected.variant);
            this.root.hud.parts.buildingPlacer.currentBaseRotation =
                (Math.round(entity.components.StaticMapEntity.originalRotation / 90) * 90 + 360) % 360;
        }
        // TODO: play error sound
    }

    /**
     * @param {MetaBuilding} metaBuilding
     */
    onSelectedPlacementBuildingChanged(metaBuilding) {
        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            const newStatus = handle.metaBuilding === metaBuilding;
            if (handle.selected !== newStatus) {
                handle.selected = newStatus;
                handle.element.classList.toggle("selected", newStatus);
            }
            if (handle.selected) {
                this.lastSelectedIndex = handle.index;
            }
        }

        this.element.classList.toggle("buildingSelected", !!metaBuilding);
    }

    /**
     * @param {MetaBuilding} metaBuilding
     */
    selectBuildingForPlacement(metaBuilding) {
        if (!metaBuilding.getIsUnlocked(this.root)) {
            this.root.soundProxy.playUiError();
            return;
        }

        if (this.root.camera.getIsMapOverlayActive()) {
            this.root.soundProxy.playUiError();
            return;
        }

        // Allow clicking an item again to deselect it
        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            if (handle.selected && handle.metaBuilding === metaBuilding) {
                metaBuilding = null;
                break;
            }
        }

        this.root.soundProxy.playUiClick();
        this.sigBuildingSelected.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
}
