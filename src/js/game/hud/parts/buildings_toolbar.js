import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { MetaBuilding } from "../../meta_building";
import { Signal } from "../../../core/signal";
import { MetaSplitterBuilding } from "../../buildings/splitter";
import { MetaMinerBuilding } from "../../buildings/miner";
import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaRotaterBuilding } from "../../buildings/rotater";
import { MetaStackerBuilding } from "../../buildings/stacker";
import { MetaMixerBuilding } from "../../buildings/mixer";
import { MetaPainterBuilding } from "../../buildings/painter";
import { MetaTrashBuilding } from "../../buildings/trash";
import { MetaBeltBaseBuilding } from "../../buildings/belt_base";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";
import { globalConfig } from "../../../core/config";
import { TrackedState } from "../../../core/tracked_state";

const toolbarBuildings = [
    MetaBeltBaseBuilding,
    MetaMinerBuilding,
    MetaUndergroundBeltBuilding,
    MetaSplitterBuilding,
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

        /** @type {Object.<string, { metaBuilding: MetaBuilding, unlocked: boolean, selected: boolean, element: HTMLElement}>} */
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
        const actionMapper = this.root.gameState.keyActionMapper;

        const items = makeDiv(this.element, null, ["buildings"]);
        const iconSize = 32;

        for (let i = 0; i < toolbarBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(toolbarBuildings[i]);
            const binding = actionMapper.getBinding("building_" + metaBuilding.getId());

            const dimensions = metaBuilding.getDimensions();
            const itemContainer = makeDiv(items, null, ["building"]);
            itemContainer.setAttribute("data-tilewidth", dimensions.x);
            itemContainer.setAttribute("data-tileheight", dimensions.y);

            const label = makeDiv(itemContainer, null, ["label"]);
            label.innerText = metaBuilding.getName();

            const tooltip = makeDiv(
                itemContainer,
                null,
                ["tooltip"],
                `
                <span class="title">${metaBuilding.getName()}</span>
                <span class="desc">${metaBuilding.getDescription()}</span>
                <span class="tutorialImage" data-icon="building_tutorials/${metaBuilding.getId()}.png"></span>
            `
            );

            const sprite = metaBuilding.getPreviewSprite(0);

            const spriteWrapper = makeDiv(itemContainer, null, ["iconWrap"]);
            spriteWrapper.innerHTML = sprite.getAsHTML(iconSize * dimensions.x, iconSize * dimensions.y);

            binding.appendLabelToElement(itemContainer);
            binding.add(() => this.selectBuildingForPlacement(metaBuilding));

            this.trackClicks(itemContainer, () => this.selectBuildingForPlacement(metaBuilding), {});

            this.buildingHandles[metaBuilding.id] = {
                metaBuilding,
                element: itemContainer,
                unlocked: false,
                selected: false,
            };
        }

        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedPlacementBuildingChanged,
            this
        );
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

        this.sigBuildingSelected.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
}
