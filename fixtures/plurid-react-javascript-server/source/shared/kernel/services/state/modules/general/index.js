// #region imports
    // #region libraries
    import {
        createSlice,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import {
        getRandomFace,
    } from '../../../../planes/NotFound/logic';
    // #endregion external
// #endregion imports



// #region module
const initialState = {
    notFoundFace: getRandomFace(),
};


export const general = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setGeneralField: (
            state,
            action,
        ) => {
            const {
                field,
                value,
            } = action.payload;

            state[field] = value;
        },
    },
});
// #endregion module



// #region exports
export const actions = general.actions;


export const getGeneral = (state) => state.general;
export const getNotFoundFace = (state) => state.general.notFoundFace;

export const selectors = {
    getGeneral,
    getNotFoundFace,
};


export const reducer = general.reducer;
// #endregion exports
