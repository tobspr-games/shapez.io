import { findNiceIntegerValue } from "../core/utils";
import { ShapeDefinition } from "./shape_definition";

export const TIER_LABELS = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
    "XVI",
    "XVII",
    "XVIII",
    "XIX",
    "XX",
];

export const UPGRADES = {
    belt: {
        label: "Belts, Distributer & Tunnels",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "CuCuCuCu", amount: 80 }],
                improvement: 1,
            },
            {
                required: [{ shape: "Ru----Ru", amount: 4000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CwSwCwSw", amount: 30000 }],
                improvement: 4,
            },
            {
                required: [{ shape: "RgRgSpSp:CwSwCwSw:Cr--Sw--", amount: 80000 }],
                improvement: 8,
            },
        ],
    },

    miner: {
        label: "Extraction",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "RuRuRuRu", amount: 200 }],
                improvement: 1,
            },
            {
                required: [{ shape: "Cu------", amount: 4000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp", amount: 30000 }],
                improvement: 4,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp:Rp----Rp", amount: 90000 }],
                improvement: 8,
            },
        ],
    },

    processors: {
        label: "Shape Processing",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "RuRuRuRu", amount: 200 }],
                improvement: 1,
            },
            {
                required: [{ shape: "Cu------", amount: 4000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp", amount: 30000 }],
                improvement: 4,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp:Rp----Rp", amount: 90000 }],
                improvement: 8,
            },
        ],
    },

    painting: {
        label: "Mixing & Painting",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "RuRuRuRu", amount: 200 }],
                improvement: 1,
            },
            {
                required: [{ shape: "Cu------", amount: 4000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp", amount: 30000 }],
                improvement: 4,
            },
            {
                required: [{ shape: "WyWgWyWg:CbCpCbCp:Rp----Rp", amount: 90000 }],
                improvement: 8,
            },
        ],
    },

    // cutter: {
    //     label: "Cut Half",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "----CuCu", amount: 450 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "CpCpCpCp", amount: 12000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "CwRrWbSp:WcWrCpCw", amount: 45000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "CwRrWbSp:WcWrCpCw:WpWpWb--", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },
    // splitter: {
    //     label: "Distribute",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "CuCu----", amount: 350 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "CrCrCrCr", amount: 7000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "WyWyWyWy", amount: 30000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "WyWyWyWy:CwSpRgRc", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },

    // rotater: {
    //     label: "Rotate",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "RuRu----", amount: 750 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "ScScScSc", amount: 3000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "ScSpRwRw:Cw----Cw", amount: 15000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "ScSpRwRw:Cw----Cw:CpCpCpCp", amount: 80000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },

    // underground_belt: {
    //     label: "Tunnel",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "--CuCu--", amount: 1000 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "RbRb----", amount: 9000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "RbRb----:WpWpWpWp", amount: 25000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "RbRb----:WpWpWpWp:RwRwRpRp", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },

    // painter: {
    //     label: "Dye",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "------Ru", amount: 4000 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "CcCcRgRg", amount: 15000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "CcCcRgRg:WgWgWgWg", amount: 35000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "CcCcRgRg:WgWgWgWg:CpRpCpRp", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },

    // mixer: {
    //     label: "Mix Colors",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "RgRgRgRg:CcCcCcCc", amount: 11000 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "WyWgWyWg:CbCpCbCp", amount: 15000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "CcCcRgRg:WgWgWgWg:CpRpCpRp", amount: 45000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "CcCcRgRg:WgWgWgWg:CpRpCpRp:CpCpCpCp", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },
    // stacker: {
    //     label: "Combine",
    //     description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
    //     tiers: [
    //         {
    //             required: [{ shape: "CgCgRgRg", amount: 20000 }],
    //             improvement: 1,
    //         },
    //         {
    //             required: [{ shape: "CgCgRgRg:WpRpWpRp", amount: 50000 }],
    //             improvement: 2,
    //         },
    //         {
    //             required: [{ shape: "CgCgRgRg:WpRpWpRp:SpSwSpSw", amount: 70000 }],
    //             improvement: 4,
    //         },
    //         {
    //             required: [{ shape: "CgCgRgRg:WpRpWpRp:SpSwSpSw:CwCwCwCw", amount: 100000 }],
    //             improvement: 8,
    //         },
    //     ],
    // },
};

// Tiers need % of the previous tier as requirement too
const tierGrowth = 2;

// Automatically generate tier levels
for (const upgradeId in UPGRADES) {
    const upgrade = UPGRADES[upgradeId];

    let currentTierRequirements = [];
    for (let i = 0; i < upgrade.tiers.length; ++i) {
        const tierHandle = upgrade.tiers[i];
        const originalRequired = tierHandle.required.slice();

        for (let k = currentTierRequirements.length - 1; k >= 0; --k) {
            const oldTierRequirement = currentTierRequirements[k];
            tierHandle.required.unshift({
                shape: oldTierRequirement.shape,
                amount: oldTierRequirement.amount,
            });
        }
        currentTierRequirements.push(
            ...originalRequired.map(req => ({
                amount: req.amount,
                shape: req.shape,
            }))
        );
        currentTierRequirements.forEach(tier => {
            tier.amount = findNiceIntegerValue(tier.amount * tierGrowth);
        });
    }
}

if (G_IS_DEV) {
    for (const upgradeId in UPGRADES) {
        const upgrade = UPGRADES[upgradeId];
        upgrade.tiers.forEach(tier => {
            tier.required.forEach(({ shape }) => {
                try {
                    ShapeDefinition.fromShortKey(shape);
                } catch (ex) {
                    throw new Error("Invalid upgrade goal: '" + ex + "' for shape" + shape);
                }
            });
        });
    }
}
