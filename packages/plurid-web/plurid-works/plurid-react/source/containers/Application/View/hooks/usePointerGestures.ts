// #region imports
    // #region libraries
    import React, {
        useRef,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        TRANSFORM_MODES,
        PluridConfigurationSpace,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface UsePointerGesturesParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    /** `stateConfiguration.space` — mirrored into a ref so the handlers read live values. */
    spaceConfiguration: PluridConfigurationSpace;
    grabModeRef: React.MutableRefObject<boolean>;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    setNavDragging: (value: boolean) => void;

    dispatchRotateXWith: DispatchAction<typeof actions.space.rotateXWith>;
    dispatchRotateYWith: DispatchAction<typeof actions.space.rotateYWith>;
    dispatchTranslateXWith: DispatchAction<typeof actions.space.translateXWith>;
    dispatchTranslateYWith: DispatchAction<typeof actions.space.translateYWith>;
    dispatchTranslateZWith: DispatchAction<typeof actions.space.translateZWith>;
    dispatchScaleUpWith: DispatchAction<typeof actions.space.scaleUpWith>;
    dispatchScaleDownWith: DispatchAction<typeof actions.space.scaleDownWith>;
}


/**
 * Native Pointer-Events gestures (replaces HammerJS). Single-pointer drag rotates / translates /
 * scales by continuous signed deltas (smooth, both axes at once); two-pointer pinch zooms at the
 * pinch midpoint; releasing a rotate with residual velocity spins on with decaying momentum.
 *
 * Owns all the live pointer/momentum refs + a `spaceConfigRef` (mirrored from `spaceConfiguration`
 * every render) and a `grabModeRef` passed in from `useGrabMode`, so the listeners attach ONCE and
 * read the latest mode/locks/grab without re-binding on every config tick.
 */
