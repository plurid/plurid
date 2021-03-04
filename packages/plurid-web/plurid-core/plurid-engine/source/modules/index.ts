// #region imports
    // #region internal
    import * as direction from './interaction/direction';
    import internatiolate from './setup/internationalization';
    import * as general from './setup/general';
    import * as matrix from './interaction/mathematics/matrix';
    import * as quaternion from './interaction/mathematics/quaternion';
    import * as router from './setup/router';
    import * as transform from './interaction/mathematics/transform';
    import * as space from './setup/space';
    import * as state from './setup/state';
    import * as utilities from './utilities';
    // #endregion internal
// #endregion imports



// #region module
export {
    direction,
    internatiolate,
    general,
    matrix,
    quaternion,
    router,
    transform,
    space,
    state,
    utilities,
};

export * from './setup/PlanesRegistrar';
// #endregion module
