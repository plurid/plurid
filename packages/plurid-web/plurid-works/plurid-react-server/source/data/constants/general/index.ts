// #region module
export const DEFAULT_SERVER_PORT = process.env.PORT
    ? parseInt(process.env.PORT)
    : 8080;


export const DEFAULT_SERVER_OPTIONS_SERVER_NAME = 'Plurid Server';
export const DEFAULT_SERVER_OPTIONS_QUIET = false;
export const DEFAULT_SERVER_OPTIONS_COMPRESSION = true;
export const DEFAULT_SERVER_OPTIONS_OPEN = false;
export const DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY = 'build';
export const DEFAULT_SERVER_OPTIONS_STILLS_DIRECTORY = 'stills';
export const DEFAULT_SERVER_OPTIONS_GATEWAY = '/gateway';

export const DEFAULT_SERVER_OPTIONS = {
    SERVER_NAME: DEFAULT_SERVER_OPTIONS_SERVER_NAME,
    QUIET: DEFAULT_SERVER_OPTIONS_QUIET,
    COMPRESSION: DEFAULT_SERVER_OPTIONS_COMPRESSION,
    OPEN: DEFAULT_SERVER_OPTIONS_OPEN,
    BUILD_DIRECTORY: DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY,
    STILLS_DIRECTORY: DEFAULT_SERVER_OPTIONS_STILLS_DIRECTORY,
    GATEWAY: DEFAULT_SERVER_OPTIONS_GATEWAY,
};


export const DEFAULT_RENDERER_REDUX_STATE = '{}';
export const DEFAULT_RENDERER_PLURID_STATE = '{}';
export const DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE = '/vendor.js';
export const DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE = '/index.js';
export const DEFAULT__PRELOADED_REDUX_STATE__ = '__PRELOADED_REDUX_STATE__';
export const DEFAULT__PRELOADED_PLURID_METASTATE__ = '__PRELOADED_PLURID_METASTATE__';


export const NOT_FOUND_ROUTE = '/not-found';

export const CATCH_ALL_PATH = '*';
export const PTTP_PATH = '/pttp';



export const environment = {
    production: process.env.ENV_MODE === 'production',
    development: process.env.ENV_MODE === 'development',
};
// #endregion module
