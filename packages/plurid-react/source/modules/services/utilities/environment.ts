const MODE_ENV = process.env.MODE_ENV || '';

const environments = {
    production: 'production',
    development: 'development',
    local: 'local',
    localExternal: 'localExternal',
}

const environment = {
    production: environments[MODE_ENV] == 'production' ? true : false,
    development: environments[MODE_ENV] == 'development' ? true : false,
    local: environments[MODE_ENV] == 'local' ? true : false,
    localExternal: environments[MODE_ENV] == 'localexternal' ? true : false,
}

export default environment;
