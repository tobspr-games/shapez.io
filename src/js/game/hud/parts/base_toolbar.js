import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { Signal } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { makeDiv } from "../../../core/utils";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { MetaBuilding } from "../../meta_building";
import { BaseHUDPart } from "../base_hud_part";
import { GameRoot } from "../../root";

export class HUDBaseToolbar extends BaseHUDPart {
    /**
     * @param {GameRoot} root
     * @param {Array<typeof MetaBuilding>} supportedBuildings
     * @param {function} visibilityCondition
     */
    constructor(root, supportedBuildings, visibilityCondition) {
        super(root);

        this.supportedBuildings = supportedBuildings;
        this.visibilityCondition = visibilityCondition;

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

    /**
     * Called when the visibility of the toolbar changed
     * @param {boolean} visible
     */
    onVisibilityChanged(visible) {
        this.element.classList.toggle("visible", visible);
    }

    /**
     * Should create all require elements
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_buildings_toolbar", ["ingame_buildingsToolbar"], "");
    }

    initialize() {
        const actionMapper = this.root.keyMapper;

        const items = makeDiv(this.element, null, ["buildings"]);

        for (let i = 0; i < this.supportedBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(this.supportedBuildings[i]);
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
    }

    /**
     * Updates the toolbar
     */
    update() {
        this.trackedIsVisisible.set(this.visibilityCondition());

        if (!this.trackedIsVisisible.get()) {
            // Currently not active
        } else {
            for (const buildingId in this.buildingHandles) {
                const handle = this.buildingHandles[buildingId];
                const newStatus = handle.metaBuilding.getIsUnlocked(this.root);
                if (handle.unlocked !== newStatus) {
                    handle.unlocked = newStatus;
                    handle.element.classList.toggle("unlocked", newStatus);
                }
            }
        }
    }

    /**
     * Cycles through all buildings
     */
    cycleBuildings() {
        let newIndex = this.lastSelectedIndex;
        for (let i = 0; i < this.supportedBuildings.length; ++i, ++newIndex) {
            newIndex %= this.supportedBuildings.length;
            const metaBuilding = gMetaBuildingRegistry.findByClass(this.supportedBuildings[newIndex]);
            const handle = this.buildingHandles[metaBuilding.id];
            if (!handle.selected && handle.unlocked) {
                break;
            }
        }
        const metaBuildingClass = this.supportedBuildings[newIndex];
        const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
        this.selectBuildingForPlacement(metaBuilding);
    }

    /**
     * Called when the selected building got changed
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
        if (!this.visibilityCondition()) {
            // Not active
            return;
        }

        if (!metaBuilding.getIsUnlocked(this.root)) {
            this.root.soundProxy.playUiError();
            return STOP_PROPAGATION;
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
