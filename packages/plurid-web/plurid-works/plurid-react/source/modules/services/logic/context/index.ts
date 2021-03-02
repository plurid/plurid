// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridContext,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const Context = React.createContext<PluridContext | null>(null);
// #endregion module



// #region exports
export default Context;
// #endregion exports
