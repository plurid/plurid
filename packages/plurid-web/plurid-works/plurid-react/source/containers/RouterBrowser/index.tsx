// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
        useContext,
        useMemo,
        useCallback,
    } from 'react';


    import {
        pluridRouterNavigate,
    } from '@plurid/plurid-engine';
    import {
        storage,
    } from '@plurid/plurid-functions';

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
    import PluridDocumentRegistryContext from '~services/document/context';
    import {
        resolvePlaneDocument,
    } from '~components/utilities/Document/Planes';
    // #region internal
    import PluridRouterContext from './context';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The shell when the host gives none. AT MODULE SCOPE: declared inside the render, it was a new
 * component type on every render, so React unmounted and remounted everything under it — the
 * routed application with its camera, spawned planes, selection and history — whenever the host
 * re-rendered the router (a theme toggle, an auth change).
 */
const DefaultRouterShell: React.FC<any> = ({
    children,
}) => (<>{children}</>);
DefaultRouterShell.displayName = 'PluridRouterShell';


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
        onReady,
        pubsub: routerPubSub,
    } = properties;
    // console.log('staticContext', staticContext)

    // the location handler is subscribed once: it reads the CURRENT props through this ref, never
    // the first render's (a host may change `cleanNavigation`, `view` or `scrollToTop` after mount)
    const latest = useRef({ cleanNavigation, cleanNavigationView, scrollToTop });
    latest.current = { cleanNavigation, cleanNavigationView, scrollToTop };
    /** THE READINESS CONTRACT: one stable `onReady` for the route's application, calling the host's current one. */
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;
    const routerOnReady = useCallback((api: Parameters<NonNullable<typeof onReady>>[0]) => {
        onReadyRef.current?.(api);
    }, []);

    const notFoundPath = notFoundPathProperty || '/not-found';
    const fadeIn = fadeInProperty ?? 10;

    // #endregion properties


    // #region references
    const topContainer = useRef<HTMLDivElement>(null);

    // THE CURRENT ROUTES (2026-10-20): built from the first render's `routes`, `planes` and
    // `hostname` (and constructed and thrown away again on every render after), the registrar and the
    // matcher never matched a route a host added later. Built again when one of the three changes.
    const pluridPlanesRegistrar = useMemo(
        () => new PluridPlanesRegistrar(
            gatherPluridPlanes(
                routes,
                planes,
            ),
            hostname,
        ),
        [routes, planes, hostname],
    );

    const pluridIsoMatcher = useMemo(
        () => new PluridIsoMatcher(
            {
                routes,
                routePlanes: planes,
            },
            hostname,
        ),
        [routes, planes, hostname],
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

    // the route at boot is resolved as a navigation resolves one: an unmatched path is the
    // not-found route (the host's `notFoundPath`), not nothing
    const [
        matchedRoute,
        setMatchedRoute,
    ] = useState<PluridRouteMatch | undefined>(
        () => pluridIsoMatcher.match(matchedPath, 'route')
            ?? pluridIsoMatcher.match(notFoundPath, 'route'),
    );
    // console.log('matchedRoute', matchedRoute);

    // The route layer of the document head: the matched route's (or route plane's) `head`,
    // resolved synchronously on the client (a Promise result keeps the server-rendered head).
    const documentRegistry = useContext(PluridDocumentRegistryContext);
    const routeDocument = useMemo(() => {
        const source = matchedRoute?.data?.head;
        return source
            ? resolvePlaneDocument(source, {
                route: matchedRoute!.match.value,
                parameters: matchedRoute!.match.parameters ?? {},
                query: matchedRoute!.match.query ?? {},
            })
            : undefined;
    }, [matchedRoute]);
    if (documentRegistry && !documentRegistry.server) {
        // during render (idempotent by value), so a hydration render already holds the route's head
        documentRegistry.setBase('route', routeDocument);
    }

    const [
        PluridRoute,
        setPluridRoute,
    ] = useState<React.FC<any>>(
        computePluridRoute(
            matchedRoute,
            pluridPlanesRegistrar,
            pluridIsoMatcher,
            staticContext && staticContext.directPlane
                ? pluridIsoMatcher.match(
                    staticContext.directPlane,
                    'route',
                ) : undefined,
            hostname,
            routerPubSub,
        ),
    );
    // #endregion state


    // #region handlers
    const scrollTop = () => {
        const { scrollToTop } = latest.current;
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
        const { cleanNavigation, cleanNavigationView } = latest.current;

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


    // THE PATH THE ROUTE ON SCREEN WAS COMPUTED FOR. A route is computed again only when the path
    // changes: every computation is a new component type, and the first re-render after mount used
    // to recompute it for the same path (the effect was gated on a `useMounted` ref that flips
    // after the first render), remounting the application a host had just been handed.
    //
    // THE ROUTES CHANGED: the path is matched again, and routed again only when it now matches
    // another route (a host's new array of the same routes, the common re-render, remounts nothing).
    const routedPath = useRef(matchedPath);
    const routedMatcher = useRef(pluridIsoMatcher);
    useEffect(() => {
        if (routedPath.current === matchedPath) {
            if (routedMatcher.current === pluridIsoMatcher) {
                return;
            }
            routedMatcher.current = pluridIsoMatcher;
            const rematched = pluridIsoMatcher.match(matchedPath, 'route')
                ?? pluridIsoMatcher.match(notFoundPath, 'route');
            if (
                rematched?.kind === matchedRoute?.kind
                && rematched?.match.value === matchedRoute?.match.value
            ) {
                return;
            }
        }
        routedPath.current = matchedPath;
        routedMatcher.current = pluridIsoMatcher;

        if (!cleanNavigation) {
            // Compare the FULL current URL (pathname + search) against `matchedPath` — which
            // already includes the search (see where it's built) — so a query-bearing URL no
            // longer pushes a spurious history entry on mount. Use `window.`-qualified globals
            // rather than the bare `location`/`history` references.
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl !== matchedPath) {
                window.history.pushState(null, '', matchedPath);
            }
        }

        let nextRoute = pluridIsoMatcher.match(matchedPath, 'route');

        // Handle direct plane access.
        if (
            nextRoute
            && nextRoute.kind === 'RoutePlane'
        ) {
           const DirectPlane = renderDirectPlane(
                nextRoute,
                pluridPlanesRegistrar,
                hostname,
            );

            setMatchedRoute(nextRoute);
            setPluridRoute(DirectPlane);
            return;
        }

        // Handle not found.
        if (!nextRoute) {
            nextRoute = pluridIsoMatcher.match(notFoundPath, 'route');
        }

        setMatchedRoute(nextRoute);
        setPluridRoute(
            computePluridRoute(
                nextRoute,
                pluridPlanesRegistrar,
                pluridIsoMatcher,
                undefined,
                hostname,
                routerPubSub,
            ),
        );
    }, [
        matchedPath,
        pluridIsoMatcher,
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

    const PluridRouterShell: React.FC<any> = isReactRenderable(shell)
        ? shell as any
        : DefaultRouterShell;

    // the pathname is the router's: an application inside a route reads this (its address-bar binding
    // rides a query parameter instead) and takes the router's `onReady` and bus
    const routerContextValue = useMemo(() => ({
        path: matchedPath,
        navigate: pluridRouterNavigate,
        onReady: routerOnReady,
        pubsub: routerPubSub,
        hostname,
    }), [matchedPath, routerOnReady, routerPubSub, hostname]);

    return (
        <PluridRouterContext.Provider value={routerContextValue}>
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
        </PluridRouterContext.Provider>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridRouterBrowser;
// #endregion exports
