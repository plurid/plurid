module.exports = function (api) {
    api.cache(true);

    const plugins = [
        [
            "babel-plugin-styled-components",
            {
                "displayName": false,
            },
        ],
    ];

    return {
        plugins
    };
}
