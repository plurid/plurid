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



export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('__PLURID_ROUTER__');
        if (serializedState === null) {
            return undefined;
        }

        return JSON.parse(serializedState);
    } catch (error) {
        return undefined;
    }
};


export const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('__PLURID_ROUTER__', serializedState);
    } catch (error) {
    }
};


const findPathByDivisions = (
    paths: any[],
    queryData: any,
) => {
    const pathDivisions = router.pluridLinkPathDivider(queryData);

    for (const path of paths) {
        if (
            path.value === pathDivisions.path.value
            || (path.value === '/' && pathDivisions.path.value === 'p')
        ) {
            console.log('path', path);
            if (path.spaces) {
                for (const space of path.spaces) {
                    if (
                        space.value === pathDivisions.space.value
                        || (space.value === 'default' && pathDivisions.space.value === 's')
                    ) {
                        console.log('space', space);
                        if (space.universes) {
                            for (const universe of space.universes) {
                                if (
                                    universe.value === pathDivisions.universe.value
                                    || (universe.value === 'default' && pathDivisions.universe.value === 'u')
                                ) {
                                    console.log('universe', universe);
                                    if (universe.clusters) {
                                        for (const cluster of universe.clusters) {
                                            if (
                                                cluster.value === pathDivisions.cluster.value
                                                || (cluster.value === 'default' && pathDivisions.cluster.value === 'c')
                                            ) {
                                                console.log('cluster', cluster);
                                                if (cluster.planes) {
                                                    for (const plane of cluster.planes) {
                                                        console.log('plane', plane);
                                                        if (plane.value === pathDivisions.plane.value) {
                                                            return {
                                                                path,
                                                                pathname: path.value,
                                                                parameters: {},
                                                                query: {},
                                                                fragments: {
                                                                    texts: [],
                                                                    elements: [],
                                                                },
                                                            };
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return;
}




const Router = router.default;


interface PluridRouterBrowserOwnProperties {
    paths: PluridRouterPath[];

    /**
     * Path to navigate to when using clean navigation.
     */
    view?: string;

    /**
     * Navigate without changing the browser URL.
     */
    cleanNavigation?: boolean;

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
        view,
        cleanNavigation,
        gateway,
        protocol: protocolProperty,
        api,
    } = properties;


    /** references */
    const pluridRouter = useRef(new Router(
        paths,
        {
            gateway,
        },
    ));

    const protocol = protocolProperty || 'http';


    /** state */
    const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse>();
    const [Component, setComponent] = useState<any>();


    /** handlers */
    const handleMatchedRoute = (
        matchedRoute: router.MatcherResponse,
    ) => {
        setMatchedRoute(matchedRoute);

        if (!cleanNavigation) {
            history.pushState(null, '', matchedRoute.path.value);
        }

        saveState(matchedRoute.path.value);

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
        return;
    }

    const handleNoMatch = () => {
        // const notFoundMatchedRoute = pluridRouter.current.match('/not-found');
        // if (notFoundMatchedRoute) {
        //     setMatchedRoute(notFoundMatchedRoute);

        //     const view = notFoundMatchedRoute.route.view;
        //     const routeComponent = indexedComponents.current[view as any];

        //     if (routeComponent) {
        //         history.pushState(null, '', '/not-found');
        //         setComponent(routeComponent.component);
        //     }
        // }
    }

    const handleGateway = () => {
        console.log('HANDLE GATEWAY');
        console.log('window.location', window.location);

        const query = router.extractQuery(window.location.search);

        const gatewayView: string[] = [];

        if (query.plurid) {
            gatewayView.push(query.plurid);
            // const path = findPathByDivisions(
            //     paths,
            //     query.plurid,
            // );

            // if (path) {
            //     pathsFound.push(path);
            // }

            // console.log('GATEWAY');
            // console.log('query', query);
            // console.log('paths', paths);
        }

        if (query.plurids) {
            const gatewayViews = query.plurids.split(',');
            gatewayView.push(...gatewayViews);


            // for (const plurid of split) {
            //     const path = findPathByDivisions(
            //         paths,
            //         plurid,
            //     );
            //     if (path) {
            //         pathsFound.push(path);
            //     }
            // }

            // console.log('GATEWAY');
            // console.log('query', query);
            // console.log('paths', paths);
            // console.log('paths', paths);
        }

        console.log('gatewayView', gatewayView);
        console.log('paths', paths);

        const planes: PluridPlane[] = [];
        const view: any[] = [];

        for (const path of paths) {
            if (!path.spaces) {
                continue;
            }

            const pathName = path.value === '/'
                ? 'p'
                : path.value;

            for (const space of path.spaces) {
                const spaceName = space.value === 'default'
                    ? 's'
                    : space.value;

                for (const universe of space.universes) {
                    const universeName = universe.value === 'default'
                        ? 'u'
                        : universe.value;

                    for (const cluster of universe.clusters) {
                        const clusterName = cluster.value === 'default'
                            ? 'c'
                            : cluster.value;

                        for (const plane of cluster.planes) {
                            const {
                                component,
                                value,
                            } = plane;

                            const planeAddressElements = [
                                protocol,
                                'localhost:3000',
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                value,
                            ];
                            const planeAddress = planeAddressElements.join('://');
                            console.log(planeAddress);

                            if (gatewayView.includes(planeAddress)) {
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
                }
            }
        }

        const gatewayRoute: router.MatcherResponse = {
            path: {
                value: gateway || 'gateway',
            },
            pathname: '',
            fragments: {
                elements: [],
                texts: [],
            },
            parameters: {},
            query: {},
        };
        setMatchedRoute(gatewayRoute);

        console.log('planes', planes);
        console.log('view', view);

        const Component = (
            <PluridApplication
                planes={planes}
                view={view}
            />
        );

        setComponent(Component);

        return;
    }

    const handleLocation = (
        event?: any,
    ) => {
        const pathname = window.location.pathname;

        if (pathname === gateway) {
            handleGateway();
            return;
        }

        const path = event && event.detail?.path
            ? event.detail.path
            : cleanNavigation && view
                ? view
                : pathname;

        if (cleanNavigation && pathname !== gateway) {
            window.history.replaceState(null, '', '/');
        }

        const matchedRoute = pluridRouter.current.match(path);
        console.log('matchedRoute', matchedRoute);

        if (!matchedRoute) {
            handleNoMatch();
            return;
        }

        handleMatchedRoute(matchedRoute);
    }


    /** effects */
    /** handlePopState */
    useEffect(() => {
        const routerData = loadState();
        const pathname = window.location.pathname;
        let actualPath;

        if (pathname === '/') {
            if (routerData !== pathname) {
                actualPath = routerData;
            } else {
                actualPath = '/';
            }
        } else {
            actualPath = cleanNavigation && view
                ? view
                : pathname;
        }
        const event = pathname === gateway
            ? undefined
            : {
                detail: {
                    path: actualPath,
                },
            };

        // console.log('routerData', routerData);
        // console.log('pathname', pathname);
        // console.log('actualPath', actualPath);

        handleLocation(event);
    }, []);


    /** handle listeners */
    useEffect(() => {
        window.addEventListener('popstate', handleLocation);
        window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);

        return () => {
            window.removeEventListener('popstate', handleLocation);
            window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);
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
}


export default PluridRouterBrowser;
