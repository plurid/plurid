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
        planeCenter,
    } from './project';
    // #endregion internal
// #endregion imports



// #region module
/**
 * DOCKING — the derived state of reading a plane as a page, in BOTH presentations (2026-09-06). A
 * camera is docked on a plane when it shows that plane face-on at the plane's FILL scale with the
 * plane's center under the view center: `pitch = −rotateX`, `yaw = −rotateY`, `scale = dockScale`,
 * `offset 0`, the pivot at the plane's center. The fill scale lets the plane's box fill the view along
 * its tighter dimension (`min(view / plane)` — 1 for a view-sized page, so the page presentation's
 * pages map 1 : 1 to view pixels), within the camera's zoom limits. The identity camera of a fresh space IS the dock pose of a view-sized root at the
 * origin. "Docked" is read off the picture, never off the parameters: a zoom about the cursor or a
 * cursor pivot re-parameterize `pivot` / `offset` losslessly, so two cameras with different pivots
 * can render the same page — the test is "does the camera equal the plane's dock pose", the
 * angles and the scale as scalars, the position through one projection of the plane's center.
 *
 * Three words: the DOCKED plane is the one the camera sits on now; the DESTINATION is the page a
 * running tween is docking on (`dockingPlaneID` in the react state); the CANDIDATE is the shown
 * plane nearest the view center, docked on when no plane is named.
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

/**
 * The scale a plane is read at: its box filling the view along the tighter dimension (1 for a
 * view-sized page), clamped to the zoom limits so the pose is always reachable.
 */
export const dockScale = (
    plane: PlaneGeometry,
    view: ViewSize,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): number => {
    if (!(plane.width > 0) || !(plane.height > 0) || !(view.width > 0) || !(view.height > 0)) {
        return 1;
    }
    const fill = Math.min(view.width / plane.width, view.height / plane.height);
    return Math.min(limits.zoomMax, Math.max(limits.zoomMin, fill));
};


/** The camera that docks on `plane`: face-on, the fill scale, the plane's center under the view center. */
export const dockPose = (
    camera: CameraState,
    plane: PlaneGeometry,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
    view: ViewSize = { width: plane.width, height: plane.height },
): CameraState => clampCamera(
    {
        ...camera,
        yaw: normalizeYaw(-plane.location.rotateY),
        // `0 - x`, not `-x`: a face-on plane must dock at +0 (a `-0` leaks into serialized viewpoints)
        pitch: 0 - plane.location.rotateX,
        scale: dockScale(plane, view, limits),
        pivot: planeCenter(plane),
        offset: { x: 0, y: 0, z: 0 },
    },
    // a page is docked face-on whatever its tilt: the orbit's pitch limit never clamps a dock pose
    { ...limits, pitchLimit: Math.max(limits.pitchLimit, Math.abs(plane.location.rotateX)) },
);

const angleDistance = (
    a: number,
    b: number,
): number => Math.abs(normalizeYaw(a - b));

/** The scalar tolerance of the dock test (scale, and the angles in degrees). */
const DOCK_TOLERANCE = 1e-3;

/**
 * Whether `camera` is docked on `plane` for this view — whether it IS the plane's dock pose: the fill
 * scale and the face-on angles within `DOCK_TOLERANCE`, then the plane's center projected within
 * `epsilon` px of the view center. The scalar checks come first so an orbit or a zoom exits on
 * the first line; `matrix` lets a walk over many planes project with one camera matrix.
 */
export const isDocked = (
    camera: CameraState,
    plane: PlaneGeometry,
    view: ViewSize,
    epsilon = 0.5,
    matrix = cameraMatrix(camera, view),
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): boolean => {
    if (Math.abs(camera.scale - dockScale(plane, view, limits)) > DOCK_TOLERANCE) {
        return false;
    }
    if (angleDistance(camera.yaw, -plane.location.rotateY) > DOCK_TOLERANCE) {
        return false;
    }
    if (Math.abs(camera.pitch + plane.location.rotateX) > DOCK_TOLERANCE) {
        return false;
    }
    // the center under the view center AT THE PIVOT DEPTH: a parallel page a few hundred units in
    // front or behind projects to the same point, at another depth
    const center = viewCenter(view);
    const projected = projectWithMatrix(matrix, camera.perspective, view, planeCenter(plane));
    return projected.visible
        && Math.abs(projected.cameraZ) <= epsilon
        && Math.abs(projected.x - center.x) <= epsilon
        && Math.abs(projected.y - center.y) <= epsilon;
};

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
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): string => {
    // every plane has its own fill scale, so the scalar test is per plane (it is the first line of
    // `isDocked`, before any projection)
    const matrix = cameraMatrix(camera, view);
    let found = '';
    walkShown(planes, (plane) => {
        if (isDocked(camera, dockGeometry(plane, fallback), view, epsilon, matrix, limits)) {
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
        const projected = projectWithMatrix(matrix, camera.perspective, view, planeCenter(dockGeometry(plane, fallback)));
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

/** The reveal move from a docked page: pulled back and tilted, the page seen as a sheet in space. */
export interface RevealPose {
    /** the camera scale (1 = docked) */
    scale: number;
    /** degrees added to the dock pose's pitch */
    pitch: number;
    /** degrees added to the dock pose's yaw */
    yaw: number;
}

/** The default reveal move (`space.docking.reveal`). */
export const REVEAL: RevealPose = {
    scale: 0.75,
    pitch: -24,
    yaw: 0,
};

export const revealPose = (
    dock: CameraState,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
    reveal: Partial<RevealPose> = REVEAL,
): CameraState => clampCamera(
    {
        ...dock,
        scale: reveal.scale ?? REVEAL.scale,
        pitch: dock.pitch + (reveal.pitch ?? REVEAL.pitch),
        yaw: normalizeYaw(dock.yaw + (reveal.yaw ?? REVEAL.yaw)),
    },
    limits,
);
// #endregion module
