// #region imports
    // #region external
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export const SET_STATE = 'SET_STATE';
export interface SetStateAction {
    type: typeof SET_STATE;
    payload: AppState;
}
// #endregion module
