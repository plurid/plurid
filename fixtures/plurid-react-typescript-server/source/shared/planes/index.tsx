// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRoutePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import GeneralPlane from '../kernel/planes/Index/Page';
    // #endregion external
// #endregion imports



// #region module
/**
 * General `plurid route plane`s which can be referenced by the `view` of any `route`.
 */
const pluridRoutePlanes: PluridRoutePlane[] = [
    {
        value: '/general-plane',
        component: {
            kind: 'react',
            element: GeneralPlane,
        },
    },
];
// #endregion module



// #region exports
export default pluridRoutePlanes;
// #endregion exports
