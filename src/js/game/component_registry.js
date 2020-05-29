import { gComponentRegistry } from "../core/global_registries";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { BeltComponent } from "./components/belt";
import { SorterComponent } from "./components/sorter";
import { ItemEjectorComponent } from "./components/item_ejector";
import { ItemAcceptorComponent } from "./components/item_acceptor";
import { MinerComponent } from "./components/miner";
import { ItemProcessorComponent } from "./components/item_processor";
import { ReplaceableMapEntityComponent } from "./components/replaceable_map_entity";
import { UndergroundBeltComponent } from "./components/underground_belt";
import { UnremovableComponent } from "./components/unremovable";
import { HubComponent } from "./components/hub";
import { StorageComponent } from "./components/storage";

export function initComponentRegistry() {
    gComponentRegistry.register(StaticMapEntityComponent);
    gComponentRegistry.register(BeltComponent);
    gComponentRegistry.register(SorterComponent);
    gComponentRegistry.register(ItemEjectorComponent);
    gComponentRegistry.register(ItemAcceptorComponent);
    gComponentRegistry.register(MinerComponent);
    gComponentRegistry.register(ItemProcessorComponent);
    gComponentRegistry.register(ReplaceableMapEntityComponent);
    gComponentRegistry.register(UndergroundBeltComponent);
    gComponentRegistry.register(UnremovableComponent);
    gComponentRegistry.register(HubComponent);
    gComponentRegistry.register(StorageComponent);

    // IMPORTANT ^^^^^ UPDATE ENTITY COMPONENT STORAGE AFTERWARDS

    // Sanity check - If this is thrown, you (=me, lol) forgot to add a new component here

    assert(
        // @ts-ignore
        require.context("./components", false, /.*\.js/i).keys().length ===
        gComponentRegistry.getNumEntries(),
        "Not all components are registered"
    );

    console.log("📦 There are", gComponentRegistry.getNumEntries(), "components");
}
