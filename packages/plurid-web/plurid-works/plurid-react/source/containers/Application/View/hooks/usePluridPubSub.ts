// #region imports
    // #region libraries
    import {
        useRef,
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
        closePlane,
        openLastClosed,
    } from '~services/state/thunks/planes';

    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
    } from '~services/state/thunks/selection';

    import {
        navigateToPluridPlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
        focusRootID,
    } from '~services/logic/animation';

    import {
        setViewpoint,
        resetCamera,
        goHome,
        goPreset,
        bookmarkCommand,
        setHome,
        fitToView,
        frameCommand,
        applyCameraDeltaCommand,
    } from '~services/logic/camera';

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
        options?: { transition?: boolean },
    ) => void;

    dispatchers: UsePluridPubSubDispatchers;
}


/**
 * The View's pubsub bridge: owns the `pluridPubSub` registry + `registerPubSub`, subscribes every
 * pubsub instance to the ~23 engine topics (configuration / space transforms / view add-remove /
 * navigate / isolate / open-close / root focus), and re-publishes the current transform + config
 * (internal-flagged) so late subscribers sync. Subscriptions are made ONCE per pubsub instance and
 * read live state through a ref; plane lookups are deep (`getTreePlaneByID`), so spawned children
 * answer to CLOSE/OPEN/NAVIGATE too. The `internal: true` flag prevents feedback.
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

    // Handlers read the LATEST state through a ref, so every pubsub instance is subscribed ONCE
    // (per instance) instead of re-subscribed on each tree/config change — which raced in-flight
    // publishes against the unsubscribe and kept stale closures alive.
    const latest = useRef({
        state,
        stateConfiguration,
        stateSpaceView,
        stateTree,
        treeUpdate,
    });
    latest.current = {
        state,
        stateConfiguration,
        stateSpaceView,
        stateTree,
        treeUpdate,
    };

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
                        latest.current.stateConfiguration,
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

                    latest.current.treeUpdate(updatedView, undefined, true, { transition: true });
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

                    latest.current.treeUpdate(view, undefined, true, { transition: true });
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
                    const updatedView = latest.current.stateSpaceView.filter(view => {
                        if (typeof view === 'string') {
                            // REMOVE the matching plane — keep everything else. The old
                            // `view === plane` did the inverse (kept only the plane that was
                            // supposed to be removed, dropping all the others).
                            return view !== plane;
                        }

                        return true;
                    });

                    dispatchSpaceSetView(updatedView);

                    // A relayout, like `VIEW_ADD_PLANE`: without `layout = true` the remaining
                    // planes collapsed to the origin.
                    latest.current.treeUpdate(updatedView, undefined, true, { transition: true });
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
                callback: (data) => {
                    const {
                        id,
                    } = data;

                    const plane = space.tree.logic.getTreePlaneByID(
                        latest.current.stateTree,
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
                    dispatch(openLastClosed() as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
                callback: (data) => {
                    const {
                        id,
                        navigate,
                    } = data;

                    // Deep lookup (children included) through the thunk — the old flat `find`
                    // never matched a spawned plane.
                    dispatch(closePlane(id, { navigate }) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.PREVIOUS_ROOT,
                callback: () => {
                    focusPreviousRoot(
                        dispatch,
                        latest.current.state,
                    );
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.NEXT_ROOT,
                callback: () => {
                    focusNextRoot(
                        dispatch,
                        latest.current.state,
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
                            latest.current.state,
                            index,
                        );
                        return;
                    }

                    const id = (data as any).id;
                    focusRootID(
                        dispatch,
                        latest.current.state,
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
                // Programmatic camera control: decode the host-supplied viewpoint (v1 scalars or a v2
                // camera) and move the camera there; `animated` routes it through the transform
                // animation (otherwise it jumps). Invalid encodings are ignored, never corrupting the
                // view. Reads the live latest.current.state inside the thunk (no stale closure).
                topic: PLURID_PUBSUB_TOPIC.SET_VIEWPOINT,
                callback: (data) => {
                    const encoded = (data as any)?.viewpoint;
                    if (typeof encoded !== 'string') {
                        return;
                    }
                    dispatch(setViewpoint(encoded, !!(data as any)?.animated) as any);
                },
            },
            {
                // High-value declarative control. The niche actions stay on the `onReady` api.
                topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW,
                callback: (data) => {
                    dispatch(fitToView({
                        animate: (data as any)?.animate ?? true,
                        faceOn: (data as any)?.faceOn,
                    }) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA,
                callback: (data) => {
                    if (!data || typeof data !== 'object') {
                        return;
                    }
                    const {
                        animate,
                        ...delta
                    } = data as any;
                    dispatch(applyCameraDeltaCommand(delta, !!animate) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_FRAME,
                callback: (data) => {
                    dispatch(frameCommand(data as any) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_HOME,
                callback: (data) => {
                    dispatch(goHome((data as any)?.animate ?? true) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SET_HOME,
                callback: (data) => {
                    const viewpoint = (data as any)?.viewpoint;
                    dispatch(setHome(typeof viewpoint === 'string' ? viewpoint : undefined) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_PRESET,
                callback: (data) => {
                    const name = (data as any)?.name;
                    if (typeof name !== 'string') {
                        return;
                    }
                    dispatch(goPreset(name, (data as any)?.animate ?? true) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK,
                callback: (data) => {
                    const name = (data as any)?.name;
                    if (typeof name !== 'string') {
                        return;
                    }
                    dispatch(bookmarkCommand({
                        name,
                        action: (data as any)?.action,
                        animate: (data as any)?.animate ?? true,
                    }) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_ALIGN,
                callback: (data) => {
                    const edge = (data as any)?.edge;
                    if (typeof edge !== 'string') {
                        return;
                    }
                    dispatch(alignSelection(edge as any) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE,
                callback: (data) => {
                    const axis = (data as any)?.axis;
                    if (axis !== 'x' && axis !== 'y') {
                        return;
                    }
                    dispatch(distributeSelection(axis) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE,
                callback: (data) => {
                    dispatch(duplicateSelection((data as any)?.offset) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL,
                callback: () => {
                    dispatch(actions.space.selectAll());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_INVERT_SELECTION,
                callback: () => {
                    dispatch(actions.space.invertSelection());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.RESET_TRANSFORM,
                callback: (data) => {
                    dispatch(resetCamera((data as any)?.animate ?? true) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.UNDO,
                callback: () => {
                    dispatch(actions.space.undo());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.REDO,
                callback: () => {
                    dispatch(actions.space.redo());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SET_TREE,
                callback: (data) => {
                    const tree = (data as any)?.tree;
                    if (Array.isArray(tree)) {
                        dispatch(actions.space.setTree(tree));
                    }
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
            camera: state.space.camera,
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
        // Once per pubsub instance: the handlers read live state through `latest`.
        pluridPubSub.length,
    ]);

    /** PubSub Publish */
    useEffect(() => {
        for (const pubsub of pluridPubSub) {
            handlePubSubPublish(pubsub);
        }
    }, [
        pluridPubSub.length,
        // Reference equality: the configuration object only changes on `setConfiguration` /
        // `SET_STATE` (and `Application` now recomputes the store only when its inputs change),
        // so no per-frame `JSON.stringify`.
        stateConfiguration,
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
