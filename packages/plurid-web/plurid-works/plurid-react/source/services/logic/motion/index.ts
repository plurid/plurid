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
    /** Animate to a camera (interruptible; instant under reduced motion). */
    tweenTo: (target: CameraState, options?: TweenOptions) => void;
    isActive: () => boolean;
    /** Whether the viewer prefers reduced motion (and the configuration respects it). */
    reducedMotion: () => boolean;
}
// #endregion module
