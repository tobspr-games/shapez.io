import { GameRoot } from "../root";
import { globalConfig } from "../../core/config";
import { Vector, mixVector } from "../../core/vector";
import { performanceNow } from "../../core/builtins";
import { lerp } from "../../core/utils";

/* dev:start */
import trailerPoints from "./trailer_points";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaBeltBaseBuilding } from "../buildings/belt_base";
import { MinerComponent } from "../components/miner";

const tickrate = 1 / 165;

export class TrailerMaker {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.markers = [];
        this.playbackMarkers = null;
        this.currentPlaybackOrigin = new Vector();
        this.currentPlaybackZoom = 3;

        window.addEventListener("keydown", ev => {
            if (ev.key === "j") {
                console.log("Record");
                this.markers.push({
                    pos: this.root.camera.center.copy(),
                    zoom: this.root.camera.zoomLevel,
                    time: 1,
                    wait: 0,
                });
            } else if (ev.key === "k") {
                console.log("Export");
                const json = JSON.stringify(this.markers);
                const handle = window.open("about:blank");
                handle.document.write(json);
            } else if (ev.key === "u") {
                if (this.playbackMarkers && this.playbackMarkers.length > 0) {
                    this.playbackMarkers = [];
                    return;
                }
                console.log("Playback");
                this.playbackMarkers = trailerPoints.map(p => Object.assign({}, p));
                this.playbackMarkers.unshift(this.playbackMarkers[0]);
                this.currentPlaybackOrigin = Vector.fromSerializedObject(this.playbackMarkers[0].pos);

                this.currentPlaybackZoom = this.playbackMarkers[0].zoom;
                this.root.camera.center = this.currentPlaybackOrigin.copy();
                this.root.camera.zoomLevel = this.currentPlaybackZoom;
                console.log("STart at", this.currentPlaybackOrigin);

                // this.root.entityMgr.getAllWithComponent(MinerComponent).forEach(miner => {
                //     miner.components.Miner.itemChainBuffer = [];
                //     miner.components.Miner.lastMiningTime = this.root.time.now() + 5;
                //     miner.components.ItemEjector.slots.forEach(slot => (slot.item = null));
                // });

                // this.root.logic.tryPlaceBuilding({
                //     origin: new Vector(-428, -15),
                //     building: gMetaBuildingRegistry.findByClass(MetaBeltBaseBuilding),
                //     originalRotation: 0,
                //     rotation: 0,
                //     variant: "default",
                //     rotationVariant: 0,
                // });

                // this.root.logic.tryPlaceBuilding({
                //     origin: new Vector(-427, -15),
                //     building: gMetaBuildingRegistry.findByClass(MetaBeltBaseBuilding),
                //     originalRotation: 0,
                //     rotation: 0,
                //     variant: "default",
                //     rotationVariant: 0,
                // });
            }
        });
    }

    update() {
        if (this.playbackMarkers && this.playbackMarkers.length > 0) {
            const nextMarker = this.playbackMarkers[0];

            if (!nextMarker.startTime) {
                console.log("Starting to approach", nextMarker.pos);
                nextMarker.startTime = performanceNow() / 1000.0;
            }

            const speed =
                globalConfig.tileSize *
                globalConfig.beltSpeedItemsPerSecond *
                globalConfig.itemSpacingOnBelts;
            // let time =
            //     this.currentPlaybackOrigin.distance(Vector.fromSerializedObject(nextMarker.pos)) / speed;
            const time = nextMarker.time;

            const progress = (performanceNow() / 1000.0 - nextMarker.startTime) / time;

            if (progress > 1.0) {
                if (nextMarker.wait > 0) {
                    nextMarker.wait -= tickrate;
                } else {
                    console.log("Approached");
                    this.currentPlaybackOrigin = this.root.camera.center.copy();
                    this.currentPlaybackZoom = this.root.camera.zoomLevel;
                    this.playbackMarkers.shift();
                }
                return;
            }

            const targetPos = Vector.fromSerializedObject(nextMarker.pos);
            const targetZoom = nextMarker.zoom;

            const pos = mixVector(this.currentPlaybackOrigin, targetPos, progress);
            const zoom = lerp(this.currentPlaybackZoom, targetZoom, progress);
            this.root.camera.zoomLevel = zoom;
            this.root.camera.center = pos;
        }
    }
}

/* dev:end */
