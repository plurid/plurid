import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import {
    PLURID_ROUTER_LOCATION_CHANGED,

    // PluridRouterRouting,
    // PluridRouting,
    PluridPlane,
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import PluridApplication from '../../../Application';

import {
    indexing,
} from '@plurid/plurid-functions';



const Router = router.default;


interface PluridRouterBrowserOwnProperties {
    paths: PluridRouterPath[];

    /**
     * Development default: 'http'.
     * Production default: 'https'.
     */
    protocol?: string;

    /**
     * Development default: 'localhost'.
     * Production default: window.location.host.
     */
    host?: string;

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
}

const PluridRouterBrowser = (
    properties: PluridRouterBrowserOwnProperties,
) => {
    /** properties */
    const {
        paths,
    } = properties;


    /** references */
    const pluridRouter = useRef(new Router(paths));


    /** state */
    const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse>();
    const [Component, setComponent] = useState<any>();


    /** handlers */
    const handlePopState = () => {
        const path = window.location.pathname;
        const matchedRoute = pluridRouter.current.match(path);

        console.log(matchedRoute);

        if (matchedRoute) {
            setMatchedRoute(matchedRoute);

            const {
                path,
            } = matchedRoute;

            const {
                exterior,
                spaces,
                slottedSpaces,
            } = path;

            let Exterior: React.FC<any> = () => (<></>);
            if (exterior) {
                switch (exterior.kind) {
                    case 'elementql':
                        break;
                    case 'react':
                        Exterior = exterior.element
                        // setComponent(exterior.element);
                }
                return;
            }

            let Spaces: React.FC<any> = () => (<></>);
            if (spaces) {
                Spaces = () => (
                    <>
                        {spaces.map(space => {
                            const planes: PluridPlane[] = [];
                            const view = [];
                            for (const universe of space.universes) {
                                for (const cluster of universe.clusters) {
                                    for (const plane of cluster.planes) {
                                        const {
                                            component,
                                            value,
                                        } = plane;

                                        if (component.kind === 'react') {
                                            const pluridPlane: PluridPlane = {
                                                component: {
                                                    element: component.element,
                                                },
                                                path: value,
                                            };

                                            planes.push(pluridPlane);
                                            view.push(value);
                                        }
                                    }
                                }
                            }

                            return (
                                <PluridApplication
                                    key={Math.random() + ''}
                                    planes={planes}
                                    view={view}
                                />
                            );
                        })}
                    </>
                );
                // setComponent(Component);
            }

            const Component = (
                <>
                    {Exterior && (
                        <Exterior
                            spaces={slottedSpaces ? Spaces : undefined}
                        />
                    )}

                    {Spaces && !slottedSpaces && (
                        <Spaces />
                    )}
                </>
            );

            setComponent(Component);

        //     const view = matchedRoute.route.view;
        //     const routeComponent = indexedComponents.current[view as any];

        //     if (routeComponent) {
        //         setComponent(routeComponent.component);
        //     }
        }

        // if (!matchedRoute) {
        //     const notFoundMatchedRoute = pluridRouter.current.match('/not-found');
        //     if (notFoundMatchedRoute) {
        //         setMatchedRoute(notFoundMatchedRoute);

        //         const view = notFoundMatchedRoute.route.view;
        //         const routeComponent = indexedComponents.current[view as any];

        //         if (routeComponent) {
        //             history.pushState(null, '', '/not-found');
        //             setComponent(routeComponent.component);
        //         }
        //     }
        // }
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




    // const {
    //     routing,
    // } = properties;

    // const {
    //     hosts,
    // } = routing;

    // for (const host of hosts) {
    //     const {
    //         hostname,
    //         paths,
    //         protocol,
    //     } = host;
    // }

    // console.log(routing);

    // return (
    //     <div>
    //         router
    //     </div>
    // );

    // const {
    //     routes,
    //     components,
    // } = routing;


    // /** references */
    // const indexedComponents = useRef(indexing.create(components, 'object', 'view'));
    // const pluridRouter = useRef(new router.default(routes));


    // /** state */
    // const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse<T>>();
    // const [Component, setComponent] = useState<any>();


    // /** handlers */
    // const handlePopState = () => {
    //     const path = window.location.pathname;
    //     const matchedRoute = pluridRouter.current.match(path);

    //     if (matchedRoute) {
    //         setMatchedRoute(matchedRoute);

    //         const view = matchedRoute.route.view;
    //         const routeComponent = indexedComponents.current[view as any];

    //         if (routeComponent) {
    //             setComponent(routeComponent.component);
    //         }
    //     }

    //     if (!matchedRoute) {
    //         const notFoundMatchedRoute = pluridRouter.current.match('/not-found');
    //         if (notFoundMatchedRoute) {
    //             setMatchedRoute(notFoundMatchedRoute);

    //             const view = notFoundMatchedRoute.route.view;
    //             const routeComponent = indexedComponents.current[view as any];

    //             if (routeComponent) {
    //                 history.pushState(null, '', '/not-found');
    //                 setComponent(routeComponent.component);
    //             }
    //         }
    //     }
    // }


    // /** effects */
    // useEffect(() => {
    //     handlePopState();
    // }, []);


    // useEffect(() => {
    //     window.addEventListener('popstate', handlePopState);
    //     window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);

    //     return () => {
    //         window.removeEventListener('popstate', handlePopState);
    //         window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);
    //     };
    // }, []);


    // /** render */
    // return (
    //     <>
    //         {matchedRoute && Component && (
    //             <>
    //                 {Component}
    //             </>
    //         )}
    //     </>
    // );
}


export default PluridRouterBrowser;
