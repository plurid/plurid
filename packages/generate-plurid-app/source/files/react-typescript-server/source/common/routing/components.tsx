import React from 'react';

import {
    PluridRouterComponent,
} from '@plurid/plurid-data';

import view, {
    ViewType,
} from './view';

import Index from '../../client/App/containers/Index';
import Static from '../../client/App/containers/Static';
import NotFound from '../../client/App/containers/NotFound';



const components: PluridRouterComponent<ViewType>[] = [
    {
        view: view.index,
        component: Index,
    },
    {
        view: view.notFound,
        component: NotFound,
    },
    {
        view: view.static,
        component: Static,
    },
    {
        view: view.page,
        component: () => (<div style={{color: 'white', height: '400px'}}>page</div>),
    },
];


export default components;
