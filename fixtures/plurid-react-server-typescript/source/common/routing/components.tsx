import React from 'react';

import {
    PluridRouterComponent,
} from '@plurid/plurid-data';

import view, {
    ViewType,
} from './view';

import Index from '../../client/App/containers/Index';
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
        view: view.page,
        component: () => (<div>page</div>),
    },
];


export default components;
