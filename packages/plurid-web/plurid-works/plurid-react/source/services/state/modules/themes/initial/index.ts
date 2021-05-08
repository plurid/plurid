// #region imports
    // #region libraries
    import {
        plurid,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
const initialState: Types.State = {
    general: plurid,
    interaction: plurid,
};
// #endregion module



// #region exports
export default initialState;
// #endregion exports
