// #region module
/**
 * The window globals the server template emits and the client reads once: the engine metastate
 * (`PluridProvider metastate`) and, by convention, the app's own preloaded store state (a preserve
 * returns it in `globals`; the kit client hands it to the service `store` factory).
 */
export const PRELOADED_PLURID_METASTATE_KEY = '__PRELOADED_PLURID_METASTATE__';
export const PRELOADED_REDUX_STATE_KEY = '__PRELOADED_REDUX_STATE__';
// #endregion module
