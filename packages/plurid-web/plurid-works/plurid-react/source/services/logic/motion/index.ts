// #region imports
    // #region libraries
    import {
        CameraState,
        Vec2,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type EasingName =
    | 'linear'
    | 'out-cubic'
    | 'out-quint'
    | 'in-out-cubic'
    | 'spring';

export type FlingKind =
    | 'orbit'
    | 'pan';

export interface TweenOptions {
    /** ms. Default `navigation.motion.duration` (380). */
    duration?: number;
    easing?: EasingName;
    /**
     * Called once the camera has LANDED on the target — at once when the controller jumps (reduced
     * motion, a zero duration, already there), at the tween's last frame otherwise; never when an
     * input interrupts it. When another caller's tween replaces a non-exclusive tween, this RIDES the
     * replacing tween and is called when the camera lands (2026-10-30: it was dropped whenever the
     * replacing caller brought an `onSettle` of its own); an exclusive tween's is not carried.
     */
    onSettle?: () => void;
    /**
     * AN EXCLUSIVE TWEEN (2026-10-30): its callbacks belong to its caller, so the caller learns
     * whether the camera landed where it asked (`onSettle`) or did not (`onInterrupt`). Called once,
     * when the tween stops without landing: an input, a jump, another caller's tween, after the
     * motion that replaced it is in place. Its `onSettle` is never carried to another caller's
     * tween, which would tell a tour it arrived at a stop the camera never reached; only a retarget
     * that `continues` it keeps both. A caller asking for the very pose a tween is going to JOINS
     * it, whichever kind either is: every caller's `onSettle` is called when it lands, and every
     * `onInterrupt` if it does not.
     */
    onInterrupt?: () => void;
    /**
     * This retarget re-aims the running tween at the place it was going, moved (the docked page
     * followed through a relayout, a plane framed again once it is measured): an exclusive tween
     * keeps its callbacks through it, and is not interrupted.
     */
    continues?: boolean;
    /**
     * The page the camera docks on: a controller that jumps commits with it named, as a jump does, so
     * a page pitched past the orbit's limit is reached face-on (the commit clamped it, 2026-10-22).
     */
    docking?: string;
}


/**
 * The View's one rAF motion loop, as seen by the rest of the adapter: thunks reach it through the
 * store's thunk extra argument (`PluridThunkExtra.motion`) so every programmatic camera move —
 * frame, fit, home, presets, bookmarks, `space.frame`, an animated `space.cameraDelta` — is an
 * interruptible tween, and every input cancels it.
 */
export interface CameraMotionController {
    /** Stop whatever is driving the camera (a tween or a fling). Any input calls this first. */
    cancel: () => void;
    /** Start a decaying fling from a pointer velocity (px/ms). */
    fling: (velocity: Vec2, kind: FlingKind) => void;
    /**
     * A pointer drag or pinch drives the camera from `gesture(true)` to `gesture(false)`, and the
     * motion reads `gesture` in between (2026-10-19: nothing set it before), so what waits for a still
     * camera — a re-frame, the detach tier, the measured relayout, an agent's settle — waits for the
     * drag too, and `data-plurid-motion` styles it. Starting one stops a tween or a fling where it is;
     * a fling started from the release takes the motion over, which ending the gesture then leaves.
     */
    gesture: (active: boolean) => void;
    /** Animate to a camera (interruptible; instant under reduced motion). `true` when a tween started, `false` for a jump. */
    tweenTo: (target: CameraState, options?: TweenOptions) => boolean;
    isActive: () => boolean;
    /** Whether the viewer prefers reduced motion (and the configuration respects it). */
    reducedMotion: () => boolean;
}
// #endregion module
