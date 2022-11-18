import { globalConfig } from "./config";
export type GameRoot = import("../game/root").GameRoot;
export type Rectangle = import("./rectangle").Rectangle;

export class DrawParameters {
    public context: CanvasRenderingContext2D = context;
    public visibleRect: Rectangle = visibleRect;
    public desiredAtlasScale: string = desiredAtlasScale;
    public zoomLevel: number = zoomLevel;
    public root: GameRoot = root;

    constructor({ context, visibleRect, desiredAtlasScale, zoomLevel, root }) {
    }
}
