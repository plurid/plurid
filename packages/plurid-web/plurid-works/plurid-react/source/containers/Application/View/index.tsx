// #region imports
    // #region libraries
    import React, {
        useRef,
        useCallback,
        useMemo,
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        objects,
    } from '@plurid/plurid-functions';

    import {
        /** constants */
        PLURID_ENTITY_VIEW,
        PLURID_DEFAULT_PREVENT_OVERSCROLL_TIMEOUT,

        /** enumerations */
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,

        /** interfaces */
        PluridApplication as PluridApplicationProperties,
        PluridConfiguration as PluridAppConfiguration,
        PluridContext,
        PluridView,
        TreePlane,
        PlaneLink,
        SpaceTransform,
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import Context from '~services/context';

    import {
        handleGlobalShortcuts,
    } from '~services/logic/shortcuts';

    import {
        interaction,
    } from '~services/engine';

    import {
        isEditableTarget,
        planeElementOf,
        isScrollableAlong,
    } from '~services/logic/input/guard';

    import {
        normalizeWheel,
        wheelToDelta,
        createWheelHistory,
    } from '~services/logic/input/wheel';

    import {
        applyLocks,
    } from '~services/logic/input/gesture';

    import {
        createFrameBatcher,
        createSmoothedBatcher,
    } from '~services/logic/input/frame';

    import { AppState } from '~services/state/store';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import StateContext from '~services/state/context';
    import {
        DispatchAction,
        DispatchActionWithoutPayload,
    } from '~data/interfaces';
    // import {
    //     ViewSize,
    // } from '~services/state/types/space';
    // #endregion external


    // #region internal
    import {
        StyledView,
    } from './styled';

    import PluridViewContainer from './Container';

    import useGrabMode from './hooks/useGrabMode';
    import useCameraMotion from './hooks/useCameraMotion';
    import useGamepad from './hooks/useGamepad';
    import PluridEmpty from '~components/structural/Empty';
    import PluridMarquee from '~components/structural/Marquee';
    import PluridLiveRegion from '~components/utilities/LiveRegion';
    import useCulling from './hooks/useCulling';
    import { warnOnce } from '~services/logic/development/warn';
    import {
        resolvePlaneFallbackSize,
        cameraCommand,
    } from '~services/logic/camera';
    import { PluridThunkExtra } from '~services/state/extra';
    import useFlyControls from './hooks/useFlyControls';
    import useViewResize from './hooks/useViewResize';
    import usePointerGestures from './hooks/usePointerGestures';
    import useTreeUpdate from './hooks/useTreeUpdate';
    import usePluridPubSub from './hooks/usePluridPubSub';
    import useCollaboration from './hooks/useCollaboration';
    import useEngineEvents from './hooks/useEngineEvents';
    import useViewpointURL from './hooks/useViewpointURL';
    // #endregion internal
// #endregion imports



// #region module
/** The engine overlay (minimap, toolbar, viewcube, dialog, HUD) an event target sits in, if any. */
const overlayOf = (
    target: EventTarget | null,
): Element | null => {
    const element = target as Element | null;
    if (!element || typeof element.closest !== 'function') {
        return null;
    }
    return element.closest('[data-plurid-overlay]');
};

/** Whether the tree's roots already are the view's items, in order (string items by route suffix). */
const rootsMatchView = (
    tree: TreePlane[],
    view: PluridApplicationView,
): boolean => (
    tree.length === view.length
    && view.every((item, index) => {
        if (typeof item !== 'string') {
            return true;
        }
        const root = tree[index];
        return root.route === item
            || root.sourceID === item
            || root.route.endsWith(item);
    })
);

export interface PluridViewOwnProperties extends PluridApplicationProperties<PluridReactComponent> {
    /** The store's thunk extra holder (from `PluridApplication`): the View registers its motion controller in it. */
    thunkExtra?: PluridThunkExtra;
}

export interface PluridViewStateProperties {
    state: AppState;
    stateConfiguration: PluridAppConfiguration;
    // stateDataUniverses: Indexed<PluridInternalStateUniverse>;
    // viewSize: ViewSize;
    stateSpaceLoading: boolean;
    stateResolvedLayout: boolean;
    stateTransform: SpaceTransform;
    // initialTree: TreePlane[];
    stateTree: TreePlane[];
    stateLinks: PlaneLink[];
    // activeUniverseID: string;
    // stateSpaceLocation: any;
    // stateCulledView: any;
    stateSpaceView: PluridApplicationView;
    stateGeneralTheme: Theme;
    /** The page the camera is docked on (the page presentation), `''` otherwise. */
    stateDockedPlaneID: string;
}

export interface PluridViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    dispatchSetConfiguration: DispatchAction<typeof actions.configuration.setConfiguration>;
    dispatchSetConfigurationMicro: DispatchActionWithoutPayload<typeof actions.configuration.setConfigurationMicro>;

    // dispatchSetUniverses: DispatchAction<typeof actions.data.setUniverses>;
    dispatchSetSpaceField: DispatchAction<typeof actions.space.setSpaceField>;

    dispatchSetSpaceLoading: DispatchAction<typeof actions.space.setSpaceLoading>;
    dispatchSetAnimatedTransform: DispatchAction<typeof actions.space.setAnimatedTransform>;
    dispatchSetTransformTime: DispatchAction<typeof actions.space.setTransformTime>;
    dispatchSetSpaceLocation: DispatchAction<typeof actions.space.setSpaceLocation>;
    dispatchSetTree: DispatchAction<typeof actions.space.setTree>;
    // dispatchSetSpaceSize: DispatchAction<typeof actions.space.setSpaceSize>;

    dispatchSetGeneralTheme: DispatchAction<typeof actions.themes.setGeneralTheme>;
    dispatchSetInteractionTheme: DispatchAction<typeof actions.themes.setInteractionTheme>;

    dispatchRotateXWith: DispatchAction<typeof actions.space.rotateXWith>;
    dispatchRotateX: DispatchAction<typeof actions.space.rotateX>;
    dispatchRotateYWith: DispatchAction<typeof actions.space.rotateYWith>;
    dispatchRotateY: DispatchAction<typeof actions.space.rotateY>;
    // dispatchTranslateX: DispatchAction<typeof actions.space.translateX>;
    dispatchTranslateXWith: DispatchAction<typeof actions.space.translateXWith>;
    // dispatchTranslateY: DispatchAction<typeof actions.space.translateY>;
    dispatchTranslateYWith: DispatchAction<typeof actions.space.translateYWith>;
    dispatchTranslateZWith: DispatchAction<typeof actions.space.translateZWith>;
    // dispatchScaleUp: DispatchAction<typeof actions.space.scaleUp>;
    dispatchScaleUpWith: DispatchAction<typeof actions.space.scaleUpWith>;
    // dispatchScaleDown: DispatchAction<typeof actions.space.scaleDown>;
    dispatchScaleDownWith: DispatchAction<typeof actions.space.scaleDownWith>;

    // dispatchSetActiveUniverse: DispatchAction<typeof actions.space.setActiveUniverse>;

    dispatchSpaceSetViewSize: DispatchAction<typeof actions.space.setViewSize>;
    dispatchSpaceSetView: DispatchAction<typeof actions.space.spaceSetView>;
    // dispatchSpaceSetCulledView: DispatchAction<typeof actions.space.spaceSetCulledView>;

    // dispatchDataSetPlaneSources: DispatchAction<typeof actions.data.setPlaneSources>;
}

