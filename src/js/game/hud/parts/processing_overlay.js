import { DynamicDomAttach } from "../dynamic_dom_attach";
import { BaseHUDPart } from "../base_hud_part";
import { performanceNow } from "../../../core/builtins";
import { makeDiv } from "../../../core/utils";
import { Signal } from "../../../core/signal";
import { InputReceiver } from "../../../core/input_receiver";
import { createLogger } from "../../../core/logging";

const logger = createLogger("hud/processing_overlay");

export class HUDProcessingOverlay extends BaseHUDPart {
    constructor(root) {
        super(root);
        this.tasks = [];
        this.computeTimeout = null;

        this.root.signals.performAsync.add(this.queueTask, this);

        this.allTasksFinished = new Signal();
        this.inputReceiver = new InputReceiver("processing-overlay");

        this.root.signals.aboutToDestruct.add(() =>
            this.root.app.inputMgr.destroyReceiver(this.inputReceiver)
        );
    }

    createElements(parent) {
        this.element = makeDiv(
            parent,
            "rg_HUD_ProcessingOverlay",
            ["hudElement"],
            `
            <span class="prefab_LoadingTextWithAnim">
            Computing
            </span>
        `
        );
    }

    initialize() {
        this.domWatcher = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0,
        });
    }

    queueTask(task, name) {
        if (!this.root.gameInitialized) {
            // Tasks before the game started can be done directlry
            task();
            return;
        }
        // if (name) {
        //     console.warn("QUEUE", name);
        // }

        task.__name = name;
        this.tasks.push(task);
    }

    hasTasks() {
        return this.tasks.length > 0;
    }

    isRunning() {
        return this.computeTimeout !== null;
    }

    processSync() {
        const now = performanceNow();
        while (this.tasks.length > 0) {
            const workload = this.tasks[0];
            workload.call();
            this.tasks.shift();
        }
        const duration = performanceNow() - now;
        if (duration > 100) {
            logger.log("Tasks done slow (SYNC!) within", (performanceNow() - now).toFixed(2), "ms");
        }
    }

    process() {
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReceiver);

        this.domWatcher.update(true);
        if (this.tasks.length === 0) {
            logger.warn("No tasks but still called process");
            return;
        }

        if (this.computeTimeout) {
            assert(false, "Double compute queued");
            clearTimeout(this.computeTimeout);
        }

        this.computeTimeout = setTimeout(() => {
            const now = performanceNow();
            while (this.tasks.length > 0) {
                const workload = this.tasks[0];
                workload.call();
                this.tasks.shift();
            }
            const duration = performanceNow() - now;
            if (duration > 100) {
                logger.log("Tasks done slow within", (performanceNow() - now).toFixed(2), "ms");
            }

            this.domWatcher.update(false);

            this.root.app.inputMgr.makeSureDetached(this.inputReceiver);

            clearTimeout(this.computeTimeout);
            this.computeTimeout = null;

            this.allTasksFinished.dispatch();
        });
    }
}
