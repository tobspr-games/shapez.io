import { TextualGameState } from "../core/textual_game_state";
import { T } from "../translations";
import { removeAllChildren } from "../core/utils";
import { globalWarn } from "../core/logging";

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   website: string,
 *   description: string,
 *   url: string,
 *   author: string,
 *   version: string,
 *   install_count: string,
 *   is_game_changing: boolean
 * }} APIModData
 */

export class ModsState extends TextualGameState {
    constructor() {
        super("ModsState");
    }

    getStateHeaderTitle() {
        return T.mods.title;
    }

    getMainContentHTML() {
        return `

            <span class="devHint">
                ${T.mods.devHint.replace(
                    "<moddingDocs>",
                    `<span class='moddingDocsLink'>${T.mods.moddingDocs}</span>`
                )}
            </span>
            

            <strong class="category_label">${T.mods.installedMods}</strong>
            <div class="installedMods"></div>
            
            <strong class="category_label">${T.mods.modsBrowser}</strong>
            <div class="modGallery"></div>
        `;
    }

    onEnter() {
        this.installedModsElement = this.htmlElement.querySelector(".installedMods");
        this.modGalleryElement = this.htmlElement.querySelector(".modGallery");

        this.rerenderInstalledMods();
        this.refreshModGallery();

        this.trackClicks(this.htmlElement.querySelector(".moddingDocsLink"), this.openModdingDocs);
    }

    openModdingDocs() {
        this.app.platformWrapper.openExternalLink("https://github.com/tobspr/yorg.io-3-modding-docs");
    }

    rerenderInstalledMods() {
        // TODO: We are leaking click detectors here
        removeAllChildren(this.installedModsElement);

        const mods = this.app.modManager.getMods();
        if (mods.length === 0) {
            this.installedModsElement.innerHTML = T.mods.noModsFound;
            return;
        }

        const frag = document.createDocumentFragment();
        for (let i = 0; i < mods.length; ++i) {
            const mod = mods[i];

            const elem = this.makeModElement(mod);
            frag.appendChild(elem);

            const uninstallButton = document.createElement("button");
            uninstallButton.classList.add("styledButton", "uninstallMod");
            uninstallButton.innerText = T.mods.uninstallMod;
            elem.appendChild(uninstallButton);
            this.trackClicks(uninstallButton, () => this.uninstallMod(mod));
        }

        this.installedModsElement.appendChild(frag);
    }

    refreshModGallery() {
        // TODO: We are leaking click detectors here
        removeAllChildren(this.modGalleryElement);

        this.modGalleryElement.innerHTML = `<span class="prefab_LoadingTextWithAnim">${T.global.loading}</span>`;

        this.app.api
            .fetchModGallery()
            .then(mods => this.rerenderModsGallery(mods))
            .catch(err => {
                globalWarn(this, "Failed to fetch mod gallery:", err);
                this.modGalleryElement.innerHTML = T.mods.modGalleryFail + " " + err;
            });
    }

    /**
     *
     * @param {APIModData|import("../core/mod_manager").ModData} mod
     */
    makeModElement(mod) {
        const elem = document.createElement("div");
        elem.classList.add("mod", "cardbox");

        const title = document.createElement("span");
        title.classList.add("title");
        title.innerText = mod.name;
        elem.appendChild(title);

        const version = document.createElement("span");
        version.classList.add("version");
        version.innerText = mod.version;
        title.appendChild(version);

        const author = document.createElement("span");
        author.classList.add("author");
        author.innerText = mod.author;
        elem.appendChild(author);

        const website = document.createElement("span");
        website.classList.add("website");
        website.innerText = T.mods.website;
        elem.appendChild(website);
        this.trackClicks(website, () => this.app.platformWrapper.openExternalLink(mod.website));

        const description = document.createElement("span");
        description.classList.add("description");
        description.innerText = mod.description;
        elem.appendChild(description);

        if (mod.is_game_changing) {
            const hint = document.createElement("span");
            hint.classList.add("gameChangingHint");
            hint.innerText = T.mods.gamechangingHint;
            elem.appendChild(hint);
        }

        return elem;
    }

