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
    reward_rotater_fl: "reward_rotater_fl",
    reward_miner_chainable: "reward_miner_chainable",
    reward_underground_belt_tier_2: "reward_underground_belt_tier_2",
    reward_splitter_compact: "reward_splitter_compact",
    reward_cutter_quad: "reward_cutter_quad",
    reward_painter_double: "reward_painter_double",
    reward_painter_quad: "reward_painter_quad",
    reward_storage: "reward_storage",

    reward_blueprints: "reward_blueprints",
    reward_freeplay: "reward_freeplay",

    no_reward: "no_reward",
    no_reward_freeplay: "no_reward_freeplay",
};

export const tutorialGoals = [
    // 1
    // Circle
    {
        shape: "CuCuCuCu", // belts t1
        required: 40,
        reward: enumHubGoalRewards.reward_cutter_and_trash,
    },

    // 2
    // Cutter
    {
        shape: "----CuCu", //
        required: 40,
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
        required: 120,
        reward: enumHubGoalRewards.reward_rotater,
    },

    // 5
    // Rotater
    {
        shape: "Cu----Cu", // belts t2
        required: 200,
        reward: enumHubGoalRewards.reward_tunnel,
    },

    // 6
    {
        shape: "Cu------", // miners t2
        required: 400,
        reward: enumHubGoalRewards.reward_painter,
    },

    // 7
    // Painter
    {
        shape: "CrCrCrCr", // unused
        required: 800,
        reward: enumHubGoalRewards.reward_rotater_ccw,
    },

    // 8
    {
        shape: "RbRb----", // painter t2
        required: 1000,
        reward: enumHubGoalRewards.reward_mixer,
    },

    // 9
    // Mixing (purple)
    {
        shape: "CpCpCpCp", // belts t3
        required: 1400,
        reward: enumHubGoalRewards.reward_splitter_compact,
    },

    // 10
    // Star shape + cyan
    {
        shape: "ScScScSc", // miners t3
        required: 1600,
        reward: enumHubGoalRewards.reward_stacker,
    },

    // 11
    // Stacker
    {
        shape: "CgScScCg", // processors t3
        required: 1800,
        reward: enumHubGoalRewards.reward_miner_chainable,
    },

    // 12
    // Blueprints
    {
        shape: "CbCbCbRb:CwCwCwCw",
        required: 2000,
        reward: enumHubGoalRewards.reward_blueprints,
    },

    // 13
    {
        shape: "RpRpRpRp:CwCwCwCw", // painting t3
        required: 12000,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
    },

    // 14
    {
        shape: "SrSrSrSr:CyCyCyCy", // unused
        required: 16000,
        reward: enumHubGoalRewards.reward_storage,
    },

    // 15
    {
        shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", // belts t4 (two variants)
        required: 25000,
        reward: enumHubGoalRewards.reward_cutter_quad,
    },

    // 16
    {
        shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", // miner t4 (two variants)
        required: 50000,
        reward: enumHubGoalRewards.reward_painter_double,
    },

    // 17
    {
        shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", // processors t4 (two variants)
        required: 120000,
        reward: enumHubGoalRewards.reward_painter_quad,
    },

    // 18
    {
        shape: finalGameShape,
        required: 250000,
        reward: enumHubGoalRewards.reward_freeplay,
    },
];

if (G_IS_DEV) {
    tutorialGoals.forEach(({ shape }) => {
        try {
            ShapeDefinition.fromShortKey(shape);
        } catch (ex) {
            throw new Error("Invalid tutorial goal: '" + ex + "' for shape" + shape);
        }
    });
}
