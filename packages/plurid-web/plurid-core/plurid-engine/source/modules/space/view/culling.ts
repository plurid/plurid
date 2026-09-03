// #region imports
    // #region libraries
    import {
        CameraState,
        ViewSize,
        TreePlaneLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        cameraMatrix,
        projectWithMatrix,
        planeCorners,
        planeCenter,
    } from '../../interaction/camera';
    // #endregion external
// #endregion imports



// #region module
export interface CullingPlane {
    id: string;
    location: TreePlaneLocation;
    width: number;
    height: number;
}

export interface CullingOptions {
    /** Camera-space distance from the eye beyond which a plane stops painting. Default `6000`. */
    distance?: number;
    /** Hysteresis fraction on both thresholds (hide above `×(1+h)`, show again below `×(1−h)`). Default `0.15`. */
    hysteresis?: number;
    /** Frustum margin as a fraction of the view size: a plane fully outside the margin stops painting. Default `0.25`. */
    frustumMargin?: number;
    /** Distance beyond which a still-painted plane is frozen (contained, no measurements). Default `3500`. */
    freezeDistance?: number;
}

export interface CullingResult {
    /** Planes that stop painting (kept mounted, state intact). */
    hidden: string[];
    /** Planes that keep painting but are contained (no layout-affecting work). */
    frozen: string[];
    /** Camera-space distance from the eye per plane (for depth cues). */
    depths: Record<string, number>;
}

/**
 * Distances are camera-space, from the EYE: a plane at the pivot depth sits at `perspective`
 * (2000 by default), so the thresholds start beyond that. Freezing kicks in before hiding.
 */
export const DEFAULT_CULLING: Required<CullingOptions> = {
    distance: 6000,
    hysteresis: 0.15,
    frustumMargin: 0.25,
    freezeDistance: 3500,
};

export const EMPTY_CULLING: CullingResult = {
    hidden: [],
    frozen: [],
    depths: {},
};


/**
 * Which planes may stop painting: a plane is HIDDEN when every projected corner lies outside the
 * view expanded by the frustum margin (or behind the eye), or when its center is farther from the
 * eye than `distance`; FROZEN when farther than `freezeDistance` but still in the picture. Both
 * thresholds carry hysteresis against the previous result, so a plane jittering on the boundary
 * never flickers. `exceptions` (active, selected, isolated, focused, a tween's target) are never
 * hidden or frozen.
 */
export const cullPlanes = (
    planes: CullingPlane[],
    camera: CameraState,
    view: ViewSize,
    options: CullingOptions = {},
    previous: CullingResult = EMPTY_CULLING,
    exceptions: Set<string> = new Set(),
): CullingResult => {
    const settings = {
        ...DEFAULT_CULLING,
        ...options,
    };
    const matrix = cameraMatrix(camera, view);
    const previouslyHidden = new Set(previous.hidden);
    const previouslyFrozen = new Set(previous.frozen);

    const marginX = view.width * settings.frustumMargin;
    const marginY = view.height * settings.frustumMargin;
    // hysteresis on the frustum: hide outside the full margin, show again inside half of it
    const showMarginX = marginX / 2;
    const showMarginY = marginY / 2;

    const hidden: string[] = [];
    const frozen: string[] = [];
    const depths: Record<string, number> = {};

    for (const plane of planes) {
        const center = projectWithMatrix(matrix, camera.perspective, view, planeCenter(plane));
        const depth = camera.perspective - center.cameraZ;
        depths[plane.id] = depth;

        if (exceptions.has(plane.id)) {
            continue;
        }

        const wasHidden = previouslyHidden.has(plane.id);
        const wasFrozen = previouslyFrozen.has(plane.id);

        // distance
        const hideDistance = settings.distance * (wasHidden ? 1 - settings.hysteresis : 1 + settings.hysteresis);
        let hide = depth > hideDistance;

        // frustum
        if (!hide) {
            const corners = planeCorners(plane).map((corner) => projectWithMatrix(matrix, camera.perspective, view, corner));
            const behind = corners.every((corner) => !corner.visible);
            if (behind) {
                hide = true;
            } else {
                const mx = wasHidden ? showMarginX : marginX;
                const my = wasHidden ? showMarginY : marginY;
                const inFront = corners.filter((corner) => corner.visible && Number.isFinite(corner.x) && Number.isFinite(corner.y));
                if (inFront.length > 0) {
                    const allLeft = inFront.every((corner) => corner.x < -mx);
                    const allRight = inFront.every((corner) => corner.x > view.width + mx);
                    const allAbove = inFront.every((corner) => corner.y < -my);
                    const allBelow = inFront.every((corner) => corner.y > view.height + my);
                    // a plane with a corner behind the eye spans the view unpredictably: keep it
                    if (inFront.length === corners.length && (allLeft || allRight || allAbove || allBelow)) {
                        hide = true;
                    }
                }
            }
        }

        if (hide) {
            hidden.push(plane.id);
            continue;
        }

        const freezeDistance = settings.freezeDistance * (wasFrozen ? 1 - settings.hysteresis : 1 + settings.hysteresis);
        if (depth > freezeDistance) {
            frozen.push(plane.id);
        }
    }

    return {
        hidden,
        frozen,
        depths,
    };
};


export const sameCulling = (
    a: CullingResult,
    b: CullingResult,
): boolean => (
    a.hidden.length === b.hidden.length
    && a.frozen.length === b.frozen.length
    && a.hidden.every((id, index) => id === b.hidden[index])
    && a.frozen.every((id, index) => id === b.frozen[index])
);
// #endregion module
