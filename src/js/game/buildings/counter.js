import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumItemType } from "../base_item";
import { ItemCounterComponent } from "../components/counter";

export class MetaCounterBuilding extends MetaBuilding {
    constructor() {
        super("counter");
    }

    /**
     * @returns {string} Colour used to represent this building when zoomed out.
     */
    getSilhouetteColor() {
        return "#444e81"; // Dark Blue
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getBeltBaseSpeed("regular");
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * The counter is unlocked once the belt speed reaches 20 (items/s). This is around the time when items on
     * a belt begin to blurr. It is also late enough in the game that a player would understand and appreciate
     * this building.
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        const beltSpeed = root.hubGoals.getBeltBaseSpeed("regular");
        return beltSpeed >= 20;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new ItemCounterComponent());

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );
    }
}
