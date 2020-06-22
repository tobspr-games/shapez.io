/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { createLogger } from "../core/logging";
import { BeltSystem } from "./systems/belt";
import { ItemEjectorSystem } from "./systems/item_ejector";
import { MapResourcesSystem } from "./systems/map_resources";
import { MinerSystem } from "./systems/miner";
import { ItemProcessorSystem } from "./systems/item_processor";
import { UndergroundBeltSystem } from "./systems/underground_belt";
import { HubSystem } from "./systems/hub";
import { StaticMapEntitySystem } from "./systems/static_map_entity";
import { ItemAcceptorSystem } from "./systems/item_acceptor";
import { StorageSystem } from "./systems/storage";

const logger = createLogger("game_system_manager");

export class GameSystemManager {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.systems = {
            /* typehints:start */
            /** @type {BeltSystem} */
            belt: null,

            /** @type {ItemEjectorSystem} */
            itemEjector: null,

            /** @type {MapResourcesSystem} */
            mapResources: null,

            /** @type {MinerSystem} */
            miner: null,

            /** @type {ItemProcessorSystem} */
            itemProcessor: null,

            /** @type {UndergroundBeltSystem} */
            undergroundBelt: null,

            /** @type {HubSystem} */
            hub: null,

            /** @type {StaticMapEntitySystem} */
            staticMapEntities: null,

            /** @type {ItemAcceptorSystem} */
            itemAcceptor: null,

            /** @type {StorageSystem} */
            storage: null,

            /* typehints:end */
        };
        this.systemUpdateOrder = [];

        this.internalInitSystems();
    }

    /**
     * Initializes all systems
     */
    internalInitSystems() {
        const add = (id, systemClass) => {
            this.systems[id] = new systemClass(this.root);
            this.systemUpdateOrder.push(id);
        };

        // Order is important!

        add("belt", BeltSystem);

        add("undergroundBelt", UndergroundBeltSystem);

        add("miner", MinerSystem);

        add("storage", StorageSystem);

        add("itemProcessor", ItemProcessorSystem);

        add("itemEjector", ItemEjectorSystem);

        add("mapResources", MapResourcesSystem);

        add("hub", HubSystem);

        add("staticMapEntities", StaticMapEntitySystem);

        // IMPORTANT: Must be after belt system since belt system can change the
        // orientation of an entity after it is placed -> the item acceptor cache
        // then would be invalid
        add("itemAcceptor", ItemAcceptorSystem);

        logger.log("📦 There are", this.systemUpdateOrder.length, "game systems");
    }

    /**
     * Updates all systems
     */
    update() {
        for (let i = 0; i < this.systemUpdateOrder.length; ++i) {
            const system = this.systems[this.systemUpdateOrder[i]];
            system.update();
        }
    }

    refreshCaches() {
        for (let i = 0; i < this.systemUpdateOrder.length; ++i) {
            const system = this.systems[this.systemUpdateOrder[i]];
            system.refreshCaches();
        }
    }
}
