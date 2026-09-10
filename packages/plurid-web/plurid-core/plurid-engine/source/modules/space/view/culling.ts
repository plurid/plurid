// #region imports
    // #region libraries
    import {
        CameraState,
        ViewSize,
        TreePlaneLocation,
        PluridConfigurationSpaceCulling,
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

/** What one culling pass decides: the hidden and frozen planes, and every plane's depth. */
export interface CullPassResult {
    /** Planes that stop painting (kept mounted, state intact). */
    hidden: string[];
    /** Planes that keep painting but are contained (no layout-affecting work). */
    frozen: string[];
    /** Camera-space distance from the eye per plane (for depth cues). */
    depths: Record<string, number>;
}

/** The pass's result with the detach tier's: the state's `culled`. */
export interface CullingResult extends CullPassResult {
    /** Hidden planes whose content is DETACHED (`culling.detach`): the shell stays, the content is retained or unmounted. */
    detached: string[];
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
    detached: [],
    depths: {},
};


// #region detach
export interface DetachOptions {
    mode: 'off' | 'retain' | 'unmount';
    delay: number;
    distance: number;
    max: number;
}

export const DEFAULT_DETACH_DELAY = 1000;

/** `space.culling.detach` resolved: `off` unless the pass is enabled and a mode is set. */
export const resolveDetachOptions = (
    culling: PluridConfigurationSpaceCulling | undefined,
): DetachOptions => {
    const off: DetachOptions = { mode: 'off', delay: DEFAULT_DETACH_DELAY, distance: 0, max: Infinity };
    if (!culling?.enabled || !culling.detach) {
        return off;
    }
    const options = typeof culling.detach === 'string' ? { mode: culling.detach } : culling.detach;
    if (options.mode !== 'retain' && options.mode !== 'unmount') {
        return off;
    }
    return {
        mode: options.mode,
        delay: Math.max(0, options.delay ?? DEFAULT_DETACH_DELAY),
        distance: Math.max(0, options.distance ?? 0),
        max: Math.max(0, options.max ?? Infinity),
    };
};

export interface DetachInput {
    /** The pass's hidden planes, in tree order. */
    hidden: string[];
    depths: Record<string, number>;
    /** Each plane's SHOWN children (a parent with a visible child keeps its content: the child's leash reads the parent's link). */
    childrenOf: Map<string, string[]>;
    /** The previously detached planes. */
    previous: string[];
    /** When each hidden plane became hidden (kept by the caller between passes). */
    hiddenSince: Map<string, number>;
    now: number;
    exceptions: Set<string>;
    /** While the camera moves or a layout transition runs: nothing NEW is detached (re-attach always happens). */
    gate: boolean;
    options: DetachOptions;
}

export interface DetachResult {
    /** In tree order. */
    detached: string[];
    /** The updated clock: hidden planes only. */
    hiddenSince: Map<string, number>;
    /** When the earliest immature candidate matures (`null`: nothing pending). */
    nextDue: number | null;
}

/**
 * THE DETACH TIER: which hidden planes lose their content. A plane hidden continuously for `delay`
 * ms, farther than `distance`, not an exception, whose shown children are all hidden too, is
 * DETACHED; with `max` the hidden-but-mounted pool is bounded — the farthest detachable planes
 * beyond it are detached at once, mature or not. A detached plane stays detached while hidden and
 * re-attaches the moment it is not (never gated). A painted plane is never detached: a blank shell
 * in view would be a hole.
 */
export const resolveDetached = (
    input: DetachInput,
): DetachResult => {
    const {
        hidden,
        depths,
        childrenOf,
        previous,
        hiddenSince: previousHiddenSince,
        now,
        exceptions,
        gate,
        options,
    } = input;
    const hiddenSet = new Set(hidden);
    const hiddenSince = new Map<string, number>();
    for (const id of hidden) {
        hiddenSince.set(id, previousHiddenSince.get(id) ?? now);
    }
    if (options.mode === 'off') {
        return { detached: [], hiddenSince, nextDue: null };
    }

    // still hidden, still detached
    const detached = new Set(previous.filter((id) => hiddenSet.has(id) && !exceptions.has(id)));
    const childrenHidden = (id: string): boolean => (childrenOf.get(id) ?? []).every((child) => hiddenSet.has(child));
    let nextDue: number | null = null;

    if (!gate) {
        for (const id of hidden) {
            if (detached.has(id) || exceptions.has(id)) {
                continue;
            }
            if (options.distance > 0 && (depths[id] ?? 0) <= options.distance) {
                continue;
            }
            if (!childrenHidden(id)) {
                continue;
            }
            const due = (hiddenSince.get(id) ?? now) + options.delay;
            if (due <= now) {
                detached.add(id);
            } else {
                nextDue = nextDue === null ? due : Math.min(nextDue, due);
            }
        }
        // the budget: the hidden-but-mounted pool (exceptions and parents of shown planes count
        // toward it) is trimmed to `max` from its farthest detachable planes
        if (options.max !== Infinity) {
            const mounted = hidden.filter((id) => !detached.has(id));
            const excess = mounted.length - options.max;
            if (excess > 0) {
                const detachable = mounted.filter((id) => !exceptions.has(id) && childrenHidden(id));
                detachable.sort((a, b) => (depths[b] ?? 0) - (depths[a] ?? 0));
                for (const id of detachable.slice(0, excess)) {
                    detached.add(id);
                }
            }
        }
    }

    return {
        detached: hidden.filter((id) => detached.has(id)),
        hiddenSince,
        nextDue,
    };
};
// #endregion detach


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
    previous: CullPassResult = EMPTY_CULLING,
    exceptions: Set<string> = new Set(),
): CullPassResult => {
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


const sameList = (
    a: string[],
    b: string[],
): boolean => a.length === b.length && a.every((id, index) => id === b[index]);

/** The three lists compared in order (the depths are a per-frame cue, not state). */
export const sameCulling = (
    a: CullingResult,
    b: CullingResult,
): boolean => sameList(a.hidden, b.hidden) && sameList(a.frozen, b.frozen) && sameList(a.detached, b.detached);
// #endregion module
