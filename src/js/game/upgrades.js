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
                improvement: 4,
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
                improvement: 4,
            },
        ],
    },

    processors: {
        label: "Shape Processing",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "SuSuSuSu", amount: 200 }],
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
                improvement: 4,
            },
        ],
    },

    painting: {
        label: "Mixing & Painting",
        description: improvement => "Speed +" + Math.floor(improvement * 100.0) + "%",
        tiers: [
            {
                required: [{ shape: "WuWuWuWu", amount: 200 }],
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
                improvement: 4,
            },
        ],
    },
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
