// #region imports
    // #region libraries
    import {
        CameraDelta,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** Merge two deltas so several inputs in one frame become ONE camera commit. */
export const mergeCameraDeltas = (
    a: CameraDelta,
    b: CameraDelta,
): CameraDelta => {
    const merged: CameraDelta = { ...a };

    if (b.pivot) {
        merged.pivot = b.pivot;
    }
    if (b.yaw) {
        merged.yaw = (merged.yaw || 0) + b.yaw;
    }
    if (b.pitch) {
        merged.pitch = (merged.pitch || 0) + b.pitch;
    }
    if (b.look) {
        merged.look = {
            yaw: (merged.look?.yaw || 0) + (b.look.yaw || 0),
            pitch: (merged.look?.pitch || 0) + (b.look.pitch || 0),
        };
    }
    if (b.pan) {
        merged.pan = {
            x: (merged.pan?.x || 0) + b.pan.x,
            y: (merged.pan?.y || 0) + b.pan.y,
        };
    }
    if (b.dolly) {
        merged.dolly = (merged.dolly || 0) + b.dolly;
    }
    if (b.fly) {
        merged.fly = {
            forward: (merged.fly?.forward || 0) + (b.fly.forward || 0),
            strafe: (merged.fly?.strafe || 0) + (b.fly.strafe || 0),
            vertical: (merged.fly?.vertical || 0) + (b.fly.vertical || 0),
        };
    }
    if (b.zoom) {
        merged.zoom = {
            factor: (merged.zoom?.factor ?? 1) * b.zoom.factor,
            anchor: b.zoom.anchor ?? merged.zoom?.anchor,
        };
    }
    if (b.absolute) {
        merged.absolute = {
            ...merged.absolute,
            ...b.absolute,
        };
    }

    return merged;
};


export const isEmptyDelta = (
    delta: CameraDelta,
): boolean => !delta.pivot
    && !delta.yaw
    && !delta.pitch
    && !delta.look
    && !delta.pan
    && !delta.dolly
    && !delta.fly
    && !delta.zoom
    && !delta.absolute;


export interface FrameBatcher {
    /** Queue a delta; it is flushed with everything else queued this frame. */
    add: (delta: CameraDelta) => void;
    /** Flush synchronously (e.g. at pointerup so the release lands before a fling starts). */
    flushNow: () => void;
    /** Drop anything queued. */
    cancel: () => void;
    pending: () => boolean;
}

type Schedule = (callback: () => void) => number;
type Unschedule = (handle: number) => void;


/**
 * Coalesce every input of a frame into ONE camera commit: a 1000 Hz mouse produces ~16 pointer
 * events per 60 Hz frame; without this each one rebuilt the matrix and notified the store.
 */
export const createFrameBatcher = (
    flush: (delta: CameraDelta) => void,
    schedule: Schedule = (callback) => requestAnimationFrame(callback),
    unschedule: Unschedule = (handle) => cancelAnimationFrame(handle),
): FrameBatcher => {
    let queued: CameraDelta | null = null;
    let handle: number | null = null;

    const run = () => {
        handle = null;
        const delta = queued;
        queued = null;
        if (delta && !isEmptyDelta(delta)) {
            flush(delta);
        }
    };

    return {
        add: (delta) => {
            queued = queued ? mergeCameraDeltas(queued, delta) : { ...delta };
            if (handle === null) {
                handle = schedule(run);
            }
        },
        flushNow: () => {
            if (handle !== null) {
                unschedule(handle);
                handle = null;
            }
            run();
        },
        cancel: () => {
            if (handle !== null) {
                unschedule(handle);
                handle = null;
            }
            queued = null;
        },
        pending: () => queued !== null,
    };
};


export interface SmoothedBatcherOptions {
    /**
     * The fraction of the remaining motion released per 60 Hz frame (0–1), scaled to the real
     * frame time so a 120 Hz display glides the same. `1` releases everything at once (the plain
     * batcher); `0.6` (the wheel default) reaches ~90 % in 2.5 frames, ~40 ms.
     */
    rate: () => number;
    /** Below this many px (pan / dolly / degrees) or log-units (zoom) the remainder is released whole. */
    epsilon?: number;
    /** The clock (ms) for the frame-time scaling; `performance.now()` by default, injectable for tests. */
    now?: () => number;
}

const FRAME_MS = 1000 / 60;

const PAN_EPSILON = 0.05;
const ZOOM_EPSILON = 0.0005;

/**
 * Coalesce like `createFrameBatcher`, but RELEASE the motion over a few frames: each frame applies
 * `rate()` of what is still pending and keeps the rest. A wheel delivers its deltas in bursts (a
 * trackpad in dozens of small events, a mouse in 100 px notches); applying them raw per frame
 * stepped and jittered, this eases every burst into a short glide that still lands exactly on the
 * total. Pan, dolly, yaw / pitch and zoom (in log space, about the LATEST anchor) are smoothed;
 * anything else in a delta (a pivot, an absolute pose, a look, a fly) goes through whole.
 */
export const createSmoothedBatcher = (
    flush: (delta: CameraDelta) => void,
    options: SmoothedBatcherOptions,
    schedule: Schedule = (callback) => requestAnimationFrame(callback),
    unschedule: Unschedule = (handle) => cancelAnimationFrame(handle),
): FrameBatcher => {
    const epsilon = options.epsilon ?? PAN_EPSILON;
    let pan = { x: 0, y: 0 };
    let dolly = 0;
    let yaw = 0;
    let pitch = 0;
    let zoomLog = 0;
    let anchor: { x: number; y: number } | undefined;
    let immediate: CameraDelta | null = null;
    let handle: number | null = null;
    let lastFrameAt: number | null = null;
    const clock = options.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));

    const pending = () => Math.abs(pan.x) > 0 || Math.abs(pan.y) > 0 || dolly !== 0 || yaw !== 0 || pitch !== 0 || zoomLog !== 0 || immediate !== null;

    const release = (fraction: number): CameraDelta => {
        const take = (value: number, floor: number) => (Math.abs(value) <= floor ? value : value * fraction);
        const delta: CameraDelta = immediate ? { ...immediate } : {};
        immediate = null;
        const panX = take(pan.x, epsilon);
        const panY = take(pan.y, epsilon);
        if (panX !== 0 || panY !== 0) {
            delta.pan = { x: panX, y: panY };
            pan = { x: pan.x - panX, y: pan.y - panY };
        }
        const dollyStep = take(dolly, epsilon);
        if (dollyStep !== 0) {
            delta.dolly = dollyStep;
            dolly -= dollyStep;
        }
        const yawStep = take(yaw, epsilon);
        if (yawStep !== 0) {
            delta.yaw = yawStep;
            yaw -= yawStep;
        }
        const pitchStep = take(pitch, epsilon);
        if (pitchStep !== 0) {
            delta.pitch = pitchStep;
            pitch -= pitchStep;
        }
        const zoomStep = take(zoomLog, ZOOM_EPSILON);
        if (zoomStep !== 0) {
            delta.zoom = { factor: Math.exp(zoomStep), anchor };
            zoomLog -= zoomStep;
        }
        return delta;
    };

    const run = () => {
        handle = null;
        const now = clock();
        const dt = lastFrameAt === null ? FRAME_MS : Math.min(100, Math.max(1, now - lastFrameAt));
        lastFrameAt = now;
        const perFrame = Math.min(1, Math.max(0.01, options.rate()));
        // the same glide per unit of TIME whatever the refresh rate
        const fraction = perFrame >= 1 ? 1 : 1 - Math.pow(1 - perFrame, dt / FRAME_MS);
        const delta = release(fraction);
        if (!isEmptyDelta(delta)) {
            flush(delta);
        }
        if (pending() && handle === null) {
            handle = schedule(run);
        } else if (!pending()) {
            lastFrameAt = null;
        }
    };

    return {
        add: (delta) => {
            if (delta.pan) {
                pan = { x: pan.x + delta.pan.x, y: pan.y + delta.pan.y };
            }
            if (delta.dolly) {
                dolly += delta.dolly;
            }
            if (delta.yaw) {
                yaw += delta.yaw;
            }
            if (delta.pitch) {
                pitch += delta.pitch;
            }
            if (delta.zoom) {
                zoomLog += Math.log(delta.zoom.factor);
                if (delta.zoom.anchor) {
                    anchor = delta.zoom.anchor;
                }
            }
            const rest: CameraDelta = { ...delta };
            delete rest.pan;
            delete rest.dolly;
            delete rest.yaw;
            delete rest.pitch;
            delete rest.zoom;
            if (!isEmptyDelta(rest)) {
                immediate = immediate ? mergeCameraDeltas(immediate, rest) : rest;
            }
            if (handle === null) {
                handle = schedule(run);
            }
        },
        flushNow: () => {
            if (handle !== null) {
                unschedule(handle);
                handle = null;
            }
            lastFrameAt = null;
            const delta = release(1);
            if (!isEmptyDelta(delta)) {
                flush(delta);
            }
        },
        cancel: () => {
            if (handle !== null) {
                unschedule(handle);
                handle = null;
            }
            lastFrameAt = null;
            pan = { x: 0, y: 0 };
            dolly = 0;
            yaw = 0;
            pitch = 0;
            zoomLog = 0;
            immediate = null;
        },
        pending,
    };
};
// #endregion module
