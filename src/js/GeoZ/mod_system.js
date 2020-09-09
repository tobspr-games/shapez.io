import { GameSystem } from "../game/game_system";
import { GameSystemWithFilter } from "../game/game_system_with_filter";
import { GameRoot } from "../game/root";
import { Component } from "../game/component";

/**
 * @typedef {
	"belt"
	| "itemEjector"
	| "mapResources"
	| "miner"
	| "itemProcessor"
	| "undergroundBelt"
	| "hub"
	| "staticMapEntities"
	| "itemAcceptor"
	| "storage"
	| "wiredPins"
	| "beltUnderlays"
	| "wire"
	| "constantSignal"
	| "logicGate"
	| "lever"
	| "display"
	| "itemProcessorOverlays"
	| "beltReader"
	| ""
 * } VanillaSystemId
*/

export class ModSystem extends GameSystem {
	/**
	 * @returns {String} Mod system ID
	 */
	static getId() {
		//abstract;
		const className = this.prototype.constructor.name;
		let id = className;
		const i = className.lastIndexOf("System");
		if(i !== -1) {
			id = id.slice(0, i);
		}
		id = id[0].toLowerCase() + id.slice(1);
		return id;
	}

	/**
	 * Before which vanilla system should this system update
	 * @returns {VanillaSystemId}
	 */
	static getUpdateBefore() {
		return "";
	}

	/**
	 * After which vanilla system should this system update
	 * @returns {VanillaSystemId}
	 */
	static getUpdateAfter() {
		return "";
	}

	/**
	 * @param {GameRoot} root
	 */
	constructor(root) {
		super(root);
	}
}

export class ModSystemWithFilter extends GameSystemWithFilter {
	/**
	 * @returns {String} Mod system ID
	 */
	static getId() {
		//abstract;
		const className = this.prototype.constructor.name;
		let id = className;
		const i = className.lastIndexOf("System");
		if(i !== -1) {
			id = id.slice(0, i);
		}
		id = id[0].toLowerCase() + id.slice(1);
		return id;
	}

	/**
	 * Before which vanilla system should this system update
	 * @returns {VanillaSystemId}
	 */
	static getUpdateBefore() {
		return "";
	}

	/**
	 * After which vanilla system should this system update
	 * @returns {VanillaSystemId}
	 */
	static getUpdateAfter() {
		return "";
	}

	/**
	 * @returns {Array<typeof Component>}
	 */
	static getRequiredComponents() {
		abstract;
		return [];
	}

	/**
     * Constructs a new game system with the given component filter. It will process
     * all entities which have *all* of the passed components
     * @param {GameRoot} root
     */
    constructor(root) {
		super(root, []);
		this.requiredComponents = /** @type {Array<typeof Component>} */ (Object.getPrototypeOf(this).getRequiredComponents());
        this.requiredComponentIds = this.requiredComponents.map(component => component.getId());
	}
}