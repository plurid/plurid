// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';


    import {
        storage,
    } from '@plurid/plurid-functions';

    import {
        useMounted,
    } from '@plurid/plurid-functions-react';

    import {
        /** constants */
        PLURID_ROUTER_LOCATION_CHANGED,
        PLURID_ROUTER_LOCATION_STORED,
        PLURID_ROUTER_STORAGE,

        /** interfaces */
        PluridRouterProperties as PluridRouterBrowserOwnProperties,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        PluridRouteMatch,
    } from '~data/interfaces';

    import {
        gatherPluridPlanes,
        computePluridRoute,
        computeInitialMatchedPath,
        renderDirectPlane,
    } from '~services/logic/router';

    import {
        isReactRenderable,
    } from '~services/utilities/react';

    import {
        PluridPlanesRegistrar,
        PluridIsoMatcher,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        PluridScrollTop,
    } from './styled';

    import FadeIn from './FadeIn';
    // #endregion internal
// #endregion imports



// #region module
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
        scrollToTop,
        fadeIn: fadeInProperty,

        static: staticContext,

        view: cleanNavigationView,
        cleanNavigation,
        notFoundPath: notFoundPathProperty,
    } = properties;
    // console.log('staticContext', staticContext)

    const notFoundPath = notFoundPathProperty || '/not-found';
    const fadeIn = fadeInProperty ?? 10;

    const pluridPlanes = gatherPluridPlanes(
        routes,
        planes,
    );
    // #endregion properties


    // #region references
    const topContainer = useRef<HTMLDivElement>(null);

    const pluridPlanesRegistrar = useRef(
        new PluridPlanesRegistrar(
            pluridPlanes,
            hostname,
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
    const scrollTop = () => {
        if (!topContainer.current || scrollToTop === false) {
            return;
        }

        const behavior = (
            typeof scrollToTop === 'undefined'
            || scrollToTop === true
            || scrollToTop === 'smooth'
        ) ? 'smooth' as const : 'auto' as const;

        topContainer.current.scrollIntoView({
            behavior,
        });
    }

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
        scrollTop();
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
                undefined,
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
            <FadeIn
                time={fadeIn}
            />

            <PluridScrollTop
                ref={topContainer}
            />

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
