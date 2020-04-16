import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import {
    /** constants */
    PLURID_ROUTER_LOCATION_CHANGED,

    /** interfaces */
    PluridPlane,
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import PluridApplication from '../../../Application';

// import {
//     indexing,
// } from '@plurid/plurid-functions';



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
        gateway,
        api,
    } = properties;


    /** references */
    const pluridRouter = useRef(new Router(paths, {}));


    /** state */
    const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse>();
    const [Component, setComponent] = useState<any>();


    /** handlers */
    const handlePopState = () => {
        const path = window.location.pathname;
        const matchedRoute = pluridRouter.current.match(path);

        if (matchedRoute) {
            setMatchedRoute(matchedRoute);

            const {
                path,
            } = matchedRoute;

            const {
                exterior,
                spaces,
                slotted,
            } = path;

            let Exterior: React.FC<any> = () => (<></>);
            if (exterior) {
                switch (exterior.kind) {
                    case 'elementql':
                        break;
                    case 'react':
                        Exterior = exterior.element
                }
            }

            let Spaces: React.FC<any> = () => (<></>);
            const spacesArray: any[] = [];
            if (spaces) {
                for (const space of spaces) {
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

                        const App = (
                            <PluridApplication
                                key={Math.random() + ''}
                                planes={planes}
                                view={view}
                            />
                        );
                        spacesArray.push(App);
                    }
                }

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
            }
            console.log('spacesArray', spacesArray);

            const Component = (
                <>
                    {exterior && (
                        <Exterior
                            spaces={slotted ? spacesArray : undefined}
                        />
                    )}

                    {spaces && !slotted && (
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
    /** handlePopState */
    useEffect(() => {
        handlePopState();
    }, []);


    /** handle listeners */
    useEffect(() => {
        window.addEventListener('popstate', handlePopState);
        window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handlePopState);
        };
    }, []);


    /** render */
    if (!matchedRoute || !Component) {
        return (
            <></>
        );
    }

    return (
        <>
            {Component}
        </>
    );

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
