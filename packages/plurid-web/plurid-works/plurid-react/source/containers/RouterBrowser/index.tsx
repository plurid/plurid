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
        // PluridComponent,
    } from '@plurid/plurid-data';

    import {
        routing,
        planes,
        utilities,
    } from '@plurid/plurid-engine';

    import {
        storage,
        uuid,
    } from '@plurid/plurid-functions';

    import {
        useMounted,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        PluridRouteMatch,
    } from '~data/interfaces';

    import PluridApplication from '~containers/Application/index';

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

    import {
        isReactRenderable,
    } from '~services/utilities/react';
    // #endregion external
// #endregion imports



// #region module
const {
    Registrar: PluridPlanesRegistrar,
} = planes;

const {
    IsoMatcher: PluridIsoMatcher,
} = routing;



const PluridRouterBrowser = (
    properties: PluridRouterBrowserOwnProperties<PluridReactComponent>,
) => {
    // #region properties
    const {
        routes,
        planes,
        exterior,
        shell,
        hostname,

        static: staticContext,

        view: cleanNavigationView,
        cleanNavigation,
        notFoundPath: notFoundPathProperty,
    } = properties;
    // console.log('staticContext', staticContext)

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

    const pluridIsoMatcher = useRef(
        new PluridIsoMatcher(
            {
                routes,
                routePlanes: planes,
            },
            hostname,
        ),
    );
    // #endregion references


    // #region state
    const mounted = useMounted();

    const [
        matchedPath,
        setMatchedPath,
    ] = useState(
        computeInitialMatchedPath(
            staticContext,
        ),
    );
    // console.log('matchedPath', matchedPath);

    const [
        matchedRoute,
        setMatchedRoute,
    ] = useState<PluridRouteMatch | undefined>(
        pluridIsoMatcher.current.match(
            matchedPath,
            'route',
        ),
    );
    // console.log('matchedRoute', matchedRoute);

    const [
        PluridRoute,
        setPluridRoute,
    ] = useState<React.FC<any>>(
        computePluridRoute(
            matchedRoute,
            pluridPlanesRegistrar.current,
            pluridIsoMatcher.current,
            staticContext && staticContext.directPlane
                ? pluridIsoMatcher.current.match(
                    staticContext.directPlane,
                    'route',
                ) : undefined,
            hostname,
        ),
    );
    // #endregion state


    // #region handlers
    const handleLocation = (
        event?: any,
    ) => {
        let matchedPath: string | undefined;

        if (
            event && event.detail && event.detail.path
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
        if (!mounted) {
            return;
        }

        if (!cleanNavigation) {
            if (location.pathname !== matchedPath) {
                history.pushState(null, '', matchedPath);
            }
        }

        let matchedRoute = pluridIsoMatcher.current.match(matchedPath, 'route');

        // Handle direct plane access.
        if (
            matchedRoute
            && matchedRoute.kind === 'RoutePlane'
        ) {
           const DirectPlane = renderDirectPlane(
                matchedRoute,
                pluridPlanesRegistrar.current,
                hostname,
            );

            setMatchedRoute(matchedRoute);
            setPluridRoute(DirectPlane);
            return;
        }

        // Handle not found.
        if (!matchedRoute) {
            matchedRoute = pluridIsoMatcher.current.match(notFoundPath, 'route');
        }

        setMatchedRoute(matchedRoute);
        setPluridRoute(
            computePluridRoute(
                matchedRoute,
                pluridPlanesRegistrar.current,
                pluridIsoMatcher.current,
                hostname,
            ),
        );
    }, [
        mounted,
        matchedPath,
    ]);


    useEffect(() => {
        if (!matchedRoute) {
            return;
        }

        if (matchedRoute.kind !== 'Route') {
            return;
        }

        const path = matchedRoute.match.value;

        storage.saveState(
            path,
            PLURID_ROUTER_STORAGE,
        );

        const locationStoredEvent = new CustomEvent(
            PLURID_ROUTER_LOCATION_STORED,
            {
                detail: {
                    path,
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
    if (isReactRenderable(exterior)) {
        PluridRouterExterior = exterior as any;
        if (PluridRouterExterior) {
            PluridRouterExterior.displayName = 'PluridRouterExterior';
        }
    }

    let PluridRouterShell: React.FC<any> = ({
        children,
    }) => (<>{children}</>);
    if (isReactRenderable(shell)) {
        PluridRouterShell = shell as any;
        if (PluridRouterShell) {
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
}
// #endregion module



// #region exports
export default PluridRouterBrowser;
// #endregion exports
