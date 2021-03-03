// #region imports
    // #region libraries
    import {
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
class PluridPlanesRegistrar {
    // TODO
    // Store the planes in a better data structure.
    private planes: Map<string, PluridPlane> = new Map();

    public register(
        planes: PluridPlane[],
    ) {
        for (const plane of planes) {
            this.planes.set(
                plane.route,
                plane,
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
}
// #endregion module



// #region exports
export default PluridPlanesRegistrar;
// #endregion exports
