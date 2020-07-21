import { MetaBuilding, defaultBuildingVariant } from "./meta_building";
import { MetaCutterBuilding, enumCutterVariants } from "./buildings/cutter";
import { MetaRotaterBuilding, enumRotaterVariants } from "./buildings/rotater";
import { MetaPainterBuilding, enumPainterVariants } from "./buildings/painter";
import { MetaMixerBuilding } from "./buildings/mixer";
import { MetaStackerBuilding } from "./buildings/stacker";
import { MetaSplitterBuilding, enumSplitterVariants } from "./buildings/splitter";
import { MetaUndergroundBeltBuilding, enumUndergroundBeltVariants } from "./buildings/underground_belt";
import { MetaMinerBuilding, enumMinerVariants } from "./buildings/miner";
import { MetaTrashBuilding, enumTrashVariants } from "./buildings/trash";

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
    [enumHubGoalRewards.reward_splitter]: typed([[MetaSplitterBuilding, defaultBuildingVariant]]),
    [enumHubGoalRewards.reward_tunnel]: typed([[MetaUndergroundBeltBuilding, defaultBuildingVariant]]),

    [enumHubGoalRewards.reward_rotater_ccw]: typed([[MetaRotaterBuilding, enumRotaterVariants.ccw]]),
    [enumHubGoalRewards.reward_rotater_fl]: typed([[MetaRotaterBuilding, enumRotaterVariants.fl]]),
    [enumHubGoalRewards.reward_miner_chainable]: typed([[MetaMinerBuilding, enumMinerVariants.chainable]]),
    [enumHubGoalRewards.reward_underground_belt_tier_2]: typed([
        [MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2],
    ]),
    [enumHubGoalRewards.reward_splitter_compact]: typed([
        [MetaSplitterBuilding, enumSplitterVariants.compact],
    ]),
    [enumHubGoalRewards.reward_cutter_quad]: typed([[MetaCutterBuilding, enumCutterVariants.quad]]),
    [enumHubGoalRewards.reward_painter_double]: typed([[MetaPainterBuilding, enumPainterVariants.double]]),
    [enumHubGoalRewards.reward_painter_quad]: typed([[MetaPainterBuilding, enumPainterVariants.quad]]),
    [enumHubGoalRewards.reward_storage]: typed([[MetaTrashBuilding, enumTrashVariants.storage]]),

    [enumHubGoalRewards.reward_freeplay]: null,
    [enumHubGoalRewards.no_reward]: null,
    [enumHubGoalRewards.no_reward_freeplay]: null,
};
