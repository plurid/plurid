// #region imports
    // #region libraries
    import {
        CameraDelta,
        PluridConfigurationSpaceTransformLocks,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type WheelSource =
    | 'mouse'
    | 'trackpad'
    | 'unknown';

export interface NormalizedWheel {
    /** Pixel-equivalent deltas (line and page modes converted). */
    dx: number;
    dy: number;
    /** A pinch gesture (browsers deliver it as a ctrl+wheel). */
    pinch: boolean;
    source: WheelSource;
}

/** One mouse notch in pixel units (Chrome, Edge, Safari report 100; Firefox reports lines). */
export const WHEEL_NOTCH_PX = 100;
const LINE_HEIGHT_PX = 16;


/** What the recent wheel events looked like: a stream keeps its device for `WHEEL_STREAM_MS`. */
export interface WheelHistory {
    lastTrackpadAt: number;
    lastMouseAt: number;
    /** The clock for tests; `performance.now()` otherwise. */
    now?: () => number;
}

/** Wheel events closer than this belong to the same gesture, on the same device. */
export const WHEEL_STREAM_MS = 300;

export const createWheelHistory = (
    now?: () => number,
): WheelHistory => ({
    lastTrackpadAt: -Infinity,
    lastMouseAt: -Infinity,
    now,
});

/**
 * Make a wheel event comparable across browsers and devices: `deltaMode` LINE (Firefox mouse
 * wheels) and PAGE are converted to pixels, and the input is classified. A mouse wheel reports
 * notches — integer multiples of 20 px (100 / 120 / 40 …), isolated in time; a trackpad reports
 * small or fractional deltas, horizontal movement, and STREAMS of events (a flick, then inertia).
 * A fast flick's deltas reach 40–200 px, so magnitude alone misreads them as notches — and a
 * notch zooms while a trackpad pans (a pan read as a zoom, 2026-09-05). With a `history` the device
 * of the stream wins: an event within `WHEEL_STREAM_MS` of a trackpad event is trackpad whatever
 * its size, and only a notch outside any trackpad stream is a mouse.
 */
export const normalizeWheel = (
    event: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'deltaMode' | 'ctrlKey'>,
    viewHeight: number,
    history?: WheelHistory,
): NormalizedWheel => {
    let scale = 1;
    if (event.deltaMode === 1) {
        scale = LINE_HEIGHT_PX;
    } else if (event.deltaMode === 2) {
        scale = Math.max(viewHeight, 1);
    }
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    const magnitude = Math.abs(dy);
    const now = history
        ? (history.now ? history.now() : (typeof performance !== 'undefined' ? performance.now() : Date.now()))
        : 0;
    const inTrackpadStream = !!history && now - history.lastTrackpadAt < WHEEL_STREAM_MS;
    const inMouseStream = !!history && now - history.lastMouseAt < WHEEL_STREAM_MS;

    let source: WheelSource;
    if (event.deltaMode !== 0) {
        source = 'mouse';
    } else if (
        (magnitude > 0 && (magnitude < 40 || !Number.isInteger(dy)))
        || Math.abs(dx) > 0
    ) {
        // small, fractional, or sideways: a trackpad
        source = 'trackpad';
    } else if (magnitude >= 40 && dy % 20 === 0) {
        // a notch — unless it is the fast part of a trackpad stream
        source = inTrackpadStream && !inMouseStream ? 'trackpad' : 'mouse';
    } else if (magnitude === 0) {
        source = inMouseStream && !inTrackpadStream ? 'mouse' : 'trackpad';
    } else {
        // a large delta that is not a notch multiple: a fast trackpad flick
        source = 'trackpad';
    }

    if (history) {
        if (source === 'trackpad') {
            history.lastTrackpadAt = now;
        } else {
            history.lastMouseAt = now;
        }
    }

    return {
        dx,
        dy,
        pinch: !!event.ctrlKey,
        source,
    };
};


export type WheelPolicy =
    | 'zoom'
    | 'scroll-first'
    | 'disabled';

export type TrackpadScrollPolicy =
    | 'pan'
    | 'zoom'
    | 'orbit'
    | 'disabled';

export interface WheelContext {
    transformMode: 'ALL' | 'ROTATION' | 'TRANSLATION' | 'SCALE';
    grabMode: boolean;
    firstPerson: boolean;
    /** The wheel happened over a plane. */
    onPlane: boolean;
    /** The content under the pointer is a scroller along the wheel's axis (whether or not it can move further). */
    scrollable: boolean;
    shift: boolean;
    alt: boolean;
    ctrlOrMeta: boolean;
    locks: PluridConfigurationSpaceTransformLocks;
    /** `gestures.wheel`. Default `scroll-first`. */
    policy?: WheelPolicy;
    /** `gestures.trackpadScroll`. Default `pan`. */
    trackpadScroll?: TrackpadScrollPolicy;
    /** `gestures.wheelZoomStep`: zoom factor per mouse notch. Default `1.1`. */
    wheelZoomStep?: number;
    /**
     * `gestures.trackpadPinchSensitivity`: the zoom exponent per px of a trackpad pinch (a
     * ctrl+wheel with trackpad-sized deltas): factor = e^(−dy · sensitivity). Default `0.006`,
     * about ×3 over a full pinch. A Ctrl + mouse notch keeps the notch step.
     */
    trackpadPinchSensitivity?: number;
    /** `gestures.rotateSensitivity`, deg/px. Default `0.22`. */
    rotateSensitivity?: number;
    /** View px of the pointer (the zoom anchor). */
    anchor: { x: number; y: number };
}

export type WheelResolution =
    | { kind: 'scroll' }
    | { kind: 'camera'; delta: CameraDelta; preventDefault: boolean };


const zoomFactor = (
    dy: number,
    step: number,
): number => Math.pow(step, -dy / WHEEL_NOTCH_PX);

export const DEFAULT_TRACKPAD_PINCH_SENSITIVITY = 0.006;

/** A trackpad pinch: an exponent per px, so a whole pinch is a real zoom, not a fraction of a notch. */
const pinchFactor = (
    dy: number,
    sensitivity: number,
): number => Math.exp(-dy * sensitivity);


/**
 * Decide what a wheel/trackpad event does. `scroll` hands the event back to the page (the plane's
 * content scrolls natively); `camera` is a delta for the frame batcher. The policy:
 *  - pinch / Ctrl-or-Cmd + wheel → zoom at the cursor, always;
 *  - an explicit transform mode pins the intent (rotate / translate / scale);
 *  - Shift + wheel orbits, Alt + wheel pans, Alt + Shift dollies (the historical modifiers);
 *  - grab mode → zoom at the cursor;
 *  - otherwise a trackpad scroll follows `trackpadScroll` (pan by default) and a mouse wheel
 *    follows `policy`: `zoom` at the cursor, unless `scroll-first` and the content under the
 *    pointer is a scroller (then the wheel is the content's — even at the end of its range, so a
 *    scroll never chains into the camera).
 */
export const wheelToDelta = (
    wheel: NormalizedWheel,
    ctx: WheelContext,
): WheelResolution => {
    const policy = ctx.policy ?? 'scroll-first';
    const step = ctx.wheelZoomStep ?? 1.1;
    const rotate = (ctx.rotateSensitivity ?? 0.22) * 0.5;

    if (policy === 'disabled') {
        return { kind: 'scroll' };
    }

    const zoomBy = (factor: number): WheelResolution => {
        if (!ctx.locks.scale || factor === 1) {
            return { kind: 'scroll' };
        }
        return {
            kind: 'camera',
            delta: {
                zoom: {
                    factor,
                    anchor: ctx.anchor,
                },
            },
            preventDefault: true,
        };
    };
    const zoom = (magnitude: number): WheelResolution => zoomBy(magnitude === 0 ? 1 : zoomFactor(magnitude, step));
    // a trackpad pinch arrives as many small ctrl+wheel deltas: an exponent per px, not a notch step
    const pinch = (): WheelResolution => (wheel.source === 'trackpad'
        ? zoomBy(wheel.dy === 0 ? 1 : pinchFactor(wheel.dy, ctx.trackpadPinchSensitivity ?? DEFAULT_TRACKPAD_PINCH_SENSITIVITY))
        : zoom(wheel.dy));

    const orbit = (): WheelResolution => {
        const yaw = ctx.locks.rotationY ? -wheel.dx * rotate : 0;
        const pitch = ctx.locks.rotationX ? -wheel.dy * rotate : 0;
        if (yaw === 0 && pitch === 0) {
            return { kind: 'scroll' };
        }
        return {
            kind: 'camera',
            delta: { yaw, pitch },
            preventDefault: true,
        };
    };

    const pan = (): WheelResolution => {
        const x = ctx.locks.translationX ? -wheel.dx : 0;
        const y = ctx.locks.translationY ? -wheel.dy : 0;
        if (x === 0 && y === 0) {
            return { kind: 'scroll' };
        }
        return {
            kind: 'camera',
            delta: { pan: { x, y } },
            preventDefault: true,
        };
    };

    const dolly = (): WheelResolution => {
        if (!ctx.locks.translationZ || wheel.dy === 0) {
            return { kind: 'scroll' };
        }
        return {
            kind: 'camera',
            delta: { dolly: -wheel.dy },
            preventDefault: true,
        };
    };

    if (wheel.pinch || ctx.ctrlOrMeta) {
        return pinch();
    }

    if (ctx.transformMode === 'ROTATION') {
        return orbit();
    }
    if (ctx.transformMode === 'TRANSLATION') {
        return ctx.alt ? dolly() : pan();
    }
    if (ctx.transformMode === 'SCALE') {
        return zoom(wheel.dy);
    }

    if (ctx.shift && ctx.alt) {
        return dolly();
    }
    if (ctx.shift) {
        return orbit();
    }
    if (ctx.alt) {
        return pan();
    }

    if (ctx.grabMode || ctx.firstPerson) {
        return zoom(wheel.dy);
    }

    if (ctx.onPlane && ctx.scrollable && policy === 'scroll-first') {
        return { kind: 'scroll' };
    }

    if (wheel.source === 'trackpad') {
        const trackpad = ctx.trackpadScroll ?? 'pan';
        if (trackpad === 'disabled') {
            return { kind: 'scroll' };
        }
        if (trackpad === 'orbit') {
            return orbit();
        }
        if (trackpad === 'zoom') {
            return zoom(wheel.dy);
        }
        return pan();
    }

    return zoom(wheel.dy);
};
// #endregion module
