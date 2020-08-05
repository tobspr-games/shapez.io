import { formatItemsPerSecond } from "../../core/utils";
import {
    angleDirectionMap,
    clockwiseAngleMap,
    counterClockwiseAngleMap,
    inverseAngleMap,
    Vector,
} from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { T } from "../../translations";
import { BeltComponent } from "../components/belt";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { ReplaceableMapEntityComponent } from "../components/replaceable_map_entity";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot, enumLayer } from "../root";

/**
 * @typedef {import("../../core/vector").Angle} Angle
 * @typedef {import("../../core/vector").Direction} Direction
 */

/** @type {Direction[]} **/
export const arrayBeltVariantToRotation = ["top", "left", "right"];

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
        const beltSpeed = root.hubGoals.getBeltBaseSpeed(enumLayer.regular);
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
        // Make this entity replaceabel
        entity.addComponent(new ReplaceableMapEntityComponent());

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: ["bottom"],
                        layer: this.getLayer(),
                    },
                ],
                animated: false,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: "top", // updated later
                        layer: this.getLayer(),
                    },
                ],
                instantEject: true,
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    updateVariants(entity, rotationVariant) {
        entity.components.Belt.direction = arrayBeltVariantToRotation[rotationVariant];
        entity.components.ItemEjector.slots[0].direction = arrayBeltVariantToRotation[rotationVariant];
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {Angle} param0.rotation
     * @param {string} param0.variant
     * @param {string} param0.layer
     * @return {{ rotation: Angle, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        const topDirection = angleDirectionMap[rotation];
        const rightDirection = angleDirectionMap[clockwiseAngleMap[rotation]];
        const bottomDirection = angleDirectionMap[inverseAngleMap[rotation]];
        const leftDirection = angleDirectionMap[counterClockwiseAngleMap[rotation]];

        const { ejectors, acceptors } = root.logic.getEjectorsAndAcceptorsAtTile(tile, layer);

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
