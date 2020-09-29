import { InputReceiver } from "../../../core/input_receiver";
import { makeButton, makeDiv, removeAllChildren } from "../../../core/utils";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { enumAnalyticsDataSource } from "../../production_analytics";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { enumDisplayMode, HUDShapeStatisticsHandle, statisticsUnitsSeconds } from "./statistics_handle";
import { T } from "../../../translations";

/**
 * Capitalizes the first letter
 * @param {string} str
 */
function capitalizeFirstLetter(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
}

export class HUDStatistics extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Statistics", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.statistics.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);

        this.filterHeader = makeDiv(this.dialogInner, null, ["filterHeader"]);
        this.sourceExplanation = makeDiv(this.dialogInner, null, ["sourceExplanation"]);

        this.filtersDataSource = makeDiv(this.filterHeader, null, ["filtersDataSource"]);
        this.filtersDisplayMode = makeDiv(this.filterHeader, null, ["filtersDisplayMode"]);

        const dataSources = [
            enumAnalyticsDataSource.produced,
            enumAnalyticsDataSource.delivered,
            enumAnalyticsDataSource.stored,
        ];

        for (let i = 0; i < dataSources.length; ++i) {
            const dataSource = dataSources[i];
            const button = makeButton(
                this.filtersDataSource,
                ["mode" + capitalizeFirstLetter(dataSource)],
                T.ingame.statistics.dataSources[dataSource].title
            );
            this.trackClicks(button, () => this.setDataSource(dataSource));
        }

        const buttonIterateUnit = makeButton(this.filtersDisplayMode, ["displayIterateUnit"]);
        const buttonDisplaySorted = makeButton(this.filtersDisplayMode, ["displaySorted"]);
        const buttonDisplayDetailed = makeButton(this.filtersDisplayMode, ["displayDetailed"]);
        const buttonDisplayIcons = makeButton(this.filtersDisplayMode, ["displayIcons"]);

        this.trackClicks(buttonIterateUnit, () => this.iterateUnit());
        this.trackClicks(buttonDisplaySorted, () => this.toggleSorted());
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

        this.sourceExplanation.innerText = T.ingame.statistics.dataSources[source].description;
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

    /**
     * @param {boolean} sorted
     */
    setSorted(sorted) {
        this.sorted = sorted;
        this.dialogInner.setAttribute("data-sorted", String(sorted));
        if (this.visible) {
            this.rerenderFull();
        }
    }

    toggleSorted() {
        this.setSorted(!this.sorted);
    }

    /**
     * Chooses the next unit
     */
    iterateUnit() {
        const units = Array.from(Object.keys(statisticsUnitsSeconds));
        const newIndex = (units.indexOf(this.currentUnit) + 1) % units.length;
        this.currentUnit = units[newIndex];

        this.rerenderPartial();
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("statistics");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuClose).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuOpenStats).add(this.close, this);

        /** @type {Object.<string, HUDShapeStatisticsHandle>} */
        this.activeHandles = {};

        this.currentUnit = "second";

        this.setSorted(true);
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

    isBlockingOverlay() {
        return this.visible;
    }

    show() {
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
        this.update();
    }

    close() {
        this.visible = false;
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

    /**
     * Performs a partial rerender, only updating graphs and counts
     */
    rerenderPartial() {
        for (const key in this.activeHandles) {
            const handle = this.activeHandles[key];
            handle.update(this.displayMode, this.dataSource, this.currentUnit);
        }
    }

    /**
     * Performs a full rerender, regenerating everything
     */
    rerenderFull() {
        for (const key in this.activeHandles) {
            this.activeHandles[key].detach();
        }
        removeAllChildren(this.contentDiv);

        // Now, attach new ones

        let entries = null;
        switch (this.dataSource) {
            case enumAnalyticsDataSource.stored: {
                entries = Object.entries(this.root.hubGoals.storedShapes);
                break;
            }
            case enumAnalyticsDataSource.produced:
            case enumAnalyticsDataSource.delivered: {
                entries = Object.entries(this.root.productionAnalytics.getCurrentShapeRates(this.dataSource));
                break;
            }
        }

        const pinnedShapes = this.root.hud.parts.pinnedShapes;

        entries.sort((a, b) => {
            const aPinned = pinnedShapes.isShapePinned(a[0]);
            const bPinned = pinnedShapes.isShapePinned(b[0]);

            if (aPinned !== bPinned) {
                return aPinned ? -1 : 1;
            }

            // Sort by shape key for some consistency
            if (!this.sorted || b[1] == a[1]) {
                return b[0].localeCompare(a[0]);
            }
            return b[1] - a[1];
        });

        let rendered = new Set();

        for (let i = 0; i < Math.min(entries.length, 200); ++i) {
            const entry = entries[i];
            const shapeKey = entry[0];

            let handle = this.activeHandles[shapeKey];
            if (!handle) {
                const definition = this.root.shapeDefinitionMgr.getShapeFromShortKey(shapeKey);
                handle = this.activeHandles[shapeKey] = new HUDShapeStatisticsHandle(
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
            <strong class="noEntries">${T.ingame.statistics.noShapesProduced}</strong>`;
        }

        this.contentDiv.classList.toggle("hasEntries", entries.length > 0);
    }
}
