const { Menu, MenuItem, app } = require("electron");

/**
 * Returns menu items for the specified window.
 * @param {Electron.BrowserWindow} window The window to use for actions
 */
function createMenuItems(window) {
    /**
     * Specifying options directly for simplicity.
     * @type {Electron.MenuItemConstructorOptions[]}
     */
    const itemOptions = [];

    itemOptions.push({
        label: "Developer Tools",
        accelerator: "F12",
        click: () => window.webContents.toggleDevTools(),
    });

    itemOptions.push({
        label: "Reload",
        accelerator: "F5",
        click: () => window.reload(),
    });

    itemOptions.push({
        label: "Restart",
        accelerator: "F5",
        click: () => {
            app.relaunch();
            app.exit(0);
        },
    });

    itemOptions.push({
        label: "Full Screen",
        accelerator: "F11",
        click: () => window.setFullScreen(!window.fullScreen),
    });

    return itemOptions.map(options => new MenuItem(options));
}

/**
 * Create and set a menu for quick access to development tasks.
 * @param {Electron.BrowserWindow} window The window to set menu on
 */
function initializeMenu(window) {
    const menu = new Menu();
    for (const item of createMenuItems(window)) {
        menu.append(item);
    }

    if (process.platform == "darwin") {
        // We're on macOS, so a root menu is needed
        const rootMenu = new Menu();
        rootMenu.append(
            new MenuItem({
                label: "shapez.io",
                submenu: menu,
            })
        );

        window.setMenu(rootMenu);
    }

    // Items can be directly used on Windows/Linux
    Menu.setApplicationMenu(menu);
}

module.exports = { initializeMenu };
