// #region imports
    // #region libraries
    import {
        interaction,
        planes,
        space,
        state,
        routing,
        general as generalEngine,
        utilities,
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
    resolvePluridRoutePlaneData,
    resolvePluridPlaneData,
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
    interaction,
    planes,
    space,
    state,
    routing,
    generalEngine,
    utilities,
    cleanTemplate,

    registerPlanes,
    getRegisteredPlanes,
    getPlanesRegistrar,
    getPluridPlaneIDByData,
    getRegisteredPlane,
    resolvePluridRoutePlaneData,
    resolvePluridPlaneData,
    PluridPlanesRegistrar,

    PluridIsoMatcher,
    resolveRoute,
    computePlaneAddress,
};
// #endregion exports
