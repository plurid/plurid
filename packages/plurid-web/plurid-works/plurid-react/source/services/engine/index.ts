// #region imports
    // #region libraries
    import {
        planes,
        space,
        state,
        routing,
        general as generalEngine,
        cleanTemplate,
    } from '@plurid/plurid-engine';
    // #endregion libraries
// #endregion imports



// #region module
const {
    registerPlanes,
    getRegisteredPlanes,
    getPlanesRegistrar,
    getPluridPlaneIDByData,
    getRegisteredPlane,
    Registrar: PluridPlanesRegistrar,
} = planes;

const {
    IsoMatcher: PluridIsoMatcher,
    resolveRoute,
    computePlaneAddress,
} = routing;
// #endregion module



// #region exports
export {
    planes,
    space,
    state,
    routing,
    generalEngine,
    cleanTemplate,

    registerPlanes,
    getRegisteredPlanes,
    getPlanesRegistrar,
    getPluridPlaneIDByData,
    getRegisteredPlane,
    PluridPlanesRegistrar,

    PluridIsoMatcher,
    resolveRoute,
    computePlaneAddress,
};
// #endregion exports
