// @ts-nocheck

const path = require("path");
const webpack = require("webpack");
const { getRevision, getVersion, getAllResourceImages } = require("./buildutils");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = ({ watch = false, standalone = false }) => {
    return {
        mode: "development",
        devtool: "cheap-source-map",
        entry: {
            "bundle.js": [path.resolve(__dirname, "../src/js/main.js")],
        },
        watch,
        node: {
            fs: "empty",
        },
        resolve: {
            alias: {
                "global-compression": path.resolve(__dirname, "..", "src", "js", "core", "lzstring.js"),
            },
        },
        context: path.resolve(__dirname, ".."),
        plugins: [
            new webpack.DefinePlugin({
                assert: "window.assert",
                assertAlways: "window.assert",
                abstract:
                    "window.assert(false, 'abstract method called of: ' + (this.name || (this.constructor && this.constructor.name)));",
                G_HAVE_ASSERT: "true",
                G_APP_ENVIRONMENT: JSON.stringify("dev"),
                G_IS_DEV: "true",
                G_IS_RELEASE: "false",
                G_IS_BROWSER: "true",
                G_IS_STANDALONE: JSON.stringify(standalone),
                G_BUILD_TIME: "" + new Date().getTime(),
                G_BUILD_COMMIT_HASH: JSON.stringify(getRevision()),
                G_BUILD_VERSION: JSON.stringify(getVersion()),
                G_ALL_UI_IMAGES: JSON.stringify(getAllResourceImages()),
            }),

            new CircularDependencyPlugin({
                // exclude detection of files based on a RegExp
                exclude: /node_modules/,

                // add errors to webpack instead of warnings
                failOnError: true,

                // allow import cycles that include an asyncronous import,
                // e.g. via import(/* webpackMode: "weak" */ './file.js')
                allowAsyncCycles: false,

                // set the current working directory for displaying module paths
                cwd: path.join(__dirname, "..", "src", "js"),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.json$/,
                    enforce: "pre",
                    use: ["./gulp/loader.compressjson"],
                    type: "javascript/auto",
                },
                { test: /\.(png|jpe?g|svg)$/, loader: "ignore-loader" },
                { test: /\.nobuild/, loader: "ignore-loader" },
                {
                    test: /\.md$/,
                    use: [
                        {
                            loader: "html-loader",
                        },
                        "markdown-loader",
                    ],
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "webpack-strip-block",
                            options: {
                                start: "typehints:start",
                                end: "typehints:end",
                            },
                        },
                        {
                            loader: path.resolve(__dirname, "mod.js"),
                        },
                    ],
                },
                {
                    test: /\.worker\.js$/,
                    use: {
                        loader: "worker-loader",
                        options: {
                            fallback: false,
                            inline: true,
                        },
                    },
                },
                {
                    test: /\.ya?ml$/,
                    type: "json", // Required by Webpack v4
                    use: "yaml-loader",
                },
            ],
        },
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "..", "build"),
        },
    };
};
