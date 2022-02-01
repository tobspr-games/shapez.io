// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Notification Blocks",
    version: "1",
    id: "notification-blocks",
    description:
        "Adds a new building to the wires layer, 'Notification Blocks' which show a custom notification when they get a truthy signal.",

    minimumGameVersion: ">=1.5.0",
};

////////////////////////////////////////////////////////////////////////
// This is the component storing which text the block should show as
// a notification.
class NotificationBlockComponent extends shapez.Component {
    static getId() {
        return "NotificationBlock";
    }

    static getSchema() {
        // Here you define which properties should be saved to the savegame
        // and get automatically restored
        return {
            notificationText: shapez.types.string,
            lastStoredInput: shapez.types.bool,
        };
    }

    constructor() {
        super();
        this.notificationText = "Test";
        this.lastStoredInput = false;
    }
}

////////////////////////////////////////////////////////////////////////
// The game system to trigger notifications when the signal changes
class NotificationBlocksSystem extends shapez.GameSystemWithFilter {
    constructor(root) {
        // By specifying the list of components, `this.allEntities` will only
        // contain entities which have *all* of the specified components
        super(root, [NotificationBlockComponent]);

        // Ask for a notification text once an entity is placed
        this.root.signals.entityManuallyPlaced.add(entity => {
            const editorHud = this.root.hud.parts.notificationBlockEdit;
            if (editorHud) {
                editorHud.editNotificationText(entity, { deleteOnCancel: true });
            }
        });
    }

