const environment = {
    production: process.env.MODE_ENV === 'production',
    development: process.env.MODE_ENV === 'development',
    local: process.env.MODE_ENV === 'local',
    localExternal: process.env.MODE_ENV === 'localexternal',
}

export default environment;
