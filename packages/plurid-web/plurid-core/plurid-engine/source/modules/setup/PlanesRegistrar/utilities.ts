// #region imports
    // #region libraries
    import {
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import PluridPlanesRegistrar from './object';

    import {
        PluridalWindow,
    } from './interfaces';
    // #endregion internal
// #endregion imports



// #region module
const registerPlanes = (
    planes?: PluridPlane[],
) => {
    if (!planes) {
        return;
    }

    if (typeof window === 'undefined') {
        return;
    }

    if (typeof (window as PluridalWindow).__pluridPlanesRegistrar__ === 'undefined') {
        const pluridPlanesRegistrar = new PluridPlanesRegistrar();
        (window as PluridalWindow).__pluridPlanesRegistrar__ = pluridPlanesRegistrar;
        (window as PluridalWindow).__pluridPlanesRegistrar__.register(planes);
        return;
    }

    (window as PluridalWindow).__pluridPlanesRegistrar__.register(planes);
}
// #endregion module



// #region exports
export {
    registerPlanes,
};
// #endregion exports
