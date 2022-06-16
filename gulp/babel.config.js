module.exports = function (api) {
    api.cache(true);
    const presets = [
        [
            "@babel/preset-env",
            {
                // targets: ">0.01%",
                targets: {
                    edge: 10,
                    firefox: 37,
                    chrome: 24,
                    safari: 10,
                    ie: 10,
                },
                useBuiltIns: "usage",
                corejs: 3,
                loose: true,
                spec: false,
                modules: "auto",
            },
        ],
    ];
    const plugins = [
        "@babel/plugin-transform-arrow-functions",
        "closure-elimination",
        // var is faster than let and const!
        // [
        //     "@babel/plugin-transform-block-scoping",
        //     {
        //         throwIfClosureRequired: true,
        //     },
        // ],
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
        sourceType: "unambiguous",
        sourceMaps: false,
        parserOpts: {},
        exclude: /(core-js|babel-core|babel-runtime)/,
        generatorOpts: {
            retainLines: false,
            compact: true,
            minified: true,
            comments: true,
        },
    };
};
