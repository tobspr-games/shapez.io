import { GameRoot } from "../root";
import { globalConfig } from "../../core/config";
import { Vector, mixVector } from "../../core/vector";
import { lerp } from "../../core/utils";
/* dev:start */
import trailerPoints from "./trailer_points";
const tickrate: any = 1 / 165;
export class TrailerMaker {
    public root = root;
    public markers = [];
    public playbackMarkers = null;
    public currentPlaybackOrigin = new Vector();
    public currentPlaybackZoom = 3;

        constructor(root) {
        window.addEventListener("keydown", (ev: any): any => {
            if (ev.key === "j") {
                console.log("Record");
                this.markers.push({
                    pos: this.root.camera.center.copy(),
                    zoom: this.root.camera.zoomLevel,
                    time: 1,
                    wait: 0,
                });
            }
            else if (ev.key === "k") {
                console.log("Export");
                const json: any = JSON.stringify(this.markers);
                const handle: any = window.open("about:blank");
                handle.document.write(json);
            }
            else if (ev.key === "u") {
                if (this.playbackMarkers && this.playbackMarkers.length > 0) {
                    this.playbackMarkers = [];
                    return;
                }
                console.log("Playback");
                this.playbackMarkers = trailerPoints.map((p: any): any => Object.assign({}, p));
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
    update(): any {
        if (this.playbackMarkers && this.playbackMarkers.length > 0) {
            const nextMarker: any = this.playbackMarkers[0];
            if (!nextMarker.startTime) {
                console.log("Starting to approach", nextMarker.pos);
                nextMarker.startTime = performance.now() / 1000.0;
            }
            const speed: any = globalConfig.tileSize *
                globalConfig.beltSpeedItemsPerSecond *
                globalConfig.itemSpacingOnBelts;
            // let time =
            //     this.currentPlaybackOrigin.distance(Vector.fromSerializedObject(nextMarker.pos)) / speed;
            const time: any = nextMarker.time;
            const progress: any = (performance.now() / 1000.0 - nextMarker.startTime) / time;
            if (progress > 1.0) {
                if (nextMarker.wait > 0) {
                    nextMarker.wait -= tickrate;
                }
                else {
                    console.log("Approached");
                    this.currentPlaybackOrigin = this.root.camera.center.copy();
                    this.currentPlaybackZoom = this.root.camera.zoomLevel;
                    this.playbackMarkers.shift();
                }
                return;
            }
            const targetPos: any = Vector.fromSerializedObject(nextMarker.pos);
            const targetZoom: any = nextMarker.zoom;
            const pos: any = mixVector(this.currentPlaybackOrigin, targetPos, progress);
            const zoom: any = lerp(this.currentPlaybackZoom, targetZoom, progress);
            this.root.camera.zoomLevel = zoom;
            this.root.camera.center = pos;
        }
    }
}
/* dev:end */
