// #region imports
    // #region external
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
const getGlobal = (state: AppState): boolean => state.shortcuts.global;
// #endregion module



// #region exports
export default {
    getGlobal,
};
// #endregion exports
