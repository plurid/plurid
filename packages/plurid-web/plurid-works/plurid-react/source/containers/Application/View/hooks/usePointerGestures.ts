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
    import { AppState } from '~services/state/store';

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
    /** Always-latest app state — the handlers read `selectedPlaneIDs` + `scale` for drag-to-move. */
    stateRef: React.MutableRefObject<AppState>;
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
        stateRef,
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
    // True for the duration of a drag that MOVES the current selection (vs orbits/pans the camera).
    const movingSelection = useRef<boolean>(false);
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

        // Gesture feel is read LIVE from `space.gestures` (each field with its default) so a host can
        // retune sensitivities/threshold/momentum mid-session without re-binding the listeners.
        const gx = () => {
            const g = spaceConfigRef.current.gestures || {};
            return {
                rotate: g.rotateSensitivity ?? 0.22,        // deg per px
                translate: g.translateSensitivity ?? 1,     // px per px
                scale: g.scaleSensitivity ?? 0.004,
                pinch: g.pinchSensitivity ?? 0.01,
                flyLook: g.flyLookSensitivity ?? 0.18,      // deg per px (fly-mode look)
                dragThreshold: g.dragThreshold ?? 4,        // px before a press becomes an orbit
                momentumDecay: g.momentumDecay ?? 0.92,
                momentumMin: g.momentumMin ?? 0.05,
                disableMomentum: g.disableMomentum ?? false,
            };
        };

        const stopMomentum = () => {
            if (momentumFrame.current !== null) {
                cancelAnimationFrame(momentumFrame.current);
                momentumFrame.current = null;
            }
        };

        // Whether the most recent drag was an orbit (so momentum only flings on orbit).
        let navWasOrbit = false;

        const rotateByDelta = (dx: number, dy: number) => {
            const sensitivity = gx().rotate;
            if (dx !== 0) {
                dispatchRotateYWith(dx * sensitivity);
            }
            if (dy !== 0) {
                dispatchRotateXWith(-dy * sensitivity);
            }
        };

        const panByDelta = (dx: number, dy: number, altKey: boolean) => {
            if (dx !== 0) {
                dispatchTranslateXWith(dx * gx().translate);
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
            const amount = Math.abs(dy) * gx().scale;
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
            // Drag-to-move the selection: convert the screen delta to space-local units (÷ scale) and
            // shift every selected plane. No camera change, no momentum fling. (Head-on is exact; under
            // a heavy orbit the X/Y mapping is approximate — a known v1 limitation.)
            if (movingSelection.current) {
                const scale = stateRef.current?.space?.scale || 1;
                if (event.altKey) {
                    // Alt-drag moves the selection in DEPTH (Z) instead of the X-Y plane.
                    dispatch(actions.space.transformSelectedPlanes({
                        deltaZ: dy / scale,
                    }));
                } else {
                    dispatch(actions.space.transformSelectedPlanes({
                        deltaX: dx / scale,
                        deltaY: dy / scale,
                    }));
                }
                return;
            }
            if (spaceConfigRef.current.firstPerson) {
                // Fly mode: dragging looks around (yaw/pitch). When the pointer is locked the
                // dedicated mouse-look listener takes over (clientX/Y frozen, so dx/dy here are ~0).
                const flyLook = gx().flyLook;
                dispatch(actions.space.flyMove({
                    yaw: dx * flyLook,
                    pitch: -dy * flyLook,
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
            const { momentumDecay, momentumMin } = gx();
            const m = momentum.current;
            rotateByDelta(m.vx, m.vy);
            m.vx *= momentumDecay;
            m.vy *= momentumDecay;
            if (Math.abs(m.vx) < momentumMin && Math.abs(m.vy) < momentumMin) {
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
            // Drag-to-move: a plain left-drag on an ALREADY-SELECTED plane (normal mode only) moves the
            // whole selection. Orbit requires grab mode, so this never competes with it; shift is left
            // to pan, and a no-drag click still reaches the plane's shift-click selection toggle.
            let moveIntent = false;
            const selection = stateRef.current?.space?.selectedPlaneIDs;
            if (
                selection && selection.length > 0
                && event.button === 0
                && !event.shiftKey
                && !spaceConfigRef.current.firstPerson
                && !grabModeRef.current
                && spaceConfigRef.current.transformMode === TRANSFORM_MODES.ALL
            ) {
                const planeEl = target && target.closest
                    ? target.closest('[data-plurid-plane]')
                    : null;
                const planeID = planeEl && planeEl.getAttribute('data-plurid-plane');
                if (planeID && selection.includes(planeID)) {
                    moveIntent = true;
                }
            }

            const navIntent = spaceConfigRef.current.firstPerson
                || grabModeRef.current
                || event.button === 1
                || spaceConfigRef.current.transformMode !== TRANSFORM_MODES.ALL;
            if (!navIntent && !moveIntent) {
                return;
            }
            movingSelection.current = moveIntent;
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
                    const deltaScale = (dist - pinchDistance.current) * gx().pinch;
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
                if (moved < gx().dragThreshold) {
                    return;
                }
                pointerDragging.current = true;
                setNavDragging(true);
                // A selection move begins — turn on the live alignment-guide overlay.
                if (movingSelection.current) {
                    dispatch(actions.space.setDraggingSelection(true));
                }
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
                const wasMoving = movingSelection.current;
                pointerDragging.current = false;
                movingSelection.current = false;
                // Always drop the guide overlay when the last pointer lifts — covers an interrupted
                // move (pointercancel / a second pointer) too, not just the clean snap path below.
                // Idempotent: the reducer no-ops when the flag is already false.
                dispatch(actions.space.setDraggingSelection(false));
                // Edge-snap the group only on the clean release of a real (past-threshold) move.
                if (wasDragging && wasMoving) {
                    dispatch(actions.space.snapSelection(undefined));
                }
                // Only fling momentum if this was an actual orbit drag (not a click), and the host
                // hasn't disabled the fling.
                const m = momentum.current;
                const { momentumMin, disableMomentum } = gx();
                if (wasDragging
                    && navWasOrbit
                    && !disableMomentum
                    && (Math.abs(m.vx) > momentumMin || Math.abs(m.vy) > momentumMin)) {
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
