// #region imports
    // #region external
    import environment from '~services/utilities/environment';
    // #endregion external


    // #region internal
    import storeProduction, {
        AppState as AppStateProduction,
    } from './store.production';
    import storeDevelopment, {
        AppState as AppStateDeveloment,
    } from './store.development';
    // #endregion internal
// #endregion imports



// #region module
export type AppState = AppStateProduction | AppStateDeveloment;


const store = environment.production
    ? storeProduction
    : storeDevelopment;
// #endregion module



// #region exports
export default store;
// #endregion exports
