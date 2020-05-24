import { ShapeDefinition } from "./shape_definition";
import { finalGameShape } from "./upgrades";

/**
 * Don't forget to also update tutorial_goals_mappings.js as well as the translations!
 * @enum {string}
 */
export const enumHubGoalRewards = {
    reward_cutter_and_trash: "reward_cutter_and_trash",
    reward_rotater: "reward_rotater",
    reward_painter: "reward_painter",
    reward_mixer: "reward_mixer",
    reward_stacker: "reward_stacker",
    reward_unstacker: "reward_unstacker",
    reward_splitter: "reward_splitter",
    reward_tunnel: "reward_tunnel",

    reward_rotater_ccw: "reward_rotater_ccw",
    reward_miner_chainable: "reward_miner_chainable",
    reward_underground_belt_tier_2: "reward_underground_belt_tier_2",
    reward_splitter_compact: "reward_splitter_compact",
    reward_cutter_quad: "reward_cutter_quad",
    reward_painter_double: "reward_painter_double",
    reward_painter_quad: "reward_painter_quad",
    reward_storage: "reward_storage",

    reward_freeplay: "reward_freeplay",

    no_reward: "no_reward",
    no_reward_freeplay: "no_reward_freeplay",
};

export const tutorialGoals = [
    // Circle
    {
        shape: "CuCuCuCu", // belts t1
        required: 60,
        reward: enumHubGoalRewards.reward_cutter_and_trash,
    },

    // Cutter
    {
        shape: "----CuCu", //
        required: 80,
        reward: enumHubGoalRewards.no_reward,
    },

    // Rectangle
    {
        shape: "RuRuRuRu", // miners t1
        required: 100,
        reward: enumHubGoalRewards.reward_splitter,
    },

    {
        shape: "RuRu----", // processors t2
        required: 350,
        reward: enumHubGoalRewards.reward_rotater,
    },

    // Rotater
    {
        shape: "Cu----Cu", // belts t2
        required: 300,
        reward: enumHubGoalRewards.reward_tunnel,
    },

    {
        shape: "Cu------", // miners t2
        required: 1000,
        reward: enumHubGoalRewards.reward_painter,
    },

    // Painter
    {
        shape: "CrCrCrCr", // unused
        required: 1500,
        reward: enumHubGoalRewards.reward_rotater_ccw,
    },

    {
        shape: "RbRb----", // painter t2
        required: 2500,
        reward: enumHubGoalRewards.reward_mixer,
    },

    // Mixing (purple)
    {
        shape: "CpCpCpCp", // belts t3
        required: 4000,
        reward: enumHubGoalRewards.reward_splitter_compact,
    },

    // Star shape + cyan
    {
        shape: "ScScScSc", // miners t3
        required: 5000,
        reward: enumHubGoalRewards.reward_stacker,
    },

    // Stacker
    {
        shape: "CgScScCg", // processors t3
        required: 6000,
        reward: enumHubGoalRewards.reward_miner_chainable,
    },

    {
        shape: "RpRpRpRp:CwCwCwCw", // painting t3
        required: 7000,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
    },

    {
        shape: "SrSrSrSr:CyCyCyCy", // unused
        required: 7850,
        reward: enumHubGoalRewards.reward_storage,
    },

    {
        shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", // belts t4 (two variants)
        required: 8000,
        reward: enumHubGoalRewards.reward_cutter_quad,
    },

    {
        shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", // miner t4 (two variants)
        required: 9000,
        reward: enumHubGoalRewards.reward_painter_double,
    },

    {
        shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", // processors t4 (two varinats)
        required: 10000,
        reward: enumHubGoalRewards.reward_painter_quad,
    },

    {
        shape: finalGameShape,
        required: 50000,
        reward: enumHubGoalRewards.reward_freeplay,
    },
];

if (G_IS_DEV) {
    tutorialGoals.forEach(({ shape, required, reward }) => {
        try {
            ShapeDefinition.fromShortKey(shape);
        } catch (ex) {
            throw new Error("Invalid tutorial goal: '" + ex + "' for shape" + shape);
        }
    });
}
