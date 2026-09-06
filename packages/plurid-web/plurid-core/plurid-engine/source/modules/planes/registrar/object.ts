// #region imports
    // #region libraries
    import {
        PluridPlane,
        RegisteredPluridPlane,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        IsoMatcher,
    } from '~modules/routing';
    // #endregion external
// #endregion imports



// #region module
type RegistrarFallback<C> = IPluridPlanesRegistrar<C> | (() => IPluridPlanesRegistrar<C> | undefined);


/**
 * The planes registrar: every application owns one (client and server alike, 2026-09-06 — C04: the
 * window-global `__pluridPlanesRegistrar__` used to be the default on the client, so two applications
 * registering the same route overwrote each other). An optional FALLBACK is consulted for reads only —
 * the application passes the window-global registry, so planes a host registered globally (the older
 * `registerPlanes(planes)` call) still resolve, while registrations never collide.
 */
class PluridPlanesRegistrar<C> implements IPluridPlanesRegistrar<C> {
    private isoMatcher: IsoMatcher<C>;
    private fallback: RegistrarFallback<C> | undefined;


    constructor(
        planes?: PluridPlane<C>[],
        origin = 'origin',
        fallback?: RegistrarFallback<C>,
    ) {
        this.isoMatcher = new IsoMatcher(
            {
                planes,
            },
            origin,
        );
        this.fallback = fallback;
    }


    private resolveFallback(): IPluridPlanesRegistrar<C> | undefined {
        const fallback = typeof this.fallback === 'function' ? this.fallback() : this.fallback;
        return fallback === this ? undefined : fallback;
    }


    public register(
        planes: PluridPlane<C>[],
    ) {
        this.isoMatcher.index({
            planes,
        });
    }

    public identify(): string[] {
        const planes = this.isoMatcher.getPlanesIndex();
        const own: string[] = [...planes.keys()];
        const fallback = this.resolveFallback();
        return fallback ? [...new Set([...fallback.identify(), ...own])] : own;
    }

    public get(
        route: string,
    ) {
        const match = this.isoMatcher.match(route);

        if (match) {
            const absoluteRoute = match.kind === 'Plane'
                ? match.data.route
                : match.data.value;

            const registeredPlane: RegisteredPluridPlane<C> = {
                route: {
                    absolute: absoluteRoute,
                    fragments: match.match.fragments,
                    parameters: match.match.parameters,
                    query: match.match.query,
                },
                component: match.data.component,
                head: match.data.head,
                width: match.data.width,
                height: match.data.height,
            };

            return registeredPlane;
        }

        return this.resolveFallback()?.get(route);
    }

    public getAll() {
        const planes = this.isoMatcher.getPlanesIndex();
        // the fallback's entries first: an own registration of the same path wins
        const all = new Map(this.resolveFallback()?.getAll() ?? []);

        for (const [path, plane] of planes) {
            const absoluteRoute = plane.kind === 'Plane'
                ? plane.data.route
                : plane.data.value;

            const registeredPlane: RegisteredPluridPlane<C> = {
                route: {
                    absolute: absoluteRoute,
                    fragments: {
                        elements: [],
                        texts: [],
                    },
                    parameters: {},
                    query: {},
                },
                component: plane.data.component,
                head: plane.data.head,
                width: plane.data.width,
                height: plane.data.height,
            };

            all.set(
                path,
                registeredPlane,
            );
        }

        return all;
    }
}
// #endregion module



// #region exports
export default PluridPlanesRegistrar;
// #endregion exports
