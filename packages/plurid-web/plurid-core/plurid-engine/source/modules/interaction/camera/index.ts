// #region exports
// Type-only re-exports, explicit: an `export *` here made the declaration bundle re-export these as
// VALUES inside the `camera` namespace (`typeof CameraDelta`), breaking consumers that check libraries.
export type {
    Mat4,
    WorldBox,
    Projected,
    PlaneBasis,
    PlaneGeometry,
    PlanePick,
} from './types';
export * from './state';
export * from './matrix';
export * from './delta';
export * from './legacy';
export * from './project';
export * from './frame';
export * from './dock';
export * from './motion';
// #endregion exports
