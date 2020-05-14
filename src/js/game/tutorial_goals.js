import { ShapeDefinition } from "./shape_definition";

/**
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

    no_reward: "no_reward",
};

/**
 * @enum {string}
 */
export const enumHubGoalRewardToString = {
    [enumHubGoalRewards.reward_cutter_and_trash]: "Cutting Shapes",
    [enumHubGoalRewards.reward_rotater]: "Rotating",
    [enumHubGoalRewards.reward_painter]: "Painting",
    [enumHubGoalRewards.reward_mixer]: "Color Mixing",
    [enumHubGoalRewards.reward_stacker]: "Combiner",
    [enumHubGoalRewards.reward_splitter]: "Splitter/Merger",
    [enumHubGoalRewards.reward_tunnel]: "Tunnel",

    [enumHubGoalRewards.no_reward]: "Next level",
};

export const tutorialGoals = [
    // Circle
    {
        shape: "CuCuCuCu",
        required: 40,
        reward: enumHubGoalRewards.reward_cutter_and_trash,
    },

    // Cutter
    {
        shape: "CuCu----",
        required: 150,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "----CuCu",
        required: 200,
        reward: enumHubGoalRewards.reward_splitter,
    },

    // Rectangle
    {
        shape: "RuRuRuRu",
        required: 80,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "RuRu----",
        required: 250,
        reward: enumHubGoalRewards.reward_rotater,
    },

    // Rotater
    {
        shape: "--CuCu--",
        required: 300,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "Ru----Ru",
        required: 400,
        reward: enumHubGoalRewards.reward_tunnel,
    },

    {
        shape: "Cu------",
        required: 800,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "------Ru",
        required: 1000,
        reward: enumHubGoalRewards.reward_painter,
    },

    // Painter
    {
        shape: "CrCrCrCr",
        required: 1500,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "RbRb----",
        required: 2500,
        reward: enumHubGoalRewards.reward_mixer,
    },

    // Mixing (purple)
    {
        shape: "CpCpCpCp",
        required: 4000,
        reward: enumHubGoalRewards.no_reward,
    },

    // Star shape + cyan
    {
        shape: "ScScScSc",
        required: 500,
        reward: enumHubGoalRewards.reward_stacker,
    },

    // Stacker
    {
        shape: "CcCcRgRg",
        required: 3000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "RgRgRgRg:CcCcCcCc",
        required: 4000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "RgCwRgCw:CpCpCpCp",
        required: 6000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "CwSwCwSw:CpCrCpCr",
        required: 6000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "WyWyWyWy",
        required: 2000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "WyWgWyWg:CbCpCbCp",
        required: 4000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "WyRgWyRg:CbCpCbCp:CpCgCpCg",
        required: 9000,
        reward: enumHubGoalRewards.no_reward,
    },

    {
        shape: "CwRrCbRy:ScSrSpSb:CwCwCwCw:RgRgRgRg",
        required: 15000,
        reward: enumHubGoalRewards.no_reward,
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
