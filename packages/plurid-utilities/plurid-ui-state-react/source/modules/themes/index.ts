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


    // #region external
    import {
        StateWithSlice,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface ThemesState {
    general: Theme;
    interaction: Theme;
}


export const initialState: ThemesState = {
    general: {
        ...plurid,
    },
    interaction: {
        ...plurid,
    },
};

export const name = 'themes' as const;


export interface SetThemePayload {
    type: 'general' | 'interaction';
    theme: Theme;
}


export const factory = (
    state: ThemesState = initialState,
) => createSlice({
    name,
    initialState: state,
    reducers: {
        setTheme: (
            state,
            action: PayloadAction<SetThemePayload>,
        ) => {
            const {
                type,
                theme,
            } = action.payload;

            state[type] = theme;
        },
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

export const slice = factory();
// #endregion module



// #region exports
export const actions = slice.actions;


const getGeneralTheme = (
    state: StateWithSlice<typeof name, ThemesState>,
) => state.themes.general;
const getInteractionTheme = (
    state: StateWithSlice<typeof name, ThemesState>,
) => state.themes.interaction;

export const selectors = {
    getGeneralTheme,
    getInteractionTheme,
};


export const reducer = slice.reducer;
// #endregion exports
