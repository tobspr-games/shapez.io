import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { angleDirectionMap, clockwiseAngleMap, counterClockwiseAngleMap, Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { T } from "../../translations";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";

/** @type {Exclude<Direction, "Bottom">[]} **/
export const arrayBeltVariantToRotation = ["top", "left", "right"];

/** @type {Record<Exclude<Direction, "bottom">, Object<number, Array<number>>>} **/
const beltOverlayMatrices = {
    top: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    left: generateMatrixRotations([0, 0, 0, 1, 1, 0, 0, 1, 0]),
    right: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
};

export class MetaBeltBaseBuilding extends MetaBuilding {
    getHasDirectionLockAvailable() {
        return true;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const beltSpeed = root.hubGoals.getBeltBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
    }

    getStayInPlacementMode() {
        return true;
    }

    getRotateAutomaticallyWhilePlacing() {
        return true;
    }

    getPlacementSound() {
        return SOUNDS.placeBelt;
    }

    getSprite() {
        return null;
    }

    getIsReplaceable() {
        return true;
    }

    /**
     *
     * @param {Angle} rotation
     * @param {RotationVariant} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return beltOverlayMatrices[entity.components.Belt.direction][rotation];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new BeltComponent({
                direction: "top", // updated later
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {RotationVariant} rotationVariant
     */
    updateVariants(entity, rotationVariant) {
        entity.components.Belt.direction = arrayBeltVariantToRotation[rotationVariant];
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {Angle} param0.rotation
     * @param {string} param0.variant
     * @param {Layer} param0.layer
     * @return {{ rotation: Angle, rotationVariant: RotationVariant, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        const topDirection = angleDirectionMap[rotation];
        const rightDirection = angleDirectionMap[(rotation + 90) % 360];
        const bottomDirection = angleDirectionMap[(rotation + 180) % 360];
        const leftDirection = angleDirectionMap[(rotation + 270) % 360];

        const { ejectors, acceptors } = root.logic.getEjectorsAndAcceptorsAtTile(tile);

        let hasBottomEjector = false;
        let hasRightEjector = false;
        let hasLeftEjector = false;

        let hasTopAcceptor = false;
        let hasLeftAcceptor = false;
        let hasRightAcceptor = false;

        // Check all ejectors
        for (let i = 0; i < ejectors.length; ++i) {
            const ejector = ejectors[i];

            if (ejector.toDirection === topDirection) {
                hasBottomEjector = true;
            } else if (ejector.toDirection === leftDirection) {
                hasRightEjector = true;
            } else if (ejector.toDirection === rightDirection) {
                hasLeftEjector = true;
            }
        }

        // Check all acceptors
        for (let i = 0; i < acceptors.length; ++i) {
            const acceptor = acceptors[i];
            if (acceptor.fromDirection === bottomDirection) {
                hasTopAcceptor = true;
            } else if (acceptor.fromDirection === rightDirection) {
                hasLeftAcceptor = true;
            } else if (acceptor.fromDirection === leftDirection) {
                hasRightAcceptor = true;
            }
        }

        // Soo .. if there is any ejector below us we always prioritize
        // this ejector
        if (!hasBottomEjector) {
            // When something ejects to us from the left and nothing from the right,
            // do a curve from the left to the top

            if (hasRightEjector && !hasLeftEjector) {
                return {
                    rotation: counterClockwiseAngleMap[rotation],
                    rotationVariant: 2,
                };
            }

            // When something ejects to us from the right and nothing from the left,
            // do a curve from the right to the top
            if (hasLeftEjector && !hasRightEjector) {
                return {
                    rotation: clockwiseAngleMap[rotation],
                    rotationVariant: 1,
                };
            }
        }

        // When there is a top acceptor, ignore sides
        // NOTICE: This makes the belt prefer side turns *way* too much!
        if (!hasTopAcceptor) {
            // When there is an acceptor to the right but no acceptor to the left,
            // do a turn to the right
            if (hasRightAcceptor && !hasLeftAcceptor) {
                return {
                    rotation,
                    rotationVariant: 2,
                };
            }

            // When there is an acceptor to the left but no acceptor to the right,
            // do a turn to the left
            if (hasLeftAcceptor && !hasRightAcceptor) {
                return {
                    rotation,
                    rotationVariant: 1,
                };
            }
        }

        return {
            rotation,
            rotationVariant: 0,
        };
    }
}
