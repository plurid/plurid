const MODE_ENV = process.env.MODE_ENV || '';

const environments: any = {
    production: 'production',
    development: 'development',
    local: 'local',
    localExternal: 'localExternal',
}

const environment = {
    production: environments[MODE_ENV] === 'production',
    development: environments[MODE_ENV] === 'development',
    local: environments[MODE_ENV] === 'local',
    localExternal: environments[MODE_ENV] === 'localexternal',
}

export default environment;
