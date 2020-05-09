import { GameRoot } from "../root";

// Automatically attaches and detaches elements from the dom
// Also supports detaching elements after a given time, useful if there is a
// hide animation like for the tooltips

// Also attaches a class name if desired

export class DynamicDomAttach {
    constructor(root, element, { timeToKeepSeconds = 0, attachClass = null } = {}) {
        /** @type {GameRoot} */
        this.root = root;

        /** @type {HTMLElement} */
        this.element = element;
        this.parent = this.element.parentElement;

        this.attachClass = attachClass;

        this.timeToKeepSeconds = timeToKeepSeconds;
        this.lastVisibleTime = 0;

        // We start attached, so detach the node first
        this.attached = true;
        this.internalDetach();

        this.internalIsClassAttached = false;
        this.classAttachTimeout = null;
    }

    internalAttach() {
        if (!this.attached) {
            this.parent.appendChild(this.element);
            assert(this.element.parentElement === this.parent, "Invalid parent #1");
            this.attached = true;
        }
    }

    internalDetach() {
        if (this.attached) {
            assert(this.element.parentElement === this.parent, "Invalid parent #2");
            this.element.parentElement.removeChild(this.element);
            this.attached = false;
        }
    }

    isAttached() {
        return this.attached;
    }

    update(isVisible) {
        if (isVisible) {
            this.lastVisibleTime = this.root ? this.root.time.realtimeNow() : 0;
            this.internalAttach();
        } else {
            if (!this.root || this.root.time.realtimeNow() - this.lastVisibleTime >= this.timeToKeepSeconds) {
                this.internalDetach();
            }
        }

        if (this.attachClass && isVisible !== this.internalIsClassAttached) {
            // State changed
            this.internalIsClassAttached = isVisible;

            if (this.classAttachTimeout) {
                clearTimeout(this.classAttachTimeout);
                this.classAttachTimeout = null;
            }

            if (isVisible) {
                this.classAttachTimeout = setTimeout(() => {
                    this.element.classList.add(this.attachClass);
                }, 15);
            } else {
                this.element.classList.remove(this.attachClass);
            }
        }
    }
}
