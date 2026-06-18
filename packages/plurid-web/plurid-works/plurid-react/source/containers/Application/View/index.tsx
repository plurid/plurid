// #region imports
    // #region libraries
    import React, {
        useRef,
        useCallback,
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
        meta,
        objects,
    } from '@plurid/plurid-functions';

    import {
        /** constants */
        PLURID_ENTITY_VIEW,
        PLURID_PUBSUB_TOPIC,
        PLURID_DEFAULT_PREVENT_OVERSCROLL_TIMEOUT,
        PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME,

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
        useAnimatedTransform,
        navigateToPluridPlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
        focusRootID,
    } from '~services/logic/animation';

    import {
        generalEngine,
        space,

        getRegisteredPlanes,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        GlobalStyle,
        StyledView,
    } from './styled';

    import PluridViewContainer from './Container';
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

    // Native Pointer-Events gesture state (replaces HammerJS). Tracks live pointers for
    // single-pointer drag + two-pointer pinch, plus a decaying-velocity momentum spin.
    const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    const pinchDistance = useRef<number | null>(null);
    // Drag-threshold: a pointerdown only becomes an orbit once it moves past a few px.
    // Below that it's a click, which must pass through to UI controls (plane header
    // icons, toolbar buttons) — they are styled <div>s, so capturing/preventing on
    // pointerdown would otherwise swallow their clicks.
    const pointerDragging = useRef<boolean>(false);
    const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
    const momentum = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
    const momentumFrame = useRef<number | null>(null);
    // Always-latest space config (transformMode/locks) for the pointer handlers, so they
    // can attach once instead of re-binding on every config change.
    const spaceConfigRef = useRef(stateConfiguration.space);
    spaceConfigRef.current = stateConfiguration.space;
    // #endregion references


    // #region state
    // Grab/navigate mode (toggle with G). When OFF (default) the space behaves like a
    // normal page — text is selectable, content is clickable, the wheel scrolls. When ON
    // a left-drag orbits / pans the 3D space (a hand tool). Middle-drag pans in any mode.
    const [grabMode, setGrabMode] = useState(false);
    const [navDragging, setNavDragging] = useState(false);
    const grabModeRef = useRef(grabMode);
    grabModeRef.current = grabMode;

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

    const resolveLayout = () => {
        const layout = true;

        treeUpdate(
            stateSpaceView,
            stateConfiguration,
            layout,
        );
    }
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

    const treeUpdate = (
        view: PluridApplicationView,
        configuration = stateConfiguration,
        layout?: boolean,
    ) => {
        // TODO? stateConfiguration update
        const planes = getRegisteredPlanes(planesRegistrar);

        const spaceTree = new space.tree.Tree(
            {
                planes,
                configuration,
                view,
                layout,
            },
            hostname,
        );

        const computedTree = spaceTree.compute();
        // console.log({
        //     planesRegistrar,
        //     computedTree,
        //     stateTree,
        // });

        // HACK: Merge the compute tree with existing stateTree plane children.
        for (const statePlane of stateTree) {
            for (const [index, computedPlane] of computedTree.entries()) {
                if (
                    statePlane.route === computedPlane.route
                    && objects.equals(statePlane.location, computedPlane.location)
                ) {
                    computedPlane.planeID = statePlane.planeID;
                    if (statePlane.children) {
                        computedTree[index].children = statePlane.children;
                    }
                }
            }
        }

        dispatchSetTree(computedTree);
    }

    const treeUpdateCallback = useCallback(() => {
        treeUpdate(
            stateSpaceView,
            stateConfiguration,
            true,
        );
    }, [
        hostname,
        stateSpaceView,
        stateConfiguration,
        JSON.stringify(stateTree),
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
                                return view === plane;
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

                            dispatchSetTree(updatedTree);

                            setTimeout(() => {
                                // HACK
                                // force the tree to update with show: false
                                dispatchSetTree(updatedTree);
                            }, 50);

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

        const registerPubSub = (
            pubsub: IPluridPubSub,
        ) => {
            const pluridPubSubs = [
                ...pluridPubSub,
                pubsub,
            ];

            setPluridPubSub(pluridPubSubs);
        }
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

        /** Resize Listener */
        useEffect(() => {
            const handleResize = meta.debounce(() => {
                if (viewElement && viewElement.current) {
                    const width = viewElement.current.offsetWidth;
                    const height = viewElement.current.offsetHeight;
                    dispatchSpaceSetViewSize({
                        width,
                        height,
                    });
                }
            }, PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME);

            handleResize();
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            }
        }, []);

        useEffect(() => {
            window.addEventListener('resize', treeUpdateCallback);

            return () => {
                window.removeEventListener('resize', treeUpdateCallback);
            }
        }, [
            stateSpaceView,
            JSON.stringify(stateConfiguration),
            JSON.stringify(stateTree),
        ]);
        // #endregion effects listeners


        // #region effects pointer
        /**
         * Native Pointer-Events gestures (replaces HammerJS). Single-pointer drag rotates
         * / translates / scales by continuous signed deltas (smooth, both axes at once);
         * two-pointer pinch zooms at the pinch midpoint; releasing a rotate with residual
         * velocity spins on with decaying momentum.
         */
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

            // CAD-style navigation. The explicit rotate/scale/translate modes pin what a drag
            // does; otherwise (the default ALL mode) a plain drag orbits and a shift- or
            // middle-button drag pans — so you can navigate the space without first choosing
            // a mode, like Fusion / SolidWorks / Inventor.
            const applySingle = (dx: number, dy: number, event: PointerEvent) => {
                const mode = spaceConfigRef.current.transformMode;
                navWasOrbit = false;
                if (spaceConfigRef.current.firstPerson) {
                    // Fly mode: dragging looks around (yaw/pitch). When the pointer is
                    // locked the dedicated mouse-look listener takes over (clientX/Y frozen,
                    // so dx/dy here are ~0).
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
                    // Default (ALL) mode. In grab mode a left-drag orbits; shift- or
                    // middle-drag pans. In normal (content) mode only middle/shift drags
                    // are tracked at all, and they pan.
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
                // Only skip form fields (a drag inside them should select/scrub, not orbit).
                // Everything else — including the engine's <div>-based controls — is allowed:
                // a click (no movement) passes straight through to the control's onClick; only
                // a drag past DRAG_THRESHOLD starts an orbit (see onPointerMove). We must NOT
                // setPointerCapture or preventDefault here, or control clicks get swallowed.
                const target = event.target as HTMLElement | null;
                if (target && target.closest && target.closest('input, textarea, select')) {
                    return;
                }
                // Only engage navigation for a deliberate nav gesture; otherwise leave the
                // press to the browser (text selection, clicks, links) — planes are pages.
                // Nav = fly mode, grab mode (G), the middle mouse button, or an explicit
                // rotate/scale/translate mode.
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

                // Below the threshold this press is still a (potential) click — let it pass
                // through to whatever control is under the pointer. Once it moves far enough,
                // commit to an orbit: capture the pointer and start applying deltas.
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
        // #endregion effects pointer


        // #region effects fly
        /**
         * First-person "fly" controls, active only in firstPerson mode. Continuous,
         * frame-rate-independent movement from held keys (WASD = move, E/Space = up,
         * Q/Shift = down) via a requestAnimationFrame loop, plus mouse-look: click the view
         * to lock the pointer and steer with the mouse (Esc releases), or just drag to look
         * (handled in applySingle). Replaces the old discrete one-step-per-keypress movement.
         */
        useEffect(() => {
            const element = viewElement.current;
            if (!element || typeof window === 'undefined') {
                return;
            }
            if (!stateConfiguration.space.firstPerson) {
                return;
            }

            const FLY_SPEED = 9;            // px per frame (planar)
            const FLY_VERTICAL = 7;         // px per frame (up/down)
            const FLY_LOOK = 0.12;          // deg per px (locked mouse-look)
            const FLY_KEYS = new Set([
                'KeyW', 'KeyA', 'KeyS', 'KeyD',
                'KeyE', 'KeyQ', 'Space', 'ShiftLeft',
            ]);

            const held = new Set<string>();
            let frame: number | null = null;

            const onKeyDown = (event: KeyboardEvent) => {
                if (event.metaKey || event.ctrlKey || event.altKey) {
                    return;
                }
                if (FLY_KEYS.has(event.code)) {
                    held.add(event.code);
                    event.preventDefault();
                }
            };
            const onKeyUp = (event: KeyboardEvent) => {
                held.delete(event.code);
            };

            const onMouseMove = (event: MouseEvent) => {
                if (document.pointerLockElement !== element) {
                    return;
                }
                const yaw = event.movementX * FLY_LOOK;
                const pitch = -event.movementY * FLY_LOOK;
                if (yaw !== 0 || pitch !== 0) {
                    dispatch(actions.space.flyMove({ yaw, pitch }));
                }
            };

            const onClick = () => {
                if (document.pointerLockElement !== element
                    && (element as any).requestPointerLock) {
                    (element as any).requestPointerLock();
                }
            };

            const loop = () => {
                let forward = 0;
                let strafe = 0;
                let vertical = 0;
                if (held.has('KeyW')) { forward += FLY_SPEED; }
                if (held.has('KeyS')) { forward -= FLY_SPEED; }
                if (held.has('KeyA')) { strafe += FLY_SPEED; }
                if (held.has('KeyD')) { strafe -= FLY_SPEED; }
                if (held.has('KeyE') || held.has('Space')) { vertical += FLY_VERTICAL; }
                if (held.has('KeyQ') || held.has('ShiftLeft')) { vertical -= FLY_VERTICAL; }
                if (forward !== 0 || strafe !== 0 || vertical !== 0) {
                    dispatch(actions.space.flyMove({ forward, strafe, vertical }));
                }
                frame = requestAnimationFrame(loop);
            };
            frame = requestAnimationFrame(loop);

            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            document.addEventListener('mousemove', onMouseMove);
            element.addEventListener('click', onClick);

            return () => {
                if (frame !== null) {
                    cancelAnimationFrame(frame);
                }
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);
                document.removeEventListener('mousemove', onMouseMove);
                element.removeEventListener('click', onClick);
                if (document.pointerLockElement === element && document.exitPointerLock) {
                    document.exitPointerLock();
                }
            };
        }, [
            stateConfiguration.space.firstPerson,
            viewElement.current,
        ]);
        // #endregion effects fly


        // #region effects grab-mode
        /** Toggle grab/navigate mode with G; Escape exits. Ignored while typing in a field. */
        useEffect(() => {
            if (typeof window === 'undefined') {
                return;
            }
            const onKeyDown = (event: KeyboardEvent) => {
                const target = event.target as HTMLElement | null;
                if (target && (
                    target.tagName === 'INPUT'
                    || target.tagName === 'TEXTAREA'
                    || target.isContentEditable
                )) {
                    return;
                }
                if (event.metaKey || event.ctrlKey || event.altKey) {
                    return;
                }
                if (event.code === 'KeyG') {
                    event.preventDefault();
                    setGrabMode((value) => !value);
                } else if (event.code === 'Escape' && grabModeRef.current) {
                    setGrabMode(false);
                }
            };
            window.addEventListener('keydown', onKeyDown);
            return () => {
                window.removeEventListener('keydown', onKeyDown);
            };
        }, []);
        // #endregion effects grab-mode


        // #region effects gamepad
        useEffect(() => {
            const handleGamepadConnect = (
                event: GamepadEvent,
            ) => {
                const gamepad = navigator.getGamepads()[event.gamepad.index];
                if (!gamepad) {
                    return;
                }
            }

            const handleGamepadDisconnect = (
                event: GamepadEvent,
            ) => {
                const gamepad = navigator.getGamepads()[event.gamepad.index];
                if (!gamepad) {
                    return;
                }
            }

            window.addEventListener('gamepadconnected', handleGamepadConnect);
            window.addEventListener('gamepaddisconnected', handleGamepadDisconnect);

            return () => {
                window.removeEventListener('gamepadconnected', handleGamepadConnect);
                window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect);
            }
        }, []);
        // #endregion effects gamepad


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
            JSON.stringify(stateTree),
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
    const pluridContext: PluridContext<PluridReactComponent> = {
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
    };

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            theme={stateGeneralTheme}
            transformMode={stateConfiguration.space.transformMode}
            grabNavigation={grabMode}
            navDragging={navDragging}
            firstPerson={stateConfiguration.space.firstPerson}
            data-plurid-entity={PLURID_ENTITY_VIEW}
        >
            <GlobalStyle
                theme={stateGeneralTheme}
                preventOverscroll={preventOverscroll}
            />

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
