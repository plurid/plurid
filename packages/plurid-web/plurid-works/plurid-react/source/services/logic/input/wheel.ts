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


/**
 * Make a wheel event comparable across browsers and devices: `deltaMode` LINE (Firefox mouse
 * wheels) and PAGE are converted to pixels, and the input is classified — a mouse wheel reports
 * large integer notches, a trackpad small fractional deltas and horizontal movement.
 */
export const normalizeWheel = (
    event: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'deltaMode' | 'ctrlKey'>,
    viewHeight: number,
): NormalizedWheel => {
    let scale = 1;
    if (event.deltaMode === 1) {
        scale = LINE_HEIGHT_PX;
    } else if (event.deltaMode === 2) {
        scale = Math.max(viewHeight, 1);
    }

    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;

    let source: WheelSource = 'unknown';
    if (event.deltaMode !== 0) {
        source = 'mouse';
    } else if (
        (Math.abs(dy) > 0 && Math.abs(dy) < 40 && !Number.isInteger(dy))
        || (Math.abs(dx) > 0 && Math.abs(dx) < 40)
    ) {
        source = 'trackpad';
    } else if (Math.abs(dy) >= 40 && Number.isInteger(dy) && dy % 20 === 0) {
        source = 'mouse';
    } else if (Math.abs(dy) < 40) {
        source = 'trackpad';
    } else {
        source = 'mouse';
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
    /** The content under the pointer can scroll along the wheel's main axis. */
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


/**
 * Decide what a wheel/trackpad event does. `scroll` hands the event back to the page (the plane's
 * content scrolls natively); `camera` is a delta for the frame batcher. The policy:
 *  - pinch / Ctrl-or-Cmd + wheel → zoom at the cursor, always;
 *  - an explicit transform mode pins the intent (rotate / translate / scale);
 *  - Shift + wheel orbits, Alt + wheel pans, Alt + Shift dollies (the historical modifiers);
 *  - grab mode → zoom at the cursor;
 *  - otherwise a trackpad scroll follows `trackpadScroll` (pan by default) and a mouse wheel
 *    follows `policy`: `zoom` at the cursor, unless `scroll-first` and the content under the
 *    pointer can scroll (then the page scrolls).
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

    const zoom = (magnitude: number): WheelResolution => {
        if (!ctx.locks.scale || magnitude === 0) {
            return { kind: 'scroll' };
        }
        return {
            kind: 'camera',
            delta: {
                zoom: {
                    factor: zoomFactor(magnitude, step),
                    anchor: ctx.anchor,
                },
            },
            preventDefault: true,
        };
    };

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
        return zoom(wheel.dy);
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