export type PluridViewProperties =
    & PluridViewOwnProperties
    & PluridViewStateProperties
    & PluridViewDispatchProperties;


const PluridView: React.FC<PluridViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // view,
            planesRegistrar,
            customPlane,
            planeContext,
            planeContextValue,
            pubsub,
            planeNotFound,
            planeRenderError,
            matchedRoute,
            hostname,
            // #endregion values
        // #endregion required


        // #region state
        state,
        stateConfiguration,
        // stateSpaceLoading,
        stateResolvedLayout,
        stateTransform,
        stateSpaceView,
        stateTree,
        stateLinks,
        stateGeneralTheme,
        stateDockedPlaneID,
        // #endregion state


        // #region dispatch
        dispatch,
        dispatchSetConfiguration,
        // dispatchSetConfigurationMicro,
        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,

        dispatchSetSpaceField,
        // dispatchSetSpaceLoading,
        dispatchSetSpaceLocation,
        dispatchSetAnimatedTransform,
        dispatchSetTransformTime,
        // dispatchSetInitialTree,
        dispatchSetTree,

        dispatchRotateXWith,
        dispatchRotateX,
        dispatchRotateYWith,
        dispatchRotateY,
        dispatchTranslateXWith,
        dispatchTranslateYWith,
        dispatchTranslateZWith,
        dispatchScaleUpWith,
        dispatchScaleDownWith,

        dispatchSpaceSetViewSize,
        dispatchSpaceSetView,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region references
    const viewElement = useRef<HTMLDivElement | null>(null);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();
    // Always-latest snapshot of the full app state for event handlers. Lets the keydown
    // callback read fresh state without being recreated on every transform tick — which
    // previously forced the keydown+wheel listeners to detach/reattach each frame.
    const stateRef = useRef(state);
    stateRef.current = state;

    // Native Pointer-Events gesture state (live pointers, pinch, momentum) + the always-latest
    // space-config ref now live inside `usePointerGestures`.
    // #endregion references


    // #region state
    // Grab/navigate mode (G toggles, Space holds, Escape exits) — see `useGrabMode`. `grabModeRef`
    // mirrors the effective value every render so the pointer + wheel handlers read it live.
    const { grabMode, grabModeRef } = useGrabMode({
        viewElement,
        stateUI: state.ui,
        shortcuts: stateConfiguration.space.shortcuts,
        dispatch,
    });
    const [navDragging, setNavDragging] = useState(false);

    // The one rAF loop for programmatic motion (tweens + flings); every input cancels it.
    const motion = useCameraMotion({
        dispatch,
        stateRef,
        spaceConfiguration: stateConfiguration.space,
    });

    // Thunks (frame / fit / home / presets / `space.frame` …) tween through THIS controller: it is
    // handed to them as the store's thunk extra argument for the life of the View.
    useEffect(() => {
        const extra = properties.thunkExtra;
        if (!extra) {
            return;
        }
        extra.motion = motion;
        extra.view = viewElement.current;
        return () => {
            if (extra.motion === motion) {
                extra.motion = undefined;
                extra.view = undefined;
            }
        };
    }, [
        properties.thunkExtra,
        motion,
    ]);

    // Opt-in gamepad navigation (`gestures.gamepad.enabled`): sticks orbit/pan, triggers zoom.
    useGamepad({
        dispatch,
        stateRef,
        motion,
    });

    // Culling + depth cues, throttled to one pass per 100 ms after a camera commit / tree change.
    useCulling({
        dispatch,
        stateRef,
        transform: state.space.transform,
        tree: stateTree,
        viewElement,
    });

    // Animated relayouts glide for the configured motion duration, instant under reduced motion.
    const layoutTransitionDuration = motion.reducedMotion()
        ? 0
        : (stateConfiguration.space.navigation?.motion?.duration ?? 380);

    // Wheel input is coalesced per frame like the pointer input, and EASED: each frame releases
    // `gestures.wheelSmoothing` of what is still pending (raw under reduced motion), so a burst of
    // wheel events glides to its exact total instead of stepping. A press cancels the tail.
    const wheelBatcher = useMemo(() => createSmoothedBatcher((delta) => {
        // a camera tween owns the camera: the wheel's tail never fights it
        if (stateRef.current.space.motion === 'tween') {
            return;
        }
        dispatch(actions.space.applyCameraDelta(
            applyLocks(delta, stateRef.current.configuration.space.transformLocks),
        ));
    }, {
        rate: () => (motion.reducedMotion()
            ? 1
            : (stateRef.current.configuration.space.gestures?.wheelSmoothing ?? 0.6)),
    }), [
        motion,
    ]);
    // The device of the current wheel stream (a fast trackpad flick must not read as a mouse notch).
    const wheelHistory = useRef(createWheelHistory());
    // A page docks: whatever the wheel still had pending is dropped (the dock pose is exact).
    useEffect(() => {
        if (stateDockedPlaneID) {
            wheelBatcher.cancel();
        }
    }, [
        stateDockedPlaneID,
        wheelBatcher,
    ]);

    const [
        preventOverscroll,
        setPreventOverscroll,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const handlePreventOverscroll = (
        event: WheelEvent,
    ) => {
        if (
            event.shiftKey
            || event.altKey
            || event.metaKey
            || event.ctrlKey
        ) {
            setPreventOverscroll(true);
        }

        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setPreventOverscroll(false);
        }, PLURID_DEFAULT_PREVENT_OVERSCROLL_TIMEOUT);
    }

    // Layout computation (treeUpdate + treeUpdateCallback + resolveLayout) lives in `useTreeUpdate`.
    const {
        treeUpdate,
        treeUpdateCallback,
        resolveLayout,
    } = useTreeUpdate({
        view: stateSpaceView,
        configuration: stateConfiguration,
        tree: stateTree,
        viewSize: state.space.viewSize,
        hostname,
        planesRegistrar,
        dispatchSetTree,
        dispatchSetLayoutTransition: (milliseconds) => dispatch(actions.space.setLayoutTransition(milliseconds)),
        layoutTransitionDuration,
    });

    // The pubsub bridge — registry + `registerPubSub` + the ~23 topic subscriptions + the
    // transform/config re-publish — lives in `usePluridPubSub`. Placed AFTER `useTreeUpdate`
    // (it needs `treeUpdate`) and BEFORE `shortcutsCallback`/`pluridContext` (they read
    // `pluridPubSub[0]` + `registerPubSub`).
    const {
        pluridPubSub,
        registerPubSub,
    } = usePluridPubSub({
        pubsub,
        state,
        stateConfiguration,
        stateTransform,
        stateSpaceView,
        stateTree,
        dispatch,
        treeUpdate,
        dispatchers: {
            dispatchSetConfiguration,
            dispatchSetGeneralTheme,
            dispatchSetInteractionTheme,
            dispatchSetSpaceLocation,
            dispatchSetAnimatedTransform,
            dispatchSetTransformTime,
            dispatchRotateXWith,
            dispatchRotateX,
            dispatchRotateYWith,
            dispatchRotateY,
            dispatchTranslateXWith,
            dispatchTranslateYWith,
            dispatchTranslateZWith,
            dispatchSpaceSetView,
            dispatchSetSpaceField,
            dispatchSetTree,
        },
    });

    // Collaboration seam: emit/apply shared-arrangement snapshots on the instance pubsub (the host
    // bridges it to a transport). Same pubsub the bridge subscribes its topics on.
    useCollaboration({
        enabled: stateConfiguration.space.collaboration === true,
        pubsub: pluridPubSub[0],
        stateTree,
        stateLinks,
        dispatch,
    });

    // Engine→host OBSERVE channel: publish `space.changed` { kind, value } whenever a watched slice
    // changes. Always on (publishing to a no-subscriber topic is free); the host subscribes only if it
    // cares. Same instance pubsub as the control bridge + collaboration.
    useEngineEvents({
        pubsub: pluridPubSub[0],
        state,
    });

    // Optionally bind the camera viewpoint with the URL's `?<param>=` — BOTH directions opt-in
    // (default off, no URL pollution), param-name configurable.
    useViewpointURL({
        stateCamera: state.space.camera,
        stateViewSize: state.space.viewSize,
        stateCameraLimits: state.space.cameraLimits,
        dispatchSetCamera: (camera) => dispatch(actions.space.setCamera(camera)),
        write: stateConfiguration.space.viewpointURLWrite === true,
        restore: stateConfiguration.space.viewpointURLRestore === true,
        param: stateConfiguration.space.viewpointURLParam || 'v',
        version: stateConfiguration.space.viewpointURLVersion,
        debounce: stateConfiguration.space.viewpointURLDebounce,
    });

    // Keep the camera's lens + limits in step with the (live-reconfigurable) configuration.
    const navigationSignature = JSON.stringify(stateConfiguration.space.navigation || null);
    useEffect(() => {
        dispatch(actions.space.setPerspective(stateConfiguration.space.perspective || 2000));
    }, [
        stateConfiguration.space.perspective,
    ]);
    useEffect(() => {
        dispatch(actions.space.setCameraLimits(
            interaction.camera.resolveCameraLimits(stateConfiguration.space.navigation),
        ));
    }, [
        navigationSignature,
    ]);
    // #endregion handlers


    // #region callbacks
    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        const {
            transformLocks,
        } = stateConfiguration.space;

        // A key on the space is an input: it interrupts any tween / fling in flight — BEFORE the
        // shortcut runs, so a shortcut that itself starts a tween (frame the active plane, a root
        // by index, home, the arrows) keeps its motion instead of losing it on the same keystroke.
        if (!isEditableTarget(event.target)) {
            motion.cancel();
        }

        handleGlobalShortcuts(
            dispatch,
            stateRef.current,
            pluridPubSub[0],
            event,
            stateConfiguration.space.firstPerson,
            transformLocks,
            stateConfiguration.space.shortcuts,
        );
    }, [
        pluridPubSub,
        stateConfiguration.space.firstPerson,
        stateConfiguration.space.transformLocks,
        stateConfiguration.space.shortcuts,
        dispatch,
        motion,
    ]);

    const wheelCallback = useCallback((event: WheelEvent) => {
        handlePreventOverscroll(event);

        // Typing targets keep their own scrolling; so do the engine's overlays (minimap, toolbar
        // drawers, dialogs) — a wheel over them never reaches the camera.
        if (isEditableTarget(event.target) || overlayOf(event.target)) {
            return;
        }

        const spaceConfiguration = stateRef.current.configuration.space;
        const viewSize = stateRef.current.space.viewSize;
        const element = viewElement.current;
        if (!element) {
            return;
        }

        const normalized = normalizeWheel(event, viewSize.height, wheelHistory.current);
        const rect = element.getBoundingClientRect();
        const planeElement = planeElementOf(event.target);
        const scrollable = !!planeElement && (
            isScrollableAlong(event.target, 'y', normalized.dy, planeElement)
            || isScrollableAlong(event.target, 'x', normalized.dx, planeElement)
        );
        const gestures = spaceConfiguration.gestures || {};

        const resolution = wheelToDelta(normalized, {
            transformMode: spaceConfiguration.transformMode as any,
            grabMode: grabModeRef.current,
            firstPerson: spaceConfiguration.firstPerson,
            onPlane: !!planeElement,
            scrollable,
            docked: !!selectors.space.getDockedPlaneID(stateRef.current),
            shift: event.shiftKey,
            alt: event.altKey,
            ctrlOrMeta: event.ctrlKey || event.metaKey,
            locks: spaceConfiguration.transformLocks,
            policy: gestures.buttonMap?.wheel === 'disabled' ? 'disabled' : gestures.wheel,
            trackpadScroll: gestures.trackpadScroll,
            wheelZoomStep: gestures.wheelZoomStep,
            trackpadPinchSensitivity: gestures.trackpadPinchSensitivity,
            rotateSensitivity: gestures.rotateSensitivity,
            anchor: {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            },
        });

        if (resolution.kind === 'scroll') {
            return;
        }

        if (resolution.preventDefault) {
            event.preventDefault();
        }
        motion.cancel();
        wheelBatcher.add(resolution.delta);
    }, [
        motion,
        wheelBatcher,
    ]);

    // The overscroll flag's timer must not fire after unmount.
    useEffect(() => () => {
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }
    }, []);

    // #endregion callbacks


    // #region handlers
        // #region handlers touch
        // Touch/pointer gestures are handled by native Pointer Events in the
        // '#region effects pointer' effect below (replaced HammerJS).
        // #endregion handlers touch
    // #endregion handlers


    // #region effects
        // #region effects listeners
        /** Keydown, Wheel Listeners */
        useEffect(() => {
            if (viewElement.current) {
                viewElement.current.addEventListener(
                    'keydown',
                    shortcutsCallback,
                    {
                        passive: false,
                    },
                );
                viewElement.current.addEventListener(
                    'wheel',
                    wheelCallback,
                    {
                        passive: false,
                    },
                );
            }

            return () => {
                if (viewElement.current) {
                    viewElement.current.removeEventListener(
                        'keydown',
                        shortcutsCallback,
                    );
                    viewElement.current.removeEventListener(
                        'wheel',
                        wheelCallback,
                    );
                }
            }
        }, [
            shortcutsCallback,
            wheelCallback,
            viewElement.current,
        ]);

        // Window-resize handling (debounced view-size measure + tree recompute) lives in
        // `useViewResize`.
        useViewResize({
            viewElement,
            dispatchSpaceSetViewSize,
            treeUpdateCallback,
        });
        // #endregion effects listeners


        // #region effects pointer
        // Native Pointer-Events gestures (orbit/pan/scale, two-pointer pinch, momentum) live in
        // `usePointerGestures`.
        usePointerGestures({
            viewElement,
            spaceConfiguration: stateConfiguration.space,
            grabModeRef,
            stateRef,
            dispatch,
            setNavDragging,
            motion,
            onPress: () => wheelBatcher.cancel(),
        });
        // #endregion effects pointer


        // #region effects fly
        // First-person "fly" controls (held-key movement + pointer-lock mouse-look) live in
        // `useFlyControls`.
        useFlyControls({
            viewElement,
            firstPerson: stateConfiguration.space.firstPerson,
            spaceConfiguration: stateConfiguration.space,
            dispatch,
            motion,
        });
        // #endregion effects fly


        // #region effects grab-mode
        // Grab/navigate mode (G toggle / Escape exit) now lives in `useGrabMode`.
        // #endregion effects grab-mode


        // #region effects tree update
        useEffect(() => {
            treeUpdateCallback();
        }, [
        //     stateSpaceView,
        ]);
        // #endregion effects tree update


        // #region layout
        useEffect(() => {
            if (!stateResolvedLayout) {
                resolveLayout();
                dispatchSetSpaceField({
                    field: 'resolvedLayout',
                    value: true,
                });
            }
        }, [
            stateResolvedLayout,
        ]);

        // A layout change on a LIVE space (the host switched `space.layout`): relayout with the
        // planes gliding to their new placements — no remount, children stay attached.
        const layoutRef = useRef(stateConfiguration.space.layout);
        useEffect(() => {
            if (layoutRef.current === stateConfiguration.space.layout) {
                return;
            }
            layoutRef.current = stateConfiguration.space.layout;
            if (!stateResolvedLayout) {
                return;
            }
            treeUpdate(stateSpaceView, stateConfiguration, true, { transition: true });
        }, [
            stateConfiguration.space.layout,
        ]);

        // The `view` prop changed on a live space (through `SET_STATE`): relayout with the new
        // roots — unless the tree already reflects it (the `view.addPlane` / `view.removePlane`
        // topics set the view AND relayout themselves).
        const viewRef = useRef(stateSpaceView);
        useEffect(() => {
            if (viewRef.current === stateSpaceView) {
                return;
            }
            viewRef.current = stateSpaceView;
            if (!stateResolvedLayout || rootsMatchView(stateTree, stateSpaceView)) {
                return;
            }
            treeUpdate(stateSpaceView, stateConfiguration, true, { transition: true });
        }, [
            stateSpaceView,
        ]);

        // The measured view size changed (the first real measurement after the fallback, a
        // container resize, a sidebar toggle): relay the roots with it. The first layout ran
        // against whatever size was known then; only a window resize relaid before.
        const layoutViewSizeRef = useRef(state.space.viewSize);
        useEffect(() => {
            const viewSize = state.space.viewSize;
            const previous = layoutViewSizeRef.current;
            layoutViewSizeRef.current = viewSize;
            if (!stateResolvedLayout) {
                return;
            }
            if (previous.width === viewSize.width && previous.height === viewSize.height) {
                return;
            }
            // A docked page stays docked through the relayout (its view-sized box changed with the view).
            const docked = selectors.space.getDockedPlaneID(stateRef.current);
            treeUpdateCallback();
            if (docked) {
                dispatch(cameraCommand({ kind: 'dock', planeID: docked }, { animate: false }) as any);
            }
        }, [
            state.space.viewSize.width,
            state.space.viewSize.height,
            stateResolvedLayout,
        ]);

        // `space.center`: on a FRESH space (identity camera, nothing restored) pan once so the first
        // root's center sits at the view center, as soon as that root has been measured.
        const centeredRef = useRef(false);
        useEffect(() => {
            if (centeredRef.current || !stateResolvedLayout || !stateConfiguration.space.center) {
                return;
            }
            const spaceState = stateRef.current.space;
            const root = spaceState.tree[0];
            const element = viewElement.current;
            const view = spaceState.viewSize;
            // Only once the state's view size IS the element's (the fallback size never centers
            // anything) and the first root has a measured height.
            if (
                !root || !(root.height > 0) || !element
                || element.offsetWidth !== view.width || element.offsetHeight !== view.height
            ) {
                return;
            }
            const camera = spaceState.camera;
            const fresh = camera.yaw === 0 && camera.pitch === 0 && camera.scale === 1
                && camera.offset.x === 0 && camera.offset.y === 0 && camera.offset.z === 0;
            centeredRef.current = true;
            if (!fresh) {
                return;
            }
            // The width the root renders at for THIS view (its measurement may still trail).
            const width = (root.sizeMode === 'manual' || root.sizeMode === 'declared') && root.width > 0
                ? root.width
                : resolvePlaneFallbackSize(stateRef.current.configuration, view).width;
            dispatch(actions.space.applyCameraDelta({
                pan: {
                    x: view.width / 2 - (root.location.translateX + width / 2),
                    y: view.height / 2 - (root.location.translateY + root.height / 2),
                },
            }));
        }, [
            stateResolvedLayout,
            stateTree[0]?.width,
            stateTree[0]?.height,
            state.space.viewSize.width,
            state.space.viewSize.height,
        ]);

        // Development warning: a view item that matched no registered plane (a typo in a route,
        // a plane missing from `planes`) silently renders nothing.
        useEffect(() => {
            if (!stateResolvedLayout || stateTree.length >= stateSpaceView.length) {
                return;
            }
            const missing = stateSpaceView.filter((item) => typeof item === 'string'
                && !stateTree.some((root) => root.route === item || root.sourceID === item || root.route.endsWith(item)));
            if (missing.length > 0) {
                warnOnce(
                    'view-unregistered:' + missing.join(','),
                    `the view lists ${missing.length} route(s) with no registered plane: ${missing.join(', ')} — register them in \`planes\` or drop them from \`view\`.`,
                    stateConfiguration.development?.warnings !== false,
                );
            }
        }, [
            stateResolvedLayout,
            stateTree,
            stateSpaceView,
        ]);

        // Close the transition window once the relayout has glided.
        useEffect(() => {
            const milliseconds = state.space.layoutTransition;
            if (!milliseconds) {
                return;
            }
            const timer = setTimeout(() => {
                dispatch(actions.space.setLayoutTransition(0));
            }, milliseconds + 40);
            return () => {
                clearTimeout(timer);
            };
        }, [
            state.space.layoutTransition,
        ]);
        // #endregion layout
    // #endregion effects


    // #region render
    // Memoized so the `Context.Provider` value below is referentially stable across View's many
    // re-renders (it re-renders on every transform tick / spawn dispatch). A fresh context object
    // each render would re-render EVERY `useContext(Context)` consumer — i.e. every plane — no
    // matter how well `React.memo` + structural sharing gate their props. Stable here ⇒ planes
    // only re-render when their own data actually changes.
    const pluridContext = useMemo<PluridContext<PluridReactComponent>>(() => ({
        planesRegistrar,
        planeContext,
        planeContextValue,
        customPlane,
        planeNotFound,
        planeRenderError,
        matchedRoute,
        hostname,

        defaultPubSub: pluridPubSub[0],
        registerPubSub,
    }), [
        planesRegistrar,
        planeContext,
        planeContextValue,
        customPlane,
        planeNotFound,
        planeRenderError,
        matchedRoute,
        hostname,
        pluridPubSub,
        registerPubSub,
    ]);

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            theme={stateGeneralTheme}
            transformMode={stateConfiguration.space.transformMode}
            grabNavigation={grabMode}
            navDragging={navDragging}
            firstPerson={stateConfiguration.space.firstPerson}
            preventOverscroll={preventOverscroll}
            data-plurid-entity={PLURID_ENTITY_VIEW}
            data-plurid-docked={stateDockedPlaneID || undefined}
            role="application"
            aria-roledescription="3D space"
            aria-label="plurid space"
        >
            <Context.Provider
                value={pluridContext}
            >
                <PluridLiveRegion />
                <PluridMarquee />

                {stateSpaceView.length !== 0 ? (
                    <PluridViewContainer
                        renderToolbar={properties.renderToolbar as any}
                        renderViewcube={properties.renderViewcube as any}
                        renderMinimap={properties.renderMinimap as any}
                        renderShortcuts={properties.renderShortcuts as any}
                    />
                ) : (
                    stateResolvedLayout
                        ? (properties.renderEmpty
                            ? (properties.renderEmpty as any)()
                            : <PluridEmpty />)
                        : <></>
                )}
            </Context.Provider>
        </StyledView>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridViewStateProperties => ({
    state,
    stateConfiguration: selectors.configuration.getConfiguration(state),
    // stateDataUniverses: selectors.data.getUniverses(state),
    // viewSize: selectors.space.getViewSize(state),
    stateTransform: selectors.space.getTransform(state),
    stateResolvedLayout: selectors.space.getResolvedLayout(state),
    stateTree: selectors.space.getTree(state),
    stateLinks: selectors.space.getPlaneLinks(state),
    // activeUniverseID: selectors.space.getActiveUniverseID(state),
    stateSpaceLoading: selectors.space.getLoading(state),
    // stateSpaceLocation: selectors.space.getTransform(state),
    // stateCulledView: selectors.space.getCulledView(state),
    stateSpaceView: selectors.space.getView(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateDockedPlaneID: selectors.space.getDockedPlaneID(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewDispatchProperties => ({
    dispatch,

    dispatchSetConfiguration: (payload) => dispatch(
        actions.configuration.setConfiguration(payload),
    ),
    dispatchSetConfigurationMicro: () => dispatch(
        actions.configuration.setConfigurationMicro(),
    ),

    // dispatchSetUniverses: (universes: any) => dispatch(
    //     actions.data.setUniverses(universes),
    // ),
    dispatchSetSpaceField: (payload) => dispatch(
        actions.space.setSpaceField(payload),
    ),
    dispatchSpaceSetViewSize: (payload) => dispatch(
        actions.space.setViewSize(payload),
    ),

    dispatchSetSpaceLoading: (payload) => dispatch(
        actions.space.setSpaceLoading(payload),
    ),
    dispatchSetAnimatedTransform: (payload) => dispatch(
        actions.space.setAnimatedTransform(payload),
    ),
    dispatchSetTransformTime: (payload) => dispatch(
        actions.space.setTransformTime(payload),
    ),
    dispatchSetSpaceLocation: (payload) => dispatch(
        actions.space.setSpaceLocation(payload),
    ),
    dispatchSetTree: (payload) => dispatch(
        actions.space.setTree(payload),
    ),
    // dispatchSetSpaceSize: (payload) => dispatch(
    //     actions.space.setSpaceSize(payload)
    // ),

    dispatchSetGeneralTheme: (payload) => dispatch(
        actions.themes.setGeneralTheme(payload),
    ),
    dispatchSetInteractionTheme: (payload) => dispatch(
        actions.themes.setInteractionTheme(payload),
    ),

    dispatchRotateX: (payload) => dispatch(
        actions.space.rotateX(payload),
    ),
    dispatchRotateXWith: (payload) => dispatch(
        actions.space.rotateXWith(payload),
    ),
    dispatchRotateY: (payload) => dispatch(
        actions.space.rotateY(payload),
    ),
    dispatchRotateYWith: (payload) => dispatch(
        actions.space.rotateYWith(payload),
    ),
    // dispatchTranslateX: (payload) => dispatch(
    //     actions.space.translateX(payload),
    // ),
    dispatchTranslateXWith: (payload) => dispatch(
        actions.space.translateXWith(payload),
    ),
    // dispatchTranslateY: (payload) => dispatch(
    //     actions.space.translateY(payload),
    // ),
    dispatchTranslateYWith: (payload) => dispatch(
        actions.space.translateYWith(payload),
    ),
    dispatchTranslateZWith: (payload) => dispatch(
        actions.space.translateZWith(payload),
    ),
    // dispatchScaleUp: (payload) => dispatch(
    //     actions.space.scaleUp(payload),
    // ),
    dispatchScaleUpWith: (payload) => dispatch(
        actions.space.scaleUpWith(payload),
    ),
    // dispatchScaleDown: (payload) => dispatch(
    //     actions.space.scaleDown(payload),
    // ),
    dispatchScaleDownWith: (payload) => dispatch(
        actions.space.scaleDownWith(payload),
    ),

    // dispatchSetActiveUniverse: (activeUniverse: string) => dispatch(
    //     actions.space.setActiveUniverse(activeUniverse),
    // ),

    dispatchSpaceSetView: (payload) => dispatch(
        actions.space.spaceSetView(payload),
    ),
    // dispatchSpaceSetCulledView: (
    //     culledView,
    // ) => dispatch(
    //     actions.space.spaceSetCulledView(culledView),
    // ),

    // dispatchDataSetPlaneSources: (
    //     planeSources,
    // ) => dispatch(
    //     actions.data.setPlaneSources(planeSources),
    // ),
});


const ConnectedPluridView = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridView);
// #endregion module



// #region exports
export default ConnectedPluridView;
// #endregion exports
