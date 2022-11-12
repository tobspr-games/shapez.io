// @ts-nocheck

const path = require("path");
const webpack = require("webpack");
const { getRevision, getVersion, getAllResourceImages } = require("./buildutils");

const TerserPlugin = require("terser-webpack-plugin");
const StringReplacePlugin = require("string-replace-webpack-plugin");
const UnusedFilesPlugin = require("unused-files-webpack-plugin").UnusedFilesWebpackPlugin;

module.exports = ({
    environment,
    es6 = false,

    standalone = false,
    isBrowser = true,
}) => {
    const globalDefs = {
        assert: "false && window.assert",
        assertAlways: "window.assert",
        abstract: "window.assert(false, 'abstract method called');",
        G_IS_DEV: "false",

        G_IS_RELEASE: environment === "prod" ? "true" : "false",
        G_IS_STANDALONE: standalone ? "true" : "false",
        G_IS_BROWSER: isBrowser ? "true" : "false",
        G_APP_ENVIRONMENT: JSON.stringify(environment),
        G_HAVE_ASSERT: "false",
        G_BUILD_TIME: "" + new Date().getTime(),
        G_BUILD_COMMIT_HASH: JSON.stringify(getRevision()),
        G_BUILD_VERSION: JSON.stringify(getVersion()),
        G_ALL_UI_IMAGES: JSON.stringify(getAllResourceImages()),
    };

    const minifyNames = false;

    return {
        mode: "production",
        entry: {
            "bundle.js": [path.resolve(__dirname, "..", "src", "js", "main.js")],
        },
        node: {
            fs: "empty",
        },
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "..", "build"),
        },
        context: path.resolve(__dirname, ".."),
        stats: {
            // Examine all modules
            maxModules: Infinity,
            // Display bailout reasons
            optimizationBailout: true,
        },
        devtool: false,
        resolve: {
            alias: {
                "global-compression": path.resolve(__dirname, "..", "src", "js", "core", "lzstring.js"),
            },
        },
        optimization: {
            minimize: true,
            // namedModules: true,

            noEmitOnErrors: true,
            removeAvailableModules: true,
            removeEmptyChunks: true,
            mergeDuplicateChunks: true,
            flagIncludedChunks: true,
            occurrenceOrder: true,
            providedExports: true,
            usedExports: true,
            concatenateModules: true,
            sideEffects: true,

            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    sourceMap: false,
                    cache: false,
                    terserOptions: {
                        ecma: es6 ? 6 : 5,
                        parse: {},
                        module: true,
                        toplevel: true,
                        keep_classnames: !minifyNames,
                        keep_fnames: !minifyNames,
                        keep_fargs: !minifyNames,
                        safari10: true,
                        compress: {
                            arguments: false, // breaks
                            drop_console: false,
                            global_defs: globalDefs,
                            keep_fargs: !minifyNames,
                            keep_infinity: true,
                            passes: 2,
                            module: true,
                            pure_funcs: [
                                "Math.radians",
                                "Math.degrees",
                                "Math.round",
                                "Math.ceil",
                                "Math.floor",
                                "Math.sqrt",
                                "Math.hypot",
                                "Math.abs",
                                "Math.max",
                                "Math.min",
                                "Math.sin",
                                "Math.cos",
                                "Math.tan",
                                "Math.sign",
                                "Math.pow",
                                "Math.atan2",
                            ],
                            toplevel: true,
                            unsafe_math: true,
                            unsafe_arrows: false,
                            warnings: true,
                        },
                        mangle: {
                            reserved: ["__$S__"],
                            eval: true,
                            keep_classnames: !minifyNames,
                            keep_fnames: !minifyNames,
                            module: true,
                            toplevel: true,
                            safari10: true,
                        },
                        output: {
                            comments: false,
                            ascii_only: true,
                            beautify: false,
                            braces: false,
                            ecma: es6 ? 6 : 5,
                            preamble:
                                "/* shapez.io Codebase - Copyright 2022 tobspr Games - " +
                                getVersion() +
                                " @ " +
                                getRevision() +
                                " */",
                        },
                    },
                }),
            ],
        },
        performance: {
            maxEntrypointSize: 5120000,
            maxAssetSize: 5120000,
        },
        plugins: [
            new webpack.DefinePlugin(globalDefs),

            new UnusedFilesPlugin({
                failOnUnused: false,
                cwd: path.join(__dirname, "..", "src", "js"),
                patterns: ["../src/js/**/*.js"],
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
                            loader: "webpack-strip-block",
                            options: {
                                start: "dev:start",
                                end: "dev:end",
                            },
                        },
                        {
                            loader: "webpack-strip-block",
                            options: {
                                start: "wires:start",
                                end: "wires:end",
                            },
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    use: [
                        // "thread-loader",
                        {
                            loader: path.resolve(__dirname, "mod.js"),
                        },
                        {
                            loader: "babel-loader?cacheDirectory",
                            options: {
                                configFile: require.resolve(
                                    es6 ? "./babel-es6.config.js" : "./babel.config.js"
                                ),
                            },
                        },
                        "uglify-template-string-loader", // Finally found this plugin
                        StringReplacePlugin.replace({
                            replacements: [
                                { pattern: /globalConfig\.tileSize/g, replacement: () => "32" },
                                { pattern: /globalConfig\.halfTileSize/g, replacement: () => "16" },
                                {
                                    pattern: /globalConfig\.beltSpeedItemsPerSecond/g,
                                    replacement: () => "2.0",
                                },
                                { pattern: /globalConfig\.debug/g, replacement: () => "''" },
                            ],
                        }),
                    ],
                },
                {
                    test: /\.worker\.js$/,
                    use: [
                        {
                            loader: "worker-loader",
                            options: {
                                fallback: false,
                                inline: true,
                            },
                        },
                        {
                            loader: "babel-loader?cacheDirectory",
                            options: {
                                configFile: require.resolve(
                                    es6 ? "./babel-es6.config.js" : "./babel.config.js"
                                ),
                            },
                        },
                    ],
                },
                {
                    test: /\.md$/,
                    use: ["html-loader", "markdown-loader"],
                },
                {
                    test: /\.ya?ml$/,
                    type: "json", // Required by Webpack v4
                    use: "yaml-loader",
                },
            ],
        },
    };
};
