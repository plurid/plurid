// #region module
export const DEFAULT_SERVER_PORT = process.env.PORT
    ? parseInt(process.env.PORT)
    : 8080;


export const DEFAULT_SERVER_OPTIONS_SERVER_NAME = 'Plurid Routes Server';
export const DEFAULT_SERVER_OPTIONS_QUIET = false;

export const DEFAULT_SERVER_OPTIONS = {
    SERVER_NAME: DEFAULT_SERVER_OPTIONS_SERVER_NAME,
    QUIET: DEFAULT_SERVER_OPTIONS_QUIET,
};


export const ENDPOINT_ROUTE = process.env.PLURID_ENDPOINT_ROUTE || '/route';
export const ENDPOINT_REGISTER = process.env.PLURID_ENDPOINT_REGISTER || '/register';


export const ONE_DAY = 60 * 60 * 24;


export const environment = {
    production: process.env.ENV_MODE === 'production',
    development: process.env.ENV_MODE === 'development',
};
// #endregion module
