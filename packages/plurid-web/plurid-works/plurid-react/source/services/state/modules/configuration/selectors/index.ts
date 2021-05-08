// #region imports
    // #region external
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



const getConfiguration = (state: AppState) => state.configuration;


export default {
    getConfiguration,
};
