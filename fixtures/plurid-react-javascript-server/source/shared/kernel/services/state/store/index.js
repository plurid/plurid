// #region imports
    // #region external
    import environment from '~kernel-services/utilities/environment';
    // #endregion external


    // #region internal
    import storeProduction from './production';
    import storeDevelopment from './development';
    // #endregion internal
// #endregion imports



// #region module
const store = environment.production
    ? storeProduction
    : storeDevelopment;
// #endregion module



// #region exports
export default store;
// #endregion exports
