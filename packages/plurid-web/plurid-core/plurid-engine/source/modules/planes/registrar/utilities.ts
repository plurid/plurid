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
const registerPlanes = <C>(
    planes?: PluridPlane<C>[],
    planesRegistrar?: IPluridPlanesRegistrar<C>,
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

    if (typeof (window as PluridalWindow<C>).__pluridPlanesRegistrar__ === 'undefined') {
        const pluridPlanesRegistrar = new PluridPlanesRegistrar<C>();
        (window as PluridalWindow<C>).__pluridPlanesRegistrar__ = pluridPlanesRegistrar;
        (window as PluridalWindow<C>).__pluridPlanesRegistrar__.register(planes);
        return;
    }

    (window as PluridalWindow<C>).__pluridPlanesRegistrar__.register(planes);

    return;
}


const getPlanesRegistrar = <C>(
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar;
    }

    if (typeof window !== 'undefined') {
        if ((window as PluridalWindow<C>).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow<C>).__pluridPlanesRegistrar__;
        }
    }

    return;
}


const getRegisteredPlanes = <C>(
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar.getAll();
    }

    if (typeof window !== 'undefined') {
        if ((window as PluridalWindow<C>).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow<C>).__pluridPlanesRegistrar__.getAll();
        }
    }

    return new Map();
}


const getRegisteredPlane = <C>(
    route: string,
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
) => {
    if (planesRegistrar) {
        return planesRegistrar.get(route);
    }

    if (typeof window !== 'undefined') {
        if ((window as PluridalWindow<C>).__pluridPlanesRegistrar__ !== undefined) {
            return (window as PluridalWindow<C>).__pluridPlanesRegistrar__.get(route);
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
