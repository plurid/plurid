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
    /** Add `planes` to what is registered (a route registered again is replaced). */
    register(
        planes: PluridPlane<C>[],
    ): void;

    /**
     * Register exactly `planes`: every route not among them stops resolving. Optional, so a host's
     * own registrar stays valid; the engine's rebuilds its index.
     */
    replace?(
        planes: PluridPlane<C>[],
    ): void;

    /** Forget the plane registered at `route` (as it was registered); `false` when none was. Optional. */
    unregister?(
        route: string,
    ): boolean;

    identify(): string[];

    get(
        route: string,
    ): RegisteredPluridPlane<C> | undefined;

    getAll(): Map<string, RegisteredPluridPlane<C>>;
}
// #endregion module
