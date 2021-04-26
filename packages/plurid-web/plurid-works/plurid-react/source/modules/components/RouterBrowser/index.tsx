// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';

    import {
        /** constants */
        PLURID_ROUTER_LOCATION_CHANGED,
        PLURID_ROUTER_LOCATION_STORED,
        PLURID_ROUTER_STORAGE,

        PLURID_ROUTE_DEFAULT_SPACE,
        PLURID_ROUTE_DEFAULT_UNIVERSE,
        PLURID_ROUTE_DEFAULT_CLUSTER,

        /** interfaces */
        IndexedPluridPlane,
        PluridRouterProperties as PluridRouterBrowserOwnProperties,
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,
        PluridComponent,
    } from '@plurid/plurid-data';

    import {
        router,
        utilities,

        PluridPlanesRegistrar,
    } from '@plurid/plurid-engine';

    import {
        storage,
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import PluridApplication from '~Application/index';

    import {
        getComponentFromRoute,
        getGatewayView,
        generateIndexedPlane,
        generateIndexedPlanes,
        computeIndexedPlanes,

        gatherPluridPlanes,
        computePluridRoute,
        computeInitialMatchedPath,
        renderDirectPlane,
    } from '~services/logic/router';
    // #endregion external
// #endregion imports



// #region module
const PluridRouter = router.default;
const PluridURLRouter = router.URLRouter;


const PluridRouterBrowser = (
    properties: PluridRouterBrowserOwnProperties,
) => {
    // #region properties
    const {
        routes,
        planes,
        exterior,
        shell,

        static: staticContext,

        view: cleanNavigationView,
        cleanNavigation,
        notFoundPath: notFoundPathProperty,
    } = properties;

    const notFoundPath = notFoundPathProperty || '/not-found';

    const pluridPlanes = gatherPluridPlanes(
        routes,
        planes,
    );
    // #endregion properties


    // #region references
    const pluridPlanesRegistrar = useRef(
        new PluridPlanesRegistrar(
            pluridPlanes,
        ),
    );

    // const pluridURLRouter = useRef(new PluridURLRouter(
    //     urlRoutes.current,
    // ));

    const pluridRouter = useRef(
        new PluridRouter(
            routes,
        ),
    );
    // #endregion references


    // #region state
    const [
        matchedPath,
        setMatchedPath,
    ] = useState(
        computeInitialMatchedPath(
            staticContext,
        ),
    );

    const [
        matchedRoute,
        setMatchedRoute,
    ] = useState(
        pluridRouter.current.match(matchedPath),
    );

    const [
        PluridRoute,
        setPluridRoute,
    ] = useState<React.FC<any>>(
        computePluridRoute(
            matchedRoute,
            routes,
            pluridPlanesRegistrar.current,
            staticContext?.directPlane,
        ),
    );
    // #endregion state


    // #region handlers
    const handleLocation = (
        event?: any,
    ) => {
        let matchedPath: string | undefined;

        if (
            event && event.detail.path
            && !matchedPath
        ) {
            matchedPath = event.detail.path;
        }


        if (
            cleanNavigation && cleanNavigationView
            && !matchedPath
        ) {
            matchedPath = cleanNavigationView;
        }


        const pathname = window.location.pathname;

        if (!matchedPath) {
            matchedPath = pathname + window.location.search;
        }


        setMatchedPath(matchedPath);
    }
    // #endregion handlers


    // #region effects
    // Handle location.
    useEffect(() => {
        window.addEventListener('popstate', handleLocation);
        window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);

        return () => {
            window.removeEventListener('popstate', handleLocation);
            window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);
        };
    }, []);


    useEffect(() => {
        if (!cleanNavigation) {
            history.pushState(null, '', matchedPath);
        }

        let matchedRoute = pluridRouter.current.match(matchedPath);

        // Handle direct plane access
        //        gateway access
        if (!matchedRoute) {
            console.log('Direct plane or gateway access');
            if (matchedPath === '/gateway') {
                // handle gateway
            }

            // render direct plane
            const {
                matchedPlane,
                DirectPlane,
            } = renderDirectPlane(
                matchedPath,
                routes,
                planes,
                pluridPlanesRegistrar.current,
            );

            if (matchedPlane && DirectPlane) {
                setMatchedRoute(matchedPlane);
                setPluridRoute(DirectPlane);
                return;
            }
        }

        // Handle not found.
        if (!matchedRoute) {
            matchedRoute = pluridRouter.current.match(notFoundPath);
        }

        setMatchedRoute(matchedRoute);
        setPluridRoute(
            computePluridRoute(
                matchedRoute,
                routes,
                pluridPlanesRegistrar.current,
            ),
        );
    }, [
        matchedPath,
    ]);


    useEffect(() => {
        if (!matchedRoute) {
            return;
        }

        storage.saveState(
            matchedRoute.path.value,
            PLURID_ROUTER_STORAGE,
        );

        const locationStoredEvent = new CustomEvent(
            PLURID_ROUTER_LOCATION_STORED,
            {
                detail: {
                    path: matchedRoute.path.value,
                },
            },
        );
        window.dispatchEvent(locationStoredEvent);
    }, [
        cleanNavigation,
        matchedRoute,
    ]);
    // #endregion effects


    // #region render
    let PluridRouterExterior: React.FC<any> | undefined;
    if (exterior) {
        if (exterior.kind === 'react') {
            PluridRouterExterior = exterior.element;
            PluridRouterExterior.displayName = 'PluridRouterExterior';
        }
    }

    let PluridRouterShell: React.FC<any> = ({
        children,
    }) => (
        <>
            {children}
        </>
    );
    if (shell) {
        if (shell.kind === 'react') {
            PluridRouterShell = shell.element;
            PluridRouterShell.displayName = 'PluridRouterShell';
        }
    }


    return (
        <>
            {PluridRouterExterior && (
                <PluridRouterExterior
                    matchedRoute={matchedRoute}
                />
            )}

            <PluridRouterShell
                matchedRoute={matchedRoute}
            >
                <PluridRoute />
            </PluridRouterShell>
        </>
    );
    // #endregion render





    // /** properties */
    // const {
    //     routes,
    //     exterior,
    //     shell,
    //     view,
    //     cleanNavigation,
    //     protocol: protocolProperty,
    //     host: hostProperty,
    //     gatewayPath: gatewayPathProperty,
    //     gatewayExterior,
    //     notFoundPath: notFoundPathProperty,
    //     api,
    //     static: staticContext,
    // } = properties;

    // const notFoundPath = notFoundPathProperty || '/not-found';
    // const gatewayPath = gatewayPathProperty || '/gateway';

    // const protocol = protocolProperty
    //     ? protocolProperty
    //     : window.location.protocol.replace(':', '');

    // const host = hostProperty
    //     ? hostProperty
    //     : window.location.host;


    // /** references */
    // const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(new Map());

    // const indexedPaths = useRef<any>({});

    // const urlRoutes = useRef(routes.map(path => {
    //     indexedPaths.current[path.value] = {
    //         ...path,
    //     };

    //     const {
    //         value,
    //         parameters,
    //     } = path;

    //     return {
    //         value,
    //         parameters,
    //     };
    // }));
    // // console.log('urlRoutes', urlRoutes);

    // const pluridURLRouter = useRef(new PluridURLRouter(
    //     urlRoutes.current,
    // ));

    // const pluridRouter = useRef(new PluridRouter(
    //     routes,
    // ));

    // const windowLocation = typeof window !== 'undefined'
    //     ? window.location.pathname
    //     : '';
    // // console.log('windowLocation', windowLocation);
    // // console.log('staticContext?.path', staticContext?.path);
    // const matchedInitialRoute = (pluridRouter as any).current.match(
    //     staticContext?.path || windowLocation
    // );
    // // console.log('matchedInitialRoute', matchedInitialRoute);
    // const actualMatchedInitialRoute = !matchedInitialRoute
    //     ? (pluridRouter as any).current.match('/not-found')
    //     : matchedInitialRoute;

    // const initialIndexedPlanes = computeIndexedPlanes(
    //     routes,
    //     protocol,
    //     host,
    // );
    // // console.log('initialIndexedPlanes', initialIndexedPlanes);

    // const initialComponent = getComponentFromRoute({
    //     matchedRoute: actualMatchedInitialRoute,
    //     protocol,
    //     host,
    //     indexedPlanes: initialIndexedPlanes,
    // });
    // // console.log('initialComponent', initialComponent);

    // /** state */
    // const [matchedRoute, setMatchedRoute] = useState<router.MatcherResponse>();
    // const [Component, setComponent] = useState<any>(
    //     initialComponent,
    // );
    // const [routerHistory, setRouterHistory] = useState({
    //     path: staticContext ? staticContext.path : '',
    // });
    // // console.log('Component', Component);


    // /** handlers */
    // const handleMatchedRoute = (
    //     matchedRoute: router.MatcherResponse,
    // ) => {
    //     // console.log('matchedRoute', matchedRoute);
    //     setMatchedRoute(matchedRoute);

    //     if (!cleanNavigation) {
    //         if (window.location.pathname !== matchedRoute.route) {
    //             history.pushState(null, '', matchedRoute.route);
    //         }
    //     }

    //     storage.saveState(
    //         matchedRoute.path.value,
    //         '__PLURID_ROUTER__',
    //     );

    //     const event = new CustomEvent(
    //         PLURID_ROUTER_LOCATION_STORED,
    //         {
    //             detail: {
    //                 path: matchedRoute.path.value,
    //             },
    //         },
    //     );
    //     if (window) {
    //         window.dispatchEvent(event);
    //     }

    //     const Component = getComponentFromRoute({
    //         matchedRoute,
    //         protocol,
    //         host,
    //         indexedPlanes: indexedPlanes.current,
    //         // staticRender: true,
    //     });

    //     setComponent(Component);
    //     return;
    // }

    // const handleNoMatch = () => {
    //     const notFoundMatchedRoute = pluridRouter.current.match(notFoundPath);

    //     if (notFoundMatchedRoute) {
    //         setMatchedRoute(notFoundMatchedRoute);
    //         const Component = getComponentFromRoute({
    //             matchedRoute: notFoundMatchedRoute,
    //             protocol,
    //             host,
    //             indexedPlanes: indexedPlanes.current,
    //         });

    //         if (Component) {
    //             setComponent(Component);
    //         }
    //     }
    // }

    // const handleGateway = () => {
    //     const {
    //         Component,
    //         gatewayRoute,
    //     } = getGatewayView({
    //         queryString: window.location.search,
    //         routes,
    //         gatewayPath,
    //         gatewayExterior,
    //         protocol,
    //         host,
    //         indexedPlanes: indexedPlanes.current,
    //     });

    //     setComponent(Component);
    //     setMatchedRoute(gatewayRoute);
    //     return;
    // }

    // const handleLocation = (
    //     event?: any,
    // ) => {
    //     const pathname = window.location.pathname;

    //     if (!event && pathname === gatewayPath) {
    //         handleGateway();
    //         return;
    //     }

    //     const path = event && event.detail?.path
    //         ? event.detail.path
    //         : cleanNavigation && view
    //             ? view
    //             : pathname + window.location.search;

    //     // if (cleanNavigation && pathname !== gateway) {
    //     //     window.history.replaceState(null, '', '/');
    //     // }

    //     const matchedRoute = pluridRouter.current.match(path);

    //     const matchedURL = pluridURLRouter.current.match(path);
    //     // console.log('matchedURL', matchedURL);

    //     if (!matchedRoute) {
    //         handleNoMatch();
    //         return;
    //     }

    //     handleMatchedRoute(matchedRoute);
    // }


    // /** effects */
    // /** handleLocation */
    // useEffect(() => {
    //     if (window.location.pathname === gatewayPath) {
    //         handleGateway();
    //         return;
    //     }

    //     handleLocation();
    // }, []);


    // /** handle listeners */
    // useEffect(() => {
    //     window.addEventListener('popstate', handleLocation);
    //     window.addEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);

    //     return () => {
    //         window.removeEventListener('popstate', handleLocation);
    //         window.removeEventListener(PLURID_ROUTER_LOCATION_CHANGED, handleLocation);
    //     };
    // }, []);


    // /** handle planes indexation */
    // useEffect(() => {
    //     for (const path of routes) {
    //         if (!path.spaces) {
    //             if (!path.planes) {
    //                 // handle static path
    //                 const pathName = path.value === '/'
    //                     ? 'p'
    //                     : utilities.cleanPathElement(path.value);

    //                 const planeAddressElements = [
    //                     protocol,
    //                     host,
    //                     pathName,
    //                 ];
    //                 const planeAddress = planeAddressElements.join('://');

    //                 const id = uuid.generate();

    //                 const indexedPlane: IndexedPluridPlane = {
    //                     protocol,
    //                     host,
    //                     path: pathName,
    //                     space: '',
    //                     universe: '',
    //                     cluster: '',
    //                     plane: '',
    //                     component: path.exterior || {
    //                         kind: 'react',
    //                         element: () => (<></>),
    //                     },
    //                     route: planeAddress,
    //                 };

    //                 indexedPlanes.current.set(id, indexedPlane);

    //                 continue;
    //             } else {
    //                 for (const plane of path.planes) {
    //                     const {
    //                         id,
    //                         indexedPlane,
    //                     } = generateIndexedPlane(
    //                         plane,
    //                         protocol,
    //                         host,
    //                         path.value,
    //                         PLURID_ROUTE_DEFAULT_SPACE,
    //                         PLURID_ROUTE_DEFAULT_UNIVERSE,
    //                         PLURID_ROUTE_DEFAULT_CLUSTER,
    //                     );
    //                     indexedPlanes.current.set(id, indexedPlane);
    //                 }

    //                 continue;
    //             }
    //         }

    //         const generatedIndexedPlanes = generateIndexedPlanes(
    //             path,
    //             protocol,
    //             host,
    //         );

    //         for (const generatedIndexedPlane of generatedIndexedPlanes) {
    //             const {
    //                 id,
    //                 indexedPlane,
    //             } = generatedIndexedPlane;
    //             indexedPlanes.current.set(id, indexedPlane);
    //         }
    //     }
    // }, [
    //     routes,
    // ]);


    // /** render */
    // let PluridRouterExterior: React.FC<any> = () => (<></>);
    // if (exterior) {
    //     if (exterior.kind === 'react') {
    //         PluridRouterExterior = exterior.element;
    //         PluridRouterExterior.displayName = 'PluridRouterExterior';
    //     }
    // }

    // let PluridRouterShell: React.FC<any> = ({
    //     children,
    // }) => (
    //     <>
    //         {children}
    //     </>
    // );
    // if (shell) {
    //     if (shell.kind === 'react') {
    //         PluridRouterShell = shell.element;
    //         PluridRouterShell.displayName = 'PluridRouterShell';
    //     }
    // }

    // return (
    //     <>
    //         <PluridRouterExterior
    //             matchedRoute={actualMatchedInitialRoute || matchedRoute}
    //         />

    //         <PluridRouterShell
    //             matchedRoute={actualMatchedInitialRoute || matchedRoute}
    //         >
    //             {!Component
    //                 ? (
    //                     <></>
    //                 ) : (
    //                     <>
    //                         {Component}
    //                     </>
    //                 )
    //             }
    //         </PluridRouterShell>
    //     </>
    // );
}
// #endregion module



// #region exports
export default PluridRouterBrowser;
// #endregion exports
