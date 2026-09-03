// #region imports
    // #region internal
    import type {
        CameraState,
        CameraLimits,
        CameraDelta,
        ViewSize,
        Vec2,
        Vec3,
    } from './types';

    import {
        DEFAULT_CAMERA_LIMITS,
        clampCamera,
        clampNumber,
    } from './state';

    import {
        cameraRotation,
        cameraInverse,
        viewCenter,
        transformPoint,
        transformDirection,
    } from './matrix';
    // #endregion internal
// #endregion imports



// #region module
/** The eye in camera space: straight in front of the view center at the perspective distance. */
export const eyeCamera = (
    camera: CameraState,
    view: ViewSize,
): Vec3 => {
    const center = viewCenter(view);

    return {
        x: center.x,
        y: center.y,
        z: camera.perspective,
    };
};


/** The eye in world space. */
export const eyeWorld = (
    camera: CameraState,
    view: ViewSize,
): Vec3 => transformPoint(
    cameraInverse(camera, view),
    eyeCamera(camera, view),
);


/**
 * Re-parameterize the camera about a new world pivot WITHOUT moving the picture:
 * `offset' = offset + R · scale · (pivot' − pivot)`. Lossless, so "orbit about the point under the
 * cursor" is simply `setPivot` followed by an orbit.
 */
export const setPivot = (
    camera: CameraState,
    pivot: Vec3,
    _view?: ViewSize,
): CameraState => {
    if (
        pivot.x === camera.pivot.x
        && pivot.y === camera.pivot.y
        && pivot.z === camera.pivot.z
    ) {
        return camera;
    }

    const rotation = cameraRotation(camera.pitch, camera.yaw);
    const delta = transformDirection(rotation, {
        x: (pivot.x - camera.pivot.x) * camera.scale,
        y: (pivot.y - camera.pivot.y) * camera.scale,
        z: (pivot.z - camera.pivot.z) * camera.scale,
    });

    return {
        ...camera,
        pivot: {
            x: pivot.x,
            y: pivot.y,
            z: pivot.z,
        },
        offset: {
            x: camera.offset.x + delta.x,
            y: camera.offset.y + delta.y,
            z: camera.offset.z + delta.z,
        },
    };
};


/**
 * Perspective factor at the pivot depth: how many camera-space px one screen px is worth on the
 * plane through the pivot. `1` when the pivot sits on the view plane.
 */
export const pivotDepthFactor = (
    camera: CameraState,
): number => {
    const denominator = camera.perspective - camera.offset.z;
    if (denominator <= 0) {
        return 1;
    }

    return denominator / camera.perspective;
};


/**
 * Multiplicative zoom that keeps the content under `anchor` (view px) fixed — exact for everything
 * on the plane through the pivot, at any orientation. The one zoom used by wheel, pinch, drag, keys.
 */
export const zoomAt = (
    camera: CameraState,
    anchor: Vec2,
    factor: number,
    view: ViewSize,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => {
    if (!Number.isFinite(factor) || factor <= 0) {
        return camera;
    }

    const nextScale = clampNumber(camera.scale * factor, limits.zoomMin, limits.zoomMax);
    const applied = nextScale / camera.scale;
    if (applied === 1) {
        return camera;
    }

    const center = viewCenter(view);
    const depth = pivotDepthFactor(camera);
    const anchorX = (anchor.x - center.x) * depth;
    const anchorY = (anchor.y - center.y) * depth;

    return {
        ...camera,
        scale: nextScale,
        offset: {
            x: (1 - applied) * anchorX + applied * camera.offset.x,
            y: (1 - applied) * anchorY + applied * camera.offset.y,
            z: camera.offset.z,
        },
    };
};


/** Screen-space pan: the content on the pivot-depth plane follows the pointer exactly. */
export const panBy = (
    camera: CameraState,
    pan: Vec2,
): CameraState => {
    if (pan.x === 0 && pan.y === 0) {
        return camera;
    }

    const depth = pivotDepthFactor(camera);

    return {
        ...camera,
        offset: {
            x: camera.offset.x + pan.x * depth,
            y: camera.offset.y + pan.y * depth,
            z: camera.offset.z,
        },
    };
};


export const orbitBy = (
    camera: CameraState,
    yaw: number,
    pitch: number,
): CameraState => {
    if (yaw === 0 && pitch === 0) {
        return camera;
    }

    return {
        ...camera,
        yaw: camera.yaw + yaw,
        pitch: camera.pitch + pitch,
    };
};


/** Rotate about the eye (first-person look) and keep the original pivot point afterwards. */
export const lookBy = (
    camera: CameraState,
    yaw: number,
    pitch: number,
    view: ViewSize,
): CameraState => {
    if (yaw === 0 && pitch === 0) {
        return camera;
    }

    const eye = eyeWorld(camera, view);
    const aboutEye = setPivot(camera, eye);
    const turned = orbitBy(aboutEye, yaw, pitch);

    return setPivot(turned, camera.pivot);
};


/**
 * Camera-relative movement in camera-space px: forward along the view axis (respects pitch),
 * strafe to the right, vertical up.
 */
export const flyBy = (
    camera: CameraState,
    forward = 0,
    strafe = 0,
    vertical = 0,
): CameraState => {
    if (forward === 0 && strafe === 0 && vertical === 0) {
        return camera;
    }

    return {
        ...camera,
        offset: {
            x: camera.offset.x - strafe,
            y: camera.offset.y + vertical,
            z: camera.offset.z + forward,
        },
    };
};


export const dollyBy = (
    camera: CameraState,
    dolly: number,
): CameraState => {
    if (dolly === 0) {
        return camera;
    }

    return {
        ...camera,
        offset: {
            ...camera.offset,
            z: camera.offset.z + dolly,
        },
    };
};


/**
 * Apply one camera delta. Field order: pivot → look → orbit → pan → dolly → fly → zoom → absolute,
 * then the limits. Returns the same reference when the delta changes nothing.
 */
export const applyCameraDelta = (
    camera: CameraState,
    delta: CameraDelta,
    view: ViewSize,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => {
    let next = camera;

    if (delta.pivot) {
        next = setPivot(next, delta.pivot);
    }

    if (delta.look) {
        next = lookBy(next, delta.look.yaw || 0, delta.look.pitch || 0, view);
    }

    if (delta.yaw || delta.pitch) {
        next = orbitBy(next, delta.yaw || 0, delta.pitch || 0);
    }

    if (delta.pan) {
        next = panBy(next, delta.pan);
    }

    if (delta.dolly) {
        next = dollyBy(next, delta.dolly);
    }

    if (delta.fly) {
        next = flyBy(next, delta.fly.forward || 0, delta.fly.strafe || 0, delta.fly.vertical || 0);
    }

    if (delta.zoom) {
        next = zoomAt(
            next,
            delta.zoom.anchor || viewCenter(view),
            delta.zoom.factor,
            view,
            limits,
        );
    }

    if (delta.absolute) {
        const absolute = delta.absolute;
        next = {
            ...next,
            ...(absolute.yaw !== undefined ? { yaw: absolute.yaw } : {}),
            ...(absolute.pitch !== undefined ? { pitch: absolute.pitch } : {}),
            ...(absolute.scale !== undefined ? { scale: absolute.scale } : {}),
            ...(absolute.perspective !== undefined ? { perspective: absolute.perspective } : {}),
            ...(absolute.pivot ? { pivot: { ...absolute.pivot } } : {}),
            ...(absolute.offset ? { offset: { ...absolute.offset } } : {}),
        };
    }

    return clampCamera(next, limits);
};
// #endregion module