    /**
     *
     * @param {Array<APIModData>} mods
     */
    rerenderModsGallery(mods) {
        // TODO: We are leaking click detectors here
        removeAllChildren(this.modGalleryElement);

        if (mods.length === 0) {
            this.modGalleryElement.innerHTML = T.mods.noModsFound;
            return;
        }

        const frag = document.createDocumentFragment();
        for (let i = 0; i < mods.length; ++i) {
            const mod = mods[i];

            const elem = this.makeModElement(mod);
            frag.appendChild(elem);

            const installCount = document.createElement("span");
            installCount.classList.add("installCount");
            installCount.innerText = T.mods.installCount.replace("<installs>", "" + mod.install_count);
            elem.appendChild(installCount);

            if (this.app.modManager.getModByName(mod.name)) {
                const installedText = document.createElement("span");
                installedText.innerText = T.mods.modInstalled;
                installedText.classList.add("installedText");
                elem.appendChild(installedText);
                elem.classList.add("installed");
            } else {
                const installButton = document.createElement("button");
                installButton.classList.add("styledButton", "installMod");
                installButton.innerText = T.mods.installMod;
                elem.appendChild(installButton);
                this.trackClicks(installButton, () => this.tryInstallMod(mod));
            }
        }
        this.modGalleryElement.appendChild(frag);
    }

    /**
     *
     * @param {import("../core/mod_manager").ModData} mod
     */
    uninstallMod(mod) {
        const closeLoading = this.dialogs.showLoadingDialog();
        this.app.modManager.uninstallMod(mod.name).then(
            () => {
                closeLoading();

                const { restart } = this.dialogs.showInfo(
                    T.mods.modUninstalledDialog.title,
                    T.mods.modUninstalledDialog.desc,
                    this.app.platformWrapper.getSupportsRestart() ? ["ok:good", "restart:misc"] : ["ok:good"]
                );
                if (restart) {
                    restart.add(() => this.app.platformWrapper.performRestart());
                }

                this.refreshModGallery();
                this.rerenderInstalledMods();
            },
            err => {
                closeLoading();
                this.dialogs.showWarning(T.global.error, err);
            }
        );
    }

    /**
     *
     * @param {APIModData} mod
     */
    tryInstallMod(mod) {
        const { install } = this.dialogs.showWarning(
            T.mods.modWarning.title,
            `
                    ${T.mods.modWarning.desc}
                    <ul>
                    <li>${T.mods.modWarning.point0}</li>
                    <li>${T.mods.modWarning.point1}</li>
                    <li>${T.mods.modWarning.point2}</li>
                    <li>${T.mods.modWarning.point3}</li>
                    ${mod.is_game_changing ? `<li>${T.mods.modWarning.disclaimerGamechanging}</li>` : ""}
                    </ul>
                `,
            // @ts-ignore
            ["cancel:good", window.modsInstallWarningShown ? "install:bad" : "install:bad:timeout"]
        );

        install.add(() => this.doInstallMod(mod));
        // @ts-ignore
        window.modsInstallWarningShown = true;
    }

    /**
     *
     * @param {APIModData} mod
     */
    doInstallMod(mod) {
        const closeLoading = this.dialogs.showLoadingDialog();

        this.app.modManager
            .installMod(
                {
                    name: mod.name,
                    author: mod.author,
                    website: mod.website,
                    url: mod.url,
                    version: mod.version,
                    description: mod.description,
                    is_game_changing: mod.is_game_changing,
                    id: mod.id,
                },
                mod.id
            )
            .then(
                () => {
                    closeLoading();

                    const { restart } = this.dialogs.showInfo(
                        T.mods.modInstalledDialog.title,
                        T.mods.modInstalledDialog.desc,
                        this.app.platformWrapper.getSupportsRestart()
                            ? ["ok:good", "restart:misc"]
                            : ["ok:good"]
                    );
                    if (restart) {
                        restart.add(() => this.app.platformWrapper.performRestart());
                    }

                    this.refreshModGallery();
                    this.rerenderInstalledMods();
                },
                err => {
                    closeLoading();
                    this.dialogs.showWarning(T.global.error, err);
                }
            );
    }

    getDefaultPreviousState() {
        return "SettingsState";
    }
}
