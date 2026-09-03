// #region imports
    // #region libraries
    import type {
        Vec2,
        Vec3,
        CameraState,
        CameraLimits,
        CameraDelta,
        CameraMotion,
        ViewSize,
        SpaceTransform,
        TreePlaneLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** A column-major 4x4 matrix, 16 entries (the layout `matrix3d(...)` consumes). */
export type Mat4 = number[];


/** Axis-aligned world-space box. */
export interface WorldBox {
    min: Vec3;
    max: Vec3;
}


/** A world point projected onto the view. */
export interface Projected {
    /** View px. `NaN` when the point is at or behind the eye. */
    x: number;
    y: number;
    /** Camera-space depth (positive = toward the eye). */
    cameraZ: number;
    /** False when the point is at or behind the eye. */
    visible: boolean;
}


/** The world-space frame of a plane: its top-left origin + unit axes. */
export interface PlaneBasis {
    origin: Vec3;
    /** Unit vector along the plane's width. */
    u: Vec3;
    /** Unit vector along the plane's height. */
    v: Vec3;
    /** Unit normal (the plane's local +Z, toward the viewer when face-on). */
    normal: Vec3;
}


/** The minimum a framing/picking helper needs to know about a plane. */
export interface PlaneGeometry {
    location: TreePlaneLocation;
    width: number;
    height: number;
}


export interface PlanePick {
    /** World point where the ray meets the plane. */
    world: Vec3;
    /** Plane-local coordinates in px from the top-left corner. */
    local: Vec2;
    /** Camera-space depth of the hit. */
    cameraZ: number;
    /** Whether the hit lies within the plane rectangle. */
    inside: boolean;
}


export type {
    Vec2,
    Vec3,
    CameraState,
    CameraLimits,
    CameraDelta,
    CameraMotion,
    ViewSize,
    SpaceTransform,
    TreePlaneLocation,
};
// #endregion module
