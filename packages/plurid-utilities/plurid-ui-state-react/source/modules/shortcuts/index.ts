// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import {
        StateWithSlice,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface ShortcutsState {
    global: boolean;
}


export const initialState: ShortcutsState = {
    global: true,
};

export const name = 'shortcuts' as const;


export const factory = (
    state: ShortcutsState = initialState,
) => createSlice({
    name,
    initialState: state,
    reducers: {
        setGlobalShortcuts: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.global = action.payload;
        },
        toggleGlobalShortcuts: (
            state,
            _action: PayloadAction<void>,
        ) => {
            state.global = !state.global;
        },
    },
});

export const slice = factory();
// #endregion module



// #region exports
export const actions = slice.actions;


const getGlobal = (
    state: StateWithSlice<typeof name, ShortcutsState>,
) => state.shortcuts.global;

export const selectors = {
    getGlobal,
};


export const reducer = slice.reducer;
// #endregion exports
