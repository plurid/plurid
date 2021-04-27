// #region imports
    // #region libraries
    import React from 'react';

    import {
        ComponentWithPlurid,
        PluridPlane,
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type PluridReactComponent<T = unknown> = React.FC<ComponentWithPlurid<T>>;

export type PluridReactPlane = PluridPlane<PluridReactComponent>;
export type PluridReactRoute = PluridRoute<PluridReactComponent>;
// #endregion module
