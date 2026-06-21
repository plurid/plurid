// #region imports
    // #region libraries
    import {
        useState,
        useCallback,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import themes from '@plurid/plurid-themes';

    import {
        PLURID_PUBSUB_TOPIC,

        PluridConfiguration,
        SpaceTransform,
        TreePlane,
        PluridApplicationView,
        PluridPubSub as IPluridPubSub,
        PluridPubSubSubscribeMessage,
    } from '@plurid/plurid-data';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';

    import {
        navigateToPluridPlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
        focusRootID,
        useAnimatedTransform,
    } from '~services/logic/animation';

    import {
        decodeViewpoint,
    } from '~services/logic/viewpoint';

    import {
        generalEngine,
        space,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
export interface UsePluridPubSubDispatchers {
    dispatchSetConfiguration: DispatchAction<typeof actions.configuration.setConfiguration>;
    dispatchSetGeneralTheme: DispatchAction<typeof actions.themes.setGeneralTheme>;
    dispatchSetInteractionTheme: DispatchAction<typeof actions.themes.setInteractionTheme>;
    dispatchSetSpaceLocation: DispatchAction<typeof actions.space.setSpaceLocation>;
    dispatchSetAnimatedTransform: DispatchAction<typeof actions.space.setAnimatedTransform>;
    dispatchSetTransformTime: DispatchAction<typeof actions.space.setTransformTime>;
    dispatchRotateXWith: DispatchAction<typeof actions.space.rotateXWith>;
    dispatchRotateX: DispatchAction<typeof actions.space.rotateX>;
    dispatchRotateYWith: DispatchAction<typeof actions.space.rotateYWith>;
    dispatchRotateY: DispatchAction<typeof actions.space.rotateY>;
    dispatchTranslateXWith: DispatchAction<typeof actions.space.translateXWith>;
    dispatchTranslateYWith: DispatchAction<typeof actions.space.translateYWith>;
    dispatchTranslateZWith: DispatchAction<typeof actions.space.translateZWith>;
    dispatchSpaceSetView: DispatchAction<typeof actions.space.spaceSetView>;
    dispatchSetSpaceField: DispatchAction<typeof actions.space.setSpaceField>;
    dispatchSetTree: DispatchAction<typeof actions.space.setTree>;
}

export interface UsePluridPubSubParameters {
    /** The initial pubsub from props (or a fresh `PluridPubSub` if absent). */
    pubsub: IPluridPubSub | undefined;

    state: AppState;
    stateConfiguration: PluridConfiguration;
    stateTransform: SpaceTransform;
    stateSpaceView: PluridApplicationView;
    stateTree: TreePlane[];

    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    treeUpdate: (
        view: PluridApplicationView,
        configuration?: PluridConfiguration,
        layout?: boolean,
    ) => void;

    dispatchers: UsePluridPubSubDispatchers;
}


/**
 * The View's pubsub bridge: owns the `pluridPubSub` registry + `registerPubSub`, subscribes every
 * pubsub instance to the ~23 engine topics (configuration / space transforms / view add-remove /
 * navigate / isolate / open-close / root focus), and re-publishes the current transform + config
 * (internal-flagged) so late subscribers sync. The handler bodies + the subscribe/publish lifecycle
 * + the exact effect dependencies are a verbatim move from the View — DO NOT change them: the deps
 * gate the (intentional) re-subscription cadence, and the `internal: true` flag prevents feedback.
 */
export const usePluridPubSub = (
    {
        pubsub,
        state,
        stateConfiguration,
        stateTransform,
        stateSpaceView,
        stateTree,
        dispatch,
        treeUpdate,
        dispatchers,
    }: UsePluridPubSubParameters,
) => {
    const [
        pluridPubSub,
        setPluridPubSub,
    ] = useState<IPluridPubSub[]>(
        pubsub
            ? [pubsub]
            : [new PluridPubSub()]
    );

    const {
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
    } = dispatchers;

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
            {
                // Public seam for a host to manage the inter-plane link graph. `data` is the
                // `PlaneLink` (must carry `id`, `sourcePlaneID`, `targetPlaneID`); the engine renders
                // an edge once both endpoints are present and stays content-agnostic about `kind`.
                topic: PLURID_PUBSUB_TOPIC.ADD_PLANE_LINK,
                callback: (data) => {
                    const link = data as any;
                    if (!link || !link.id || !link.sourcePlaneID || !link.targetPlaneID) {
                        return;
                    }
                    dispatch(actions.space.addPlaneLink(link));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.REMOVE_PLANE_LINK,
                callback: (data) => {
                    const id = (data as any)?.id;
                    if (!id) {
                        return;
                    }
                    dispatch(actions.space.removePlaneLink(id));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SET_PLANE_LINKS,
                callback: (data) => {
                    const links = (data as any)?.links;
                    if (!Array.isArray(links)) {
                        return;
                    }
                    dispatch(actions.space.setPlaneLinks(links));
                },
            },
            {
                // Public seam for the multi-selection working set. A host wires its own select
                // trigger (e.g. a plane-header click) to these; the built-in shift+click + Escape
                // publish them too.
                topic: PLURID_PUBSUB_TOPIC.SET_SELECTION,
                callback: (data) => {
                    const ids = (data as any)?.ids;
                    if (!Array.isArray(ids)) {
                        return;
                    }
                    dispatch(actions.space.setSelection(ids));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION,
                callback: (data) => {
                    const id = (data as any)?.id;
                    if (!id) {
                        return;
                    }
                    dispatch(actions.space.toggleSelection(id));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.CLEAR_SELECTION,
                callback: () => {
                    dispatch(actions.space.clearSelection());
                },
            },
            {
                // Programmatic camera control: decode the host-supplied viewpoint and move the camera
                // there. `setSpaceLocation` sets the 6 scalars + recomputes the matrix; `animated`
                // routes it through the transform animation (otherwise it jumps). Invalid encodings
                // are ignored, never corrupting the view.
                topic: PLURID_PUBSUB_TOPIC.SET_VIEWPOINT,
                callback: (data) => {
                    const viewpoint = decodeViewpoint((data as any)?.viewpoint);
                    if (!viewpoint) {
                        return;
                    }
                    if ((data as any)?.animated) {
                        useAnimatedTransform(dispatch);
                    }
                    dispatchSetSpaceLocation(viewpoint);
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
    // part of the `pluridContext` value, and a fresh function each render would change the context
    // object and force every `useContext(Context)` consumer (every plane) to re-render regardless
    // of `React.memo`.
    const registerPubSub = useCallback((
        pubsub: IPluridPubSub,
    ) => {
        setPluridPubSub(previous => [
            ...previous,
            pubsub,
        ]);
    }, []);
    // #endregion handlers pubsub


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


    return {
        pluridPubSub,
        registerPubSub,
    };
}
// #endregion module



// #region exports
export default usePluridPubSub;
// #endregion exports
