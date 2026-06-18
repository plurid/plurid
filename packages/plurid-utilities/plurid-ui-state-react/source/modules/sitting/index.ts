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
export interface SittingState {
    currentLink: string;
    tray: boolean;
}


export const initialState: SittingState = {
    currentLink: '',
    tray: false,
};

export const name = 'sitting' as const;


export const factory = (
    state: SittingState = initialState,
) => createSlice({
    name,
    initialState: state,
    reducers: {
        setSittingCurrentLink: (
            state,
            action: PayloadAction<string>,
        ) => {
            const currentLink = action.payload;

            return {
                ...state,
                currentLink,
            };
        },
        setSittingTray: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.tray = action.payload;
        },
        toggleSittingTray: (
            state,
            _action: PayloadAction<void>,
        ) => {
            state.tray = !state.tray;
        }
    },
});

export const slice = factory();
// #endregion module



// #region exports
export const actions = slice.actions;


const getCurrentLink = (
    state: StateWithSlice<typeof name, SittingState>,
) => state.sitting.currentLink;
const getTray = (
    state: StateWithSlice<typeof name, SittingState>,
) => state.sitting.tray;

export const selectors = {
    getCurrentLink,
    getTray,
};


export const reducer = slice.reducer;
// #endregion exports
