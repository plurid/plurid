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
        PluridConfigurationSpace,
        CameraDelta,
        Vec3,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';

    import {
        dragWorldDelta,
        cameraForward,
        cameraDepthOf,
        planeWorldCenter,
    } from '~services/logic/selection';

    import {
        snapSelectionNow,
        selectInScreenRect,
    } from '~services/state/thunks/selection';

    import {
        isEditableTarget,
        isEngineControl,
        planeElementOf,
    } from '~services/logic/input/guard';

    import {
        resolveGestureIntent,
        applyLocks,
        GestureIntent,
        GestureContext,
    } from '~services/logic/input/gesture';

    import {
        createFrameBatcher,
    } from '~services/logic/input/frame';

    import {
        framePlaneByID,
        fitToView,
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import type {
        CameraMotionController,
    } from './useCameraMotion';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

export interface UsePointerGesturesParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    /** `stateConfiguration.space` — mirrored into a ref so the handlers read live values. */
    spaceConfiguration: PluridConfigurationSpace;
    grabModeRef: React.MutableRefObject<boolean>;
    /** Always-latest app state — the handlers read the camera, the tree, the selection. */
    stateRef: React.MutableRefObject<AppState>;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    setNavDragging: (value: boolean) => void;
    motion: CameraMotionController;
    /** Called at every press, before anything else — the View drops a gliding wheel tail here. */
    onPress?: () => void;
}

interface Sample {
    x: number;
    y: number;
    time: number;
}

interface Gesture {
    intent: GestureIntent;
    button: number;
    pointerType: string;
    primary: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    dragging: boolean;
    samples: Sample[];
    historyOpen: boolean;
    /** Camera-space depth of the dragged plane's center (move-selection): the drag maps to that plane. */
    dragDepth: number;
    /** Two-pointer state (pinch zoom + two-finger pan), engaged when a second pointer lands. */
    pinch: {
        distance: number;
        midX: number;
        midY: number;
        angle: number;
    } | null;
}

const MAX_SAMPLES = 24;

/** Development trace: when a host sets `window.__pluridGestureLog = []`, every decision is pushed to it. */
const trace = (entry: Record<string, unknown>) => {
    if (typeof window === 'undefined') {
        return;
    }
    const log = (window as any).__pluridGestureLog;
    if (Array.isArray(log)) {
        log.push(entry);
    }
};
/** px of drag per doubling of the zoom, for drag-to-zoom (scaled by `scaleSensitivity`). */
const DRAG_ZOOM_PX_PER_DOUBLING = 250;


/**
 * Native Pointer-Events gestures. A press resolves to ONE intent through the mapping table
 * (`resolveGestureIntent`: planes-are-pages on content, orbit on empty space, right / middle /
 * Shift pan, Alt dolly, modes and `buttonMap` override); a second pointer turns the gesture into a
 * pinch (zoom at the midpoint, two-finger pan). Every input of a frame is coalesced into ONE camera
 * commit (`createFrameBatcher`), the orbit pivots about the point under the cursor
 * (`navigation.orbitPivot`), and a release with velocity hands a time-based fling to the motion
 * controller. Clicks below the drag threshold pass through untouched; a right-drag suppresses the
 * context menu it would otherwise open; a double click frames the plane (or everything).
 *
 * Listeners attach once: the handlers read the live configuration / state through refs.
 */
