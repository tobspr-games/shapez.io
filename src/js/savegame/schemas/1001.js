import { SavegameInterface_V1000 } from "./1000.js";
import { createLogger } from "../../core/logging.js";
import { T } from "../../translations.js";

const schema = require("./1001.json");

const logger = createLogger("savegame_interface/1001");

export class SavegameInterface_V1001 extends SavegameInterface_V1000 {
    getVersion() {
        return 1001;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1000to1001(data) {
        logger.log("Migrating 1000 to 1001");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        dump.pinnedShapes = {
            shapes: [],
        };
        dump.waypoints = {
            waypoints: [
                {
                    label: T.ingame.waypoints.hub,
                    center: { x: 0, y: 0 },
                    zoomLevel: 3,
                    deletable: false,
                },
            ],
        };

        const entities = dump.entities;
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];

            // FIXME - https://github.com/tobspr/shapez.io/issues/514
            // Broken in https://github.com/tobspr/shapez.io/commit/bf2eee908fedb84dbbabd359a200c446020a340e
            /** @type any **/
            const staticComp = entity.components.StaticMapEntity;
            const beltComp = entity.components.Belt;
            if (staticComp) {
                if (staticComp.spriteKey) {
                    staticComp.blueprintSpriteKey = staticComp.spriteKey.replace(
                        "sprites/buildings",
                        "sprites/blueprints"
                    );
                } else {
                    if (entity.components.Hub) {
                        staticComp.blueprintSpriteKey = "";
                    } else if (beltComp) {
                        const direction = beltComp.direction;
                        staticComp.blueprintSpriteKey = "sprites/blueprints/belt_" + direction + ".png";
                    } else {
                        assertAlways(false, "Could not deduct entity type for migrating 1000 -> 1001");
                    }
                }
            }
        }
    }
}
