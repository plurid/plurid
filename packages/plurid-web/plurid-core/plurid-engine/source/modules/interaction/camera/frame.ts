// #region imports
    // #region internal
    import type {
        CameraState,
        CameraLimits,
        ViewSize,
        Vec3,
        WorldBox,
        PlaneGeometry,
    } from './types';

    import {
        DEFAULT_CAMERA_LIMITS,
        clampCamera,
        clampNumber,
        normalizeYaw,
    } from './state';

    import {
        cameraMatrix,
        viewCenter,
    } from './matrix';

    import {
        projectWithMatrix,
        planeCorners,
        planeCenter,
        boxCenter,
        boxCorners,
        pointsBounds,
        worldBounds,
        WorldBoundsOptions,
    } from './project';
    // #endregion internal
// #endregion imports



// #region module
export interface FrameOptions {
    /** Fraction of the view the framed content may fill. Default `0.85`. */
    margin?: number;
    /** Target orientation; defaults to the current camera's. */
    yaw?: number;
    pitch?: number;
    /** Upper bound on the framing zoom (e.g. `1` to never magnify a plane past its natural size). */
    maxScale?: number;
    minScale?: number;
    limits?: CameraLimits;
}


/**
 * Frame a set of world points: pivot at their center, no pan/dolly, the orientation requested, and
 * the largest zoom (within the limits) at which every projected point fits inside the view margin.
 * The projected extent grows monotonically with the zoom, so a bisection finds it.
 */
export const framePoints = (
    camera: CameraState,
    points: Vec3[],
    center: Vec3,
    view: ViewSize,
    options: FrameOptions = {},
): CameraState => {
    const limits = options.limits || DEFAULT_CAMERA_LIMITS;
    const margin = options.margin ?? 0.85;
    const viewMiddle = viewCenter(view);
    const halfWidth = (view.width / 2) * margin;
    const halfHeight = (view.height / 2) * margin;

    const base: CameraState = {
        ...camera,
        yaw: normalizeYaw(options.yaw ?? camera.yaw),
        pitch: clampNumber(options.pitch ?? camera.pitch, -limits.pitchLimit, limits.pitchLimit),
        pivot: { ...center },
        offset: { x: 0, y: 0, z: 0 },
    };

    const fits = (scale: number): boolean => {
        const matrix = cameraMatrix({ ...base, scale }, view);
        for (const point of points) {
            const projected = projectWithMatrix(matrix, camera.perspective, view, point);
            if (!projected.visible) {
                return false;
            }
            if (
                Math.abs(projected.x - viewMiddle.x) > halfWidth
                || Math.abs(projected.y - viewMiddle.y) > halfHeight
            ) {
                return false;
            }
        }
        return true;
    };

    let low = Math.max(limits.zoomMin, options.minScale ?? limits.zoomMin);
    let high = Math.min(limits.zoomMax, options.maxScale ?? limits.zoomMax);
    if (high < low) {
        high = low;
    }

    let scale = low;
    if (points.length === 0 || fits(high)) {
        scale = high;
    } else if (!fits(low)) {
        scale = low;
    } else {
        for (let iteration = 0; iteration < 40; iteration += 1) {
            const middle = (low + high) / 2;
            if (fits(middle)) {
                low = middle;
            } else {
                high = middle;
            }
        }
        scale = low;
    }

    return clampCamera(
        {
            ...base,
            scale,
        },
        limits,
    );
};


export const frameBounds = (
    camera: CameraState,
    box: WorldBox,
    view: ViewSize,
    options: FrameOptions = {},
): CameraState => framePoints(
    camera,
    boxCorners(box),
    boxCenter(box),
    view,
    options,
);


export interface FramePlaneOptions extends FrameOptions {
    /** Turn the camera to look at the plane face-on. Default `true`. */
    faceOn?: boolean;
}


/**
 * Frame one plane: pivot at its center; face-on (yaw = −rotateY, pitch = −rotateX) unless asked
 * otherwise; zoom capped at `maxScale` (default `1`, so a small plane is centered, not magnified).
 */
export const framePlane = (
    camera: CameraState,
    plane: PlaneGeometry,
    view: ViewSize,
    options: FramePlaneOptions = {},
): CameraState => {
    const faceOn = options.faceOn ?? true;

    return framePoints(
        camera,
        planeCorners(plane),
        planeCenter(plane),
        view,
        {
            maxScale: 1,
            ...options,
            yaw: options.yaw ?? (faceOn ? -plane.location.rotateY : camera.yaw),
            pitch: options.pitch ?? (faceOn ? -plane.location.rotateX : camera.pitch),
        },
    );
};


export interface FitAllOptions extends FrameOptions, WorldBoundsOptions {
    /** Look at the space front-on (yaw 0, pitch 0). Default `true`. */
    faceOn?: boolean;
}

interface FittablePlane {
    location: PlaneGeometry['location'];
    width?: number;
    height?: number;
    show?: boolean;
    children?: FittablePlane[];
}


/** Frame every visible plane (children included). Returns the camera unchanged for an empty space. */
export const fitAll = (
    camera: CameraState,
    planes: FittablePlane[],
    view: ViewSize,
    options: FitAllOptions = {},
): CameraState => {
    const box = worldBounds(planes, options);
    if (!box) {
        return camera;
    }

    const faceOn = options.faceOn ?? true;

    return frameBounds(
        camera,
        box,
        view,
        {
            ...options,
            yaw: options.yaw ?? (faceOn ? 0 : camera.yaw),
            pitch: options.pitch ?? (faceOn ? 0 : camera.pitch),
        },
    );
};


export {
    pointsBounds,
};
// #endregion module
