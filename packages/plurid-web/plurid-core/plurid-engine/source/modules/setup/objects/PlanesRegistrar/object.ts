// #region imports
    // #region libraries
    import {
        PluridPlane,
        RegisteredPluridPlane,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import * as router from '../../router';

    import {
        resolvePluridPlaneData,
    } from '../../general/planes';
    // #endregion external
// #endregion imports



// #region module
/**
 * The planes registrar can be stored in-memory (server-side)
 * or on the `window.__pluridPlanesRegistrar__` object (browser-side).
 */
class PluridPlanesRegistrar<C> implements IPluridPlanesRegistrar<C> {
    // TODO
    // Store the planes in a better data structure.
    private planes: Map<string, RegisteredPluridPlane<C>> = new Map();

    private isoMatcher: router.IsoMatcher<C>;


    constructor(
        planes?: PluridPlane<C>[],
    ) {
        const isoMatcher = new router.IsoMatcher({
            planes,
        });
        this.isoMatcher = isoMatcher;

        // if (planes) {
        //     this.register(planes);
        // }
    }


    public register(
        planes: PluridPlane<C>[],
    ) {
        this.isoMatcher.index({
            planes,
        });

        // for (const plane of planes) {
        //     // loop over PluridPlanes and generate the Fully Qualified Route
        //     // given the FQR
        //     // store the component in an index by route

        //     const planeData = resolvePluridPlaneData(plane);
        //     const {
        //         route,
        //         component,
        //     } = planeData;

        //     // obtain from path the absolute route
        //     // /plane -> Fully Qualified Route
        //     const resolvedRoute = router.resolveRoute(
        //         route,
        //         'http',
        //         'localhost',
        //     );
        //     // console.log('resolvedRoute', resolvedRoute);

        //     const {
        //         protocol,
        //         host,
        //         path: routePath,
        //         space,
        //         universe,
        //         cluster,
        //         plane: planePath,
        //         route: absoluteRoute,
        //     } = resolvedRoute;

        //     const registeredPluridPlane: RegisteredPluridPlane<C> = {
        //         component,
        //         route: {
        //             protocol: {},
        //             host: {},
        //             path: {},
        //             space: {},
        //             universe: {},
        //             cluster: {},
        //             plane: {},
        //             absolute: absoluteRoute,
        //         },
        //     };

        //     this.planes.set(
        //         absoluteRoute,
        //         registeredPluridPlane,
        //     );
        // }
    }

    public identify() {
        const planes = this.isoMatcher.getPlanesIndex();
        const keys = planes.keys();

        const ids: string[] = [];
        for (const id of keys) {
            ids.push(id);
        }
        return ids;

        // if (this.planes.size === 0) {
        //     return [];
        // }

        // const ids: string[] = [];
        // for (const [id, _] of this.planes) {
        //     ids.push(id);
        // }

        // return ids;
    }

    public get(
        route: string,
    ) {
        const match = this.isoMatcher.match(route);
        // console.log('match', match, route);

        if (match) {
            const registeredPlane: RegisteredPluridPlane<C> = {
                route: (match.data as any).route || (match.data as any).value || '',
                component: match.data.component,
            };

            return registeredPlane;
        }

        return;

        // // TODO
        // // Account for parametric, constrained routes.
        // return this.planes.get(route);
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
                },
                component: plane.data.component,
            };

            all.set(
                path,
                registeredPlane,
            );
        }

        // return this.planes;
        return all;
    }
}
// #endregion module



// #region exports
export default PluridPlanesRegistrar;
// #endregion exports
