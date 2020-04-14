const ENV_MODE = process.env.ENV_MODE || '';

const environments = {
    production: 'production',
    development: 'development',
    local: 'local',
    localExternal: 'localExternal',
}

const environment = {
    production: environments[ENV_MODE] == 'production' ? true : false,
    development: environments[ENV_MODE] == 'development' ? true : false,
    local: environments[ENV_MODE] == 'local' ? true : false,
    localExternal: environments[ENV_MODE] == 'localexternal' ? true : false,
}

export default environment;
