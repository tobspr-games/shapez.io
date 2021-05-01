import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { clamp, lerp } from "../../core/utils";
import { Vector } from "../../core/vector";
import { GoalAcceptorComponent } from "../components/goal_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunk } from "../map_chunk";
import { GameRoot } from "../root";

export class GoalAcceptorSystem extends GameSystemWithFilter {
    /** @param {GameRoot} root */
    constructor(root) {
        super(root, [GoalAcceptorComponent]);

        this.puzzleCompleted = false;
    }

    update() {
        const now = this.root.time.now();

        let allAccepted = true;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const goalComp = entity.components.GoalAcceptor;

            // filter the ones which are no longer active, or which are not the same
            goalComp.deliveryHistory = goalComp.deliveryHistory.filter(
                d =>
                    now - d.time < globalConfig.goalAcceptorMinimumDurationSeconds && d.item === goalComp.item
            );

            if (goalComp.deliveryHistory.length < goalComp.getRequiredDeliveryHistorySize()) {
                allAccepted = false;
            }
        }

        if (
            !this.puzzleCompleted &&
            this.root.gameInitialized &&
            allAccepted &&
            !this.root.gameMode.getIsEditor()
        ) {
            this.root.signals.puzzleComplete.dispatch();
            this.puzzleCompleted = true;
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunk} chunk
     * @returns
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const goalComp = contents[i].components.GoalAcceptor;

            if (!goalComp) {
                continue;
            }

            const staticComp = contents[i].components.StaticMapEntity;
            const item = goalComp.item;

            const requiredItemsForSuccess = goalComp.getRequiredDeliveryHistorySize();
            const percentage = clamp(goalComp.deliveryHistory.length / requiredItemsForSuccess, 0, 1);

            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            if (item) {
                const localOffset = new Vector(0, -1.8).rotateFastMultipleOf90(staticComp.rotation);
                item.drawItemCenteredClipped(
                    center.x + localOffset.x,
                    center.y + localOffset.y,
                    parameters,
                    globalConfig.tileSize * 0.65
                );
            }

            const isValid = item && goalComp.deliveryHistory.length >= requiredItemsForSuccess;

            parameters.context.translate(center.x, center.y);
            parameters.context.rotate((staticComp.rotation / 180) * Math.PI);

            parameters.context.lineWidth = 1;
            parameters.context.fillStyle = "#8de255";
            parameters.context.strokeStyle = "#64666e";
            parameters.context.lineCap = "round";

            // progress arc

            goalComp.displayPercentage = lerp(goalComp.displayPercentage, percentage, 0.3);

            const startAngle = Math.PI * 0.595;
            const maxAngle = Math.PI * 1.82;
            parameters.context.beginPath();
            parameters.context.arc(
                0.25,
                -1.5,
                11.6,
                startAngle,
                startAngle + goalComp.displayPercentage * maxAngle,
                false
            );
            parameters.context.arc(
                0.25,
                -1.5,
                15.5,
                startAngle + goalComp.displayPercentage * maxAngle,
                startAngle,
                true
            );
            parameters.context.closePath();
            parameters.context.fill();
            parameters.context.stroke();
            parameters.context.lineCap = "butt";

            // LED indicator

            parameters.context.lineWidth = 1;
            parameters.context.strokeStyle = "#64666e";
            parameters.context.fillStyle = isValid ? "#8de255" : "#ff666a";
            parameters.context.beginCircle(10, 11.8, 3);
            parameters.context.fill();
            parameters.context.stroke();

            parameters.context.rotate((-staticComp.rotation / 180) * Math.PI);
            parameters.context.translate(-center.x, -center.y);
        }
    }
}
