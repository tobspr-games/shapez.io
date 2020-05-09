module.exports = function (api) {
    api.cache(true);
    const presets = [
        [
            "@babel/preset-env",
            {
                targets: "android >= 4.4.4",
                useBuiltIns: "usage",
                corejs: 3,
                loose: true,
                spec: false,
                modules: "auto",
                // debug: true
            },
        ],
    ];
    const plugins = [
        "closure-elimination",
        [
            "@babel/plugin-transform-classes",
            {
                loose: true,
            },
        ],
    ];
    return {
        presets,
        plugins,
        highlightCode: true,
        sourceType: "module",
        sourceMaps: false,
        parserOpts: {},
        only: ["../src/js"],
        generatorOpts: {
            retainLines: false,
            compact: true,
            minified: true,
            comments: true,
        },
    };
};
