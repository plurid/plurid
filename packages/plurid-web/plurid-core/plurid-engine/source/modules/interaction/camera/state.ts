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
    // no rollLimit: the horizon is free to turn all the way round (it only ever moves in first person)
    zoomMin: 0.1,
    zoomMax: 4,
    dollyLimitFraction: 0.6,
};


/** A finite number, or `undefined` (NaN, ±Infinity, a string, `null`). */
const finiteOrUndefined = (
    value: unknown,
): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);


/**
 * Camera limits from a partial (e.g. `configuration.space.navigation`), each field defaulted
 * independently — and VALID: every limit a finite number (a `pitchLimit: 'x'` made every clamp
 * NaN, and the whole matrix with it), `pitchLimit` / `dollyLimitFraction` / `rollLimit` not
 * negative, `zoomMin` above 0 and `zoomMax` not below it (an inverted range is held at `zoomMin`).
 * An invalid field takes its default; an invalid `rollLimit` is dropped (the roll is free).
 */
export const resolveCameraLimits = (
    partial?: Partial<CameraLimits> | null,
): CameraLimits => {
    const at = <K extends keyof CameraLimits>(
        key: K,
        valid: (value: number) => boolean,
    ): number | undefined => {
        const value = finiteOrUndefined(partial?.[key]);
        return value !== undefined && valid(value) ? value : undefined;
    };

    const zoomMin = at('zoomMin', (value) => value > 0) ?? DEFAULT_CAMERA_LIMITS.zoomMin;
    const zoomMax = at('zoomMax', (value) => value > 0) ?? DEFAULT_CAMERA_LIMITS.zoomMax;
    const rollLimit = at('rollLimit', (value) => value >= 0);

    return {
        pitchLimit: at('pitchLimit', (value) => value >= 0) ?? DEFAULT_CAMERA_LIMITS.pitchLimit,
        zoomMin,
        zoomMax: Math.max(zoomMin, zoomMax),
        dollyLimitFraction: at('dollyLimitFraction', (value) => value >= 0) ?? DEFAULT_CAMERA_LIMITS.dollyLimitFraction,
        ...(rollLimit !== undefined ? { rollLimit } : {}),
    };
};


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
    roll: 0,
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


/** `value` when it is a finite number, else `previous` when that is, else `identity`. */
const finiteField = (
    value: unknown,
    previous: unknown,
    identity: number,
): number => finiteOrUndefined(value) ?? finiteOrUndefined(previous) ?? identity;

/** A vector of finite parts, each part falling back like `finiteField`; the same reference when whole. */
const finiteVector = (
    value: Vec3 | undefined,
    previous: Vec3 | undefined,
): Vec3 => {
    const x = finiteField(value?.x, previous?.x, 0);
    const y = finiteField(value?.y, previous?.y, 0);
    const z = finiteField(value?.z, previous?.z, 0);
    return value && x === value.x && y === value.y && z === value.z
        ? value
        : {
            x,
            y,
            z,
        };
};

/** A perspective is a distance: a finite number above 0. */
const validPerspective = (
    value: unknown,
): number | undefined => {
    const perspective = finiteOrUndefined(value);
    return perspective !== undefined && perspective > 0 ? perspective : undefined;
};


/**
 * Enforce the camera limits: pitch clamped, yaw wrapped, scale within the zoom range, the dolly
 * kept in front of the eye. Returns the SAME reference when nothing had to change, so callers can
 * cheaply detect a no-op.
 *
 * THE COMMIT GATE LETS NO NaN THROUGH. A field that is not a finite number — a partial delta, a
 * string perspective, an interpolation at NaN — takes `fallback`'s (the camera before the change),
 * else the identity's (no turn, scale 1, the origin, `DEFAULT_PERSPECTIVE`), and the perspective
 * must be above 0. One NaN used to blank the space (`matrix3d(NaN…)`, which the browser drops) while
 * culling, docking and hit-tests computed with it, and every later delta kept it NaN.
 */
export const clampCamera = (
    camera: CameraState,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
    fallback?: CameraState,
): CameraState => {
    const safeLimits = limits === DEFAULT_CAMERA_LIMITS ? limits : resolveCameraLimits(limits);
    const perspective = validPerspective(camera.perspective)
        ?? validPerspective(fallback?.perspective)
        ?? DEFAULT_PERSPECTIVE;
    const pivot = finiteVector(camera.pivot, fallback?.pivot);
    const offset = finiteVector(camera.offset, fallback?.offset);

    const pitch = clampNumber(finiteField(camera.pitch, fallback?.pitch, 0), -safeLimits.pitchLimit, safeLimits.pitchLimit);
    const yaw = normalizeYaw(finiteField(camera.yaw, fallback?.yaw, 0));
    // the horizon wraps like the yaw; a `rollLimit` holds it near level (0 forbids the tilt)
    const wrappedRoll = normalizeYaw(finiteField(camera.roll, fallback?.roll, 0));
    const roll = safeLimits.rollLimit === undefined
        ? wrappedRoll
        : clampNumber(wrappedRoll, -safeLimits.rollLimit, safeLimits.rollLimit);
    const scale = clampNumber(finiteField(camera.scale, fallback?.scale, 1), safeLimits.zoomMin, safeLimits.zoomMax);
    const dollyMax = perspective * safeLimits.dollyLimitFraction;
    const dollyMin = -perspective * 8;
    const offsetZ = clampNumber(offset.z, dollyMin, dollyMax);

    if (
        pitch === camera.pitch
        && yaw === camera.yaw
        && roll === camera.roll
        && scale === camera.scale
        && perspective === camera.perspective
        && pivot === camera.pivot
        && offset === camera.offset
        && offsetZ === camera.offset.z
    ) {
        return camera;
    }

    return {
        ...camera,
        pitch,
        yaw,
        roll,
        scale,
        perspective,
        pivot,
        offset: offsetZ === offset.z
            ? offset
            : {
                ...offset,
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
        && near(a.roll, b.roll, epsilon)
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
        // a camera persisted before the horizon could tilt has no roll: it reads as level
        && (camera.roll === undefined || Number.isFinite(camera.roll))
        && Number.isFinite(camera.scale)
        && (camera.scale as number) > 0
        && Number.isFinite(camera.perspective)
        && (camera.perspective as number) > 0
        && isVec(camera.pivot)
        && isVec(camera.offset);
};
// #endregion module
