// #region imports
    // #region libraries
    import React from 'react';

    import {
        ComponentWithPlurid,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type PluridReactComponent<T = unknown> = React.FC<ComponentWithPlurid<T>>;
// #endregion module
