// #region imports
    // #region libraries
    import {
        PluridPlane,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,

        PluridalWindow,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import PluridPlanesRegistrar from './object';
    // #endregion internal
// #endregion imports



// #region module
const registerPlanes = (
    planes?: PluridPlane[],
    planesRegistrar?: IPluridPlanesRegistrar,
) => {
    if (!planes) {
        return;
    }

    if (planesRegistrar) {
        planesRegistrar.register(planes);
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

    return;
}


const getPlanesRegistrar = (
    planesRegistrar: IPluridPlanesRegistrar | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar;
    }

    if (window) {
        if ((window as PluridalWindow).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow).__pluridPlanesRegistrar__;
        }
    }

    return;
}


const getRegisteredPlanes = (
    planesRegistrar: IPluridPlanesRegistrar | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar.getAll();
    }

    if (window) {
        if ((window as PluridalWindow).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow).__pluridPlanesRegistrar__.getAll();
        }
    }

    return new Map();
}


const getRegisteredPlane = (
    route: string,
    planesRegistrar: IPluridPlanesRegistrar | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar.get(route);
    }

    if (window) {
        if ((window as PluridalWindow).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow).__pluridPlanesRegistrar__.get(route);
        }
    }

    return;
}
// #endregion module



// #region exports
export {
    registerPlanes,
    getPlanesRegistrar,
    getRegisteredPlanes,
    getRegisteredPlane,
};
// #endregion exports
