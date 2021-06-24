const railsdk = require("./wegame_sdk/railsdk.js");
const { dialog } = require("electron");

function init(isDev) {
    console.log("Step 1: wegame: init");

    try {
        console.log("Step 2: Calling need restart app");
        const need_restart = railsdk.RailNeedRestartAppForCheckingEnvironment(
            2001639,
            [`--rail_render_pid=${process.pid}`] //,"--rail_debug_mode",
        );
        console.log("Step 3: Needs restart =", need_restart);
        if (need_restart) {
            console.error("Step 4: Need restart");
            dialog.showErrorBox("加载RailSDK失败", "请先运行WeGame开发者版本");
            return;
        }
    } catch (err) {
        console.error("Rail SDK error:", err);
        dialog.showErrorBox("加载RailSDK失败", err);
        return;
    }

    console.log("Step 5: starting rail sdk");
    if (railsdk.RailInitialize() === false) {
        console.error("RailInitialize() = false");
        dialog.showErrorBox("RailInitialize调用失败", "请先运行WeGame开发者版本");
        return;
    }

    console.log("Initialize RailSDK success!");

    railsdk.RailRegisterEvent(railsdk.RailEventID.kRailEventSystemStateChanged, event => {
        console.log(event);
        if (event.result === railsdk.RailResult.kSuccess) {
            if (
                event.state === railsdk.RailSystemState.kSystemStatePlatformOffline ||
                event.state === railsdk.RailSystemState.kSystemStatePlatformExit ||
                event.state === railsdk.RailSystemState.kSystemStateGameExitByAntiAddiction
            ) {
                remote.app.exit();
            }
        }
    });
}

function listen() {
    console.log("wegame: listen");
}

module.exports = { init, listen };
