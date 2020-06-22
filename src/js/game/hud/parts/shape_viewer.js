import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, removeAllChildren } from "../../../core/utils";
import { T } from "../../../translations";
import { defaultBuildingVariant } from "../../meta_building";
import { ShapeDefinition } from "../../shape_definition";
import { KEYMAPPINGS, KeyActionMapper } from "../../key_action_mapper";
import { InputReceiver } from "../../../core/input_receiver";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDShapeViewer extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_ShapeViewer", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.shapeViewer.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
    }

    initialize() {
        this.root.hud.signals.viewShapeDetailsRequested.add(this.renderForShape, this);

        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("shape_viewer");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);

        this.close();
    }

    /**
     * Closes the dialog
     */
    close() {
        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    /**
     * Shows the viewer for a given definition
     * @param {ShapeDefinition} definition
     */
    renderForShape(definition) {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);

        removeAllChildren(this.contentDiv);

        const layers = definition.layers;
        for (let i = 0; i < layers.length; ++i) {
            const layerElem = makeDiv(this.contentDiv, null, ["layer", "layer-" + i]);

            let fakeLayers = [];
            for (let k = 0; k < i; ++k) {
                fakeLayers.push([null, null, null, null]);
            }
            fakeLayers.push(layers[i]);

            const thisLayerOnly = new ShapeDefinition({ layers: fakeLayers });
            const thisLayerCanvas = thisLayerOnly.generateAsCanvas(160);
            layerElem.appendChild(thisLayerCanvas);

            for (let quad = 0; quad < 4; ++quad) {
                const quadElem = makeDiv(layerElem, null, ["quad", "quad-" + quad]);

                const contents = layers[i][quad];
                if (contents) {
                    const colorLabelElem = makeDiv(
                        quadElem,
                        null,
                        ["colorLabel"],
                        T.ingame.colors[contents.color]
                    );
                } else {
                    const emptyLabelElem = makeDiv(
                        quadElem,
                        null,
                        ["emptyLabel"],
                        T.ingame.shapeViewer.empty
                    );
                }
            }

            if (i < layers.length - 1) {
                makeDiv(this.contentDiv, null, ["seperator"], "+");
            }
        }
    }

    /**
     * Cleans up everything
     */
    cleanup() {
        document.body.classList.remove("ingameDialogOpen");
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
