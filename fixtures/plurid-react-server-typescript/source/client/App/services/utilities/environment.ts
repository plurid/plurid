const environment = {
    local: process.env.REACT_APP_MODE_ENV === 'local',
    localExternal: process.env.REACT_APP_MODE_ENV === 'localExternal',
    development: process.env.REACT_APP_MODE_ENV === 'development',
    production: process.env.REACT_APP_MODE_ENV === 'production',
}


export default environment;
