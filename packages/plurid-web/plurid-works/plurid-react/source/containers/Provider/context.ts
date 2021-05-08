// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridMetastate,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const PluridContext = React.createContext<PluridMetastate | undefined>(undefined);
// #endregion module



// #region exports
export default PluridContext;
// #endregion exports
