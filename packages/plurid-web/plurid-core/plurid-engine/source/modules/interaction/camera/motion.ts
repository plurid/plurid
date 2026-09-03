// #region imports
    // #region internal
    import type {
        CameraState,
        ViewSize,
        Vec2,
    } from './types';

    import {
        normalizeYaw,
    } from './state';

    import {
        setPivot,
    } from './delta';
    // #endregion internal
// #endregion imports



// #region module
export type EasingName =
    | 'linear'
    | 'out-cubic'
    | 'out-quint'
    | 'in-out-cubic';

export type Easing = (t: number) => number;

export const EASINGS: Record<EasingName, Easing> = {
    'linear': (t) => t,
    'out-cubic': (t) => 1 - Math.pow(1 - t, 3),
    'out-quint': (t) => 1 - Math.pow(1 - t, 5),
    'in-out-cubic': (t) => (t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2),
};


/** Signed shortest rotation from `from` to `to`, in (-180, 180]. */
export const shortestArc = (
    from: number,
    to: number,
): number => normalizeYaw(to - from);


const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;


/**
 * Interpolate between two cameras: `from` is first re-parameterized about `to`'s pivot (lossless),
 * then the offset and pitch lerp, the yaw takes the shortest arc, and the scale interpolates
 * geometrically so a zoom feels constant-rate. `t` is already eased.
 */
export const interpolateCamera = (
    from: CameraState,
    to: CameraState,
    t: number,
    _view?: ViewSize,
): CameraState => {
    if (t <= 0) {
        return from;
    }
    if (t >= 1) {
        return to;
    }

    const start = setPivot(from, to.pivot);

    return {
        yaw: normalizeYaw(start.yaw + shortestArc(start.yaw, to.yaw) * t),
        pitch: lerp(start.pitch, to.pitch, t),
        scale: start.scale * Math.pow(to.scale / start.scale, t),
        perspective: lerp(start.perspective, to.perspective, t),
        pivot: { ...to.pivot },
        offset: {
            x: lerp(start.offset.x, to.offset.x, t),
            y: lerp(start.offset.y, to.offset.y, t),
            z: lerp(start.offset.z, to.offset.z, t),
        },
    };
};


export interface VelocitySample {
    x: number;
    y: number;
    /** ms timestamp (`performance.now()` / `event.timeStamp`). */
    time: number;
}

export interface VelocityOptions {
    /** Only samples within this many ms of `now` count. Default `100`. */
    window?: number;
    /** No fling if the newest sample is older than this (the pointer paused). Default `60`. */
    stale?: number;
}


/**
 * Pointer velocity in px/ms from timestamped position samples — independent of the event rate
 * (it divides the displacement across the window by the elapsed time, instead of replaying one
 * per-event delta per frame) and zero after a pause.
 */
export const estimateVelocity = (
    samples: VelocitySample[],
    now: number,
    options: VelocityOptions = {},
): Vec2 => {
    const window = options.window ?? 100;
    const stale = options.stale ?? 60;

    if (samples.length < 2) {
        return { x: 0, y: 0 };
    }

    const newest = samples[samples.length - 1];
    if (now - newest.time > stale) {
        return { x: 0, y: 0 };
    }

    let oldest = newest;
    for (let index = samples.length - 2; index >= 0; index -= 1) {
        const sample = samples[index];
        if (now - sample.time > window) {
            break;
        }
        oldest = sample;
    }

    const elapsed = newest.time - oldest.time;
    if (elapsed <= 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: (newest.x - oldest.x) / elapsed,
        y: (newest.y - oldest.y) / elapsed,
    };
};


const REFERENCE_FRAME_MS = 1000 / 60;


/**
 * Decay a velocity by a per-60Hz-frame factor over an arbitrary frame duration, so momentum feels
 * the same at 60, 120, or a stuttering 30 frames per second.
 */
export const decayVelocity = (
    velocity: number,
    decayPerFrame: number,
    dtMs: number,
): number => velocity * Math.pow(decayPerFrame, dtMs / REFERENCE_FRAME_MS);


export interface SpringState {
    position: number;
    velocity: number;
}

export interface SpringOptions {
    /** Spring constant (per second²). Default `170`. */
    stiffness?: number;
    /** Damping coefficient (per second). Default `26` (near critical for the default stiffness). */
    damping?: number;
}


/** One semi-implicit Euler step of a damped spring toward `target`. */
export const springStep = (
    state: SpringState,
    target: number,
    dtMs: number,
    options: SpringOptions = {},
): SpringState => {
    const stiffness = options.stiffness ?? 170;
    const damping = options.damping ?? 26;
    const dt = Math.min(dtMs, 64) / 1000;

    const acceleration = -stiffness * (state.position - target) - damping * state.velocity;
    const velocity = state.velocity + acceleration * dt;
    const position = state.position + velocity * dt;

    return {
        position,
        velocity,
    };
};


export const springSettled = (
    state: SpringState,
    target: number,
    epsilon = 0.01,
): boolean => Math.abs(state.position - target) < epsilon
    && Math.abs(state.velocity) < epsilon;
// #endregion module
