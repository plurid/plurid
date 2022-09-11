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

    import {
        loadHammer,
    } from '~services/utilities/imports';

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
    // #endregion references


    // #region state
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
            state,
            pluridPubSub[0],
            event,
            stateConfiguration.space.firstPerson,
            transformLocks,
        );
    }, [
        JSON.stringify(state),
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
        const handleSwipe = (
            event: HammerInput,
        ) => {
            const {
                transformMode,
            } = stateConfiguration.space;

            if (transformMode === TRANSFORM_MODES.ALL) {
                return;
            }

            const {
                velocity,
                distance,
                direction,
            } = event;

            const {
                altKey,
            } = event.srcEvent;

            const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
            const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
            const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

            useAnimatedTransform(dispatch);

            switch (direction) {
                case 2:
                    /** right */
                    if (rotationMode) {
                        dispatchRotateYWith(velocity * 60);
                    }

                    if (translationMode) {
                        dispatchTranslateXWith(-1 * distance);
                    }
                    break;
                case 4:
                    /** left */
                    if (rotationMode) {
                        dispatchRotateYWith(velocity * 60);
                    }

                    if (translationMode) {
                        dispatchTranslateXWith(distance);
                    }
                    break;
                case 8:
                    /** top */
                    if (rotationMode) {
                        dispatchRotateXWith(velocity * 60);
                    }

                    if (translationMode) {
                        if (altKey) {
                            dispatchTranslateZWith(-1 * distance);
                        } else {
                            dispatchTranslateYWith(-1 * distance);
                        }
                    }

                    if (scalationMode) {
                        dispatchScaleUpWith(velocity);
                    }
                    break;
                case 16:
                    /** down */
                    if (rotationMode) {
                        dispatchRotateXWith(velocity * 60);
                    }

                    if (translationMode) {
                        if (altKey) {
                            dispatchTranslateZWith(distance);
                        } else {
                            dispatchTranslateYWith(distance);
                        }
                    }

                    if (scalationMode) {
                        dispatchScaleDownWith(velocity);
                    }
                    break;
            }
        }

        const handlePan = (
            event: HammerInput,
        ) => {
            const {
                transformMode,
            } = stateConfiguration.space;

            if (transformMode === TRANSFORM_MODES.ALL) {
                return;
            }

            const {
                velocity,
                distance,
                direction,
            } = event;

            const {
                altKey,
            } = event.srcEvent;

            const rotationMode = transformMode === TRANSFORM_MODES.ROTATION;
            const translationMode = transformMode === TRANSFORM_MODES.TRANSLATION;
            const scalationMode = transformMode === TRANSFORM_MODES.SCALE;

            const rotationVelocity = velocity * 20;
            const translationVelocity = distance / 5;
            const scaleVelocity = velocity / 4;

            switch (direction) {
                case 2:
                    /** right */
                    if (rotationMode) {
                        dispatchRotateYWith(rotationVelocity);
                    }

                    if (translationMode) {
                        dispatchTranslateXWith(-1 * translationVelocity);
                    }
                    break;
                case 4:
                    /** left */
                    if (rotationMode) {
                        dispatchRotateYWith(rotationVelocity);
                    }

                    if (translationMode) {
                        dispatchTranslateXWith(translationVelocity);
                    }
                    break;
                case 8:
                    /** top */
                    if (rotationMode) {
                        dispatchRotateXWith(rotationVelocity);
                    }

                    if (translationMode) {
                        if (altKey) {
                            dispatchTranslateZWith(-1 * translationVelocity);
                        } else {
                            dispatchTranslateYWith(-1 * translationVelocity);
                        }
                    }

                    if (scalationMode) {
                        dispatchScaleUpWith(scaleVelocity);
                    }
                    break;
                case 16:
                    /** down */
                    if (rotationMode) {
                        dispatchRotateXWith(rotationVelocity);
                    }

                    if (translationMode) {
                        if (altKey) {
                            dispatchTranslateZWith(translationVelocity);
                        } else {
                            dispatchTranslateYWith(translationVelocity);
                        }
                    }

                    if (scalationMode) {
                        dispatchScaleDownWith(scaleVelocity);
                    }
                    break;
            }
        }

        const handlePinch = (
            event: HammerInput,
            type: 'in' | 'out',
        ) => {
            const {
                transformMode,
            } = stateConfiguration.space;

            if (transformMode !== 'TRANSLATION') {
                return;
            }

            const direction = type === 'in' ? 1 : -1;
            const velocity = direction * 20;

            dispatchTranslateZWith(velocity);
        }

        const handlePinchin = (
            event: HammerInput,
        ) => {
            handlePinch(event, 'in');
        }

        const handlePinchout = (
            event: HammerInput,
        ) => {
            handlePinch(event, 'out');
        }
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
            JSON.stringify(state),
            viewElement.current,
            stateConfiguration.space.transformMode,
            stateConfiguration.space.firstPerson,
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


        // #region effects touch
        /** Touch */
        useEffect(() => {
            if (typeof window === 'undefined') {
                return;
            }

            let touch: HammerManager;

            const handleTouch = async () => {
                const HammerImport = await loadHammer();
                const Hammer = HammerImport.default;

                const {
                    transformTouch,
                } = stateConfiguration.space;

                /**
                 * Remove Hammerjs default css properties to add them only when in Lock Mode.
                 * https://stackoverflow.com/a/37896547
                 */
                delete (Hammer as any).defaults.cssProps.userSelect;
                delete (Hammer as any).defaults.cssProps.userDrag;
                delete (Hammer as any).defaults.cssProps.tapHighlightColor;
                delete (Hammer as any).defaults.cssProps.touchSelect;

                if (!viewElement.current) {
                    return;
                }

                touch = new Hammer(viewElement.current);
                touch.get('pan').set({ direction: Hammer.DIRECTION_ALL });
                touch.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
                touch.get('pinch').set({ enable: true });

                if (transformTouch === TRANSFORM_TOUCHES.PAN) {
                    touch.on('pan', handlePan);
                } else {
                    touch.on('swipe', handleSwipe);
                }

                touch.on('pinchin', handlePinchin);
                touch.on('pinchout', handlePinchout);
            }

            handleTouch();

            return () => {
                if (!touch) {
                    return;
                }

                const {
                    transformTouch,
                } = stateConfiguration.space;

                if (transformTouch === TRANSFORM_TOUCHES.PAN) {
                    touch.off('pan', handlePan);
                } else {
                    touch.off('swipe', handleSwipe);
                }

                touch.off('pinchin', handlePinchin);
                touch.off('pinchout', handlePinchout);
            }
        }, [
            viewElement.current,
            stateConfiguration.space.transformTouch,
            stateConfiguration.space.transformMode,
        ]);
        // #endregion effects touch


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
            transformMode={stateConfiguration.space.transformMode}
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
