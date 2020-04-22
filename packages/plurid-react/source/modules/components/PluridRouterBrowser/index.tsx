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
    IndexedPluridPlane,
    PluridRouterProperties as PluridRouterBrowserOwnProperties,
} from '@plurid/plurid-data';

import {
    router,
    utilities,
} from '@plurid/plurid-engine';

import {
    storage,
    uuid,
} from '@plurid/plurid-functions';

import PluridApplication from '../../../Application';

import environment from '../../services/utilities/environment';

import {
    getComponentFromRoute,
} from '../../services/logic/router';



const Router = router.default;


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

    // console.log('protocolProperty', protocolProperty);
    const protocol = protocolProperty
        ? protocolProperty
        : window.location.protocol.replace(':', '');
    // const protocol = protocolProperty
    //     ? protocolProperty
    //     : environment.production
    //         ? 'https'
    //         : 'http';
    // console.log('protocol', protocol);

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

        if (!cleanNavigation) {
            if (window.location.pathname !== matchedRoute.route) {
                history.pushState(null, '', matchedRoute.route);
            }
        }

        storage.saveState(
            matchedRoute.path.value,
            '__PLURID_ROUTER__',
        );

        const Component = getComponentFromRoute(
            matchedRoute,
            protocol,
            host,
            indexedPlanes.current,
        );

        setComponent(Component);
        return;
    }

    const handleNoMatch = () => {
        const notFoundMatchedRoute = pluridRouter.current.match('/not-found');
        if (notFoundMatchedRoute) {
            setMatchedRoute(notFoundMatchedRoute);
            const Component = getComponentFromRoute(
                notFoundMatchedRoute,
                protocol,
                host,
                indexedPlanes.current,
            );

            if (Component) {
                history.pushState(null, '', '/not-found');
                setComponent(Component);
            }
        }
    }

    const handleGateway = () => {
        // console.log('HANDLE GATEWAY');
        // console.log('window.location', window.location);

        const query = router.extractQuery(window.location.search);

        const gatewayView: string[] = [];

        if (query.plurid) {
            gatewayView.push(query.plurid);
        }

        if (query.plurids) {
            const gatewayViews = query.plurids.split(',');
            gatewayView.push(...gatewayViews);
        }

        // console.log('gatewayView', gatewayView);
        // console.log('paths', paths);

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
                            // console.log('planeAddress', planeAddress);

                            for (const gatewayViewPlane of gatewayView) {
                                // check that the planeAddress is the same as gatewayViewPlane
                                // considering parameters / query

                                if (gatewayViewPlane === planeAddress) {
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
            route: '',
        };
        setMatchedRoute(gatewayRoute);

        // console.log('planes', planes);
        // console.log('view', view);

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

        if (!event && pathname === gatewayPath) {
            handleGateway();
            return;
        }

        const path = event && event.detail?.path
            ? event.detail.path
            : cleanNavigation && view
                ? view
                : pathname + window.location.search;

        // if (cleanNavigation && pathname !== gateway) {
        //     window.history.replaceState(null, '', '/');
        // }

        const matchedRoute = pluridRouter.current.match(path);

        if (!matchedRoute) {
            handleNoMatch();
            return;
        }

        handleMatchedRoute(matchedRoute);
    }


    /** effects */
    /** handleLocation */
    useEffect(() => {
        // const routerData = storage.loadState('__PLURID_ROUTER__');
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
        // console.log('HANDLE PLANES INDEXATION');

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
