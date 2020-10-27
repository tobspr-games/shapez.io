import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { WirelessDisplayComponent } from "../components/wireless_display";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { isTrueItem } from "../items/boolean_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { MapChunkView } from "../map_chunk_view";
import { THIRDPARTY_URLS } from "../../core/config";
import { DialogWithForm } from "../../core/modal_dialog_elements";
import { FormElementInput, FormElementItemChooser } from "../../core/modal_dialog_forms";
import { fillInLinkIntoTranslation } from "../../core/utils";
import { T } from "../../translations";
import { Entity } from "../entity";
import { WirelessCodeComponent } from "../components/wireless_code";

export class WirelessDisplaySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WirelessDisplayComponent]);

        this.root.signals.entityManuallyPlaced.add(this.channelSignalValue, this);

        /** @type {Object<string, import("../../core/draw_utils").AtlasSprite>} */
        this.displaySprites = {};

        for (const colorId in enumColors) {
            if (colorId === enumColors.uncolored) {
                continue;
            }
            this.displaySprites[colorId] = Loader.getSprite("sprites/wires/display/" + colorId + ".png");
        }

        this.wirelessMachineList = {};

        this.displayNumber = 0;
        this.entityCount = 0;
    }

    update() {
        if (this.entityCount != this.allEntities.length) {
            for (let i = 0; i < this.allEntities.length; i++) {
                const entity = this.allEntities[i];
                if (entity.components.WirelessDisplay && entity.components.WiredPins && entity.components.WirelessCode && !this.wirelessMachineList[entity.components.WirelessCode]) {
                    this.wirelessMachineList[entity.components.WirelessCode["wireless_code"]] = entity;
                }
            }
            this.entityCount = this.allEntities.length;
        }
    }

    /**
     * Asks the entity to enter a valid signal code
     * @param {Entity} entity
     */
    channelSignalValue(entity) {
        if (entity.components.WirelessDisplay) {
            // Ok, query, but also save the uid because it could get stale
            const uid = entity.uid;

            const signalValueInput = new FormElementInput({
                id: "channelValue",
                label: fillInLinkIntoTranslation(T.dialogs.editChannel.descShortKey, THIRDPARTY_URLS.shapeViewer),
                placeholder: "",
                defaultValue: "",
                validator: val => val,
            });

            const channeldialog = new DialogWithForm({
                app: this.root.app,
                title: T.dialogs.editChannel.title,
                desc: T.dialogs.editChannel.descItems,
                formElements: [signalValueInput],
                buttons: ["cancel:bad:escape", "ok:good:enter"],
                closeButton: false,
            });
            this.root.hud.parts.dialogs.internalShowDialog(channeldialog);

            // When confirmed, set the signal
            const closeHandler = () => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                const constantComp = entityRef.components.WirelessDisplay;
                if (!constantComp) {
                    // no longer interesting
                    return;
                }

                if (signalValueInput.getValue() && !entity.components.WiredPins) {
                    entity.addComponent(new WirelessCodeComponent(signalValueInput.getValue()));
                } else if (signalValueInput.getValue() && entity.components.WiredPins) {
                    entity.addComponent(new WirelessCodeComponent(signalValueInput.getValue()));
                    this.wirelessMachineList[entity.components.WirelessCode["wireless_code"]] = entity;
                }
            };

            channeldialog.buttonSignals.ok.add(closeHandler);
            channeldialog.valueChosen.add(closeHandler);

            // When cancelled, destroy the entity again
            channeldialog.buttonSignals.cancel.add(() => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                const constantComp = entityRef.components.WirelessDisplay;
                if (!constantComp) {
                    // no longer interesting
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }

    /**
     * Returns the color / value a display should show
     * @param {BaseItem} value
     * @returns {BaseItem}
     */
    getDisplayItem(value) {
        if (!value) {
            return null;
        }

        switch (value.getItemType()) {
            case "boolean": {
                return isTrueItem(value) ? COLOR_ITEM_SINGLETONS[enumColors.white] : null;
            }

            case "color": {
                const item = /**@type {ColorItem} */ (value);
                return item.color === enumColors.uncolored ? null : item;
            }

            case "shape": {
                return value;
            }

            default:
                assertAlways(false, "Unknown item type: " + value.getItemType());
        }
    }

    /**
     * Draws a given chunk
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity_a = contents[i];
            if (entity_a && !entity_a.components.WiredPins && entity_a.components.WirelessDisplay && entity_a.components.WirelessCode) {
                const entity_b = this.wirelessMachineList[entity_a.components.WirelessCode["wireless_code"]];
                if (entity_b) {
                    if (!this.allEntities.includes(entity_b)) {
                        this.wirelessMachineList[entity_b] = undefined;
                        return;
                    }
                    const origin = entity_a.components.StaticMapEntity.origin;
                    const pinsComp = entity_b.components.WiredPins;
                    const network = pinsComp.slots[0].linkedNetwork;
    
                    if (!network) {
                        continue;
                    }
    
                    const value = this.getDisplayItem(network.currentValue);
    
                    if (!value) {
                        continue;
                    }
    
                    if (value.getItemType()) {
                        if (value.getItemType() === "color") {
                            this.displaySprites[/** @type {ColorItem} */ (value).color].drawCachedCentered(
                                parameters,
                                (origin.x + 0.5) * globalConfig.tileSize,
                                (origin.y + 0.5) * globalConfig.tileSize,
                                globalConfig.tileSize
                            );
                        } else if (value.getItemType() === "shape") {
                            value.drawItemCenteredClipped(
                                (origin.x + 0.5) * globalConfig.tileSize,
                                (origin.y + 0.5) * globalConfig.tileSize,
                                parameters,
                                30
                            );
                        }
                    }
                }
            }
        }
    }
}

