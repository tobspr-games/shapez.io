/* typehints:start */
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { BeltComponent } from "./components/belt";
import { ItemEjectorComponent } from "./components/item_ejector";
import { ItemAcceptorComponent } from "./components/item_acceptor";
import { MinerComponent } from "./components/miner";
import { ItemProcessorComponent } from "./components/item_processor";
import { ReplaceableMapEntityComponent } from "./components/replaceable_map_entity";
import { UndergroundBeltComponent } from "./components/underground_belt";
import { UnremovableComponent } from "./components/unremovable";
import { HubComponent } from "./components/hub";
import { StorageComponent } from "./components/storage";
/* typehints:end */

/**
 * Typedefs for all entity components. These are not actually present on the entity,
 * thus they are undefined by default
 */
export class EntityComponentStorage {
    constructor() {
        // TODO: Figure out if its faster to declare all components here and not
        // compile them out (In theory, should make it a fast object in V8 engine)

        /* typehints:start */

        /** @type {StaticMapEntityComponent} */
        this.StaticMapEntity;

        /** @type {BeltComponent} */
        this.Belt;

        /** @type {ItemEjectorComponent} */
        this.ItemEjector;

        /** @type {ItemAcceptorComponent} */
        this.ItemAcceptor;

        /** @type {MinerComponent} */
        this.Miner;

        /** @type {ItemProcessorComponent} */
        this.ItemProcessor;

        /** @type {ReplaceableMapEntityComponent} */
        this.ReplaceableMapEntity;

        /** @type {UndergroundBeltComponent} */
        this.UndergroundBelt;

        /** @type {UnremovableComponent} */
        this.Unremovable;

        /** @type {HubComponent} */
        this.Hub;

        /** @type {StorageComponent} */
        this.Storage;

        /* typehints:end */
    }
}
