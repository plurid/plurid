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
/**
 * The planes registrar can be stored in-memory (server-side)
 * or on the `window.__pluridPlanesRegistrar__` object (browser-side).
 */
class PluridPlanesRegistrar<C> implements IPluridPlanesRegistrar<C> {
    private isoMatcher: IsoMatcher<C>;


    constructor(
        planes?: PluridPlane<C>[],
        origin = 'origin',
    ) {
        this.isoMatcher = new IsoMatcher(
            {
                planes,
            },
            origin,
        );
    }


    public register(
        planes: PluridPlane<C>[],
    ) {
        this.isoMatcher.index({
            planes,
        });
    }

    public identify() {
        const planes = this.isoMatcher.getPlanesIndex();
        return [...planes.keys()];
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
            };

            return registeredPlane;
        }

        return;
    }

    public getAll() {
        const planes = this.isoMatcher.getPlanesIndex();
        const all = new Map();

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
