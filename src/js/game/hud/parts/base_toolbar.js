import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { STOP_PROPAGATION } from "../../../core/signal";
import { makeDiv, safeModulo } from "../../../core/utils";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDBaseToolbar extends BaseHUDPart {
    /**
     * @param {GameRoot} root
     * @param {object} param0
     * @param {Array<typeof MetaBuilding>} param0.primaryBuildings
     * @param {Array<typeof MetaBuilding>=} param0.secondaryBuildings
     * @param {function} param0.visibilityCondition
     * @param {string} param0.htmlElementId
     * @param {Layer=} param0.layer
     */
    constructor(
        root,
        { primaryBuildings, secondaryBuildings = [], visibilityCondition, htmlElementId, layer = "regular" }
    ) {
        super(root);

        this.primaryBuildings = primaryBuildings;
        this.secondaryBuildings = secondaryBuildings;
        this.visibilityCondition = visibilityCondition;
        this.htmlElementId = htmlElementId;
        this.layer = layer;

        /** @type {Object.<string, {
         * metaBuilding: MetaBuilding,
         * unlocked: boolean,
         * selected: boolean,
         * element: HTMLElement,
         * index: number
         * }>} */
        this.buildingHandles = {};
    }

    /**
     * Should create all require elements
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        this.element = makeDiv(parent, this.htmlElementId, ["ingame_buildingsToolbar"], "");
    }

    /**
     * Returns all buildings
     * @returns {Array<typeof MetaBuilding>}
     */
    get allBuildings() {
        return [...this.primaryBuildings, ...this.secondaryBuildings];
    }

    initialize() {
        const actionMapper = this.root.keyMapper;
        let rowSecondary;
        if (this.secondaryBuildings.length > 0) {
            rowSecondary = makeDiv(this.element, null, ["buildings", "secondary"]);

            this.secondaryDomAttach = new DynamicDomAttach(this.root, rowSecondary, {
                attachClass: "visible",
            });
        }

        const rowPrimary = makeDiv(this.element, null, ["buildings", "primary"]);

        const allBuildings = this.allBuildings;

        for (let i = 0; i < allBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(allBuildings[i]);

            let rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId() + "_" + this.layer];
            if (!rawBinding) {
                rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId()];
            }

            const binding = actionMapper.getBinding(rawBinding);

            const itemContainer = makeDiv(
                this.primaryBuildings.includes(allBuildings[i]) ? rowPrimary : rowSecondary,
                null,
                ["building"]
            );
            itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");
            itemContainer.setAttribute("data-id", metaBuilding.getId());

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

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0.12,
            attachClass: "visible",
        });
        this.lastSelectedIndex = 0;
        actionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildings).add(this.cycleBuildings, this);
    }

    /**
     * Updates the toolbar
     */
    update() {
        const visible = this.visibilityCondition();
        this.domAttach.update(visible);

        if (visible) {
            let recomputeSecondaryToolbarVisibility = false;
            for (const buildingId in this.buildingHandles) {
                const handle = this.buildingHandles[buildingId];
                const newStatus = handle.metaBuilding.getIsUnlocked(this.root);
                if (handle.unlocked !== newStatus) {
                    handle.unlocked = newStatus;
                    handle.element.classList.toggle("unlocked", newStatus);
                    recomputeSecondaryToolbarVisibility = true;
                }
            }

            if (recomputeSecondaryToolbarVisibility && this.secondaryDomAttach) {
                let anyUnlocked = false;
                for (let i = 0; i < this.secondaryBuildings.length; ++i) {
                    const metaClass = gMetaBuildingRegistry.findByClass(this.secondaryBuildings[i]);
                    if (metaClass.getIsUnlocked(this.root)) {
                        anyUnlocked = true;
                        break;
                    }
                }

                this.secondaryDomAttach.update(anyUnlocked);
            }
        }
    }

    /**
     * Cycles through all buildings
     */
    cycleBuildings() {
        const visible = this.visibilityCondition();
        if (!visible) {
            return;
        }

        let newBuildingFound = false;
        let newIndex = this.lastSelectedIndex;
        const direction = this.root.keyMapper.getBinding(KEYMAPPINGS.placement.rotateInverseModifier).pressed
            ? -1
            : 1;

        for (let i = 0; i <= this.primaryBuildings.length; ++i) {
            newIndex = safeModulo(newIndex + direction, this.primaryBuildings.length);
            const metaBuilding = gMetaBuildingRegistry.findByClass(this.primaryBuildings[newIndex]);
            const handle = this.buildingHandles[metaBuilding.id];
            if (!handle.selected && handle.unlocked) {
                newBuildingFound = true;
                break;
            }
        }
        if (!newBuildingFound) {
            return;
        }
        const metaBuildingClass = this.primaryBuildings[newIndex];
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
        this.root.hud.signals.buildingSelectedForPlacement.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
}
