import { globalConfig } from "../../core/config";
import { smoothenDpi } from "../../core/dpi_manager";
import { DrawParameters } from "../../core/draw_parameters";
import { drawSpriteClipped } from "../../core/draw_utils";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import { ORIGINAL_SPRITE_SCALE } from "../../core/sprites";
import { formatBigNumber } from "../../core/utils";
import { T } from "../../translations";
import { HubComponent } from "../components/hub";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";

const HUB_SIZE_TILES = 4;
const HUB_SIZE_PIXELS = HUB_SIZE_TILES * globalConfig.tileSize;

export class HubSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [HubComponent]);

        this.hubSprite = Loader.getSprite("sprites/buildings/hub.png");
    }

    /**
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        for (let i = 0; i < this.allEntities.length; ++i) {
            this.drawEntity(parameters, this.allEntities[i]);
        }
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            // Set hub goal
            const entity = this.allEntities[i];
            const pinsComp = entity.components.WiredPins;
            for (let i = 0; i < pinsComp.slots.length; i++) {
                if (!this.root.hubGoals.currentGoal.definitions[i]) {
                    pinsComp.slots[i].value = null;
                    continue;
                }

                pinsComp.slots[i].value = this.root.shapeDefinitionMgr.getShapeItemFromDefinition(
                    this.root.hubGoals.currentGoal.definitions[i]
                );
            }
        }
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} w
     * @param {number} h
     * @param {number} dpi
     */
    redrawHubBaseTexture(canvas, context, w, h, dpi) {
        // This method is quite ugly, please ignore it! It's more ugly now

        context.scale(dpi, dpi);

        const parameters = new DrawParameters({
            context,
            visibleRect: new Rectangle(0, 0, w, h),
            desiredAtlasScale: ORIGINAL_SPRITE_SCALE,
            zoomLevel: dpi * 0.75,
            root: this.root,
        });

        context.clearRect(0, 0, w, h);

        this.hubSprite.draw(context, 0, 0, w, h);

        if (this.root.hubGoals.isEndOfDemoReached()) {
            // End of demo
            context.font = "bold 12px GameFont";
            context.fillStyle = "#fd0752";
            context.textAlign = "center";
            context.fillText(T.buildings.hub.endOfDemo.toUpperCase(), w / 2, h / 2 + 6);
            context.textAlign = "left";

            return;
        }

        const goals = this.root.hubGoals.currentGoal;
        const delivered = this.root.hubGoals.getCurrentGoalDelivered();
        for (let i = 0; i < goals.definitions.length; i++) {
            const x =
                45 +
                (goals.definitions.length > 3
                    ? 22 * i - 14
                    : goals.definitions.length > 2
                    ? 28 * i - 8
                    : goals.definitions.length > 1
                    ? 43 * i
                    : 0);
            const y = 58 + (goals.definitions.length > 1 ? -3 : 0);
            goals.definitions[i].drawCentered(
                x,
                y,
                parameters,
                goals.definitions.length > 3
                    ? 20
                    : goals.definitions.length > 2
                    ? 26
                    : goals.definitions.length > 1
                    ? 32
                    : 36
            );

            const textOffsetX = 0;
            const textOffsetY = 24;

            if (goals.requires[i].throughputOnly) {
                // Throughput
                const deliveredText = T.ingame.statistics.shapesDisplayUnits.second.replace(
                    "<shapes>",
                    formatBigNumber(goals.requires[i].amount)
                );
                if (goals.definitions.length > 3) {
                    context.font = "bold 6px GameFont";
                    context.fillStyle = "#64666e";
                    context.textAlign = "left";
                    const offset = context.measureText(deliveredText).width;
                    context.fillText(deliveredText, textOffsetX + x - offset / 2, textOffsetY + y - 6);
                } else if (goals.definitions.length > 2) {
                    context.font = "bold 6px GameFont";
                    context.fillStyle = "#64666e";
                    context.textAlign = "left";
                    const offset = context.measureText(deliveredText).width;
                    context.fillText(deliveredText, textOffsetX + x - offset / 2, textOffsetY + y - 4);
                } else if (goals.definitions.length > 1) {
                    context.font = "bold 8px GameFont";
                    context.fillStyle = "#64666e";
                    context.textAlign = "left";
                    const offset = context.measureText(deliveredText).width;
                    context.fillText(deliveredText, textOffsetX + x - offset / 2, textOffsetY + y);
                } else {
                    context.font = "bold 12px GameFont";
                    context.fillStyle = "#64666e";
                    context.textAlign = "left";
                    const offset = context.measureText(deliveredText).width;
                    context.fillText(deliveredText, textOffsetX + 86 - offset / 2, textOffsetY + 40);
                }
            } else {
                const textRequired = "/" + formatBigNumber(goals.requires[i].amount);
                const textDelivered = formatBigNumber(delivered[i]);
                if (goals.definitions.length > 3) {
                    context.font = "6px GameFont";
                    const offsetRequired = context.measureText(textRequired).width;

                    context.font = "bold 6px GameFont";
                    const offsetDelivered = context.measureText(textDelivered).width;

                    const totalOffset = offsetDelivered + offsetRequired;

                    // Delivered
                    context.fillStyle = "#64666e";
                    context.fillText(textDelivered, textOffsetX + x - totalOffset / 2, textOffsetY + y - 6);

                    // Required
                    context.font = "6px GameFont";
                    context.fillStyle = "#64666e";
                    context.fillText(
                        textRequired,
                        textOffsetX + x + offsetDelivered - totalOffset / 2,
                        textOffsetY + y - 6
                    );
                } else if (goals.definitions.length > 2) {
                    context.font = "6px GameFont";
                    const offsetRequired = context.measureText(textRequired).width;

                    context.font = "bold 6px GameFont";
                    const offsetDelivered = context.measureText(textDelivered).width;

                    const totalOffset = offsetDelivered + offsetRequired;

                    // Delivered
                    context.fillStyle = "#64666e";
                    context.fillText(textDelivered, textOffsetX + x - totalOffset / 2, textOffsetY + y - 4);

                    // Required
                    context.font = "6px GameFont";
                    context.fillStyle = "#64666e";
                    context.fillText(
                        textRequired,
                        textOffsetX + x + offsetDelivered - totalOffset / 2,
                        textOffsetY + y - 4
                    );
                } else if (goals.definitions.length > 1) {
                    context.font = "8px GameFont";
                    const offsetRequired = context.measureText(textRequired).width;

                    context.font = "bold 8px GameFont";
                    const offsetDelivered = context.measureText(textDelivered).width;

                    const totalOffset = offsetDelivered + offsetRequired;

                    // Delivered
                    context.fillStyle = "#64666e";
                    context.fillText(textDelivered, textOffsetX + x - totalOffset / 2, textOffsetY + y);

                    // Required
                    context.font = "8px GameFont";
                    context.fillStyle = "#64666e";
                    context.fillText(
                        textRequired,
                        textOffsetX + x + offsetDelivered - totalOffset / 2,
                        textOffsetY + y
                    );
                } else {
                    // Delivered
                    if (delivered[i] > 9999) {
                        context.font = "bold 16px GameFont";
                    } else if (delivered[i] > 999) {
                        context.font = "bold 20px GameFont";
                    } else {
                        context.font = "bold 25px GameFont";
                    }
                    context.fillStyle = "#64666e";
                    context.textAlign = "left";
                    context.fillText(textDelivered, textOffsetX + 70, textOffsetY + 37);

                    // Required
                    context.font = "13px GameFont";
                    context.fillStyle = "#a4a6b0";
                    context.fillText(textRequired, textOffsetX + 70, textOffsetY + 37 + 13);
                }
            }
        }

        // Reward
        const rewardText = T.storyRewards[goals.reward].title.toUpperCase();
        if (rewardText.length > 12) {
            context.font = "bold 8px GameFont";
        } else {
            context.font = "bold 10px GameFont";
        }
        context.fillStyle = "#fd0752";
        context.textAlign = "center";

        context.fillText(rewardText, HUB_SIZE_PIXELS / 2, 105);

        // Level "8"
        context.font = "bold 10px GameFont";
        context.fillStyle = "#fff";
        context.fillText("" + this.root.hubGoals.level, 27, 32);

        // "LVL"
        context.textAlign = "center";
        context.fillStyle = "#fff";
        context.font = "bold 6px GameFont";
        context.fillText(T.buildings.hub.levelShortcut, 27, 22);

        // "Deliver"
        context.fillStyle = "#64666e";
        context.font = "bold 10px GameFont";
        context.fillText(T.buildings.hub.deliver.toUpperCase(), HUB_SIZE_PIXELS / 2, 30);

        // "To unlock"
        const unlockText = T.buildings.hub.toUnlock.toUpperCase();
        if (unlockText.length > 15) {
            context.font = "bold 8px GameFont";
        } else {
            context.font = "bold 10px GameFont";
        }
        context.fillText(T.buildings.hub.toUnlock.toUpperCase(), HUB_SIZE_PIXELS / 2, 92);

        context.textAlign = "left";
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        // Deliver count
        const delivered = this.root.hubGoals.getCurrentGoalDelivered();
        const deliveredText = delivered.map(value => formatBigNumber(value));

        const dpi = smoothenDpi(globalConfig.shapesSharpness * parameters.zoomLevel);
        const canvas = parameters.root.buffers.getForKey({
            key: "hub",
            subKey: dpi + "/" + this.root.hubGoals.level + "/" + deliveredText,
            w: globalConfig.tileSize * 4,
            h: globalConfig.tileSize * 4,
            dpi,
            redrawMethod: this.redrawHubBaseTexture.bind(this),
        });

        const extrude = 8;
        drawSpriteClipped({
            parameters,
            sprite: canvas,
            x: staticComp.origin.x * globalConfig.tileSize - extrude,
            y: staticComp.origin.y * globalConfig.tileSize - extrude,
            w: HUB_SIZE_PIXELS + 2 * extrude,
            h: HUB_SIZE_PIXELS + 2 * extrude,
            originalW: HUB_SIZE_PIXELS * dpi,
            originalH: HUB_SIZE_PIXELS * dpi,
        });
    }
}
