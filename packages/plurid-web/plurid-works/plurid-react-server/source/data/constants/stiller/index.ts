// #region imports
    // #region external
    import {
        PluridStillerOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const defaultStillerOptions: PluridStillerOptions = {
    waitUntil: 'networkidle0',
    timeout: 30_000,
    ignore: [],
};
// #endregion module
