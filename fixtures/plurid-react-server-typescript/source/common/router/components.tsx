import React from 'react';



interface RouteComponent<T> {
    view: T;
    component: React.FC<any>;
}


const components: RouteComponent<any>[] = [
    {
        view: 'one',
        component: () => (<div>one</div>),
    },
];


export default components;
