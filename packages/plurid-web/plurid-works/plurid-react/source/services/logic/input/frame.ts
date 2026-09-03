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
// #endregion module
