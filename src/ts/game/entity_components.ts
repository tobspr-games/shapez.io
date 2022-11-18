/* typehints:start */
import type { BeltComponent } from "./components/belt";
import type { BeltUnderlaysComponent } from "./components/belt_underlays";
import type { HubComponent } from "./components/hub";
import type { ItemAcceptorComponent } from "./components/item_acceptor";
import type { ItemEjectorComponent } from "./components/item_ejector";
import type { ItemProcessorComponent } from "./components/item_processor";
import type { MinerComponent } from "./components/miner";
import type { StaticMapEntityComponent } from "./components/static_map_entity";
import type { StorageComponent } from "./components/storage";
import type { UndergroundBeltComponent } from "./components/underground_belt";
import type { WiredPinsComponent } from "./components/wired_pins";
import type { WireComponent } from "./components/wire";
import type { ConstantSignalComponent } from "./components/constant_signal";
import type { LogicGateComponent } from "./components/logic_gate";
import type { LeverComponent } from "./components/lever";
import type { WireTunnelComponent } from "./components/wire_tunnel";
import type { DisplayComponent } from "./components/display";
import type { BeltReaderComponent } from "./components/belt_reader";
import type { FilterComponent } from "./components/filter";
import type { ItemProducerComponent } from "./components/item_producer";
import type { GoalAcceptorComponent } from "./components/goal_acceptor";
/* typehints:end */
/**
 * Typedefs for all entity components. These are not actually present on the entity,
 * thus they are undefined by default
 */
export class EntityComponentStorage {
    public StaticMapEntity: StaticMapEntityComponent;
    public Belt: BeltComponent;
    public ItemEjector: ItemEjectorComponent;
    public ItemAcceptor: ItemAcceptorComponent;
    public Miner: MinerComponent;
    public ItemProcessor: ItemProcessorComponent;
    public UndergroundBelt: UndergroundBeltComponent;
    public Hub: HubComponent;
    public Storage: StorageComponent;
    public WiredPins: WiredPinsComponent;
    public BeltUnderlays: BeltUnderlaysComponent;
    public Wire: WireComponent;
    public ConstantSignal: ConstantSignalComponent;
    public LogicGate: LogicGateComponent;
    public Lever: LeverComponent;
    public WireTunnel: WireTunnelComponent;
    public Display: DisplayComponent;
    public BeltReader: BeltReaderComponent;
    public Filter: FilterComponent;
    public ItemProducer: ItemProducerComponent;
    public GoalAcceptor: GoalAcceptorComponent;

    constructor() {
    }
}