export const usePointerGestures = (
    {
        viewElement,
        spaceConfiguration,
        grabModeRef,
        dispatch,
        setNavDragging,
        dispatchRotateXWith,
        dispatchRotateYWith,
        dispatchTranslateXWith,
        dispatchTranslateYWith,
        dispatchTranslateZWith,
        dispatchScaleUpWith,
        dispatchScaleDownWith,
    }: UsePointerGesturesParameters,
) => {
    // Native Pointer-Events gesture state. Tracks live pointers for single-pointer drag +
    // two-pointer pinch, plus a decaying-velocity momentum spin.
    const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    const pinchDistance = useRef<number | null>(null);
    // Drag-threshold: a pointerdown only becomes an orbit once it moves past a few px. Below that
    // it's a click, which must pass through to UI controls (plane header icons, toolbar buttons).
    const pointerDragging = useRef<boolean>(false);
    const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
    const momentum = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
    const momentumFrame = useRef<number | null>(null);
    // Always-latest space config (transformMode/locks/firstPerson) for the pointer handlers, so
    // they can attach once instead of re-binding on every config change.
    const spaceConfigRef = useRef(spaceConfiguration);
    spaceConfigRef.current = spaceConfiguration;

    useEffect(() => {
        const element = viewElement.current;
        if (!element || typeof window === 'undefined') {
            return;
        }

        const ROTATE_SENSITIVITY = 0.22;   // deg per px
        const TRANSLATE_SENSITIVITY = 1;   // px per px
        const SCALE_DRAG_SENSITIVITY = 0.004;
        const PINCH_SENSITIVITY = 0.01;
        const MOMENTUM_DECAY = 0.92;
        const MOMENTUM_MIN = 0.05;
        const DRAG_THRESHOLD = 4;          // px before a press becomes an orbit
        const FLY_LOOK_SENSITIVITY = 0.18; // deg per px when dragging to look in fly mode

        const stopMomentum = () => {
            if (momentumFrame.current !== null) {
                cancelAnimationFrame(momentumFrame.current);
                momentumFrame.current = null;
            }
        };

        // Whether the most recent drag was an orbit (so momentum only flings on orbit).
        let navWasOrbit = false;

        const rotateByDelta = (dx: number, dy: number) => {
            if (dx !== 0) {
                dispatchRotateYWith(dx * ROTATE_SENSITIVITY);
            }
            if (dy !== 0) {
                dispatchRotateXWith(-dy * ROTATE_SENSITIVITY);
            }
        };

        const panByDelta = (dx: number, dy: number, altKey: boolean) => {
            if (dx !== 0) {
                dispatchTranslateXWith(dx * TRANSLATE_SENSITIVITY);
            }
            if (dy !== 0) {
                if (altKey) {
                    dispatchTranslateZWith(dy);
                } else {
                    dispatchTranslateYWith(dy);
                }
            }
        };

        const scaleByDrag = (dy: number) => {
            const amount = Math.abs(dy) * SCALE_DRAG_SENSITIVITY;
            if (amount > 0) {
                if (dy < 0) {
                    dispatchScaleUpWith(amount);
                } else {
                    dispatchScaleDownWith(amount);
                }
            }
        };

        // CAD-style navigation. The explicit rotate/scale/translate modes pin what a drag does;
        // otherwise (the default ALL mode) a plain drag orbits and a shift- or middle-button drag
        // pans — so you can navigate the space without first choosing a mode.
        const applySingle = (dx: number, dy: number, event: PointerEvent) => {
            const mode = spaceConfigRef.current.transformMode;
            navWasOrbit = false;
            if (spaceConfigRef.current.firstPerson) {
                // Fly mode: dragging looks around (yaw/pitch). When the pointer is locked the
                // dedicated mouse-look listener takes over (clientX/Y frozen, so dx/dy here are ~0).
                dispatch(actions.space.flyMove({
                    yaw: dx * FLY_LOOK_SENSITIVITY,
                    pitch: -dy * FLY_LOOK_SENSITIVITY,
                }));
                return;
            }
            if (mode === TRANSFORM_MODES.ROTATION) {
                navWasOrbit = true;
                rotateByDelta(dx, dy);
            } else if (mode === TRANSFORM_MODES.TRANSLATION) {
                panByDelta(dx, dy, event.altKey);
            } else if (mode === TRANSFORM_MODES.SCALE) {
                scaleByDrag(dy);
            } else {
                // Default (ALL) mode. In grab mode a left-drag orbits; shift- or middle-drag pans.
                // In normal (content) mode only middle/shift drags are tracked at all, and they pan.
                const wantsPan = event.shiftKey || (event.buttons & 4) === 4;
                if (grabModeRef.current && !wantsPan) {
                    navWasOrbit = true;
                    rotateByDelta(dx, dy);
                } else {
                    panByDelta(dx, dy, event.altKey);
                }
            }
        };

        const runMomentum = () => {
            const m = momentum.current;
            rotateByDelta(m.vx, m.vy);
            m.vx *= MOMENTUM_DECAY;
            m.vy *= MOMENTUM_DECAY;
            if (Math.abs(m.vx) < MOMENTUM_MIN && Math.abs(m.vy) < MOMENTUM_MIN) {
                stopMomentum();
                return;
            }
            momentumFrame.current = requestAnimationFrame(runMomentum);
        };

        const twoPointerDistance = (): number => {
            const pts = Array.from(activePointers.current.values());
            return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        };

        const onPointerDown = (event: PointerEvent) => {
            // Only skip form fields (a drag inside them should select/scrub, not orbit). Everything
            // else — including the engine's <div>-based controls — is allowed: a click (no movement)
            // passes straight through to the control's onClick; only a drag past DRAG_THRESHOLD
            // starts an orbit (see onPointerMove). We must NOT setPointerCapture or preventDefault
            // here, or control clicks get swallowed.
            const target = event.target as HTMLElement | null;
            // Form fields AND rich-text editors (contentEditable, e.g. TipTap/Lexical/ProseMirror):
            // a drag inside them should select/scrub text, not orbit. `isContentEditable` resolves
            // inheritance (a drag on a text node inside an editable host), matching `useGrabMode`.
            if (target && ((target.closest && target.closest('input, textarea, select')) || target.isContentEditable)) {
                return;
            }
            // Only engage navigation for a deliberate nav gesture; otherwise leave the press to the
            // browser (text selection, clicks, links) — planes are pages. Nav = fly mode, grab mode
            // (G), the middle mouse button, or an explicit rotate/scale/translate mode.
            const navIntent = spaceConfigRef.current.firstPerson
                || grabModeRef.current
                || event.button === 1
                || spaceConfigRef.current.transformMode !== TRANSFORM_MODES.ALL;
            if (!navIntent) {
                return;
            }
            stopMomentum();
            momentum.current = { vx: 0, vy: 0 };
            pointerDragging.current = false;
            pointerDownAt.current = { x: event.clientX, y: event.clientY };
            activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            lastPointer.current = { x: event.clientX, y: event.clientY };
            if (activePointers.current.size === 2) {
                // A two-finger gesture is unambiguous — engage pinch immediately.
                pointerDragging.current = true;
                pinchDistance.current = twoPointerDistance();
            }
        };

        const onPointerMove = (event: PointerEvent) => {
            if (!activePointers.current.has(event.pointerId)) {
                return;
            }
            activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (activePointers.current.size >= 2) {
                if (!spaceConfigRef.current.transformLocks.scale) {
                    return;
                }
                const pts = Array.from(activePointers.current.values());
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                if (pinchDistance.current !== null) {
                    const deltaScale = (dist - pinchDistance.current) * PINCH_SENSITIVITY;
                    if (deltaScale !== 0) {
                        const rect = element.getBoundingClientRect();
                        const originX = (pts[0].x + pts[1].x) / 2 - rect.left;
                        const originY = (pts[0].y + pts[1].y) / 2 - rect.top;
                        dispatch(actions.space.zoomAtPoint({ deltaScale, originX, originY }));
                    }
                }
                pinchDistance.current = dist;
                lastPointer.current = null;
                return;
            }

            if (!lastPointer.current) {
                lastPointer.current = { x: event.clientX, y: event.clientY };
                return;
            }

            // Below the threshold this press is still a (potential) click — let it pass through to
            // whatever control is under the pointer. Once it moves far enough, commit to an orbit:
            // capture the pointer and start applying deltas.
            if (!pointerDragging.current) {
                const origin = pointerDownAt.current;
                const moved = origin
                    ? Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
                    : 0;
                if (moved < DRAG_THRESHOLD) {
                    return;
                }
                pointerDragging.current = true;
                setNavDragging(true);
                lastPointer.current = { x: event.clientX, y: event.clientY };
                try {
                    element.setPointerCapture(event.pointerId);
                } catch (_) { /* capture unsupported */ }
                return;
            }

            const dx = event.clientX - lastPointer.current.x;
            const dy = event.clientY - lastPointer.current.y;
            lastPointer.current = { x: event.clientX, y: event.clientY };
            // Momentum tracks per-move velocity, capped so one large delta (e.g. a
            // synthetic/teleporting pointer) can't launch a runaway spin on release.
            const cap = 40;
            momentum.current = {
                vx: Math.max(-cap, Math.min(cap, dx)),
                vy: Math.max(-cap, Math.min(cap, dy)),
            };
            event.preventDefault();
            applySingle(dx, dy, event);
        };

        const endPointer = (event: PointerEvent) => {
            activePointers.current.delete(event.pointerId);
            try {
                element.releasePointerCapture(event.pointerId);
            } catch (_) { /* capture unsupported */ }

            if (activePointers.current.size < 2) {
                pinchDistance.current = null;
            }

            if (activePointers.current.size === 0) {
                lastPointer.current = null;
                pointerDownAt.current = null;
                setNavDragging(false);
                const wasDragging = pointerDragging.current;
                pointerDragging.current = false;
                // Only fling momentum if this was an actual orbit drag (not a click).
                const m = momentum.current;
                if (wasDragging
                    && navWasOrbit
                    && (Math.abs(m.vx) > MOMENTUM_MIN || Math.abs(m.vy) > MOMENTUM_MIN)) {
                    stopMomentum();
                    momentumFrame.current = requestAnimationFrame(runMomentum);
                }
            } else {
                const remaining = Array.from(activePointers.current.values())[0];
                lastPointer.current = remaining ? { x: remaining.x, y: remaining.y } : null;
            }
        };

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove, { passive: false });
        element.addEventListener('pointerup', endPointer);
        element.addEventListener('pointercancel', endPointer);

        return () => {
            stopMomentum();
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', endPointer);
            element.removeEventListener('pointercancel', endPointer);
        };
    }, [
        viewElement.current,
    ]);
}
// #endregion module



// #region exports
export default usePointerGestures;
// #endregion exports
