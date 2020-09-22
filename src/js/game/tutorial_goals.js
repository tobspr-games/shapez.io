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
    reward_balancer: "reward_balancer",
    reward_tunnel: "reward_tunnel",

    reward_rotater_ccw: "reward_rotater_ccw",
    reward_rotater_180: "reward_rotater_180",
    reward_miner_chainable: "reward_miner_chainable",
    reward_underground_belt_tier_2: "reward_underground_belt_tier_2",
    reward_splitter: "reward_splitter",
    reward_cutter_quad: "reward_cutter_quad",
    reward_painter_double: "reward_painter_double",
    reward_painter_quad: "reward_painter_quad",
    reward_storage: "reward_storage",
    reward_merger: "reward_merger",

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
        required: 85,
        reward: enumHubGoalRewards.reward_balancer,
    },

    // 4
    {
        shape: "RuRu----", // processors t2
        required: 100,
        reward: enumHubGoalRewards.reward_rotater,
    },

    // 5
    // Rotater
    {
        shape: "Cu----Cu", // belts t2
        required: 175,
        reward: enumHubGoalRewards.reward_tunnel,
    },

    // 6
    {
        shape: "Cu------", // miners t2
        required: 250,
        reward: enumHubGoalRewards.reward_painter,
    },

    // 7
    // Painter
    {
        shape: "CrCrCrCr", // unused
        required: 500,
        reward: enumHubGoalRewards.reward_rotater_ccw,
    },

    // 8
    {
        shape: "RbRb----", // painter t2
        required: 700,
        reward: enumHubGoalRewards.reward_mixer,
    },

    // 9
    // Mixing (purple)
    {
        shape: "CpCpCpCp", // belts t3
        required: 800,
        reward: enumHubGoalRewards.reward_splitter,
    },

    // 10
    // Star shape + cyan
    {
        shape: "ScScScSc", // miners t3
        required: 900,
        reward: enumHubGoalRewards.reward_stacker,
    },

    // 11
    // Stacker
    {
        shape: "CgScScCg", // processors t3
        required: 1000,
        reward: enumHubGoalRewards.reward_miner_chainable,
    },

    // 12
    // Blueprints
    {
        shape: "CbCbCbRb:CwCwCwCw",
        required: 1250,
        reward: enumHubGoalRewards.reward_blueprints,
    },

    // 13
    {
        shape: "RpRpRpRp:CwCwCwCw", // painting t3
        required: 5000,
        reward: enumHubGoalRewards.reward_underground_belt_tier_2,
    },

    // 14
    {
        shape: "SrSrSrSr:CyCyCyCy", // unused
        required: 7500,
        reward: enumHubGoalRewards.reward_storage,
    },

    // 15
    {
        shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", // belts t4 (two variants)
        required: 15000,
        reward: enumHubGoalRewards.reward_cutter_quad,
    },

    // 16
    {
        shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", // miner t4 (two variants)
        required: 20000,
        reward: enumHubGoalRewards.reward_painter_double,
    },

    // 17
    {
        shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", // rotater 180
        required: 25000,
        reward: enumHubGoalRewards.reward_rotater_180,
    },

    // 18
    {
        shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", // processors t4 (two variants)
        required: 30000,
        reward: enumHubGoalRewards.reward_painter_quad,
    },

    // 19
    {
        shape: finalGameShape,
        required: 50000,
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
