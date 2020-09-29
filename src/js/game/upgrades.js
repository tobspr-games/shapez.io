import { IS_DEMO } from "../core/config";
import { findNiceIntegerValue } from "../core/utils";
import { ShapeDefinition } from "./shape_definition";

export const preparementShape = "CpRpCp--:SwSwSwSw";
export const finalGameShape = "RuCw--Cw:----Ru--";
export const rocketShape = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
export const blueprintShape = "CbCbCbRb:CwCwCwCw";

const fixedImprovements = [0.5, 0.5, 1, 1, 2, 1, 1];

const numEndgameUpgrades = !IS_DEMO ? 20 - fixedImprovements.length - 1 : 0;

function generateEndgameUpgrades() {
    return new Array(numEndgameUpgrades).fill(null).map((_, i) => ({
        required: [
            { shape: preparementShape, amount: 30000 + i * 10000 },
            { shape: finalGameShape, amount: 20000 + i * 5000 },
            { shape: rocketShape, amount: 20000 + i * 5000 },
        ],
        excludePrevious: true,
    }));
}

for (let i = 0; i < numEndgameUpgrades; ++i) {
    fixedImprovements.push(0.1);
}

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
            required: [{ shape: "CuCuCuCu", amount: 60 }],
        },
        {
            required: [{ shape: "--CuCu--", amount: 500 }],
        },
        {
            required: [{ shape: "CpCpCpCp", amount: 1000 }],
        },
        {
            required: [{ shape: "SrSrSrSr:CyCyCyCy", amount: 6000 }],
        },
        {
            required: [{ shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", amount: 25000 }],
        },
        {
            required: [{ shape: preparementShape, amount: 25000 }],
            excludePrevious: true,
        },
        {
            required: [
                { shape: preparementShape, amount: 25000 },
                { shape: finalGameShape, amount: 50000 },
            ],
            excludePrevious: true,
        },
        ...generateEndgameUpgrades(),
    ],

    miner: [
        {
            required: [{ shape: "RuRuRuRu", amount: 300 }],
        },
        {
            required: [{ shape: "Cu------", amount: 800 }],
        },
        {
            required: [{ shape: "ScScScSc", amount: 3500 }],
        },
        {
            required: [{ shape: "CwCwCwCw:WbWbWbWb", amount: 23000 }],
        },
        {
            required: [{ shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", amount: 50000 }],
        },
        {
            required: [{ shape: preparementShape, amount: 25000 }],
            excludePrevious: true,
        },
        {
            required: [
                { shape: preparementShape, amount: 25000 },
                { shape: finalGameShape, amount: 50000 },
            ],
            excludePrevious: true,
        },
        ...generateEndgameUpgrades(),
    ],

    processors: [
        {
            required: [{ shape: "SuSuSuSu", amount: 500 }],
        },
        {
            required: [{ shape: "RuRu----", amount: 600 }],
        },
        {
            required: [{ shape: "CgScScCg", amount: 3500 }],
        },
        {
            required: [{ shape: "CwCrCwCr:SgSgSgSg", amount: 25000 }],
        },
        {
            required: [{ shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", amount: 50000 }],
        },
        {
            required: [{ shape: preparementShape, amount: 25000 }],
            excludePrevious: true,
        },
        {
            required: [
                { shape: preparementShape, amount: 25000 },
                { shape: finalGameShape, amount: 50000 },
            ],
            excludePrevious: true,
        },
        ...generateEndgameUpgrades(),
    ],

    painting: [
        {
            required: [{ shape: "RbRb----", amount: 600 }],
        },
        {
            required: [{ shape: "WrWrWrWr", amount: 3800 }],
        },
        {
            required: [{ shape: "RpRpRpRp:CwCwCwCw", amount: 6500 }],
        },
        {
            required: [{ shape: "WpWpWpWp:CwCwCwCw:WpWpWpWp", amount: 25000 }],
        },
        {
            required: [{ shape: "WpWpWpWp:CwCwCwCw:WpWpWpWp:CwCwCwCw", amount: 50000 }],
        },
        {
            required: [{ shape: preparementShape, amount: 25000 }],
            excludePrevious: true,
        },
        {
            required: [
                { shape: preparementShape, amount: 25000 },
                { shape: finalGameShape, amount: 50000 },
            ],
            excludePrevious: true,
        },
        ...generateEndgameUpgrades(),
    ],
};

// Tiers need % of the previous tier as requirement too
const tierGrowth = 2.5;

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
