import { T } from "../translations";
import { enumBalancerVariants, MetaBalancerBuilding } from "./buildings/balancer";
import { MetaConstantSignalBuilding } from "./buildings/constant_signal";
import { enumCutterVariants, MetaCutterBuilding } from "./buildings/cutter";
import { MetaDisplayBuilding } from "./buildings/display";
import { MetaLeverBuilding } from "./buildings/lever";
import { MetaLogicGateBuilding } from "./buildings/logic_gate";
import { enumMinerVariants, MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { enumPainterVariants, MetaPainterBuilding } from "./buildings/painter";
import { MetaReaderBuilding } from "./buildings/reader";
import { enumRotaterVariants, MetaRotaterBuilding } from "./buildings/rotater";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaStorageBuilding } from "./buildings/storage";
import { enumUndergroundBeltVariants, MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { defaultBuildingVariant, MetaBuilding } from "./meta_building";
/** @typedef {Array<[typeof MetaBuilding, string]>} TutorialGoalReward */
import { enumHubGoalRewards } from "./tutorial_goals";

/**
 * Helper method for proper types
 *  @returns {TutorialGoalReward}
 */
const typed = x => x;

/**
 * Stores which reward unlocks what
 * @enum {TutorialGoalReward?}
 */
export const enumHubGoalRewardsToContentUnlocked = {
    [enumHubGoalRewards.reward_cutter_and_trash]: typed([[MetaCutterBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_rotater]: typed([[MetaRotaterBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_painter]: typed([[MetaPainterBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_mixer]: typed([[MetaMixerBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_stacker]: typed([[MetaStackerBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_balancer]: typed([[MetaBalancerBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_tunnel]: typed([[MetaUndergroundBeltBuilding, defaultBuildingVariant]]),

    [enumHubGoalRewards.reward_rotater_ccw]: typed([[MetaRotaterBuilding, enumRotaterVariants.ccw]]),
    [enumHubGoalRewards.reward_rotater_180]: typed([[MetaRotaterBuilding, enumRotaterVariants.rotate180]]),
    [enumHubGoalRewards.reward_miner_chainable]: typed([[MetaMinerBuilding, enumMinerVariants.chainable]]),
    [enumHubGoalRewards.reward_underground_belt_tier_2]: typed([
        [MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2],
    ]),
    [enumHubGoalRewards.reward_splitter]: typed([[MetaBalancerBuilding, enumBalancerVariants.splitter]]),
    [enumHubGoalRewards.reward_merger]: typed([[MetaBalancerBuilding, enumBalancerVariants.merger]]),
    [enumHubGoalRewards.reward_cutter_quad]: typed([[MetaCutterBuilding, enumCutterVariants.quad]]),
    [enumHubGoalRewards.reward_painter_double]: typed([[MetaPainterBuilding, enumPainterVariants.double]]),
    [enumHubGoalRewards.reward_painter_quad]: typed([[MetaPainterBuilding, enumPainterVariants.quad]]),
    [enumHubGoalRewards.reward_storage]: typed([[MetaStorageBuilding, defaultBuildingVariant]]),

    [enumHubGoalRewards.reward_belt_reader]: typed([[MetaReaderBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_display]: typed([[MetaDisplayBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_constant_signal]: typed([
        [MetaConstantSignalBuilding, defaultBuildingVariant],
    ]),
    [enumHubGoalRewards.reward_logic_gates]: typed([[MetaLogicGateBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_virtual_processing]: null, // @TODO!

    [enumHubGoalRewards.reward_wires_filters_and_levers]: typed([
        [MetaLeverBuilding, defaultBuildingVariant],
    ]),
    [enumHubGoalRewards.reward_freeplay]: null,
    [enumHubGoalRewards.reward_blueprints]: null,
    [enumHubGoalRewards.no_reward]: null,
    [enumHubGoalRewards.no_reward_freeplay]: null,
};

if (G_IS_DEV) {
    // Sanity check
    for (const rewardId in enumHubGoalRewards) {
        const mapping = enumHubGoalRewardsToContentUnlocked[rewardId];

        if (typeof mapping === "undefined") {
            assertAlways(
                false,
                "Please define a mapping for the reward " + rewardId + " in tutorial_goals_mappings.js"
            );
        }

        const translation = T.storyRewards[rewardId];
        if (!translation || !translation.title || !translation.desc) {
            assertAlways(false, "Translation for reward " + rewardId + "missing");
        }
    }
}