export const usePointerGestures = (
    {
        viewElement,
        spaceConfiguration,
        grabModeRef,
        stateRef,
        dispatch,
        setNavDragging,
        motion,
        onPress,
    }: UsePointerGesturesParameters,
) => {
    const spaceConfigRef = useRef(spaceConfiguration);
    spaceConfigRef.current = spaceConfiguration;

    const pointers = useRef<Map<number, { x: number; y: number; type: string }>>(new Map());
    const gesture = useRef<Gesture | null>(null);
    const suppressContextMenu = useRef(false);

    useEffect(() => {
        const element = viewElement.current;
        if (!element || typeof window === 'undefined') {
            return;
        }

        const cfg = () => spaceConfigRef.current;
        const gx = () => {
            const g = cfg().gestures || {};
            return {
                rotate: g.rotateSensitivity ?? 0.22,        // deg per px
                translate: g.translateSensitivity ?? 1,     // px per px
                scale: g.scaleSensitivity ?? 0.004,
                flyLook: g.flyLookSensitivity ?? 0.15,      // deg per px (fly-mode look)
                dragThreshold: g.dragThreshold ?? 4,        // px before a press becomes a drag
                touchTwist: g.touchTwist ?? false,
                doubleClickFrame: g.doubleClickFrame ?? true,
            };
        };

        const batcher = createFrameBatcher((delta: CameraDelta) => {
            dispatch(actions.space.applyCameraDelta(
                applyLocks(delta, cfg().transformLocks),
            ));
        });

        const viewPoint = (clientX: number, clientY: number) => {
            const rect = element.getBoundingClientRect();
            return {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
        };

        const contextFor = (event: PointerEvent): GestureContext => {
            const target = event.target;
            const planeElement = planeElementOf(target);
            const planeID = planeElement?.getAttribute('data-plurid-plane') || '';
            const selection = stateRef.current?.space?.selectedPlaneIDs || [];
            const pointerType = event.pointerType === 'touch' || event.pointerType === 'pen'
                ? event.pointerType
                : 'mouse';

            return {
                pointerType,
                button: event.button,
                buttons: event.buttons,
                shift: event.shiftKey,
                alt: event.altKey,
                ctrl: event.ctrlKey,
                meta: event.metaKey,
                onPlane: !!planeElement,
                onSelectedPlane: !!planeID && selection.includes(planeID),
                onEditable: isEditableTarget(target),
                onControl: isEngineControl(target),
                grabMode: grabModeRef.current,
                firstPerson: cfg().firstPerson,
                transformMode: cfg().transformMode as GestureContext['transformMode'],
                buttonMap: cfg().gestures?.buttonMap,
                touchOne: cfg().gestures?.touchOne,
            };
        };

        // #region auto-pivot
        /**
         * Orbit about the point under the cursor: the hit on the plane under the pointer, else the
         * point on the pivot-depth plane under the pointer; `selection` orbits about the selection's
         * center; `view` keeps the current pivot. A lossless re-parameterization — no visible change.
         */
        const autoPivot = (clientX: number, clientY: number) => {
            const policy = cfg().navigation?.orbitPivot ?? 'cursor';
            if (policy === 'view') {
                return;
            }

            const state = stateRef.current;
            const spaceState = state.space;
            const camera = spaceState.camera;
            const view = spaceState.viewSize;
            const fallback = resolvePlaneFallbackSize(state.configuration, view);
            let pivot: Vec3 | undefined;

            if (policy === 'selection' && spaceState.selectedPlaneIDs.length > 0) {
                const selected = new Set(spaceState.selectedPlaneIDs);
                const planes: any[] = [];
                const walk = (nodes: any[]) => {
                    for (const node of nodes) {
                        if (selected.has(node.planeID)) {
                            planes.push({ ...node, children: undefined });
                        }
                        if (node.children) {
                            walk(node.children);
                        }
                    }
                };
                walk(spaceState.tree);
                const box = cameraEngine.worldBounds(planes, {
                    fallbackWidth: fallback.width,
                    fallbackHeight: fallback.height,
                });
                if (box) {
                    pivot = cameraEngine.boxCenter(box);
                }
            }

            const screen = viewPoint(clientX, clientY);

            if (!pivot) {
                const under = typeof document.elementFromPoint === 'function'
                    ? document.elementFromPoint(clientX, clientY)
                    : null;
                const planeElement = under ? planeElementOf(under) : null;
                const planeID = planeElement?.getAttribute('data-plurid-plane');
                if (planeID) {
                    const plane = spaceEngine.tree.logic.getTreePlaneByID(spaceState.tree, planeID);
                    if (plane) {
                        const pick = cameraEngine.pickPlanePoint(
                            camera,
                            view,
                            {
                                location: plane.location,
                                width: plane.width || fallback.width,
                                height: plane.height || fallback.height,
                            },
                            screen,
                        );
                        if (pick && pick.inside) {
                            pivot = pick.world;
                        }
                    }
                }
            }

            if (!pivot) {
                pivot = cameraEngine.unprojectAtCameraZ(camera, view, screen, camera.offset.z);
            }

            if (pivot && [pivot.x, pivot.y, pivot.z].every(Number.isFinite)) {
                dispatch(actions.space.applyCameraDelta({ pivot }));
            }
        };
        // #endregion auto-pivot

        const beginDrag = (current: Gesture, event: PointerEvent) => {
            current.dragging = true;
            current.lastX = event.clientX;
            current.lastY = event.clientY;

            if (current.intent === 'move-selection') {
                dispatch(actions.space.historyBegin());
                current.historyOpen = true;
                dispatch(actions.space.setDraggingSelection(true));
                // The drag lives on the pressed plane: its center's depth maps screen px to world.
                const state = stateRef.current;
                const pressedID = planeElementOf(event.target)?.getAttribute('data-plurid-plane') || '';
                const pressed = pressedID
                    ? spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, pressedID)
                    : undefined;
                const fallback = resolvePlaneFallbackSize(state.configuration, state.space.viewSize);
                current.dragDepth = pressed
                    ? cameraDepthOf(state.space.camera, state.space.viewSize, planeWorldCenter(pressed, fallback))
                    : state.space.camera.offset.z;
            } else if (current.intent === 'marquee') {
                const start = viewPoint(current.startX, current.startY);
                dispatch(actions.ui.setMarquee({ left: start.x, top: start.y, right: start.x, bottom: start.y }));
            } else {
                setNavDragging(true);
                if (current.intent === 'orbit') {
                    autoPivot(event.clientX, event.clientY);
                }
            }

            try {
                element.setPointerCapture(event.pointerId);
            } catch (_) { /* capture unsupported */ }
        };

        const applyMove = (current: Gesture, dx: number, dy: number, event: PointerEvent) => {
            const sensitivities = gx();
            switch (current.intent) {
                case 'orbit':
                    batcher.add({
                        yaw: dx * sensitivities.rotate,
                        pitch: -dy * sensitivities.rotate,
                    });
                    break;
                case 'pan':
                    batcher.add({
                        pan: {
                            x: dx * sensitivities.translate,
                            y: dy * sensitivities.translate,
                        },
                    });
                    break;
                case 'dolly':
                    batcher.add({ dolly: dy });
                    break;
                case 'zoom': {
                    const perDoubling = DRAG_ZOOM_PX_PER_DOUBLING * (0.004 / Math.max(sensitivities.scale, 1e-6));
                    batcher.add({
                        zoom: {
                            factor: Math.pow(2, -dy / perDoubling),
                            anchor: viewPoint(current.startX, current.startY),
                        },
                    });
                    break;
                }
                case 'look':
                    batcher.add({
                        look: {
                            yaw: dx * sensitivities.flyLook,
                            pitch: -dy * sensitivities.flyLook,
                        },
                    });
                    break;
                case 'move-selection': {
                    // Screen delta → world delta on the dragged plane's depth (exact at any
                    // orientation); Alt moves along the camera's forward direction instead.
                    const state = stateRef.current;
                    const camera = state.space.camera;
                    const view = state.space.viewSize;
                    if (event.altKey) {
                        const forward = cameraForward(camera, view);
                        const amount = dy / (camera.scale || 1);
                        dispatch(actions.space.transformSelectedPlanes({
                            deltaX: forward.x * amount,
                            deltaY: forward.y * amount,
                            deltaZ: forward.z * amount,
                        }));
                    } else {
                        const delta = dragWorldDelta(
                            camera,
                            view,
                            { x: current.lastX - dx, y: current.lastY - dy },
                            { x: current.lastX, y: current.lastY },
                            current.dragDepth,
                        );
                        dispatch(actions.space.transformSelectedPlanes({
                            deltaX: delta.x,
                            deltaY: delta.y,
                            deltaZ: delta.z,
                        }));
                    }
                    break;
                }
                case 'marquee': {
                    const start = viewPoint(current.startX, current.startY);
                    const now = viewPoint(current.lastX, current.lastY);
                    dispatch(actions.ui.setMarquee({ left: start.x, top: start.y, right: now.x, bottom: now.y }));
                    break;
                }
                default:
                    break;
            }
        };

        const twoPointers = () => {
            const points = Array.from(pointers.current.values());
            const a = points[0];
            const b = points[1];
            return {
                distance: Math.hypot(a.x - b.x, a.y - b.y),
                midX: (a.x + b.x) / 2,
                midY: (a.y + b.y) / 2,
                angle: Math.atan2(b.y - a.y, b.x - a.x),
            };
        };

        const applyPinch = (current: Gesture) => {
            if (!current.pinch) {
                return;
            }
            const now = twoPointers();
            const previous = current.pinch;
            const delta: CameraDelta = {};

            if (previous.distance > 0 && now.distance > 0) {
                const factor = now.distance / previous.distance;
                if (factor !== 1) {
                    delta.zoom = {
                        factor,
                        anchor: viewPoint(now.midX, now.midY),
                    };
                }
            }

            const panX = now.midX - previous.midX;
            const panY = now.midY - previous.midY;
            if (panX !== 0 || panY !== 0) {
                delta.pan = { x: panX, y: panY };
            }

            if (gx().touchTwist) {
                let twist = (now.angle - previous.angle) * (180 / Math.PI);
                if (twist > 180) { twist -= 360; }
                if (twist < -180) { twist += 360; }
                if (twist !== 0) {
                    delta.yaw = twist;
                }
            }

            current.pinch = now;
            if (Object.keys(delta).length > 0) {
                batcher.add(delta);
            }
        };

        const finish = (event: PointerEvent | null) => {
            const current = gesture.current;
            gesture.current = null;
            pointers.current.clear();
            if (!current) {
                return;
            }

            batcher.flushNow();

            if (event) {
                try {
                    element.releasePointerCapture(event.pointerId);
                } catch (_) { /* capture unsupported */ }
            }

            if (current.intent === 'move-selection') {
                dispatch(actions.space.setDraggingSelection(false));
                if (current.dragging) {
                    dispatch(snapSelectionNow() as any);
                }
                if (current.historyOpen) {
                    dispatch(actions.space.historyEnd());
                }
                return;
            }
            if (current.intent === 'marquee') {
                dispatch(actions.ui.setMarquee(null));
                if (current.dragging) {
                    const start = viewPoint(current.startX, current.startY);
                    const end = viewPoint(current.lastX, current.lastY);
                    const mode = event?.shiftKey ? 'add' : (event?.altKey ? 'subtract' : 'set');
                    dispatch(selectInScreenRect(
                        { left: start.x, top: start.y, right: end.x, bottom: end.y },
                        mode,
                    ) as any);
                } else if (!event?.shiftKey && !event?.altKey) {
                    // a ⌘/Ctrl-click on empty space clears the selection
                    dispatch(actions.space.clearSelection());
                }
                return;
            }

            setNavDragging(false);

            if (
                current.dragging
                && (current.intent === 'orbit' || current.intent === 'pan')
                && !current.pinch
            ) {
                const now = event?.timeStamp || performance.now();
                const velocity = cameraEngine.estimateVelocity(current.samples, now);
                motion.fling(velocity, current.intent);
            }
        };

        const onPointerDown = (event: PointerEvent) => {
            const current = gesture.current;

            // A second pointer during a gesture → pinch (zoom at the midpoint + two-finger pan).
            if (current && pointers.current.size === 1 && !pointers.current.has(event.pointerId)) {
                pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });
                current.pinch = twoPointers();
                current.dragging = true;
                current.samples = [];
                if (current.intent === 'move-selection') {
                    // a pinch is navigation — end the move cleanly first
                    dispatch(actions.space.setDraggingSelection(false));
                    if (current.historyOpen) {
                        dispatch(actions.space.historyEnd());
                        current.historyOpen = false;
                    }
                    current.intent = 'pan';
                }
                setNavDragging(true);
                try {
                    element.setPointerCapture(event.pointerId);
                } catch (_) { /* capture unsupported */ }
                event.preventDefault();
                return;
            }

            if (current) {
                return;
            }

            // A touch that the browser will scroll natively still reaches us; the intent table
            // decides whether the engine wants it.
            const context = contextFor(event);
            const intent = resolveGestureIntent(context);
            onPress?.();
            trace({ phase: 'down', intent, pointerType: context.pointerType, button: context.button, onPlane: context.onPlane, onControl: context.onControl, onEditable: context.onEditable, pointerId: event.pointerId });
            if (intent === 'none') {
                return;
            }

            motion.cancel();
            pointers.current.clear();
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });
            // A right press that navigates owns the button: the context menu (which some platforms
            // open on press, others on release) is suppressed for this press.
            suppressContextMenu.current = event.button === 2;
            gesture.current = {
                intent,
                button: event.button,
                pointerType: event.pointerType,
                primary: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                lastX: event.clientX,
                lastY: event.clientY,
                dragging: false,
                samples: [{ x: event.clientX, y: event.clientY, time: event.timeStamp || performance.now() }],
                historyOpen: false,
                dragDepth: 0,
                pinch: null,
            };
            // Middle / right presses would otherwise auto-scroll or select; a left press below the
            // threshold must still click, so it is left alone here.
            if (event.button === 1 || event.button === 2) {
                event.preventDefault();
            }
        };

        const onPointerMove = (event: PointerEvent) => {
            const current = gesture.current;
            if (!current || !pointers.current.has(event.pointerId)) {
                trace({ phase: 'move-ignored', hasGesture: !!current, known: pointers.current.has(event.pointerId), pointerId: event.pointerId });
                return;
            }
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });

            if (current.pinch) {
                if (pointers.current.size >= 2) {
                    applyPinch(current);
                    event.preventDefault();
                }
                return;
            }

            if (event.pointerId !== current.primary) {
                return;
            }

            const coalesced: PointerEvent[] = typeof (event as any).getCoalescedEvents === 'function'
                ? ((event as any).getCoalescedEvents() as PointerEvent[])
                : [];
            const events = coalesced.length > 0 ? coalesced : [event];
            for (const sample of events) {
                current.samples.push({
                    x: sample.clientX,
                    y: sample.clientY,
                    time: sample.timeStamp || performance.now(),
                });
            }
            if (current.samples.length > MAX_SAMPLES) {
                current.samples.splice(0, current.samples.length - MAX_SAMPLES);
            }

            if (!current.dragging) {
                const moved = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
                if (moved < gx().dragThreshold) {
                    return;
                }
                trace({ phase: 'drag-begin', intent: current.intent, pointerId: event.pointerId });
                beginDrag(current, event);
                return;
            }

            const dx = event.clientX - current.lastX;
            const dy = event.clientY - current.lastY;
            current.lastX = event.clientX;
            current.lastY = event.clientY;
            if (dx !== 0 || dy !== 0) {
                applyMove(current, dx, dy, event);
            }
            event.preventDefault();
        };

        const onPointerEnd = (event: PointerEvent) => {
            const current = gesture.current;
            if (!current) {
                pointers.current.delete(event.pointerId);
                return;
            }
            if (!pointers.current.has(event.pointerId)) {
                return;
            }

            pointers.current.delete(event.pointerId);

            if (current.pinch) {
                if (pointers.current.size >= 2) {
                    current.pinch = twoPointers();
                    return;
                }
                current.pinch = null;
                if (pointers.current.size === 1) {
                    // continue as a single-pointer pan with the remaining finger
                    const [id, remaining] = Array.from(pointers.current.entries())[0];
                    current.primary = id;
                    current.intent = 'pan';
                    current.lastX = remaining.x;
                    current.lastY = remaining.y;
                    current.samples = [];
                    return;
                }
            }

            if (pointers.current.size > 0) {
                return;
            }

            finish(event);
        };

        const onWindowPointerEnd = (event: PointerEvent) => {
            if (gesture.current && pointers.current.has(event.pointerId)) {
                onPointerEnd(event);
            }
        };

        const onLostCapture = (event: PointerEvent) => {
            // A touch is implicitly captured by the element it landed on; taking the capture for
            // the view makes THAT element lose it (a bubbling `lostpointercapture` that is not the
            // end of the gesture). Only the view losing its own capture ends the gesture.
            if (event.target !== element) {
                return;
            }
            if (gesture.current && pointers.current.has(event.pointerId) && !gesture.current.pinch) {
                onPointerEnd(event);
            }
        };

        const onBlur = () => {
            if (gesture.current) {
                finish(null);
            }
        };

        const onContextMenu = (event: MouseEvent) => {
            if (suppressContextMenu.current) {
                suppressContextMenu.current = false;
                event.preventDefault();
            }
        };

        const onDoubleClick = (event: MouseEvent) => {
            if (!gx().doubleClickFrame) {
                return;
            }
            if (isEditableTarget(event.target) || isEngineControl(event.target)) {
                return;
            }
            const planeElement = planeElementOf(event.target);
            const planeID = planeElement?.getAttribute('data-plurid-plane');
            motion.cancel();
            if (planeID) {
                dispatch(framePlaneByID(planeID, true) as any);
            } else {
                dispatch(fitToView({ animate: true }) as any);
            }
            event.preventDefault();
        };

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove, { passive: false });
        element.addEventListener('pointerup', onPointerEnd);
        element.addEventListener('pointercancel', onPointerEnd);
        element.addEventListener('lostpointercapture', onLostCapture);
        element.addEventListener('contextmenu', onContextMenu);
        element.addEventListener('dblclick', onDoubleClick);
        window.addEventListener('pointerup', onWindowPointerEnd);
        window.addEventListener('pointercancel', onWindowPointerEnd);
        window.addEventListener('blur', onBlur);

        return () => {
            batcher.cancel();
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerEnd);
            element.removeEventListener('pointercancel', onPointerEnd);
            element.removeEventListener('lostpointercapture', onLostCapture);
            element.removeEventListener('contextmenu', onContextMenu);
            element.removeEventListener('dblclick', onDoubleClick);
            window.removeEventListener('pointerup', onWindowPointerEnd);
            window.removeEventListener('pointercancel', onWindowPointerEnd);
            window.removeEventListener('blur', onBlur);
        };
    }, []);
}
// #endregion module



// #region exports
export default usePointerGestures;
// #endregion exports
