// #region imports
    // #region external
    import {
        PluridPlanesRegistrar,
    } from '../registrar';
    // #endregion external
// #endregion imports



// #region module
export type PluridalWindow = typeof window & {
    __pluridPlanesRegistrar__: PluridPlanesRegistrar;
}
// #endregion module
