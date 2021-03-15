/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { gGameModeRegistry } from "../core/global_registries";
import { types, BasicSerializableObject } from "../savegame/serialization";

export class GameMode extends BasicSerializableObject {
    /** @returns {string} */
    static getId() {
        abstract;
        return "Unknown";
    }

    static getSchema() {
        return {};
    }

    /**
     * @param {GameRoot} root
     * @param {string} [id=Regular]
     */
    static create (root, id = "Regular") {
        // id = "Regular"
        return new (gGameModeRegistry.findById(id))(root);
    }

    /**
     * @param {GameRoot} root
     * @param {string} [id=Regular]
     */
    constructor(root) {
        super();
        this.root = root;
    }

    serialize() {
        return {
            $: this.getId(),
            data: super.serialize()
        }
    }

    deserialize({ $, data }) {
        const Mode = gGameModeRegistry.findById($);

        return super.deserialize(data, Mode, gGameModeRegistry.getId(), this.root);
    }

    getId() {
        // @ts-ignore
        return this.constructor.getId();
    }
}
