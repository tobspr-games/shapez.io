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
    // 1
    // Circle
    {
        shape: "CuCuCuCu", // belts t1
        required: 35,
        reward: enumHubGoalRewards.reward_cutter_and_trash,
    },

    // 2
    // Cutter
    {
        shape: "----CuCu", //
        required: 50,
        reward: enumHubGoalRewards.no_reward,
    },

    // 3
    // Rectangle
    {
        shape: "RuRuRuRu", // miners t1
        required: 100,
        reward: enumHubGoalRewards.reward_splitter,
    },

    // 4
    {
        shape: "RuRu----", // processors t2
        required: 150,
        reward: enumHubGoalRewards.reward_rotater,
    },

    // 5
    // Rotater
    {
        shape: "Cu----Cu", // belts t2
        required: 300,
        reward: enumHubGoalRewards.reward_tunnel,
    },

    // 6
    {
        shape: "Cu------", // miners t2
        required: 700,
        reward: enumHubGoalRewards.reward_painter,
    },

    // 7
    // Painter
    {
        shape: "CrCrCrCr", // unused
        required: 1300,
        reward: enumHubGoalRewards.reward_rotater_ccw,
    },

    // 8
    {
        shape: "RbRb----", // painter t2
        required: 2500,
        reward: enumHubGoalRewards.reward_mixer,
    },

    // 9
    // Mixing (purple)
    {
        shape: "CpCpCpCp", // belts t3
        required: 4000,
        reward: enumHubGoalRewards.reward_splitter_compact,
    },

    // 10
    // Star shape + cyan
    {
        shape: "ScScScSc", // miners t3
        required: 5000,
        reward: enumHubGoalRewards.reward_stacker,
    },

    // 11
    // Stacker
    {
        shape: "CgScScCg", // processors t3
        required: 6000,
        reward: enumHubGoalRewards.reward_miner_chainable,
    },

    // 12
    {
        shape: "RpRpRpRp:CwCwCwCw", // painting t3
        required: 7000,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
    },

    // 13
    {
        shape: "SrSrSrSr:CyCyCyCy", // unused
        required: 7850,
        reward: enumHubGoalRewards.reward_storage,
    },

    // 14
    {
        shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", // belts t4 (two variants)
        required: 8000,
        reward: enumHubGoalRewards.reward_cutter_quad,
    },

    // 15
    {
        shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", // miner t4 (two variants)
        required: 9000,
        reward: enumHubGoalRewards.reward_painter_double,
    },

    // 16
    {
        shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", // processors t4 (two varinats)
        required: 10000,
        reward: enumHubGoalRewards.reward_painter_quad,
    },

    // 17
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
