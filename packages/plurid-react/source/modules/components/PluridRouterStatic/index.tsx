import React from 'react';

import {
    PluridRouterRouting,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    indexing,
} from '@plurid/plurid-functions';



const PluridRouter = router.default;


interface PluridRouterStaticOwnProperties<T> {
    path: string;
    routing: PluridRouterRouting<T>;
    children: React.ReactChildren;
}

function PluridRouterStatic<T>(
    properties: PluridRouterStaticOwnProperties<T>,
) {
    /** properties */
    const {
        path,
        routing,
    } = properties;

    const {
        routes,
        components,
    } = routing;

    const indexedComponents = indexing.create(components, 'view');
    const pluridRouter = new PluridRouter(routes);

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
