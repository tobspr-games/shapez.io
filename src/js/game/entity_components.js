/* typehints:start */
import { BeltComponent } from "./components/belt";
import { BeltUnderlaysComponent } from "./components/belt_underlays";
import { HubComponent } from "./components/hub";
import { ItemAcceptorComponent } from "./components/item_acceptor";
import { ItemEjectorComponent } from "./components/item_ejector";
import { ItemProcessorComponent } from "./components/item_processor";
import { MinerComponent } from "./components/miner";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { StorageComponent } from "./components/storage";
import { UndergroundBeltComponent } from "./components/underground_belt";
import { WiredPinsComponent } from "./components/wired_pins";
/* typehints:end */

/**
 * Typedefs for all entity components. These are not actually present on the entity,
 * thus they are undefined by default
 */
export class EntityComponentStorage {
    constructor() {
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

        /** @type {UndergroundBeltComponent} */
        this.UndergroundBelt;

        /** @type {HubComponent} */
        this.Hub;

        /** @type {StorageComponent} */
        this.Storage;

        /** @type {WiredPinsComponent} */
        this.WiredPins;

        /** @type {BeltUnderlaysComponent} */
        this.BeltUnderlays;

        /* typehints:end */
    }
}
