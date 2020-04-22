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

import {
    getComponentFromRoute,
    getGatewayView,
} from '../../services/logic/router';



const PluridRouter = router.default;


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
        gatewayPath: gatewayPathProperty,
        gatewayExterior,
        notFoundPath: notFoundPathProperty,
        api,
    } = properties;

    const notFoundPath = notFoundPathProperty || '/not-found';
    const gatewayPath = gatewayPathProperty || '/gateway';

    const protocol = protocolProperty
        ? protocolProperty
        : window.location.protocol.replace(':', '');

    const host = hostProperty
        ? hostProperty
        : window.location.host;


    /** references */
    const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(new Map());

    const pluridRouter = useRef(new PluridRouter(
        paths,
    ));


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

        const Component = getComponentFromRoute({
            matchedRoute,
            protocol,
            host,
            indexedPlanes: indexedPlanes.current,
        });

        setComponent(Component);
        return;
    }

    const handleNoMatch = () => {
        const notFoundMatchedRoute = pluridRouter.current.match(notFoundPath);
        if (notFoundMatchedRoute) {
            setMatchedRoute(notFoundMatchedRoute);
            const Component = getComponentFromRoute({
                matchedRoute: notFoundMatchedRoute,
                protocol,
                host,
                indexedPlanes: indexedPlanes.current,
            });

            if (Component) {
                history.pushState(null, '', notFoundPath);
                setComponent(Component);
            }
        } else {
            setComponent(
                <>Not Found</>
            );
        }
    }

    const handleGateway = () => {
        const {
            Component,
            gatewayRoute,
        } = getGatewayView({
            queryString: window.location.search,
            paths,
            gatewayPath,
            gatewayExterior,
            protocol,
            host,
            indexedPlanes: indexedPlanes.current,
        });

        setComponent(Component);
        setMatchedRoute(gatewayRoute);
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
        if (window.location.pathname === gatewayPath) {
            handleGateway();
            return;
        }

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
