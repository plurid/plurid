// #region imports
    // #region external
    import {
        PluridPlane,
        RegisteredPluridPlane,
    } from '../plane';
    // #endregion external
// #endregion imports



// #region module
export interface PluridPlanesRegistrar {
    register(
        planes: PluridPlane[],
    ): void;

    identify(): string[];

    get(
        route: string,
    ): RegisteredPluridPlane | undefined;

    getAll(): Map<string, RegisteredPluridPlane>;
}
// #endregion module
