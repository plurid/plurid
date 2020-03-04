import React from 'react';

import {
    PluridRouterComponent,
} from '@plurid/plurid-data';

import view, {
    ViewType,
} from './view';



const components: PluridRouterComponent<ViewType>[] = [
    {
        view: view.index,
        component: () => (<div>index</div>),
    },
    {
        view: view.page,
        component: () => (<div>page</div>),
    },
];


export default components;
