// #region imports
    // #region libraries
    import {
        PluridPlane,
        RegisteredPluridPlane,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import * as router from '../router';
    // #endregion external
// #endregion imports



// #region module
class PluridPlanesRegistrar implements IPluridPlanesRegistrar {
    // TODO
    // Store the planes in a better data structure.
    private planes: Map<string, RegisteredPluridPlane> = new Map();

    public register(
        planes: PluridPlane[],
    ) {
        for (const plane of planes) {
            // loop over PluridPlanes and generate the Fully Qualified Route
            // given the FQR
            // store the component in an index by route

            const {
                component,
                route,
            } = plane;

            const {
                kind,
                element,
                properties,
            } = component;

            // obtain from path the absolute route
            // /plane -> Fully Qualified Route
            const resolvedRoute = router.resolveRoute(
                route,
                'http',
                'localhost',
            );
            // console.log('resolvedRoute', resolvedRoute);

            const {
                protocol,
                host,
                path: routePath,
                space,
                universe,
                cluster,
                plane: planePath,
                route: absoluteRoute,
            } = resolvedRoute;

            const registeredPluridPlane: RegisteredPluridPlane = {
                component,
                route: {
                    protocol: {},
                    host: {},
                    path: {},
                    space: {},
                    universe: {},
                    cluster: {},
                    plane: {},
                    absolute: absoluteRoute,
                },
            };

            this.planes.set(
                absoluteRoute,
                registeredPluridPlane,
            );
        }
    }

    public get(
        route: string,
    ) {
        // TODO
        // Account for parametric, constrained routes.
        return this.planes.get(route);
    }

    public getAll() {
        return this.planes;
    }
}
// #endregion module



// #region exports
export default PluridPlanesRegistrar;
// #endregion exports
