// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Smooth Zoom",
    version: "1",
    id: "smooth_zoom",
    description: "Allows to zoom in and out smoothly, also disables map overview",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        this.modInterface.registerIngameKeybinding({
            id: "smooth_zoom_zoom_in",
            keyCode: shapez.keyToKeyCode("1"),
            translation: "Zoom In (use with SHIFT)",
            modifiers: {
                shift: true,
            },
            handler: root => {
                root.camera.setDesiredZoom(5);
                return shapez.STOP_PROPAGATION;
            },
        });
        this.modInterface.registerIngameKeybinding({
            id: "smooth_zoom_zoom_out",
            keyCode: shapez.keyToKeyCode("0"),
            translation: "Zoom Out (use with SHIFT)",
            modifiers: {
                shift: true,
            },
            handler: root => {
                root.camera.setDesiredZoom(0.1);
                return shapez.STOP_PROPAGATION;
            },
        });

        this.modInterface.extendClass(shapez.Camera, ({ $old }) => ({
            internalUpdateZooming(now, dt) {
                if (!this.currentlyPinching && this.desiredZoom !== null) {
                    const diff = this.zoomLevel - this.desiredZoom;
                    if (Math.abs(diff) > 0.0001) {
                        const speed = 0.0005;
                        let step = Math.sign(diff) * Math.min(speed, Math.abs(diff));
                        const pow = 1 / 2;
                        this.zoomLevel = Math.pow(Math.pow(this.zoomLevel, pow) - step, 1 / pow);
                    } else {
                        this.zoomLevel = this.desiredZoom;
                        this.desiredZoom = null;
                    }
                }
            },
        }));

        shapez.globalConfig.mapChunkOverviewMinZoom = -1;
    }
}
