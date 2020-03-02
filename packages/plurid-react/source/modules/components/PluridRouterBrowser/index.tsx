import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

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

interface PluridRouterBrowserOwnProperties<T> {
    routes: router.Route<T>[];
    components: RouteComponent<T>[];
}

function PluridRouterBrowser<T>(
    properties: PluridRouterBrowserOwnProperties<T>,
) {
    /** properties */
    const {
        routes,
        components,
    } = properties;


    /** references */
    const indexedComponents = useRef(indexing.create(components, 'view'));
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
    }


    /** effects */
    useEffect(() => {
        if (pluridRouter.current && indexedComponents.current) {
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
        }
    }, []);


    useEffect(() => {
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
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
