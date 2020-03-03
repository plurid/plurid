import React from 'react';

import {
    router,
} from '@plurid/plurid-engine';

import {
    indexing,
} from '@plurid/plurid-functions';



interface RouteComponent<T> {
    view: T;
    component: React.FC<any>;
}

interface PluridRouterStaticOwnProperties<T> {
    path: string;
    routes: router.Route<T>[];
    components: RouteComponent<T>[];
}

function PluridRouterStatic<T>(
    properties: PluridRouterStaticOwnProperties<T>,
) {
    /** properties */
    const {
        path,
        routes,
        components,
    } = properties;

    const indexedComponents = indexing.create(components, 'view');
    // console.log('indexedComponents', indexedComponents);
    const pluridRouter = new router.default(routes);

    const matchedRoute = pluridRouter.match(path);
    if (!matchedRoute) {
        return (
            <></>
        )
    }

    const view = matchedRoute.route.view;
    const routeComponent = indexedComponents[view as any];

    if (!routeComponent) {
        return (
            <></>
        )
    }

    history.pushState(null, '', path);


    /** render */
    const Component = routeComponent.component;
    return (
        <>
            {matchedRoute && Component && (
                <Component />
            )}
        </>
    );
}


export default PluridRouterStatic;
