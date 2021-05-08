// #region module
const environment = {
    production: process.env.ENV_MODE === 'production',
    development: process.env.ENV_MODE === 'development',
    local: process.env.ENV_MODE === 'local',
    localExternal: process.env.ENV_MODE === 'localexternal',
};
// #endregion module



// #region exports
export default environment;
// #endregion exports
