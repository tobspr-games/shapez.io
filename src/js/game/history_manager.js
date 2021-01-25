import { Entity } from "./entity";
import { SOUNDS } from "../platform/sound";
import { KEYMAPPINGS } from "./key_action_mapper";

class LiFoQueue {
    constructor(size = 20) {
        this.size = size;
        this.items = [];
    }

    enqueue(element) {
        if (this.size < this.items.length + 1) {
            this.items.shift();
        }
        this.items.push(element);
    }

    dequeue() {
        return this.items.pop();
    }

    clear() {
        this.items = [];
    }
}

const ActionType = {
    add: "ADD",
    remove: "REMOVE",
};

export class HistoryManager {
    constructor(root) {
        this.root = root;
        this._entities = new LiFoQueue();
        this._forRedo = new LiFoQueue();

        this.initializeBindings();
    }

    initializeBindings() {
        this.root.keyMapper.getBinding(KEYMAPPINGS.placement.undo).add(this._undo, this);
        this.root.keyMapper.getBinding(KEYMAPPINGS.placement.redo).add(this._redo, this);
    }

    /**
     * @param {Entity} entity
     */
    addAction(entity) {
        this._forRedo.clear();
        this._entities.enqueue({ type: ActionType.add, entity });
    }

    removeAction(entity) {
        this._forRedo.clear();
        this._entities.enqueue({ type: ActionType.remove, entity });
    }

    _undo() {
        const { type, entity } = this._entities.dequeue() || {};
        if (!entity) {
            return;
        }
        if (type === ActionType.add && this.root.logic.canDeleteBuilding(entity)) {
            this._forRedo.enqueue({ type: ActionType.remove, entity: entity.clone() });
            this._removeEntity(entity);
        }
        if (type === ActionType.remove && this.root.logic.checkCanPlaceEntity(entity)) {
            this._forRedo.enqueue({ type: ActionType.add, entity: entity });
            this._placeEntity(entity);
        }
    }

    _redo() {
        const { type, entity } = this._forRedo.dequeue() || {};
        if (!entity) {
            return;
        }
        if (type === ActionType.remove && this.root.logic.checkCanPlaceEntity(entity)) {
            this._placeEntity(entity);
            this._entities.enqueue({ type: ActionType.add, entity });
        }
        if (type === ActionType.add && this.root.logic.canDeleteBuilding(entity)) {
            this._entities.enqueue({ type: ActionType.remove, entity: entity.clone() });
            this._removeEntity(entity);
        }
    }

    _removeEntity(entity) {
        this.root.map.removeStaticEntity(entity);
        this.root.entityMgr.destroyEntity(entity);
        this.root.entityMgr.processDestroyList();
        this.root.soundProxy.playUi(SOUNDS.destroyBuilding);
    }

    _placeEntity(entity) {
        this.root.logic.freeEntityAreaBeforeBuild(entity);
        this.root.map.placeStaticEntity(entity);
        this.root.entityMgr.registerEntity(entity);
    }
}
