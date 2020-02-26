export const DEFAULT_SERVER_PORT = process.env.PORT
    ? parseInt(process.env.PORT)
    : 8080;


export const DEFAULT_SERVER_OPTIONS_QUIET = false;
export const DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY = 'build';

export const DEFAULT_SERVER_OPTIONS = {
    QUIET: DEFAULT_SERVER_OPTIONS_QUIET,
    BUILD_DIRECTORY: DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY,
};


export const DEFAULT_RENDERER_STORE = '{}';
export const DEFAULT_RENDERER_SCRIPT = '/index.js';
