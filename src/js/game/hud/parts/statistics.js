import { BaseHUDPart } from "../base_hud_part";
import {
    makeDiv,
    makeButton,
    formatBigNumber,
    clamp,
    removeAllChildren,
    waitNextFrame,
} from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper } from "../../key_action_mapper";
import { ShapeDefinition } from "../../shape_definition";
import { GameRoot } from "../../root";
import { freeCanvas, makeOffscreenBuffer } from "../../../core/buffer_utils";
import { enumAnalyticsDataSource } from "../../production_analytics";
import { globalConfig } from "../../../core/config";
import { Math_floor, Math_min } from "../../../core/builtins";

/** @enum {string} */
const enumDisplayMode = {
    icons: "icons",
    detailed: "detailed",
};

/**
 * Simple wrapper for a shape definition
 */
class ShapeStatisticsHandle {
    /**
     * @param {GameRoot} root
     * @param {ShapeDefinition} definition
     * @param {IntersectionObserver} intersectionObserver
     */
    constructor(root, definition, intersectionObserver) {
        this.definition = definition;
        this.root = root;
        this.intersectionObserver = intersectionObserver;

        this.visible = false;
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.setAttribute("data-shape-key", this.definition.getHash());

        this.counter = document.createElement("span");
        this.counter.classList.add("counter");
        this.element.appendChild(this.counter);
    }

    /**
     * Sets whether the shape handle is visible currently
     * @param {boolean} visibility
     */
    setVisible(visibility) {
        if (visibility === this.visible) {
            return;
        }
        this.visible = visibility;
        if (visibility) {
            if (!this.shapeCanvas) {
                // Create elements
                this.shapeCanvas = this.definition.generateAsCanvas(100);
                this.shapeCanvas.classList.add("icon");
                this.element.appendChild(this.shapeCanvas);
            }
        } else {
            // Drop elements
            if (this.shapeCanvas) {
                this.shapeCanvas.remove();
                delete this.shapeCanvas;
            }
            if (this.graphCanvas) {
                this.graphCanvas.remove();
                delete this.graphCanvas;
                delete this.graphContext;
            }
        }
    }

    /**
     *
     * @param {enumDisplayMode} displayMode
     * @param {enumAnalyticsDataSource} dataSource
     * @param {boolean=} forced
     */
    update(displayMode, dataSource, forced = false) {
        if (!this.element) {
            return;
        }
        if (!this.visible && !forced) {
            return;
        }

        switch (dataSource) {
            case enumAnalyticsDataSource.stored: {
                this.counter.innerText = formatBigNumber(
                    this.root.hubGoals.storedShapes[this.definition.getHash()] || 0
                );
                break;
            }
            case enumAnalyticsDataSource.delivered:
            case enumAnalyticsDataSource.produced: {
                let rate =
                    (this.root.productionAnalytics.getCurrentShapeRate(dataSource, this.definition) /
                        globalConfig.analyticsSliceDurationSeconds) *
                    60;
                this.counter.innerText = formatBigNumber(rate) + " / m";
                break;
            }
        }

        if (displayMode === enumDisplayMode.detailed) {
            const graphDpi = globalConfig.statisticsGraphDpi;

            const w = 300;
            const h = 40;

            if (!this.graphCanvas) {
                const [canvas, context] = makeOffscreenBuffer(w * graphDpi, h * graphDpi, {
                    smooth: true,
                    reusable: false,
                    label: "statgraph-" + this.definition.getHash(),
                });
                context.scale(graphDpi, graphDpi);
                canvas.classList.add("graph");
                this.graphCanvas = canvas;
                this.graphContext = context;
                this.element.appendChild(this.graphCanvas);
            }

            this.graphContext.clearRect(0, 0, w, h);

            this.graphContext.fillStyle = "#bee0db";
            this.graphContext.strokeStyle = "#66ccbc";
            this.graphContext.lineWidth = 1.5;

            const sliceWidth = w / globalConfig.statisticsGraphSlices;

            let values = [];
            let maxValue = 1;

            for (let i = 0; i < globalConfig.statisticsGraphSlices - 1; ++i) {
                const value = this.root.productionAnalytics.getPastShapeRate(
                    dataSource,
                    this.definition,
                    globalConfig.statisticsGraphSlices - i - 1
                );
                if (value > maxValue) {
                    maxValue = value;
                }
                values.push(value);
            }

            this.graphContext.beginPath();
            this.graphContext.moveTo(0.75, h + 5);
            for (let i = 0; i < values.length; ++i) {
                const yValue = clamp((1 - values[i] / maxValue) * h, 0.75, h - 0.75);
                const x = i * sliceWidth;
                if (i === 0) {
                    this.graphContext.lineTo(0.75, yValue);
                }
                this.graphContext.lineTo(x, yValue);
                if (i === values.length - 1) {
                    this.graphContext.lineTo(w + 100, yValue);
                    this.graphContext.lineTo(w + 100, h + 5);
                }
            }

            this.graphContext.closePath();
            this.graphContext.stroke();
            this.graphContext.fill();
        } else {
            if (this.graphCanvas) {
                this.graphCanvas.remove();
                delete this.graphCanvas;
                delete this.graphContext;
            }
        }
    }

