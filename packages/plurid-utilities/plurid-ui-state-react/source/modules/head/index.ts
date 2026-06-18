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
export interface HeadState {
    title: string;
    description: string;
    canonicalURL: string;
    ogTitle: string;
    ogImage: string;
    ogURL: string;
    ogDescription: string;
    styles: string[];
    scripts: string[];
}


export const initialState: HeadState = {
    title: '',
    description: '',
    ogTitle: '',
    ogImage: '',
    ogURL: '',
    ogDescription: '',
    canonicalURL: '',
    styles: [],
    scripts: [],
};

export const name = 'head' as const;


export const factory = (
    state: HeadState = initialState,
) => createSlice({
    name,
    initialState: state,
    reducers: {
        setHead: (
            state,
            action: PayloadAction<Partial<HeadState>>,
        ) => {
            state = {
                ...state,
                ...action,
            };
        },
    },
});

export const slice = factory();
// #endregion module



// #region exports
export const actions = slice.actions;


export const getHead = (
    state: StateWithSlice<typeof name, HeadState>,
): HeadState => state.head;

export const selectors = {
    getHead,
};


export const reducer = slice.reducer;
// #endregion exports
