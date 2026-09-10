// #region imports
    // #region internal
    import {
        computeViewTree,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export {
    computeViewTree,
};
// #endregion module

export {
    cullPlanes,
    sameCulling,
    DEFAULT_CULLING,
    EMPTY_CULLING,
    DEFAULT_DETACH_DELAY,
    resolveDetachOptions,
    resolveDetached,
} from './culling';
export type {
    CullingPlane,
    CullingOptions,
    CullPassResult,
    CullingResult,
    DetachOptions,
    DetachInput,
    DetachResult,
} from './culling';
