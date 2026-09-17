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
        // A FRAMING LANDS LEVEL. Fitting, framing a plane, going home: the picture is put straight,
        // which is also the way out of a rolled first-person view (press 0 and the horizon is back).
        roll: 0,
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


interface FittablePlane {
    location: PlaneGeometry['location'];
    width?: number;
    height?: number;
    show?: boolean;
    children?: FittablePlane[];
}

const DEG = Math.PI / 180;

/** every (visible) plane, children included, flattened; sizes filled from the fallback */
const flattenPlanes = (
    planes: FittablePlane[],
    options: WorldBoundsOptions = {},
): PlaneGeometry[] => {
    const flat: PlaneGeometry[] = [];
    const walk = (nodes: FittablePlane[]) => {
        for (const node of nodes) {
            if (!options.includeHidden && node.show === false) {
                continue;
            }
            flat.push({
                location: node.location,
                width: node.width || options.fallbackWidth || 0,
                height: node.height || options.fallbackHeight || 0,
            });
            if (node.children && node.children.length > 0) {
                walk(node.children);
            }
        }
    };
    walk(planes);
    return flat;
};

/** The world corners of every (visible) plane, children included: what a fit frames. */
export const worldPoints = (
    planes: FittablePlane[],
    options: WorldBoundsOptions = {},
): Vec3[] => flattenPlanes(planes, options).flatMap((plane) => planeCorners(plane));


/**
 * THE YAW AT WHICH EVERYTHING READS.
 *
 * A plane turned `rotateY` seen from a camera yaw `y` projects to `|cos(rotateY + y)|` of its
 * width. Roots alone read best from the front (0); a root and a branch at 90.1° read at 0.706 of
 * their width each from the yaw between them (−45.05°), and from the front the branch is a line.
 * The candidates are the face-on yaw of every distinct turn and the bisector of every pair of
 * them; the one that maximises the NARROWEST plane's projected width wins, the nearest to the
 * front on a tie. Widths weigh in when given, so a wide plane does not sacrifice a narrow one.
 */
export const bestYaw = (
    planes: { location: { rotateY: number }; width?: number }[],
): number => {
    const shown = planes.filter((plane) => !!plane);
    if (shown.length === 0) {
        return 0;
    }

    const turns = [...new Set(shown.map((plane) => Math.round(plane.location.rotateY * 1000) / 1000))];
    const candidates = new Set<number>();
    for (const turn of turns) {
        candidates.add(normalizeYaw(-turn));
        for (const other of turns) {
            candidates.add(normalizeYaw(-(turn + other) / 2));
        }
    }

    const narrowest = (yaw: number) => Math.min(...shown.map((plane) => (
        (plane.width || 1) * Math.abs(Math.cos((plane.location.rotateY + yaw) * DEG))
    )));

    let best = 0;
    let bestWidth = -Infinity;
    for (const yaw of [...candidates].sort((a, b) => Math.abs(a) - Math.abs(b))) {
        const width = narrowest(yaw);
        if (width > bestWidth + 1e-9) {
            best = yaw;
            bestWidth = width;
        }
    }
    return best;
};


export interface FramePlanesOptions extends Omit<FrameOptions, 'yaw'> {
    /** the yaw to frame from: a number, or `best` (`bestYaw`), the default */
    yaw?: number | 'best';
}

/**
 * Frame these planes by their REAL corners from the given yaw (level): the picture parent and
 * child both read in. Framing by real corners rather than by the axis-aligned box lets a turned
 * plane fit at a larger scale, since the box around a fin is wider than the fin.
 */
export const framePlanes = (
    camera: CameraState,
    planes: PlaneGeometry[],
    view: ViewSize,
    options: FramePlanesOptions = {},
): CameraState => {
    const points = planes.flatMap((plane) => planeCorners(plane));
    const box = pointsBounds(points);
    if (!box) {
        return camera;
    }

    const yaw = options.yaw === undefined || options.yaw === 'best'
        ? bestYaw(planes)
        : options.yaw;

    return framePoints(
        camera,
        points,
        boxCenter(box),
        view,
        {
            maxScale: 1,
            ...options,
            yaw,
            pitch: options.pitch ?? 0,
        },
    );
};

/** Frame a parent and its child from the yaw between them: the branch and where it came from. */
export const framePair = (
    camera: CameraState,
    parent: PlaneGeometry,
    child: PlaneGeometry,
    view: ViewSize,
    options: FrameOptions = {},
): CameraState => framePlanes(camera, [parent, child], view, { ...options, yaw: 'best' });


export interface FitAllOptions extends Omit<FrameOptions, 'yaw'>, WorldBoundsOptions {
    /** Look at the space front-on (yaw 0, pitch 0). Default `true`. */
    faceOn?: boolean;
    /** the yaw to fit from: a number, or `best` (`bestYaw` over the shown planes) */
    yaw?: number | 'best';
}


/**
 * Frame every visible plane (children included) by its real corners. Returns the camera unchanged
 * for an empty space. Front-on by default; `yaw: 'best'` turns to where the narrowest plane reads.
 */
export const fitAll = (
    camera: CameraState,
    planes: FittablePlane[],
    view: ViewSize,
    options: FitAllOptions = {},
): CameraState => {
    const flat = flattenPlanes(planes, options);
    const points = flat.flatMap((plane) => planeCorners(plane));
    const box = pointsBounds(points);
    if (!box) {
        return camera;
    }

    const faceOn = options.faceOn ?? true;
    const yaw = options.yaw === 'best'
        ? bestYaw(flat)
        : (options.yaw ?? (faceOn ? 0 : camera.yaw));

    return framePoints(
        camera,
        points,
        boxCenter(box),
        view,
        {
            ...options,
            yaw,
            pitch: options.pitch ?? (faceOn ? 0 : camera.pitch),
        },
    );
};


export {
    pointsBounds,
    worldBounds,
};
// #endregion module
