// #region imports
    // #region internal
    import type {
        CameraState,
        CameraLimits,
        ViewSize,
        PlaneGeometry,
    } from './types';
    import {
        DEFAULT_CAMERA_LIMITS,
        clampCamera,
        normalizeYaw,
    } from './state';
    import {
        cameraMatrix,
        viewCenter,
    } from './matrix';
    import {
        projectWithMatrix,
        planeBasis,
        planeCenter,
    } from './project';
    // #endregion internal
// #endregion imports



// #region module
/**
 * DOCKING — the page presentation's derived state. A camera is docked on a plane when it shows
 * that plane face-on at scale 1 with the plane's box exactly on the view: `pitch = −rotateX`,
 * `yaw = −rotateY`, `scale 1`, `offset 0`, the pivot at the plane's center, so a view-sized plane
 * maps 1 : 1 to view pixels (depth 0, perspective factor 1). The identity camera of a fresh space
 * IS the dock pose of a view-sized root at the origin. "Docked" is read off the picture, never
 * off the parameters: a zoom about the cursor or a cursor pivot re-parameterize `pivot` / `offset`
 * losslessly, so two cameras with different pivots can render the same page.
 */

/** A tree node as the dock functions read it (a root or a spawned child). */
export interface DockablePlane {
    planeID: string;
    location: PlaneGeometry['location'];
    width?: number;
    height?: number;
    /** `declared` / `manual` sizes are the plane's own; a `measured` size observes the configured one */
    sizeMode?: 'measured' | 'manual' | 'declared';
    show?: boolean;
    children?: DockablePlane[];
}

/** The CONFIGURED plane size (`elements.plane.width` / `height` resolved against the view; 0 = content-driven). */
export interface DockFallbackSize {
    width: number;
    height: number;
}

/**
 * The box a plane docks by. A declared or manual size is the plane's own. A measured size is only an
 * OBSERVATION of the configured size — it lags a frame behind a view resize and starts at 0 — so a
 * configured dimension wins over it whenever there is one; the measurement stands in where the
 * configuration leaves a dimension to the content.
 */
export const dockGeometry = (
    plane: DockablePlane,
    configured: DockFallbackSize,
): PlaneGeometry => {
    const own = plane.sizeMode === 'declared' || plane.sizeMode === 'manual';
    return {
        location: plane.location,
        width: own ? (plane.width || configured.width) : (configured.width || plane.width || 0),
        height: own ? (plane.height || configured.height) : (configured.height || plane.height || 0),
    };
};

/** The camera that docks on `plane`: face-on, unit scale, the plane's center under the view center. */
export const dockPose = (
    camera: CameraState,
    plane: PlaneGeometry,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => clampCamera(
    {
        ...camera,
        yaw: normalizeYaw(-plane.location.rotateY),
        // `0 - x`, not `-x`: a face-on plane must dock at +0 (a `-0` leaks into serialized viewpoints)
        pitch: 0 - plane.location.rotateX,
        scale: 1,
        pivot: planeCenter(plane),
        offset: { x: 0, y: 0, z: 0 },
    },
    limits,
);

const angleDistance = (
    a: number,
    b: number,
): number => Math.abs(normalizeYaw(a - b));

/**
 * Whether `camera` is docked on `plane` for this view: unit scale and the face-on angles (within
 * 1e-3), then the plane's top-left and bottom-right corners projected onto the view's own corners
 * within `epsilon` px. The scalar checks come first so an orbit or a zoom exits on the first line.
 */
export const isDocked = (
    camera: CameraState,
    plane: PlaneGeometry,
    view: ViewSize,
    epsilon = 0.5,
): boolean => {
    if (Math.abs(camera.scale - 1) > 1e-3) {
        return false;
    }
    if (angleDistance(camera.yaw, -plane.location.rotateY) > 1e-3) {
        return false;
    }
    if (Math.abs(camera.pitch + plane.location.rotateX) > 1e-3) {
        return false;
    }
    const basis = planeBasis(plane.location);
    const topLeft = basis.origin;
    const bottomRight = {
        x: basis.origin.x + basis.u.x * plane.width + basis.v.x * plane.height,
        y: basis.origin.y + basis.u.y * plane.width + basis.v.y * plane.height,
        z: basis.origin.z + basis.u.z * plane.width + basis.v.z * plane.height,
    };
    const matrix = cameraMatrix(camera, view);
    const a = projectWithMatrix(matrix, camera.perspective, view, topLeft);
    const b = projectWithMatrix(matrix, camera.perspective, view, bottomRight);
    return a.visible && b.visible
        && Math.abs(a.x) <= epsilon
        && Math.abs(a.y) <= epsilon
        && Math.abs(b.x - view.width) <= epsilon
        && Math.abs(b.y - view.height) <= epsilon;
};

const geometryOf = dockGeometry;

const walkShown = (
    planes: DockablePlane[],
    visit: (plane: DockablePlane) => boolean,
): boolean => {
    for (const plane of planes) {
        if (plane.show === false) {
            continue;
        }
        if (visit(plane)) {
            return true;
        }
        if (plane.children && walkShown(plane.children, visit)) {
            return true;
        }
    }
    return false;
};

/** The id of the shown plane (roots and spawned children) the camera is docked on; `''` when none. */
export const findDockedPlane = (
    camera: CameraState,
    planes: DockablePlane[],
    view: ViewSize,
    fallback: DockFallbackSize,
    epsilon = 0.5,
): string => {
    let found = '';
    walkShown(planes, (plane) => {
        if (isDocked(camera, geometryOf(plane, fallback), view, epsilon)) {
            found = plane.planeID;
            return true;
        }
        return false;
    });
    return found;
};

/** The shown plane whose projected center is nearest the view center (visible ones only); `''` when none. */
export const dockCandidate = (
    camera: CameraState,
    planes: DockablePlane[],
    view: ViewSize,
    fallback: DockFallbackSize,
): string => {
    const matrix = cameraMatrix(camera, view);
    const center = viewCenter(view);
    let best = '';
    let bestDistance = Infinity;
    walkShown(planes, (plane) => {
        const projected = projectWithMatrix(matrix, camera.perspective, view, planeCenter(geometryOf(plane, fallback)));
        if (!projected.visible) {
            return false;
        }
        const distance = Math.hypot(projected.x - center.x, projected.y - center.y);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = plane.planeID;
        }
        return false;
    });
    return best;
};

/** The reveal from a docked page: pulled back and tilted, the page seen as a sheet in space. */
export const REVEAL = {
    scale: 0.8,
    pitch: 8,
    yaw: -6,
} as const;

export const revealPose = (
    dock: CameraState,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => clampCamera(
    {
        ...dock,
        scale: REVEAL.scale,
        pitch: dock.pitch + REVEAL.pitch,
        yaw: normalizeYaw(dock.yaw + REVEAL.yaw),
    },
    limits,
);
// #endregion module
