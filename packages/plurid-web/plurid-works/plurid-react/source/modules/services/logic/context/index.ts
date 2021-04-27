// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridContext,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const Context = React.createContext<PluridContext<PluridReactComponent> | null>(null);
// #endregion module



// #region exports
export default Context;
// #endregion exports
