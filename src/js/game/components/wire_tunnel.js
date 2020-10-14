import { Vector } from "../../core/vector";
import { Component } from "../component";
import { defaultBuildingVariant } from "../meta_building";

export class WireTunnelComponent extends Component {
	static getId() {
		return "WireTunnel";

	}

	constructor({ Variant, Connections = [] }) {
		super();

		this.Variant = Variant;
		// /**
		//  * All Connection Directions
		//  * @type {Object.<string, Array<Vector>>} Possibility for a T piece. Should be Irrelevant
		//  */
		/**
		 * @type {Object.<string, Vector>} 
		 */
		this.Connections = {};

		this.RebuildConnections(Connections);

		/**
		 * Linked network, only if its not multiple directions
		 * @type {Array<import("../systems/wire").WireNetwork>}
		 */
		this.linkedNetworks = [];
	}

	/**
	 * @param {import("../buildings/wire_tunnel").ConnectionDirections} Connections 
	 */
	RebuildConnections(Connections) {

		this.Connections = {};
		for(let i = 0; i < Connections.length; ++i) {
			assert(Connections[i].length == 2, "Connection Wasn't Continuos");
			let [a, b] = Connections[i];

			const ahash = a.toString();
			if(!this.Connections[ahash]) {
				this.Connections[ahash] = b;
			}

			const bhash = b.toString();
			if(!this.Connections[bhash]) {
				this.Connections[bhash] = a;
			}
		}
		console.log(this.Connections);
	}

	/**
	 * @param {string} Variant
	 * @param {import("../buildings/wire_tunnel").ConnectionDirections} Connections 
	 */
	UpdateConnections(Variant, Connections) {
		if(this.Variant !== Variant){
			this.Variant = Variant;
			this.RebuildConnections(Connections)
		}
	}

	/**
	 * Local Space Direction the connection is coming from
	 * @param {Vector} dir 
	 */
	CanConnect(dir) {
		return !!this.Connections[dir.toString()];
	}

	/**
	 * @param {import("./static_map_entity").StaticMapEntityComponent} staticComp
	 * @param {Vector} input 
	 * LocalSpace Direction into the Tunnel
	 */
	GetOutputDirection(staticComp, input) {
		const inputDir = staticComp.unapplyRotationToVector(input); //TODO: Fix the Wierd Shit
		if(this.CanConnect(inputDir)){
			return staticComp.applyRotationToVector(this.Connections[inputDir.toString()]);;
		}
		return null;
	}
}
