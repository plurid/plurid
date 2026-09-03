// #region imports
    // #region internal
    import type {
        CameraState,
        CameraLimits,
        Vec3,
        ViewSize,
    } from './types';

    import {
        viewCenter,
    } from './matrix';
    // #endregion internal
// #endregion imports



// #region module
export const DEFAULT_PERSPECTIVE = 2000;

export const DEFAULT_CAMERA_LIMITS: CameraLimits = {
    pitchLimit: 89,
    zoomMin: 0.1,
    zoomMax: 4,
    dollyLimitFraction: 0.6,
};


/** Camera limits from a partial (e.g. `configuration.space.navigation`), each field defaulted independently. */
export const resolveCameraLimits = (
    partial?: Partial<CameraLimits> | null,
): CameraLimits => ({
    pitchLimit: partial?.pitchLimit ?? DEFAULT_CAMERA_LIMITS.pitchLimit,
    zoomMin: partial?.zoomMin ?? DEFAULT_CAMERA_LIMITS.zoomMin,
    zoomMax: partial?.zoomMax ?? DEFAULT_CAMERA_LIMITS.zoomMax,
    dollyLimitFraction: partial?.dollyLimitFraction ?? DEFAULT_CAMERA_LIMITS.dollyLimitFraction,
});


export const vec3 = (
    x = 0,
    y = 0,
    z = 0,
): Vec3 => ({
    x,
    y,
    z,
});


export const createCamera = (
    perspective: number = DEFAULT_PERSPECTIVE,
    partial?: Partial<CameraState>,
): CameraState => ({
    yaw: 0,
    pitch: 0,
    scale: 1,
    pivot: vec3(),
    offset: vec3(),
    perspective,
    ...partial,
});


/**
 * The camera that renders the identity matrix for a given view: no rotation, unit zoom, the pivot
 * at the world point under the view center. This is the "home" camera of a fresh space.
 */
export const identityCamera = (
    view: ViewSize,
    perspective: number = DEFAULT_PERSPECTIVE,
): CameraState => createCamera(perspective, {
    pivot: viewCenter(view),
});


/** Wrap an angle to (-180, 180]. */
export const normalizeYaw = (
    yaw: number,
): number => {
    if (!Number.isFinite(yaw)) {
        return 0;
    }

    let value = yaw % 360;
    if (value > 180) {
        value -= 360;
    } else if (value <= -180) {
        value += 360;
    }

    // Avoid a `-0` leaking into serialized viewpoints.
    return value === 0 ? 0 : value;
};


export const clampNumber = (
    value: number,
    min: number,
    max: number,
): number => Math.min(Math.max(value, min), max);


/**
 * Enforce the camera limits: pitch clamped, yaw wrapped, scale within the zoom range, the dolly
 * kept in front of the eye. Returns the SAME reference when nothing had to change, so callers can
 * cheaply detect a no-op.
 */
export const clampCamera = (
    camera: CameraState,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => {
    const pitch = clampNumber(camera.pitch, -limits.pitchLimit, limits.pitchLimit);
    const yaw = normalizeYaw(camera.yaw);
    const scale = clampNumber(camera.scale, limits.zoomMin, limits.zoomMax);
    const dollyMax = camera.perspective * limits.dollyLimitFraction;
    const dollyMin = -camera.perspective * 8;
    const offsetZ = clampNumber(camera.offset.z, dollyMin, dollyMax);

    if (
        pitch === camera.pitch
        && yaw === camera.yaw
        && scale === camera.scale
        && offsetZ === camera.offset.z
    ) {
        return camera;
    }

    return {
        ...camera,
        pitch,
        yaw,
        scale,
        offset: offsetZ === camera.offset.z
            ? camera.offset
            : {
                ...camera.offset,
                z: offsetZ,
            },
    };
};


const near = (
    a: number,
    b: number,
    epsilon: number,
): boolean => Math.abs(a - b) <= epsilon;


export const sameCamera = (
    a: CameraState,
    b: CameraState,
    epsilon = 0,
): boolean => (
    a === b
    || (
        near(a.yaw, b.yaw, epsilon)
        && near(a.pitch, b.pitch, epsilon)
        && near(a.scale, b.scale, epsilon)
        && near(a.perspective, b.perspective, epsilon)
        && near(a.pivot.x, b.pivot.x, epsilon)
        && near(a.pivot.y, b.pivot.y, epsilon)
        && near(a.pivot.z, b.pivot.z, epsilon)
        && near(a.offset.x, b.offset.x, epsilon)
        && near(a.offset.y, b.offset.y, epsilon)
        && near(a.offset.z, b.offset.z, epsilon)
    )
);


/** Defensive read of a possibly-partial persisted camera; anything malformed falls back. */
export const isCameraState = (
    value: unknown,
): value is CameraState => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const camera = value as Record<string, unknown>;
    const isVec = (v: unknown) => !!v
        && typeof v === 'object'
        && Number.isFinite((v as Vec3).x)
        && Number.isFinite((v as Vec3).y)
        && Number.isFinite((v as Vec3).z);

    return Number.isFinite(camera.yaw)
        && Number.isFinite(camera.pitch)
        && Number.isFinite(camera.scale)
        && (camera.scale as number) > 0
        && Number.isFinite(camera.perspective)
        && (camera.perspective as number) > 0
        && isVec(camera.pivot)
        && isVec(camera.offset);
};
// #endregion module
