// #region imports
    // #region internal
    import {
        computePath,
    } from './logic';

    import {
        childLocation,
        resolvePlaneAngle,
        resolveBridgeSide,
        recomputeSubtree,
        recomputeTree,
        planeDepth,
        DEFAULT_BRIDGE_LENGTH,
        DEFAULT_PLANE_ANGLE,
    } from './child';
    import type {
        PlaneFan,
        PlaneFanDirection,
        BridgeSide,
    } from './child';
    // #endregion internal
// #endregion imports



// #region exports
export type {
    PlaneFan,
    PlaneFanDirection,
    BridgeSide,
};

export {
    computePath,

    childLocation,
    resolvePlaneAngle,
    resolveBridgeSide,
    recomputeSubtree,
    recomputeTree,
    planeDepth,
    DEFAULT_BRIDGE_LENGTH,
    DEFAULT_PLANE_ANGLE,
};
// #endregion exports