    /**
     * Attaches the handle
     * @param {HTMLElement} parent
     */
    attach(parent) {
        if (!this.element) {
            this.initElement();
        }
        if (this.element.parentElement !== parent) {
            parent.appendChild(this.element);
            this.intersectionObserver.observe(this.element);
        }
    }

    /**
     * Detaches the handle
     */
    detach() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
            this.intersectionObserver.unobserve(this.element);
        }
    }

    /**
     * Destroys the handle
     */
    destroy() {
        if (this.element) {
            this.intersectionObserver.unobserve(this.element);
            this.shapeCanvas.remove();

            this.element.remove();
            delete this.element;
            delete this.counter;
            delete this.shapeCanvas;
        }
    }
}

export class HUDStatistics extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Statistics", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], `statistics`);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);

        this.filterHeader = makeDiv(this.dialogInner, null, ["filterHeader"]);

        this.filtersDataSource = makeDiv(this.filterHeader, null, ["filtersDataSource"]);
        this.filtersDisplayMode = makeDiv(this.filterHeader, null, ["filtersDisplayMode"]);

        const buttonModeProduced = makeButton(this.filtersDataSource, ["modeProduced"], "Produced");
        const buttonModeDelivered = makeButton(this.filtersDataSource, ["modeDelivered"], "Delivered");
        const buttonModeStored = makeButton(this.filtersDataSource, ["modeStored"], "Stored");

        this.trackClicks(buttonModeProduced, () => this.setDataSource(enumAnalyticsDataSource.produced));
        this.trackClicks(buttonModeStored, () => this.setDataSource(enumAnalyticsDataSource.stored));
        this.trackClicks(buttonModeDelivered, () => this.setDataSource(enumAnalyticsDataSource.delivered));

        const buttonDisplayDetailed = makeButton(this.filtersDisplayMode, ["displayDetailed"]);
        const buttonDisplayIcons = makeButton(this.filtersDisplayMode, ["displayIcons"]);

        this.trackClicks(buttonDisplayIcons, () => this.setDisplayMode(enumDisplayMode.icons));
        this.trackClicks(buttonDisplayDetailed, () => this.setDisplayMode(enumDisplayMode.detailed));

        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
    }

    /**
     * @param {enumAnalyticsDataSource} source
     */
    setDataSource(source) {
        this.dataSource = source;
        this.dialogInner.setAttribute("data-datasource", source);
        if (this.visible) {
            this.rerenderFull();
        }
    }

    /**
     * @param {enumDisplayMode} mode
     */
    setDisplayMode(mode) {
        this.displayMode = mode;
        this.dialogInner.setAttribute("data-displaymode", mode);
        if (this.visible) {
            this.rerenderFull();
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("statistics");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding("back").add(this.close, this);
        this.keyActionMapper.getBinding("menu_open_stats").add(this.close, this);

        /** @type {Object.<string, ShapeStatisticsHandle>} */
        this.activeHandles = {};

        this.setDataSource(enumAnalyticsDataSource.produced);
        this.setDisplayMode(enumDisplayMode.detailed);

        this.intersectionObserver = new IntersectionObserver(this.intersectionCallback.bind(this), {
            root: this.contentDiv,
        });

        this.lastFullRerender = 0;

        this.close();
        this.rerenderFull();
    }

    intersectionCallback(entries) {
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            const handle = this.activeHandles[entry.target.getAttribute("data-shape-key")];
            if (handle) {
                handle.setVisible(entry.intersectionRatio > 0);
            }
        }
    }

    cleanup() {
        document.body.classList.remove("ingameDialogOpen");
    }

    show() {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
        this.update();
    }

    close() {
        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
        if (this.visible) {
            if (this.root.time.now() - this.lastFullRerender > 1) {
                this.lastFullRerender = this.root.time.now();
                this.lastPartialRerender = this.root.time.now();
                this.rerenderFull();
            }
            this.rerenderPartial();
        }
    }

    rerenderPartial() {
        for (const key in this.activeHandles) {
            const handle = this.activeHandles[key];
            handle.update(this.displayMode, this.dataSource);
        }
    }

    rerenderFull() {
        removeAllChildren(this.contentDiv);

        // Now, attach new ones
        const entries = Object.entries(this.root.hubGoals.storedShapes);
        entries.sort((a, b) => b[1] - a[1]);

        let rendered = new Set();

        for (let i = 0; i < Math_min(entries.length, 200); ++i) {
            const entry = entries[i];
            const shapeKey = entry[0];
            const amount = entry[1];
            if (amount < 1) {
                continue;
            }

            let handle = this.activeHandles[shapeKey];
            if (!handle) {
                const definition = this.root.shapeDefinitionMgr.getShapeFromShortKey(shapeKey);
                handle = this.activeHandles[shapeKey] = new ShapeStatisticsHandle(
                    this.root,
                    definition,
                    this.intersectionObserver
                );
            }

            rendered.add(shapeKey);
            handle.attach(this.contentDiv);
        }

        for (const key in this.activeHandles) {
            if (!rendered.has(key)) {
                this.activeHandles[key].destroy();
                delete this.activeHandles[key];
            }
        }

        if (entries.length === 0) {
            this.contentDiv.innerHTML = `
            <strong class="noEntries">No shapes have been produced so far.</strong>`;
        }

        this.contentDiv.classList.toggle("hasEntries", entries.length > 0);
    }
}
