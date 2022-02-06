import { BaseSavegameInterface } from "./savegame_interface";
import { SavegameInterface_V1000 } from "./schemas/1000";
import { createLogger } from "../core/logging";
import { SavegameInterface_V1001 } from "./schemas/1001";
import { SavegameInterface_V1002 } from "./schemas/1002";
import { SavegameInterface_V1003 } from "./schemas/1003";
import { SavegameInterface_V1004 } from "./schemas/1004";
import { SavegameInterface_V1005 } from "./schemas/1005";
import { SavegameInterface_V1006 } from "./schemas/1006";
import { SavegameInterface_V1007 } from "./schemas/1007";
import { SavegameInterface_V1008 } from "./schemas/1008";
import { SavegameInterface_V1009 } from "./schemas/1009";
import { SavegameInterface_V1010 } from "./schemas/1010";
import { SavegameInterface_V1011 } from "./schemas/1011";

/** @type {Object.<number, typeof BaseSavegameInterface>} */
export const savegameInterfaces = {
    1000: SavegameInterface_V1000,
    1001: SavegameInterface_V1001,
    1002: SavegameInterface_V1002,
    1003: SavegameInterface_V1003,
    1004: SavegameInterface_V1004,
    1005: SavegameInterface_V1005,
    1006: SavegameInterface_V1006,
    1007: SavegameInterface_V1007,
    1008: SavegameInterface_V1008,
    1009: SavegameInterface_V1009,
    1010: SavegameInterface_V1010,
    1011: SavegameInterface_V1011,
};

const logger = createLogger("savegame_interface_registry");

/**
 * Returns if the given savegame has any supported interface
 * @param {any} savegame
 * @returns {BaseSavegameInterface|null}
 */
export function getSavegameInterface(savegame) {
    if (!savegame || !savegame.version) {
        logger.warn("Savegame does not contain a valid version (undefined)");
        return null;
    }
    const version = savegame.version;
    if (!Number.isInteger(version)) {
        logger.warn("Savegame does not contain a valid version (non-integer):", version);
        return null;
    }

    const interfaceClass = savegameInterfaces[version];
    if (!interfaceClass) {
        logger.warn("Version", version, "has no implemented interface!");
        return null;
    }

    return new interfaceClass(savegame);
}
