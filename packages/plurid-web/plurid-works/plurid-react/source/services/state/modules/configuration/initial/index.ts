// #region imports
    // #region libraries
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
const initialState: Types.State = {
    ...defaultConfiguration,
};
// #endregion module



// #region exports
export default initialState;
// #endregion exports
