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


    import themes, {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        objects,
    } from '@plurid/plurid-functions';

    import {
        /** constants */
        PLURID_ENTITY_VIEW,
        PLURID_PUBSUB_TOPIC,
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
        SpaceTransform,
        PluridPubSub as IPluridPubSub,
        PluridPubSubSubscribeMessage,
        PluridApplicationView,
    } from '@plurid/plurid-data';

    import PluridPubSub from '@plurid/plurid-pubsub';
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

    import {
        navigateToPluridPlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
        focusRootID,
    } from '~services/logic/animation';

    import {
        generalEngine,
    } from '~services/engine';
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
    const scrollTimeout = useRef<NodeJS.Timeout>();
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
        pluridPubSub,
        setPluridPubSub,
    ] = useState<IPluridPubSub[]>(
        pubsub
            ? [pubsub]
            : [new PluridPubSub()]
    );

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
        );
    }, [
        pluridPubSub,
        stateConfiguration.space.firstPerson,
        stateConfiguration.space.transformLocks,
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
        );
    }, [
        dispatch,
        stateConfiguration.space.transformMode,
        stateConfiguration.space.transformLocks,
    ]);

    // #endregion callbacks


    // #region handlers
        // #region handlers pubsub
        const handlePubSubSubscribe = (
            pubsub: IPluridPubSub,
        ) => {
            const subscriptions: PluridPubSubSubscribeMessage[] = [
                {
                    topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                    callback: (data) => {
                        if ((data as any).internal) {
                            return;
                        }

                        const computedConfiguration = generalEngine.configuration.merge(
                            data,
                            stateConfiguration,
                        );

                        // Handle themes
                        if (typeof computedConfiguration.global.theme === 'object') {
                            if (typeof computedConfiguration.global.theme.general === 'string') {
                                dispatchSetGeneralTheme((themes as any)[computedConfiguration.global.theme.general]);
                            } else {
                                dispatchSetGeneralTheme(computedConfiguration.global.theme.general);
                            }

                            if (typeof computedConfiguration.global.theme.interaction === 'string') {
                                dispatchSetInteractionTheme((themes as any)[computedConfiguration.global.theme.interaction]);
                            } else {
                                dispatchSetInteractionTheme(computedConfiguration.global.theme.interaction);
                            }
                        } else if (typeof computedConfiguration.global.theme === 'string') {
                            dispatchSetGeneralTheme((themes as any)[computedConfiguration.global.theme]);
                            dispatchSetInteractionTheme((themes as any)[computedConfiguration.global.theme]);
                        }


                        dispatchSetConfiguration(computedConfiguration);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM,
                    callback: (data) => {
                        const {
                            value,
                            internal,
                        } = data;

                        if (internal) {
                            return;
                        }

                        dispatchSetSpaceLocation(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM,
                    callback: (data) => {
                        const {
                            value,
                        } = data;

                        dispatchSetAnimatedTransform(value.active);

                        if (value.time) {
                            dispatchSetTransformTime(value.time);
                        } else {
                            dispatchSetTransformTime(450);
                        }
                    },
                },

                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchRotateXWith(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchRotateX(value);
                    },
                },

                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchRotateYWith(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchRotateY(value);
                    },
                },

                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchTranslateXWith(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        // dispatchTranslateXTo(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchTranslateYWith(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        // dispatchTranslateYTo(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        dispatchTranslateZWith(value);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO,
                    callback: (data) => {
                        const {
                            value,
                        } = data;
                        // dispatchTranslateZTo(value);
                    },
                },

                {
                    topic: PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE,
                    callback: (data) => {
                        const {
                            plane,
                        } = data;

                        const updatedView = [
                            ...stateSpaceView,
                            plane,
                        ];
                        dispatchSpaceSetView(updatedView);

                        treeUpdate(updatedView, undefined, true);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES,
                    callback: (data) => {
                        const {
                            view,
                        } = data;

                        dispatchSpaceSetView([
                            ...view,
                        ]);

                        treeUpdate(view, undefined, true);
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE,
                    callback: (data) => {
                        const {
                            plane,
                        } = data;

                        /** TODO
                         * a less naive filtering
                         */
                        const updatedView = stateSpaceView.filter(view => {
                            if (typeof view === 'string') {
                                // REMOVE the matching plane — keep everything else. The old
                                // `view === plane` did the inverse (kept only the plane that was
                                // supposed to be removed, dropping all the others).
                                return view !== plane;
                            }

                            return true;
                        });

                        dispatchSpaceSetView(updatedView);

                        treeUpdate(updatedView);
                    },
                },

                {
                    topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
                    callback: (data) => {
                        const {
                            id,
                        } = data;

                        const plane = space.tree.logic.getTreePlaneByID(
                            stateTree,
                            id,
                        );

                        navigateToPluridPlane(
                            dispatch,
                            plane,
                        );
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
                    callback: (data) => {
                        const {
                            id,
                        } = data;

                        if (typeof id !== 'string') {
                            return;
                        }

                        dispatchSetSpaceField({
                            field: 'isolatePlane',
                            value: id,
                        });
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE,
                    callback: () => {
                        const treePlane = stateTree.find(plane => plane.planeID === state.space.lastClosedPlane);
                        if (treePlane) {
                            const forceShow = true;
                            const {
                                updatedTree,
                            } = space.tree.logic.togglePlaneFromTree(
                                stateTree,
                                treePlane.planeID,
                                forceShow,
                            );

                            dispatchSetTree(updatedTree);

                            dispatchSetSpaceField({
                                field: 'lastClosedPlane',
                                value: '',
                            });
                        }
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
                    callback: (data) => {
                        const {
                            id,
                        } = data;

                        const treePlane = stateTree.find(plane => plane.planeID === id);
                        if (treePlane) {
                            const forceShow = false;
                            const {
                                updatedTree,
                            } = space.tree.logic.togglePlaneFromTree(
                                stateTree,
                                treePlane.planeID,
                                forceShow,
                            );

                            // Single dispatch — `togglePlaneFromTree` now returns a NEW
                            // immutable tree, so this update is detected on the first dispatch.
                            // (Previously a 50 ms re-dispatch HACK forced the update because the
                            // old mutating toggle left the tree identity unchanged.)
                            dispatchSetTree(updatedTree);

                            dispatchSetSpaceField({
                                field: 'lastClosedPlane',
                                value: id,
                            });
                        }
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.PREVIOUS_ROOT,
                    callback: () => {
                        focusPreviousRoot(
                            dispatch,
                            state,
                        );
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.NEXT_ROOT,
                    callback: () => {
                        focusNextRoot(
                            dispatch,
                            state,
                        );
                    },
                },
                {
                    topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_ROOT,
                    callback: (data) => {
                        const index = (data as any).index;
                        if (typeof index !== 'undefined') {
                            focusRootIndex(
                                dispatch,
                                state,
                                index,
                            );
                            return;
                        }

                        const id = (data as any).id;
                        focusRootID(
                            dispatch,
                            state,
                            id,
                        );
                    },
                },
            ];

            const indexes: string[] = [];

            for (const subscription of subscriptions) {
                const index = pubsub.subscribe(subscription);
                indexes.push(index);
            }

            return () => {
                for (const index of indexes) {
                    pubsub.unsubscribe(
                        index,
                    );
                }
            }
        }

        const handlePubSubPublish = (
            pubsub: IPluridPubSub,
        ) => {
            const internalTransform = {
                value: {
                    ...stateTransform,
                },
                internal: true,
            };
            pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM,
                data: internalTransform,
            });

            pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                data: {
                    ...stateConfiguration,
                    internal: true,
                } as any,
            });
        }

        // `useCallback` + functional update so this keeps a STABLE identity across renders: it is
        // part of the `pluridContext` value below, and a fresh function each render would change
        // the context object and force every `useContext(Context)` consumer (every plane) to
        // re-render regardless of `React.memo`.
        const registerPubSub = useCallback((
            pubsub: IPluridPubSub,
        ) => {
            setPluridPubSub(previous => [
                ...previous,
                pubsub,
            ]);
        }, []);
        // #endregion handlers pubsub


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
            dispatch,
        });
        // #endregion effects fly


        // #region effects grab-mode
        // Grab/navigate mode (G toggle / Escape exit) now lives in `useGrabMode`.
        // #endregion effects grab-mode


        // #region effects pubsub
        /** PubSub Subscribe */
        useEffect(() => {
            const unsubscribers: (() => void)[] = [];

            for (const pubsub of pluridPubSub) {
                const unsubscriber = handlePubSubSubscribe(pubsub);

                unsubscribers.push(unsubscriber);
            }

            return () => {
                for (const unsubscriber of unsubscribers) {
                    unsubscriber();
                }
            }
        }, [
            state.space.lastClosedPlane,
            pluridPubSub.length,
            // Tree ref (the slice is untouched by transform gestures, so it only changes on
            // real tree mutations) instead of an O(n) stringify on every re-render. Config is
            // left stringified on purpose: it may be regenerated by `compute()`, so its
            // reference is not a reliable change signal, and it is a far smaller object.
            stateTree,
            JSON.stringify(stateConfiguration),
        ]);

        /** PubSub Publish */
        useEffect(() => {
            for (const pubsub of pluridPubSub) {
                handlePubSubPublish(pubsub);
            }
        }, [
            pluridPubSub.length,
            JSON.stringify(stateConfiguration),
            stateTransform,
        ]);
        // #endregion effects pubsub


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
                    <PluridViewContainer />
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
