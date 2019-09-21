module.exports = function (api) {
    api.cache(true);

    // const presets = [ ... ];
    const plugins = [
        [
            "babel-plugin-styled-components",
            {
                "displayName": false,
            },
        ],
    ];

    return {
        // presets,
        plugins
    };
}
