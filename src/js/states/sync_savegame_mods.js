import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";
import { Savegame } from "../savegame/savegame";

export class SyncSavegameModsState extends TextualGameState {
    constructor() {
        super("SyncSavegameModsState");
    }

    getMainContentHTML() {
        return `


            <div class="comparisonDiv">
                <span class="desc">${T.syncSavegameMods.desc}</span>

                <div class="modsComparison">

                    <div class="savegameMods modsGroup">
                        <strong>${T.syncSavegameMods.savegameMods}</strong>
                        <div class="modsList">
                            <span>Mymod@1.0.0</span>
                        </div>
                        
                        </div>

                        <div class="installedMods modsGroup">
                        <strong>${T.syncSavegameMods.yourMods}</strong>
                        <div class="modsList">
                            <span>Mymod@1.0.1</span>
                        </div>
                    </div>
                </div>

                <div class="buttonDiv">
                    <button class="styledButton cancel">${T.dialogs.buttons.cancel}</button>
                    <button class="styledButton syncMods">${T.syncSavegameMods.syncMods}</button>
                </div>
            </div>
            `;
    }

    getShowDiamonds() {
        return false;
    }

    onEnter(payload) {
        /** @type {Savegame} */
        const savegame = payload.savegame;
        const nextStateId = payload.nextStateId;
        const nextStatePayload = payload.nextStatePayload;

        this.targetMods = savegame.getInstalledMods();

        if (this.app.modManager.needsRestart) {
            this.containerElement.classList.add("loading");
            const { cancel, restart } = this.dialogs.showWarning(
                T.syncSavegameMods.dialog.needs_restart.title,
                T.syncSavegameMods.dialog.needs_restart.desc,
                this.app.platformWrapper.getSupportsRestart()
                    ? ["cancel:bad", "restart:misc"]
                    : ["cancel:bad"]
            );
            cancel.add(() => this.moveToState("MainMenuState"));
            if (restart) {
                restart.add(() => this.app.platformWrapper.performRestart());
            }
            return;
        }

        const renderMods = (mods, targetId) => {
            const targetElement = this.containerElement.querySelector(targetId);

            const filteredMods = mods.filter(mod => mod.is_game_changing);

            if (filteredMods.length > 0) {
                targetElement.innerHTML = filteredMods
                    .map(m => "<strong>" + m.name + "@" + m.version + "</strong>")
                    .join("");
            } else {
                targetElement.innerHTML = `<span class='noMods'>${T.syncSavegameMods.no_game_changing_mods}</span>`;
            }
        };

        renderMods(this.app.modManager.getMods(), ".installedMods .modsList");
        renderMods(savegame.getInstalledMods(), ".savegameMods .modsList");

        this.trackClicks(this.htmlElement.querySelector("button.cancel"), this.onBackButton);
        this.trackClicks(this.htmlElement.querySelector("button.syncMods"), this.doSyncMods);
    }

    doSyncMods() {
        const closeLoading = this.dialogs.showLoadingDialog();

        this.app.modManager.syncModsFromSavegame(this.targetMods).then(
            () => {
                closeLoading();
                const { cancel, restart } = this.dialogs.showWarning(
                    T.syncSavegameMods.dialog_synced.title,
                    T.syncSavegameMods.dialog_synced.desc,
                    this.app.platformWrapper.getSupportsRestart()
                        ? ["cancel:bad", "restart:misc"]
                        : ["cancel:bad"]
                );
                cancel.add(this.onBackButton, this);
                if (restart) {
                    restart.add(() => this.app.platformWrapper.performRestart());
                }
            },
            err => {
                closeLoading();
                const { ok } = this.dialogs.showWarning(T.global.error, err);
                ok.add(this.onBackButton, this);
            }
        );
    }

    onBackButton() {
        this.moveToState("SingleplayerOverviewState");
    }
}
