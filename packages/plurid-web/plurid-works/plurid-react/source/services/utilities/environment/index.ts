// #region module
// Read the build/runtime mode without assuming a Node `process` exists. As a published
// library, plurid-react runs in the browser (no `process`), under SSR (Node), and through
// bundlers that statically replace `process.env` — so guard the access and default to
// production (safest: no devtools, no dev-only store wiring).
const readEnvMode = (): string => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.ENV_MODE) {
            return process.env.ENV_MODE;
        }
    } catch (_) {
        // `process` not defined in this runtime (e.g. browser ESM) — fall through.
    }

    return 'production';
};

const ENV_MODE = readEnvMode();

const environment = {
    production: ENV_MODE === 'production',
    development: ENV_MODE === 'development',
    local: ENV_MODE === 'local',
    localExternal: ENV_MODE === 'localexternal',
};
// #endregion module



// #region exports
export default environment;
// #endregion exports
