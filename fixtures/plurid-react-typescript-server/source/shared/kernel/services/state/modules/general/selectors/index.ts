// #region imports
    // #region external
    import {
        AppState,
    } from '../../../store';
    // #endregion external
// #endregion imports



// #region module
const getNotFoundFace = (state: AppState) => state.general.notFoundFace;



const selectors = {
    getNotFoundFace,
};
// #endregion module



// #region exports
export default selectors;
// #endregion exports
