import React from 'react';

import view, {
    ViewType,
} from './view';



interface RouteComponent<T> {
    view: T;
    component: React.FC<any>;
}


const components: RouteComponent<ViewType>[] = [
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
