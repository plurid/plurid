// #region imports
    // #region libraries
    import {
        themes,
    } from '@plurid/plurid-ui-state-react';
    // #endregion libraries
// #endregion imports



// #region module
const slice = themes.factory();
// #endregion module



// #region exports
export const {
    actions,
    reducer,
} = slice;

export const {
    selectors,
} = themes;
// #endregion exports
