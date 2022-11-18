import { T } from "../translations";
import { openStandaloneLink } from "./config";
export let WEB_STEAM_SSO_AUTHENTICATED: any = false;
export async function authorizeViaSSOToken(app: any, dialogs: any): any {
    if (G_IS_STANDALONE) {
        return;
    }
    if (window.location.search.includes("sso_logout_silent")) {
        window.localStorage.setItem("steam_sso_auth_token", "");
        window.location.replace("/");
        return new Promise((): any => null);
    }
    if (window.location.search.includes("sso_logout")) {
        const { ok }: any = dialogs.showWarning(T.dialogs.steamSsoError.title, T.dialogs.steamSsoError.desc);
        window.localStorage.setItem("steam_sso_auth_token", "");
        ok.add((): any => window.location.replace("/"));
        return new Promise((): any => null);
    }
    if (window.location.search.includes("steam_sso_no_ownership")) {
        const { ok, getStandalone }: any = dialogs.showWarning(T.dialogs.steamSsoNoOwnership.title, T.dialogs.steamSsoNoOwnership.desc, ["ok", "getStandalone:good"]);
        window.localStorage.setItem("steam_sso_auth_token", "");
        getStandalone.add((): any => {
            openStandaloneLink(app, "sso_ownership");
            window.location.replace("/");
        });
        ok.add((): any => window.location.replace("/"));
        return new Promise((): any => null);
    }
    const token: any = window.localStorage.getItem("steam_sso_auth_token");
    if (!token) {
        return Promise.resolve();
    }
    const apiUrl: any = app.clientApi.getEndpoint();
    console.warn("Authorizing via token:", token);
    const verify: any = async (): any => {
        const token: any = window.localStorage.getItem("steam_sso_auth_token");
        if (!token) {
            window.location.replace("?sso_logout");
            return;
        }
        try {
            const response: any = await Promise.race([
                fetch(apiUrl + "/v1/sso/refresh", {
                    method: "POST",
                    body: token,
                    headers: {
                        "x-api-key": "d5c54aaa491f200709afff082c153ef2",
                    },
                }),
                new Promise((resolve: any, reject: any): any => {
                    setTimeout((): any => reject("timeout exceeded"), 20000);
                }),
            ]);
            const responseText: any = await response.json();
            if (!responseText.token) {
                console.warn("Failed to register");
                window.localStorage.setItem("steam_sso_auth_token", "");
                window.location.replace("?sso_logout");
                return;
            }
            window.localStorage.setItem("steam_sso_auth_token", responseText.token);
            app.clientApi.token = responseText.token;
            WEB_STEAM_SSO_AUTHENTICATED = true;
        }
        catch (ex: any) {
            console.warn("Auth failure", ex);
            window.localStorage.setItem("steam_sso_auth_token", "");
            window.location.replace("/");
            return new Promise((): any => null);
        }
    };
    await verify();
    setInterval(verify, 120000);
}
