import { GameSystemWithFilter } from "../game_system_with_filter";
import { HubComponent } from "../components/hub";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { formatBigNumber } from "../../core/utils";
import { Loader } from "../../core/loader";
import { T } from "../../translations";

export class HubSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [HubComponent]);

        this.hubSprite = Loader.getSprite("sprites/buildings/hub.png");
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const hubComponent = entity.components.Hub;

            const queue = hubComponent.definitionsToAnalyze;
            for (let k = 0; k < queue.length; ++k) {
                const definition = queue[k];
                this.root.hubGoals.handleDefinitionDelivered(definition);
            }

            hubComponent.definitionsToAnalyze = [];
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const pos = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        // Background
        staticComp.drawSpriteOnFullEntityBounds(parameters, this.hubSprite, 2.2);

        const definition = this.root.hubGoals.currentGoal.definition;

        definition.draw(pos.x - 25, pos.y - 10, parameters, 40);

        const goals = this.root.hubGoals.currentGoal;

        const textOffsetX = 2;
        const textOffsetY = -6;

        // Deliver count
        const delivered = this.root.hubGoals.getCurrentGoalDelivered();

        if (delivered > 9999) {
            context.font = "bold 16px GameFont";
        } else if (delivered > 999) {
            context.font = "bold 20px GameFont";
        } else {
            context.font = "bold 25px GameFont";
        }
        context.fillStyle = "#64666e";
        context.textAlign = "left";
        context.fillText("" + formatBigNumber(delivered), pos.x + textOffsetX, pos.y + textOffsetY);

        // Required
        context.font = "13px GameFont";
        context.fillStyle = "#a4a6b0";
        context.fillText(
            "/ " + formatBigNumber(goals.required),
            pos.x + textOffsetX,
            pos.y + textOffsetY + 13
        );

        // Reward
        const rewardText = T.storyRewards[goals.reward].title.toUpperCase();
        if (rewardText.length > 12) {
            context.font = "bold 9px GameFont";
        } else {
            context.font = "bold 11px GameFont";
        }
        context.fillStyle = "#fd0752";
        context.textAlign = "center";

        context.fillText(rewardText, pos.x, pos.y + 46);

        // Level
        context.font = "bold 11px GameFont";
        context.fillStyle = "#fff";
        context.fillText("" + this.root.hubGoals.level, pos.x - 42, pos.y - 36);

        // Texts
        context.textAlign = "center";
        context.fillStyle = "#fff";
        context.font = "bold 7px GameFont";
        context.fillText(T.buildings.hub.levelShortcut, pos.x - 42, pos.y - 47);

        context.fillStyle = "#64666e";
        context.font = "bold 11px GameFont";
        context.fillText(T.buildings.hub.deliver.toUpperCase(), pos.x, pos.y - 40);
        context.fillText(T.buildings.hub.toUnlock.toUpperCase(), pos.x, pos.y + 30);

        context.textAlign = "left";
    }
}
