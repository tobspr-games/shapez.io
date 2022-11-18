import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { globalWarn } from "../../../core/logging";
import { STOP_PROPAGATION } from "../../../core/signal";
import { makeDiv, safeModulo } from "../../../core/utils";
import { MetaBlockBuilding } from "../../buildings/block";
import { MetaConstantProducerBuilding } from "../../buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "../../buildings/goal_acceptor";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
export class HUDBaseToolbar extends BaseHUDPart {
    public primaryBuildings = this.filterBuildings(primaryBuildings);
    public secondaryBuildings = this.filterBuildings(secondaryBuildings);
    public visibilityCondition = visibilityCondition;
    public htmlElementId = htmlElementId;
    public layer = layer;
    public buildingHandles: {
        [idx: string]: {
            metaBuilding: MetaBuilding;
            unlocked: boolean;
            selected: boolean;
            element: HTMLElement;
            index: number;
            puzzleLocked: boolean;
        };
    } = {};

        constructor(root, { primaryBuildings, secondaryBuildings = [], visibilityCondition, htmlElementId, layer = "regular" }) {
        super(root);
    }
    /**
     * Should create all require elements
     */
    createElements(parent: HTMLElement): any {
        this.element = makeDiv(parent, this.htmlElementId, ["ingame_buildingsToolbar"], "");
    }
    /**
     * {}
     */
    filterBuildings(buildings: Array<typeof MetaBuilding>): Array<typeof MetaBuilding> {
        const filtered: any = [];
        for (let i: any = 0; i < buildings.length; i++) {
            if (this.root.gameMode.isBuildingExcluded(buildings[i])) {
                continue;
            }
            filtered.push(buildings[i]);
        }
        return filtered;
    }
    /**
     * Returns all buildings
     * {}
     */
    get allBuildings() {
        return [...this.primaryBuildings, ...this.secondaryBuildings];
    }
    initialize(): any {
        const actionMapper: any = this.root.keyMapper;
        let rowSecondary: any;
        if (this.secondaryBuildings.length > 0) {
            rowSecondary = makeDiv(this.element, null, ["buildings", "secondary"]);
            this.secondaryDomAttach = new DynamicDomAttach(this.root, rowSecondary, {
                attachClass: "visible",
            });
        }
        const rowPrimary: any = makeDiv(this.element, null, ["buildings", "primary"]);
        const allBuildings: any = this.allBuildings;
        for (let i: any = 0; i < allBuildings.length; ++i) {
            const metaBuilding: any = gMetaBuildingRegistry.findByClass(allBuildings[i]);
            let rawBinding: any = KEYMAPPINGS.buildings[metaBuilding.getId() + "_" + this.layer];
            if (!rawBinding) {
                rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId()];
            }
            if (rawBinding) {
                const binding: any = actionMapper.getBinding(rawBinding);
                binding.add((): any => this.selectBuildingForPlacement(metaBuilding));
            }
            else {
                globalWarn("Building has no keybinding:", metaBuilding.getId());
            }
            const itemContainer: any = makeDiv(this.primaryBuildings.includes(allBuildings[i]) ? rowPrimary : rowSecondary, null, ["building"]);
            itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");
            itemContainer.setAttribute("data-id", metaBuilding.getId());
            const icon: any = makeDiv(itemContainer, null, ["icon"]);
            this.trackClicks(icon, (): any => this.selectBuildingForPlacement(metaBuilding), {
                clickSound: null,
            });
            //lock icon for puzzle editor
            if (this.root.gameMode.getIsEditor() && !this.inRequiredBuildings(metaBuilding)) {
                const puzzleLock: any = makeDiv(itemContainer, null, ["puzzle-lock"]);
                itemContainer.classList.toggle("editor", true);
                this.trackClicks(puzzleLock, (): any => this.toggleBuildingLock(metaBuilding), {
                    clickSound: null,
                });
            }
            this.buildingHandles[metaBuilding.id] = {
                metaBuilding: metaBuilding,
                element: itemContainer,
                unlocked: false,
                selected: false,
                index: i,
                puzzleLocked: false,
            };
        }
        this.root.hud.signals.selectedPlacementBuildingChanged.add(this.onSelectedPlacementBuildingChanged, this);
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
    update(): any {
        const visible: any = this.visibilityCondition();
        this.domAttach.update(visible);
        if (visible) {
            let recomputeSecondaryToolbarVisibility: any = false;
            for (const buildingId: any in this.buildingHandles) {
                const handle: any = this.buildingHandles[buildingId];
                const newStatus: any = !handle.puzzleLocked && handle.metaBuilding.getIsUnlocked(this.root);
                if (handle.unlocked !== newStatus) {
                    handle.unlocked = newStatus;
                    handle.element.classList.toggle("unlocked", newStatus);
                    recomputeSecondaryToolbarVisibility = true;
                }
            }
            if (recomputeSecondaryToolbarVisibility && this.secondaryDomAttach) {
                let anyUnlocked: any = false;
                for (let i: any = 0; i < this.secondaryBuildings.length; ++i) {
                    const metaClass: any = gMetaBuildingRegistry.findByClass(this.secondaryBuildings[i]);
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
    cycleBuildings(): any {
        const visible: any = this.visibilityCondition();
        if (!visible) {
            return;
        }
        let newBuildingFound: any = false;
        let newIndex: any = this.lastSelectedIndex;
        const direction: any = this.root.keyMapper.getBinding(KEYMAPPINGS.placement.rotateInverseModifier).pressed
            ? -1
            : 1;
        for (let i: any = 0; i <= this.primaryBuildings.length; ++i) {
            newIndex = safeModulo(newIndex + direction, this.primaryBuildings.length);
            const metaBuilding: any = gMetaBuildingRegistry.findByClass(this.primaryBuildings[newIndex]);
            const handle: any = this.buildingHandles[metaBuilding.id];
            if (!handle.selected && handle.unlocked) {
                newBuildingFound = true;
                break;
            }
        }
        if (!newBuildingFound) {
            return;
        }
        const metaBuildingClass: any = this.primaryBuildings[newIndex];
        const metaBuilding: any = gMetaBuildingRegistry.findByClass(metaBuildingClass);
        this.selectBuildingForPlacement(metaBuilding);
    }
    /**
     * Called when the selected building got changed
     */
    onSelectedPlacementBuildingChanged(metaBuilding: MetaBuilding): any {
        for (const buildingId: any in this.buildingHandles) {
            const handle: any = this.buildingHandles[buildingId];
            const newStatus: any = handle.metaBuilding === metaBuilding;
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
        selectBuildingForPlacement(metaBuilding: MetaBuilding): any {
        if (!this.visibilityCondition()) {
            // Not active
            return;
        }
        if (!metaBuilding.getIsUnlocked(this.root)) {
            this.root.soundProxy.playUiError();
            return STOP_PROPAGATION;
        }
        const handle: any = this.buildingHandles[metaBuilding.getId()];
        if (handle.puzzleLocked) {
            handle.puzzleLocked = false;
            handle.element.classList.toggle("unlocked", false);
            this.root.soundProxy.playUiClick();
            return;
        }
        // Allow clicking an item again to deselect it
        for (const buildingId: any in this.buildingHandles) {
            const handle: any = this.buildingHandles[buildingId];
            if (handle.selected && handle.metaBuilding === metaBuilding) {
                metaBuilding = null;
                break;
            }
        }
        this.root.soundProxy.playUiClick();
        this.root.hud.signals.buildingSelectedForPlacement.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
        toggleBuildingLock(metaBuilding: MetaBuilding): any {
        if (!this.visibilityCondition()) {
            // Not active
            return;
        }
        if (this.inRequiredBuildings(metaBuilding) || !metaBuilding.getIsUnlocked(this.root)) {
            this.root.soundProxy.playUiError();
            return STOP_PROPAGATION;
        }
        const handle: any = this.buildingHandles[metaBuilding.getId()];
        handle.puzzleLocked = !handle.puzzleLocked;
        handle.element.classList.toggle("unlocked", !handle.puzzleLocked);
        this.root.soundProxy.playUiClick();
        const entityManager: any = this.root.entityMgr;
        for (const entity: any of entityManager.getAllWithComponent(StaticMapEntityComponent)) {
            const staticComp: any = entity.components.StaticMapEntity;
            if (staticComp.getMetaBuilding().id === metaBuilding.id) {
                this.root.map.removeStaticEntity(entity);
                entityManager.destroyEntity(entity);
            }
        }
        entityManager.processDestroyList();
        const currentMetaBuilding: any = this.root.hud.parts.buildingPlacer.currentMetaBuilding;
        if (currentMetaBuilding.get() == metaBuilding) {
            currentMetaBuilding.set(null);
        }
    }
        inRequiredBuildings(metaBuilding: MetaBuilding): any {
        const requiredBuildings: any = [
            gMetaBuildingRegistry.findByClass(MetaConstantProducerBuilding),
            gMetaBuildingRegistry.findByClass(MetaGoalAcceptorBuilding),
            gMetaBuildingRegistry.findByClass(MetaBlockBuilding),
        ];
        return requiredBuildings.includes(metaBuilding);
    }
}
