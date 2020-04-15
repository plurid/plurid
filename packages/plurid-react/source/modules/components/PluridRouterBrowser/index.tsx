import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import {
    PLURID_ROUTER_LOCATION_CHANGED,

    PluridRouterRouting,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    indexing,
} from '@plurid/plurid-functions';



interface PluridRouterBrowserOwnProperties<T> {
    routing: PluridRouterRouting<T>;

    /**
     * The gateway path is used to receive external routing requests.
     * e.g. https://example.com/gateway?plurid=https://subdomain.example.com://path/to/123://s://u://c://a-plane
     * will route to that specific host://route://space://universe://cluster://plane
     */
    gateway?: string;

    /**
     * API endpoint to request the elements for the paths not found in the initial routing.
     */
    api?: string;
    children?: any;
}

function PluridRouterBrowser<T>(
    properties: PluridRouterBrowserOwnProperties<T>,
) {
    /** properties */
    const {
        routing,
    } = properties;

    const {
        routes,
        components,
    } = routing;


    /** references */
    const indexedComponents = useRef(indexing.create(components, 'object', 'view'));
    const pluridRouter = useRef(new router.default(routes));


    /** state */
    const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse<T>>();
    const [Component, setComponent] = useState<any>();


    /** handlers */
    const handlePopState = () => {
        const path = window.location.pathname;
        const matchedRoute = pluridRouter.current.match(path);

        if (matchedRoute) {
            setMatchedRoute(matchedRoute);

            const view = matchedRoute.route.view;
            const routeComponent = indexedComponents.current[view as any];

            if (routeComponent) {
                setComponent(routeComponent.component);
            }
        }

        if (!matchedRoute) {
            const notFoundMatchedRoute = pluridRouter.current.match('/not-found');
            if (notFoundMatchedRoute) {
                setMatchedRoute(notFoundMatchedRoute);

                const view = notFoundMatchedRoute.route.view;
                const routeComponent = indexedComponents.current[view as any];

                if (routeComponent) {
                    history.pushState(null, '', '/not-found');
                    setComponent(routeComponent.component);
                }
            }
        }
    }


    /** effects */
    useEffect(() => {
        handlePopState();
    }, []);


    useEffect(() => {
        window.addEventListener('popstate', handlePopState);
        window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);
        };
    }, []);


    /** render */
    return (
        <>
            {matchedRoute && Component && (
                <>
                    {Component}
                </>
            )}
        </>
    );
}


export default PluridRouterBrowser;
