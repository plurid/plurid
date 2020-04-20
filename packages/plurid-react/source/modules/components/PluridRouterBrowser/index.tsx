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
    PluridRouterComponent,
    IndexedPluridPlane,
} from '@plurid/plurid-data';

import {
    router,
    utilities,
} from '@plurid/plurid-engine';

import {
    uuid,
} from '@plurid/plurid-functions';

import PluridApplication from '../../../Application';

import environment from '../../services/utilities/environment';

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
     * Development default: `'localhost:3000'`.
     *
     * Production default: `window.location.host`.
     */
    host?: string;

    /**
     * The `gatewayPath` is used to receive external routing requests.
     *
     * e.g.
     *
     * `https://example.com/gateway?plurid=https://subdomain.example.com://path/to/123://s://u://c://a-plane`
     *
     * will route to that specific
     *
     * `host://path://space://universe://cluster://plane`
     */
    gatewayPath?: string;

    /**
     * Component to be rendered on the gateway path, external to the plurid view.
     */
    gatewayExterior?: PluridRouterComponent;

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
        protocol: protocolProperty,
        host: hostProperty,
        gatewayPath,
        gatewayExterior,
        api,
    } = properties;


    /** references */
    const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(new Map());

    const pluridRouter = useRef(new Router(
        paths,
    ));

    const protocol = protocolProperty || 'http';
    const host = hostProperty
        ? hostProperty
        : environment.production
            ? window.location.host
            : 'localhost:3000';


    /** state */
    const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse>();
    const [Component, setComponent] = useState<any>();


    /** handlers */
    const handleMatchedRoute = (
        matchedRoute: router.MatcherResponse,
    ) => {
        setMatchedRoute(matchedRoute);

        // if (!cleanNavigation) {
        //     history.pushState(null, '', matchedRoute.path.value);
        // }

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
                            indexedPlanes={indexedPlanes.current}
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
                                indexedPlanes={indexedPlanes.current}
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
        }

        if (query.plurids) {
            const gatewayViews = query.plurids.split(',');
            gatewayView.push(...gatewayViews);
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
                : utilities.cleanPathElement(path.value);

            for (const space of path.spaces) {
                const spaceName = space.value === 'default'
                    ? 's'
                    : utilities.cleanPathElement(space.value);

                for (const universe of space.universes) {
                    const universeName = universe.value === 'default'
                        ? 'u'
                        : utilities.cleanPathElement(universe.value);

                    for (const cluster of universe.clusters) {
                        const clusterName = cluster.value === 'default'
                            ? 'c'
                            : utilities.cleanPathElement(cluster.value);

                        for (const plane of cluster.planes) {
                            const {
                                component,
                                value,
                            } = plane;

                            const planeName = utilities.cleanPathElement(value);

                            const planeAddressElements = [
                                protocol,
                                host,
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                planeName,
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
                value: gatewayPath || 'gateway',
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

        let Exterior: React.FC<any> = () => (<></>);
        if (gatewayExterior) {
            switch (gatewayExterior.kind) {
                case 'react':
                    Exterior = gatewayExterior.element;
                    break;
            }
        }

        const Component = (
            <>
                <Exterior />

                <PluridApplication
                    planes={planes}
                    indexedPlanes={indexedPlanes.current}
                    view={view}
                />
            </>
        );

        setComponent(Component);

        return;
    }

    const handleLocation = (
        event?: any,
    ) => {
        const pathname = window.location.pathname;

        if (pathname === gatewayPath) {
            handleGateway();
            return;
        }

        const path = event && event.detail?.path
            ? event.detail.path
            : cleanNavigation && view
                ? view
                : pathname;

        // if (cleanNavigation && pathname !== gateway) {
        //     window.history.replaceState(null, '', '/');
        // }

        const matchedRoute = pluridRouter.current.match(path);
        console.log('matchedRoute', matchedRoute);

        if (!matchedRoute) {
            handleNoMatch();
            return;
        }

        handleMatchedRoute(matchedRoute);
    }


    /** effects */
    /** handleLocation */
    useEffect(() => {
        // const routerData = loadState();
        // const pathname = window.location.pathname;
        // let actualPath;

        // if (pathname === '/') {
        //     if (routerData !== pathname) {
        //         actualPath = routerData;
        //     } else {
        //         actualPath = '/';
        //     }
        // } else {
        //     actualPath = cleanNavigation && view
        //         ? view
        //         : pathname;
        // }
        // const event = pathname === gateway
        //     ? undefined
        //     : {
        //         detail: {
        //             path: actualPath,
        //         },
        //     };

        // console.log('routerData', routerData);
        // console.log('pathname', pathname);
        // console.log('actualPath', actualPath);

        // handleLocation(event);

        handleLocation();
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


    /** handle planes indexation */
    useEffect(() => {
        console.log('HANDLE PLANES INDEXATION');

        for (const path of paths) {
            if (!path.spaces) {
                const pathName = path.value === '/'
                    ? 'p'
                    : utilities.cleanPathElement(path.value);

                const planeAddressElements = [
                    protocol,
                    host,
                    pathName,
                ];
                const planeAddress = planeAddressElements.join('://');

                const id = uuid.generate();

                const indexedPlane: IndexedPluridPlane = {
                    protocol,
                    host,
                    path: pathName,
                    space: '',
                    universe: '',
                    cluster: '',
                    plane: '',
                    component: path.exterior,
                    route: planeAddress,
                };

                indexedPlanes.current.set(id, indexedPlane);

                continue;
            }

            for (const space of path.spaces) {
                for (const universe of space.universes) {
                    for (const cluster of universe.clusters) {
                        for (const plane of cluster.planes) {
                            const pathName = path.value === '/'
                                ? 'p'
                                : utilities.cleanPathElement(path.value);
                            const spaceName = space.value === 'default'
                                ? 's'
                                : utilities.cleanPathElement(space.value);
                            const universeName = universe.value === 'default'
                                ? 'u'
                                : utilities.cleanPathElement(universe.value);
                            const clusterName = cluster.value === 'default'
                                ? 'c'
                                : utilities.cleanPathElement(cluster.value);
                            const planeName = utilities.cleanPathElement(plane.value);

                            const planeAddressElements = [
                                protocol,
                                host,
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                planeName,
                            ];
                            const planeAddress = planeAddressElements.join('://');

                            const indexedPlane: IndexedPluridPlane = {
                                protocol,
                                host,
                                path: pathName,
                                space: spaceName,
                                universe: universeName,
                                cluster: clusterName,
                                plane: planeName,
                                component: plane.component,
                                route: planeAddress,
                            };

                            const id = uuid.generate();

                            indexedPlanes.current.set(id, indexedPlane);
                        }
                    }
                }
            }
        }
    }, []);

    // console.log('indexedPlanes', indexedPlanes);
    // console.log('indexedPlanesSources', indexedPlanesSources);


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
