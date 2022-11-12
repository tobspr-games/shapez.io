/**
 * @type {Record<string, {
 *  standalone: boolean,
 *  environment?: 'dev' | 'staging' | 'prod',
 *  electronBaseDir?: string,
 *  steamAppId?: number,
 *  executableName?: string
 * }>}
 */
const BUILD_VARIANTS = {
    "web-localhost": {
        standalone: false,
        environment: "dev",
    },
    "web-shapezio-beta": {
        standalone: false,
        environment: "staging",
    },
    "web-shapezio": {
        standalone: false,
        environment: "prod",
    },
    "standalone-steam": {
        standalone: true,
        executableName: "shapez",
        steamAppId: 1318690,
    },
};
module.exports = { BUILD_VARIANTS };
