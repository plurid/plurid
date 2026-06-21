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
        handleGlobalWheel,
    } from '~services/logic/shortcuts';

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
export interface PluridViewOwnProperties extends PluridApplicationProperties<PluridReactComponent> {
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
    // Grab/navigate mode (toggle with G; Escape exits) — see `useGrabMode`. `grabModeRef` mirrors
    // `grabMode` every render so the pointer + wheel handlers read the live value.
    const { grabMode, grabModeRef } = useGrabMode();
    const [navDragging, setNavDragging] = useState(false);

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
        hostname,
        planesRegistrar,
        dispatchSetTree,
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
        stateTransform,
        dispatchSetSpaceLocation,
        write: stateConfiguration.space.viewpointURLWrite === true,
        restore: stateConfiguration.space.viewpointURLRestore === true,
        param: stateConfiguration.space.viewpointURLParam || 'v',
        debounce: stateConfiguration.space.viewpointURLDebounce,
    });
    // #endregion handlers


    // #region callbacks
    const shortcutsCallback = useCallback((event: KeyboardEvent) => {
        const {
            transformLocks,
        } = stateConfiguration.space;

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
    ]);

    const wheelCallback = useCallback((event: WheelEvent) => {
        handlePreventOverscroll(event);

        const {
            transformMode,
            transformLocks,
        } = stateConfiguration.space;

        const transformModes = {
            rotation: transformMode === TRANSFORM_MODES.ROTATION,
            translation: transformMode === TRANSFORM_MODES.TRANSLATION,
            scale: transformMode === TRANSFORM_MODES.SCALE,
        };

        handleGlobalWheel(
            dispatch,
            event,
            transformModes,
            transformLocks,
            grabModeRef.current,
            stateConfiguration.space.gestures?.buttonMap?.wheel === 'disabled',
        );
    }, [
        dispatch,
        stateConfiguration.space.transformMode,
        stateConfiguration.space.transformLocks,
        stateConfiguration.space.gestures,
    ]);

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
            dispatchRotateXWith,
            dispatchRotateYWith,
            dispatchTranslateXWith,
            dispatchTranslateYWith,
            dispatchTranslateZWith,
            dispatchScaleUpWith,
            dispatchScaleDownWith,
        });
        // #endregion effects pointer


        // #region effects fly
        // First-person "fly" controls (held-key movement + pointer-lock mouse-look) live in
        // `useFlyControls`.
        useFlyControls({
            viewElement,
            firstPerson: stateConfiguration.space.firstPerson,
            flySpeed: stateConfiguration.space.gestures?.flySpeed,
            flyLook: stateConfiguration.space.gestures?.flyLookSensitivity,
            dispatch,
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
        >
            <Context.Provider
                value={pluridContext}
            >
                {stateSpaceView.length !== 0 ? (
                    <PluridViewContainer
                        renderToolbar={properties.renderToolbar as any}
                        renderViewcube={properties.renderViewcube as any}
                        renderMinimap={properties.renderMinimap as any}
                        renderShortcuts={properties.renderShortcuts as any}
                    />
                ) : (
                    <></>
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
