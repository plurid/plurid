// #region imports
    // #region external
    import {
        PluridPlane,
        RegisteredPluridPlane,
    } from '../plane';
    // #endregion external
// #endregion imports



// #region module
export interface PluridPlanesRegistrar<C> {
    register(
        planes: PluridPlane<C>[],
    ): void;

    identify(): string[];

    get(
        route: string,
    ): RegisteredPluridPlane<C> | undefined;

    getAll(): Map<string, RegisteredPluridPlane<C>>;
}
// #endregion module
