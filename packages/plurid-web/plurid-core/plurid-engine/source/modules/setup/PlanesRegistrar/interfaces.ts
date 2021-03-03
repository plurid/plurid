// #region imports
    // #region internal
    import PluridPlanesRegistrar from './object';
    // #endregion internal
// #endregion imports



// #region module
export type PluridalWindow = typeof window & {
    __pluridPlanesRegistrar__: PluridPlanesRegistrar;
}
// #endregion module
