import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv, removeAllChildren } from "../../../core/utils";
import { T } from "../../../translations";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { ShapeDefinition } from "../../shape_definition";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

const copy = require("clipboard-copy");

export class HUDShapeViewer extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_ShapeViewer", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.shapeViewer.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);

        this.renderArea = makeDiv(this.contentDiv, null, ["renderArea"]);
        this.infoArea = makeDiv(this.contentDiv, null, ["infoArea"]);

        // Create button to copy the shape area
        this.copyButton = document.createElement("button");
        this.copyButton.classList.add("styledButton", "copyKey");
        this.copyButton.innerText = T.ingame.shapeViewer.copyKey;
        this.infoArea.appendChild(this.copyButton);
    }

    initialize() {
        this.root.hud.signals.viewShapeDetailsRequested.add(this.renderForShape, this);

        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.currentShapeKey = null;

        this.inputReciever = new InputReceiver("shape_viewer");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);

        this.trackClicks(this.copyButton, this.onCopyKeyRequested);

        this.close();
    }

    isBlockingOverlay() {
        return this.visible;
    }

    /**
     * Called when the copying of a key was requested
     */
    onCopyKeyRequested() {
        if (this.currentShapeKey) {
            copy(this.currentShapeKey);
            this.close();
        }
    }

    /**
     * Closes the dialog
     */
    close() {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    /**
     * Shows the viewer for a given definition
     * @param {ShapeDefinition} definition
     */
    renderForShape(definition) {
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);

        removeAllChildren(this.renderArea);

        this.currentShapeKey = definition.getHash();

        const layers = definition.layers;
        this.contentDiv.setAttribute("data-layers", layers.length);

        for (let i = layers.length - 1; i >= 0; --i) {
            const layerElem = makeDiv(this.renderArea, null, ["layer", "layer-" + i]);

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
        }
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
