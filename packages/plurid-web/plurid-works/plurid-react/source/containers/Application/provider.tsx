// #region imports
    // #region libraries
    import React, {
        createContext,
        useContext,
        useMemo,
    } from 'react';

    import {
        PluridApplication as PluridApplicationProperties,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE CONFIGURATION SURFACE, REACHABLE FROM BOTH MOUNT PATHS.
 *
 * There are two ways to mount a plurid application. `<PluridApplication …/>`
 * takes eighteen props for customization, persistence and observation. The
 * ROUTE-DRIVEN path — `routes` → `PluridRouterBrowser` → the engine constructs
 * the applications itself — forwarded five: `id`, `planes`, `view`,
 * `configuration`, `hostname`.
 *
 * `@plurid/plurid-kit` generates the route-driven shape, `GETTING_STARTED`
 * teaches it, and every product uses it. So seventeen documented props could
 * not be reached from the way we tell people to build, and `CONTROL_SURFACE`
 * described an API the kit's own output could not call. Products worked around
 * it in the only place left to them — the stylesheet — and the workarounds were
 * the same in every product, which is what a missing API looks like.
 *
 * This is the answer, and it is deliberately NOT seventeen new fields on
 * `PluridRoute`: a host configures ONCE, outside the router, and every
 * application the router constructs reads it. That also settles multi-space
 * routes, where per-route props would have to be repeated per space.
 *
 * AN APPLICATION'S OWN PROP ALWAYS WINS. These are defaults, not overrides —
 * a direct `<PluridApplication renderEmpty={…}/>` inside a provider keeps its
 * own, exactly as it would outside one.
 */
export type PluridApplicationDefaults = Pick<
    PluridApplicationProperties<PluridReactComponent>,
    | 'renderToolbar'
    | 'renderViewcube'
    | 'renderDockRail'
    | 'renderMinimap'
    | 'renderShortcuts'
    | 'renderPalette'
    | 'renderEmpty'
    | 'renderPlaneControls'
    | 'renderPlaneBridge'
    | 'renderOrigin'
    | 'renderDebugger'
    | 'useLocalStorage'
    | 'storageAdapter'
    | 'onPersistContent'
    | 'onRestoreContent'
    | 'onViewpointChange'
    | 'onReady'
>;


export const PluridApplicationDefaultsContext = createContext<
    PluridApplicationDefaults | undefined
>(undefined);


export interface PluridApplicationProviderProperties extends PluridApplicationDefaults {
    children: React.ReactNode;
}


/**
 * Wrap a router (or anything that mounts applications) to give every
 * application under it the same slots, persistence and observation.
 *
 * ```tsx
 * <PluridApplicationProvider
 *     renderEmpty={() => <YourEmptyState />}
 *     renderPlaneControls={(context) => <YourPlaneBar {...context} />}
 *     useLocalStorage
 * >
 *     <PluridRouterBrowser routes={routes} shell={Shell} />
 * </PluridApplicationProvider>
 * ```
 *
 * Nesting is supported and the nearest provider wins per field: an inner
 * provider's values are merged over the outer one's, so a section of an
 * application can change one slot without restating the rest.
 */
export const PluridApplicationProvider: React.FC<PluridApplicationProviderProperties> = (
    properties,
) => {
    const {
        children,
        ...defaults
    } = properties;

    const outer = useContext(PluridApplicationDefaultsContext);

    const value = useMemo(() => {
        const merged: Record<string, unknown> = {
            ...outer,
        };

        // an explicitly passed `undefined` must not erase the outer value: it
        // reads as "not configured here", which is what leaving it out means
        for (const [key, entry] of Object.entries(defaults)) {
            if (entry !== undefined) {
                merged[key] = entry;
            }
        }

        return merged as PluridApplicationDefaults;
    }, [
        outer,
        ...Object.keys(defaults).sort().map((key) => (defaults as any)[key]),
    ]);

    return (
        <PluridApplicationDefaultsContext.Provider value={value}>
            {children}
        </PluridApplicationDefaultsContext.Provider>
    );
};
PluridApplicationProvider.displayName = 'PluridApplicationProvider';


/** The defaults in force, for the application that is about to mount. */
export const usePluridApplicationDefaults = () => useContext(
    PluridApplicationDefaultsContext,
);
// #endregion module
