// #region imports
    // #region libraries
    import {
        createSlice,
        // PayloadAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
export interface GeneralState {
}


const initialState: GeneralState = {
};


export const general = createSlice({
    name: 'general',
    initialState,
    reducers: {
    },
});
// #endregion module



// #region exports
export const actions = general.actions;


export const getGeneral = (state: AppState) => state.general;

export const selectors = {
    getGeneral,
};


export const reducer = general.reducer;
// #endregion exports
