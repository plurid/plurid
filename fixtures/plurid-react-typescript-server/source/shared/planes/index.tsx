// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridReactRoutePlane,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import GeneralPlane from '../kernel/planes/Index/Page';
    // #endregion external
// #endregion imports



// #region module
/**
 * General `plurid route plane`s which can be referenced by the `view` of any `route`.
 */
const pluridRoutePlanes: PluridReactRoutePlane[] = [
    {
        value: '/general-plane',
        component: GeneralPlane,
    },
    [
        '/tuple',
        () => (<div>tuple</div>),
    ],
    [
        '/elementql-plane',
        {
            name: 'AppElementQL',
            url: 'http://localhost:21100/elementql',
        },
    ],
];
// #endregion module



// #region exports
export default pluridRoutePlanes;
// #endregion exports
