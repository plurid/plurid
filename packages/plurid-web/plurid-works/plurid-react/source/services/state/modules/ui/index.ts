// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
export interface UIState {
    toolbarScrollPosition: number;
}


const initialState: UIState = {
    toolbarScrollPosition: 0,
};


export const ui = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setUIToolbarScrollPosition: (
            state,
            action: PayloadAction<number>,
        ) => {
            state.toolbarScrollPosition = action.payload;
        },
    },
});
// #endregion module



// #region exports
export const actions = ui.actions;


export const getToolbarScrollPosition = (state: AppState) => state.ui.toolbarScrollPosition;

export const selectors = {
    getToolbarScrollPosition,
};


export const reducer = ui.reducer;
// #endregion exports