    update() {
        if (!this.root.gameInitialized) {
            // Do not start updating before the wires network was
            // computed to avoid dispatching all notifications
            return;
        }

        // Go over all notification blocks and check if the signal changed
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            // Compute if the bottom pin currently has a truthy input
            const pinsComp = entity.components.WiredPins;
            const network = pinsComp.slots[0].linkedNetwork;

            let currentInput = false;

            if (network && network.hasValue()) {
                const value = network.currentValue;
                if (value && shapez.isTruthyItem(value)) {
                    currentInput = true;
                }
            }

            // If the value changed, show the notification if its truthy
            const notificationComp = entity.components.NotificationBlock;
            if (currentInput !== notificationComp.lastStoredInput) {
                notificationComp.lastStoredInput = currentInput;
                if (currentInput) {
                    this.root.hud.signals.notification.dispatch(
                        notificationComp.notificationText,
                        shapez.enumNotificationType.info
                    );
                }
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////
// The actual notification block building
class MetaNotificationBlockBuilding extends shapez.ModMetaBuilding {
    constructor() {
        super("notification_block");
    }

    static getAllVariantCombinations() {
        return [
            {
                variant: shapez.defaultBuildingVariant,
                name: "Notification Block",
                description: "Shows a predefined notification on screen when receiving a truthy signal",

                regularImageBase64: RESOURCES["notification_block.png"],
                blueprintImageBase64: RESOURCES["notification_block.png"],
                tutorialImageBase64: RESOURCES["notification_block.png"],
            },
        ];
    }

    getSilhouetteColor() {
        return "#daff89";
    }

    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(shapez.enumHubGoalRewards.reward_wires_painter_and_levers);
    }

    getLayer() {
        return "wires";
    }

    getDimensions() {
        return new shapez.Vector(1, 1);
    }

    getRenderPins() {
        // Do not show pin overlays since it would hide our building icon
        return false;
    }

    setupEntityComponents(entity) {
        // Accept logical input from the bottom
        entity.addComponent(
            new shapez.WiredPinsComponent({
                slots: [
                    {
                        pos: new shapez.Vector(0, 0),
                        direction: shapez.enumDirection.bottom,
                        type: shapez.enumPinSlotType.logicalAcceptor,
                    },
                ],
            })
        );

        // Add your notification component to identify the building as a notification block
        entity.addComponent(new NotificationBlockComponent());
    }
}

////////////////////////////////////////////////////////////////////////
// HUD Component to be able to edit notification blocks by clicking them
class HUDNotificationBlockEdit extends shapez.BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        if (this.root.currentLayer !== "wires") {
            return;
        }

        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "wires");
        if (contents) {
            const notificationComp = contents.components.NotificationBlock;
            if (notificationComp) {
                if (button === shapez.enumMouseButton.left) {
                    this.editNotificationText(contents, {
                        deleteOnCancel: false,
                    });
                    return shapez.STOP_PROPAGATION;
                }
            }
        }
    }

    /**
     * Asks the player to enter a notification text
     * @param {Entity} entity
     * @param {object} param0
     * @param {boolean=} param0.deleteOnCancel
     */
    editNotificationText(entity, { deleteOnCancel = true }) {
        const notificationComp = entity.components.NotificationBlock;
        if (!notificationComp) {
            return;
        }

        // save the uid because it could get stale
        const uid = entity.uid;

        // create an input field to query the text
        const textInput = new shapez.FormElementInput({
            id: "notificationText",
            placeholder: "",
            defaultValue: notificationComp.notificationText,
            validator: val => val.length > 0,
        });

        // create the dialog & show it
        const dialog = new shapez.DialogWithForm({
            app: this.root.app,
            title: shapez.T.mods.notificationBlocks.dialogTitle,
            desc: shapez.T.mods.notificationBlocks.enterNotificationText,
            formElements: [textInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false,
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // When confirmed, set the text
        dialog.buttonSignals.ok.add(() => {
            if (!this.root || !this.root.entityMgr) {
                // Game got stopped
                return;
            }

            const entityRef = this.root.entityMgr.findByUid(uid, false);
            if (!entityRef) {
                // outdated
                return;
            }

            const notificationComp = entityRef.components.NotificationBlock;
            if (!notificationComp) {
                // no longer interesting
                return;
            }

            // set the text
            notificationComp.notificationText = textInput.getValue();
        });

        // When cancelled, destroy the entity again
        if (deleteOnCancel) {
            dialog.buttonSignals.cancel.add(() => {
                if (!this.root || !this.root.entityMgr) {
                    // Game got stopped
                    return;
                }

                const entityRef = this.root.entityMgr.findByUid(uid, false);
                if (!entityRef) {
                    // outdated
                    return;
                }

                const notificationComp = entityRef.components.NotificationBlock;
                if (!notificationComp) {
                    // no longer interesting
                    return;
                }

                this.root.logic.tryDeleteBuilding(entityRef);
            });
        }
    }
}

////////////////////////////////////////////////////////////////////////
// The actual mod logic
class Mod extends shapez.Mod {
    init() {
        // Register the component
        this.modInterface.registerComponent(NotificationBlockComponent);

        // Register the new building
        this.modInterface.registerNewBuilding({
            metaClass: MetaNotificationBlockBuilding,
            buildingIconBase64: RESOURCES["notification_block.png"],
        });

        // Add it to the regular toolbar
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "secondary",
            metaClass: MetaNotificationBlockBuilding,
        });

        // Register our game system so we can dispatch the notifications
        this.modInterface.registerGameSystem({
            id: "notificationBlocks",
            systemClass: NotificationBlocksSystem,
            before: "constantSignal",
        });

        // Register our hud element to be able to edit the notification texts
        this.modInterface.registerHudElement("notificationBlockEdit", HUDNotificationBlockEdit);

        // This mod also supports translations
        this.modInterface.registerTranslations("en", {
            mods: {
                notificationBlocks: {
                    enterNotificationText:
                        "Enter the notification text to show once the signal switches from 0 to 1:",
                },
            },
        });
    }
}

const RESOURCES = {
    "notification_block.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4VpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAyQTMyQTVGNzA1RTExRUNBQ0EzQTZCNEYxQjM5MkFBIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAyQTMyQTVFNzA1RTExRUNBQ0EzQTZCNEYxQjM5MkFBIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjY3NDVhMzZlLTkyMWUtNDViYS04NDFjLWVjOWZjZTc0Y2MyNSIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk3MDYxZWYyLTY2ZGMtZjI0Zi1iZTMy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",
};
