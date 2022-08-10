// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';


    import {
        Theme,
        plurid,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
export interface ThemesState {
    general: Theme;
    interaction: Theme;
}


const initialState: ThemesState = {
    general: plurid,
    interaction: plurid,
};


export const themes = createSlice({
    name: 'themes',
    initialState,
    reducers: {
        setGeneralTheme: (
            state,
            action: PayloadAction<Theme>,
        ) => {
            state.general = action.payload;
        },
        setInteractionTheme: (
            state,
            action: PayloadAction<Theme>,
        ) => {
            state.interaction = action.payload;
        },
    },
});
// #endregion module



// #region exports
export const actions = themes.actions;


export const getGeneralTheme = (state: AppState) => state.themes.general;
export const getInteractionTheme = (state: AppState) => state.themes.general;

export const selectors = {
    getGeneralTheme,
    getInteractionTheme,
};


export const reducer = themes.reducer;
// #endregion exports
