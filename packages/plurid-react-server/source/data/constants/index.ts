export const DEFAULT_SERVER_PORT = process.env.PORT
    ? parseInt(process.env.PORT)
    : 8080;


export const DEFAULT_SERVER_OPTIONS_QUIET = false;
export const DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY = 'build';
export const DEFAULT_SERVER_OPTIONS_STILLS_DIRECTORY = 'stills';

export const DEFAULT_SERVER_OPTIONS = {
    QUIET: DEFAULT_SERVER_OPTIONS_QUIET,
    BUILD_DIRECTORY: DEFAULT_SERVER_OPTIONS_BUILD_DIRECTORY,
    STILLS_DIRECTORY: DEFAULT_SERVER_OPTIONS_STILLS_DIRECTORY,
};


export const DEFAULT_RENDERER_REDUX_STATE = '{}';
export const DEFAULT_RENDERER_PLURID_STATE = '{}';
export const DEFAULT_RENDERER_SCRIPT = '/index.js';
export const DEFAULT__PRELOADED_REDUX_STATE__ = '__PRELOADED_REDUX_STATE__';
export const DEFAULT__PRELOADED_PLURID_STATE__ = '__PRELOADED_PLURID_STATE__';

export const DEFAULT_WINDOW_SIZER_SCRIPT = `
/** PLURID WINDOW SIZER */
const pluridRoots = document.querySelectorAll('[data-plurid-entity="PluridRoots"]');
pluridRoots.forEach(pluridRoot => {
    pluridRoot.style.width = window.innerWidth + 'px';
    pluridRoot.style.height = window.innerHeight + 'px';
});
`;


export const NOT_FOUND_ROUTE = '/not-found';



export const environment = {
    production: process.env.ENV_MODE === 'production',
    development: process.env.ENV_MODE === 'development',
};
