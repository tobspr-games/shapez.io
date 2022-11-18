/* typehints:start */
import type { DrawParameters } from "../../core/draw_parameters";
import type { MapChunkView } from "../map_chunk_view";
import type { GameRoot } from "../root";
/* typehints:end */
import { globalConfig } from "../../core/config";
import { STOP_PROPAGATION } from "../../core/signal";
import { GameSystem } from "../game_system";
import { THEME } from "../theme";
import { Entity } from "../entity";
import { Vector } from "../../core/vector";
export class ZoneSystem extends GameSystem {
    public drawn = false;

        constructor(root) {
        super(root);
        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);
        this.root.signals.gameFrameStarted.add((): any => {
            this.drawn = false;
        });
    }
    /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @param {} entity
     * @param {} tile
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /* /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @pVector | undefinee
      /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(ent /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     k(entity:  /**
     *
  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     *  /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefined} tile
     * @returns*/
    prePlacementCheckile: Vector | un /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} entity
     * @param { /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @param {} entity
     * @param {} tile
     * @ /**
     *
     * @ /**
     *
     * @param { /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefinee
     * @returns
     ntCheck(entity:  /**
     *
     * @ /**
     *
     * @param {Entity} entity
     * @param {Vector | undefined} tile
     * @returns
     */
    prePlacementCheck(entity: Entity, tile: Vector | undefined = null): any {
        const staticComp: any = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }
        const mode: any = this.root.gameMode;
        const zones: any = mode.getBuildableZones();
        if (!zones) {
            return;
        }
        const transformed: any = staticComp.getTileSpaceBounds();
        if (tile) {
            transformed.x += tile.x;
            transformed.y += tile.y;
        }
        if (!zones.some((zone: any): any => zone.intersectsFully(transformed))) {
            return STOP_PROPAGATION;
        }
    }
    /**
     * Draws the zone
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        if (this.drawn) {
            // oof
            return;
        }
        this.drawn = true;
        const mode: any = this.root.gameMode;
        const zones: any = mode.getBuildableZones();
        if (!zones) {
            return;
        }
        const zone: any = zones[0].allScaled(globalConfig.tileSize);
        const context: any = parameters.context;
        context.lineWidth = 2;
        context.strokeStyle = THEME.map.zone.borderSolid;
        context.beginPath();
        context.rect(zone.x - 1, zone.y - 1, zone.w + 2, zone.h + 2);
        context.stroke();
        const outer: any = zone;
        const padding: any = 40 * globalConfig.tileSize;
        context.fillStyle = THEME.map.zone.outerColor;
        context.fillRect(outer.x + outer.w, outer.y, padding, outer.h);
        context.fillRect(outer.x - padding, outer.y, padding, outer.h);
        context.fillRect(outer.x - padding - globalConfig.tileSize, outer.y - padding, 2 * padding + zone.w + 2 * globalConfig.tileSize, padding);
        context.fillRect(outer.x - padding - globalConfig.tileSize, outer.y + outer.h, 2 * padding + zone.w + 2 * globalConfig.tileSize, padding);
        context.globalAlpha = 1;
    }
}
