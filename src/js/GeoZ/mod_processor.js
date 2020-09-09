import { Entity } from "../game/entity";
import { ItemProcessorSystem } from "../game/systems/item_processor";
import { BaseItem } from "../game/base_item";

/**
 * @typedef {{
 *   items: Array<BaseItem>,
 *   itemsBySlot: Array<{ item: BaseItem, sourceSlot: number }>,
 *   itemsRaw: Array<{ item: BaseItem, sourceSlot: number }>,
 *   entity: Entity,
 *   outItems: Array<{item: BaseItem, requiredSlot?: number, preferredSlot?: number}>,
 *   system: ItemProcessorSystem
 * }} ProcessorParameters
*/

export class ModProcessor {
	/**
	 * @returns {String}
	 */
	static getType() {
		return this.prototype.constructor.name;
	}

	/**
	 * @returns {Number}
	 */
	static getBaseSpeed() {
		abstract;
		return 0;
	}

	/**
     * Checks whether it's possible to process something
     * @param {Entity} entity
	 * @returns {Boolean}
     */
	static canProcess(entity) {
		abstract;
		return false;
	}

	/**
	 * Process ther current item
	 * @param {ProcessorParameters} param0 
	 * @returns {Boolean} Whether to track the production towards the analytics
	 */
	static process({}) {
		abstract;
		return false;
	}
}