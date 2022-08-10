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
export interface ShortcutsState {
    global: boolean;
}


const initialState: ShortcutsState = {
    global: true,
};


export const shortcuts = createSlice({
    name: 'shortcuts',
    initialState,
    reducers: {
        setGlobalShortcuts: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.global = action.payload;
        },
    },
});
// #endregion module



// #region exports
export const actions = shortcuts.actions;


export const getGlobal = (state: AppState) => state.shortcuts.global;

export const selectors = {
    getGlobal,
};


export const reducer = shortcuts.reducer;
// #endregion exports
