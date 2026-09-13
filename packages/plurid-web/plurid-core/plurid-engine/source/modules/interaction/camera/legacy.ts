// #region imports
    // #region internal
    import type {
        CameraState,
        CameraLimits,
        SpaceTransform,
        ViewSize,
    } from './types';

    import {
        DEFAULT_CAMERA_LIMITS,
        DEFAULT_PERSPECTIVE,
        clampCamera,
        normalizeYaw,
    } from './state';

    import {
        cameraRotation,
        viewCenter,
        transformDirectionTransposed,
    } from './matrix';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The legacy six scalars are an exact alternative parameterization of the camera, with the pivot
 * implicitly at the view center. Both directions preserve the rendered matrix:
 *
 *   toLegacy:   rotationX = pitch, rotationY = yaw, t = Rᵀ·offset + C − scale·pivot
 *   fromLegacy: offset = 0, pivot = (C − t) / scale
 *
 * THE MIRROR IS LOSSY IN ONE PLACE: six scalars have no third angle, so a ROLLED camera's legacy
 * rotationX/Y are its unrolled shadow (the translation is exact — it un-rotates by the full
 * rotation, roll included). Nothing in the engine reads the scalars back to move the camera; they
 * are a compatibility mirror, and `transform` (the matrix) carries the roll. A camera can only be
 * rolled in first person or by a host's own delta, so the ordinary space never meets this.
 */
export const toLegacy = (
    camera: CameraState,
    view: ViewSize,
): SpaceTransform => {
    const center = viewCenter(view);
    const rotation = cameraRotation(camera.pitch, camera.yaw, camera.roll);
    const unrotated = transformDirectionTransposed(rotation, camera.offset);

    return {
        rotationX: camera.pitch,
        rotationY: camera.yaw,
        translationX: unrotated.x + center.x - camera.scale * camera.pivot.x,
        translationY: unrotated.y + center.y - camera.scale * camera.pivot.y,
        translationZ: unrotated.z + center.z - camera.scale * camera.pivot.z,
        scale: camera.scale,
    };
};


export const fromLegacy = (
    transform: SpaceTransform,
    view: ViewSize,
    perspective: number = DEFAULT_PERSPECTIVE,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => {
    const center = viewCenter(view);
    const scale = transform.scale > 0 && Number.isFinite(transform.scale)
        ? transform.scale
        : 1;

    return clampCamera(
        {
            yaw: normalizeYaw(transform.rotationY),
            pitch: transform.rotationX,
            // six scalars carry no horizon: a camera read back from them is level
            roll: 0,
            scale,
            pivot: {
                x: (center.x - transform.translationX) / scale,
                y: (center.y - transform.translationY) / scale,
                z: (center.z - transform.translationZ) / scale,
            },
            offset: {
                x: 0,
                y: 0,
                z: 0,
            },
            perspective,
        },
        limits,
    );
};
// #endregion module
