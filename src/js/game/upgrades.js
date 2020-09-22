import { findNiceIntegerValue } from "../core/utils";
import { ShapeDefinition } from "./shape_definition";

export const finalGameShape = "RuCw--Cw:----Ru--";
export const blueprintShape = "CbCbCbRb:CwCwCwCw";

const fixedImprovements = [0.5, 0.5, 1, 1, 2, 2];

/** @typedef {{
 *   shape: string,
 *   amount: number
 * }} UpgradeRequirement */

/** @typedef {{
 *   required: Array<UpgradeRequirement>
 *   improvement?: number,
 *   excludePrevious?: boolean
 * }} TierRequirement */

/** @typedef {Array<TierRequirement>} UpgradeTiers */

/** @type {Object<string, UpgradeTiers>} */
export const UPGRADES = {
    belt: [
        {
            required: [{ shape: "CuCuCuCu", amount: 150 }],
        },
        {
            required: [{ shape: "--CuCu--", amount: 1000 }],
        },
        {
            required: [{ shape: "CpCpCpCp", amount: 5000 }],
        },
        {
            required: [{ shape: "SrSrSrSr:CyCyCyCy", amount: 12000 }],
        },
        {
            required: [{ shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", amount: 20000 }],
        },
        {
            required: [{ shape: finalGameShape, amount: 75000 }],
            excludePrevious: true,
        },
    ],

    miner: [
        {
            required: [{ shape: "RuRuRuRu", amount: 400 }],
        },
        {
            required: [{ shape: "Cu------", amount: 3000 }],
        },
        {
            required: [{ shape: "ScScScSc", amount: 7000 }],
        },
        {
            required: [{ shape: "CwCwCwCw:WbWbWbWb", amount: 15000 }],
        },
        {
            required: [{ shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", amount: 30000 }],
        },
        {
            required: [{ shape: finalGameShape, amount: 85000 }],
            excludePrevious: true,
        },
    ],

    processors: [
        {
            required: [{ shape: "SuSuSuSu", amount: 600 }],
        },
        {
            required: [{ shape: "RuRu----", amount: 2000 }],
        },
        {
            required: [{ shape: "CgScScCg", amount: 15000 }],
        },
        {
            required: [{ shape: "CwCrCwCr:SgSgSgSg", amount: 20000 }],
        },
        {
            required: [{ shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", amount: 30000 }],
        },
        {
            required: [{ shape: finalGameShape, amount: 100000 }],
            excludePrevious: true,
        },
    ],

    painting: [
        {
            required: [{ shape: "RbRb----", amount: 1000 }],
        },
        {
            required: [{ shape: "WrWrWrWr", amount: 3000 }],
        },
        {
            required: [{ shape: "RpRpRpRp:CwCwCwCw", amount: 15000 }],
        },
        {
            required: [{ shape: "WpWpWpWp:CwCwCwCw:WpWpWpWp", amount: 20000 }],
        },
        {
            required: [{ shape: "WpWpWpWp:CwCwCwCw:WpWpWpWp:CwCwCwCw", amount: 30000 }],
        },
        {
            required: [{ shape: finalGameShape, amount: 125000 }],
            excludePrevious: true,
        },
    ],
};

// Tiers need % of the previous tier as requirement too
const tierGrowth = 1.8;

// Automatically generate tier levels
for (const upgradeId in UPGRADES) {
    const upgradeTiers = UPGRADES[upgradeId];

    let currentTierRequirements = [];
    for (let i = 0; i < upgradeTiers.length; ++i) {
        const tierHandle = upgradeTiers[i];
        tierHandle.improvement = fixedImprovements[i];
        const originalRequired = tierHandle.required.slice();

        for (let k = currentTierRequirements.length - 1; k >= 0; --k) {
            const oldTierRequirement = currentTierRequirements[k];
            if (!tierHandle.excludePrevious) {
                tierHandle.required.unshift({
                    shape: oldTierRequirement.shape,
                    amount: oldTierRequirement.amount,
                });
            }
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

// VALIDATE
if (G_IS_DEV) {
    for (const upgradeId in UPGRADES) {
        UPGRADES[upgradeId].forEach(tier => {
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
