// #region imports
    // #region libraries
    import React, {
        MutableRefObject,
        useRef,
        useState,
        useCallback,
        useEffect,
        useLayoutEffect,
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
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
        PluridInspectorRegistry,
    } from '@plurid/plurid-data';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region external
    import {
        PendingPlane,
        PENDING_TREE_CHANGES,
        hiddenPlaneIDsOf,
        planeIDsOf,
        planeOf,
        answersTo,
        parametersOf,
    } from '~services/logic/correlation';

    import {
        measureLinkCoordinates,
    } from '~services/logic/link/measure';

    import {
        buildInspection,
    } from '~services/logic/inspector';

    import { AppState } from '~services/state/store';
    import actions from '~services/state/actions';
    import selectors from '~services/state/selectors';
    import type {
        PluridThunkExtra,
    } from '~services/state/extra';

    import {
        isDevelopment,
    } from '~services/logic/development/environment';
    import {
        DispatchAction,
    } from '~data/interfaces';

    import {
        closePlane,
        openLastClosed,
        toggleLinkPlane,
    } from '~services/state/thunks/planes';

    import {
        runShortcutReported,
    } from '~services/logic/shortcuts';

    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
        copySelection,
        pasteFragment,
        snapSelectionNow,
        selectInScreenRect,
        navigateDirection,
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
        dockCommand,
        revealCommand,
        applyCameraDeltaCommand,
    } from '~services/logic/camera';

    import {
        generalEngine,
        space,
        state as stateEngine,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
export interface UsePluridPubSubDispatchers {
    dispatchSetConfiguration: DispatchAction<typeof actions.configuration.setConfiguration>;
    dispatchSetGeneralTheme: DispatchAction<typeof actions.themes.setGeneralTheme>;
    dispatchSetInteractionTheme: DispatchAction<typeof actions.themes.setInteractionTheme>;
    dispatchSetSpaceLocation: DispatchAction<typeof actions.space.setSpaceLocation>;
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
    /**
     * The plane requests the host is waiting on. A command carrying a `token`
     * records the planes that exist RIGHT NOW; `useEngineEvents` diffs the next
     * tree against that set and publishes the answer.
     */
    pendingPlanes?: MutableRefObject<PendingPlane[]>;
    /** The initial pubsub from props (or a fresh `PluridPubSub` if absent). */
    pubsub: IPluridPubSub | undefined;

    state: AppState;
    stateConfiguration: PluridConfiguration;
    stateTransform: SpaceTransform;
    stateSpaceView: PluridApplicationView;
    stateTree: TreePlane[];

    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    /** `space.spawnPlane` makes a plane the way a link does, which needs the application's registrar. */
    planesRegistrar?: IPluridPlanesRegistrar<any>;
    hostname?: string;
    /** `space.focus` moves the keyboard focus to the space; `space.blur` takes it off; `focus` reports it. */
    viewElement?: React.RefObject<HTMLDivElement | null>;
    /** `space.describe` answers with the inspection `api.inspect()` gives. */
    inspector?: PluridInspectorRegistry;
    /**
     * The layout signature a `configuration` publish relaid the roots for, so the View's own
     * layout effect does not lay them out a second time for the same change.
     */
    relaidLayout?: MutableRefObject<string>;
    /** The application's id, on every `space.changed` this bridge publishes. */
    applicationID?: string;
    treeUpdate: (
        view: PluridApplicationView,
        configuration?: PluridConfiguration,
        layout?: boolean,
        options?: { transition?: boolean; tree?: TreePlane[] },
    ) => void;

    dispatchers: UsePluridPubSubDispatchers;
}


/** a message the bus could not act on, said once in development, never thrown */
const warn = (
    topic: string,
    reason: string,
) => {
    if (typeof console !== 'undefined' && isDevelopment()) {
        console.warn('[plurid] \'' + topic + '\' was ignored: ' + reason);
    }
};

/** The topics that address a plane by `planeID` (the field `id` and `plane` were renamed to, 2026-09-13). */
const PLANE_ADDRESSED: ReadonlySet<string> = new Set([
    PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
    PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
    PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
    PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION,
    PLURID_PUBSUB_TOPIC.SPACE_SET_PLANE_SHOW,
    PLURID_PUBSUB_TOPIC.SPACE_PIN_PLANE,
    PLURID_PUBSUB_TOPIC.SPACE_RESIZE_PLANE,
    PLURID_PUBSUB_TOPIC.REFRESH_PLANE,
    PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE,
    PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE,
    PLURID_PUBSUB_TOPIC.SPACE_DOCK,
] as string[]);

/**
 * A FIELD FROM BEFORE THE RENAME, NAMED. `{ id }` for `{ planeID }` and `animated` for `animate` were
 * removed after a release of aliases (MIGRATION, 2026-09-13); a payload still carrying them did
 * nothing, and said nothing.
 */
const renamedFields = (
    topic: string,
    data: unknown,
) => {
    if (!data || typeof data !== 'object') {
        return;
    }
    const record = data as Record<string, unknown>;
    if (
        PLANE_ADDRESSED.has(topic)
        && record.planeID === undefined
        && (record.id !== undefined || record.plane !== undefined)
    ) {
        warn(topic, 'the plane is `planeID` (`' + (record.id !== undefined ? 'id' : 'plane') + '` was renamed)');
    }
    if (record.animated !== undefined && record.animate === undefined) {
        warn(topic, '`animated` was renamed `animate`');
    }
};

/** A string for an attribute selector's double-quoted value. */
const cssString = (
    value: string,
) => value.replace(/["\\]/g, '\\$&');

/** A view entry's route: a string, or the typed `{ plane }` (`PluridView`). */
export const viewEntryRoute = (
    entry: unknown,
): string | undefined => (typeof entry === 'string'
    ? entry
    : (entry && typeof entry === 'object' && typeof (entry as { plane?: unknown }).plane === 'string'
        ? (entry as { plane: string }).plane
        : undefined));

/** the keys of a configuration that decide where the roots go */
export const layoutSignature = (
    configuration: PluridConfiguration,
): string => JSON.stringify([
    configuration.space?.layout,
    configuration.space?.center,
    configuration.space?.dimensions,
    configuration.space?.presentation,
    configuration.elements?.plane?.width,
    configuration.elements?.plane?.height,
    configuration.elements?.plane?.maxHeight,
]);


/**
 * A link named by a CSS selector inside a plane, measured the way a `PluridLink` measures itself
 * (`measureLinkCoordinates`): where a product's own element sits on the parent, in the parent's
 * px. Nothing on a server, or for a selector that finds nothing.
 */
const measureLinkInPlane = (
    parentPlaneID: string,
    selector: unknown,
    scope: ParentNode | null | undefined,
): { coordinates: { x: number; y: number }; linkID?: string; linkRoute?: string } | undefined => {
    if (typeof selector !== 'string' || !selector || typeof document === 'undefined') {
        return undefined;
    }
    // this application's view, not the document: two applications can hold the same plane id
    const planeElement = (scope ?? document).querySelector(`[data-plurid-plane="${cssString(parentPlaneID)}"]`) as HTMLElement | null;
    let linkElement: HTMLElement | null = null;
    try {
        linkElement = planeElement?.querySelector(selector) as HTMLElement | null;
    } catch (_) {
        warn('space.spawnPlane', '`link` is not a valid CSS selector: ' + selector);
        return undefined;
    }
    if (!planeElement || !linkElement) {
        return undefined;
    }
    // a selector naming a `PluridLink` (or something inside one) opens THAT link's plane: the
    // anchor's identity, so the link shows it open and a later click finds it rather than
    // opening a second
    const anchor = linkElement.closest('[data-plurid-entity="PluridLink"]') as HTMLElement | null;
    return {
        coordinates: measureLinkCoordinates(linkElement, planeElement),
        linkID: anchor?.getAttribute('data-plurid-link') || undefined,
        linkRoute: anchor?.getAttribute('data-plurid-link-route') || undefined,
    };
};


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
        planesRegistrar,
        hostname,
        viewElement,
        pendingPlanes,
        inspector,
        relaidLayout,
        applicationID,
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

    /**
     * RECORD A PLANE REQUEST, so the host can be told which plane it became.
     *
     * The planes that exist RIGHT NOW are the baseline: whatever the command
     * produces is, by definition, not among them — which is what makes the
     * answer exact even when the same route is already open. A command without
     * a token records nothing and costs nothing.
     */
    const notePending = (
        token: unknown,
        route: string,
    ) => {
        if (typeof token !== 'string' || !token || !pendingPlanes) {
            return;
        }

        const tree = current().space.tree;
        pendingPlanes.current = [
            ...pendingPlanes.current,
            {
                token,
                route,
                known: planeIDsOf(tree),
                hidden: hiddenPlaneIDsOf(tree),
                remaining: PENDING_TREE_CHANGES,
            },
        ];
    };

    /**
     * ANSWER A TOKEN NOW, on `space.changed` of the bus that asked: with the plane when it already
     * exists (a spawn of a route that is open changes no tree, so the diff never answered it), or
     * with `refused` when no plane will ever come (a route nothing is registered at, a parent that
     * is not there). A host waiting on the answer used to wait for nothing.
     */
    const answer = (
        bus: IPluridPubSub,
        token: unknown,
        kind: 'plane' | 'refused',
        value: Record<string, unknown>,
    ) => {
        if (typeof token !== 'string' || !token) {
            return;
        }
        bus.publish({
            topic: PLURID_PUBSUB_TOPIC.CHANGED,
            data: { kind, value: { token, ...value }, application: applicationID },
        } as any);
    };

    /** Whether a route resolves to a registered plane; `true` when there is no registrar to ask. */
    const registered = (
        route: string,
    ): boolean => {
        const registrar = latest.current.planesRegistrar;
        if (!registrar) {
            return true;
        }
        try {
            return !!registrar.get(route);
        } catch (_) {
            return false;
        }
    };

    // Handlers read the LATEST state through a ref, so every pubsub instance is subscribed ONCE
    // (per instance) instead of re-subscribed on each tree/config change — which raced in-flight
    // publishes against the unsubscribe and kept stale closures alive.
    const latest = useRef({
        state,
        stateConfiguration,
        stateTransform,
        stateSpaceView,
        stateTree,
        treeUpdate,
        planesRegistrar,
        hostname,
        viewElement,
    });
    latest.current = {
        state,
        stateConfiguration,
        stateTransform,
        stateSpaceView,
        stateTree,
        treeUpdate,
        planesRegistrar,
        hostname,
        viewElement,
    };

    /**
     * THE STORE AS IT IS NOW. `latest` holds what was last RENDERED, and two commands published in
     * one tick both read it: the second `view.addPlane` appended to a view the first had not yet
     * rendered, and one plane was lost; a `space.command` after a selection saw the old selection.
     * A thunk returns what it returns, so one that reads `getState` reads the store between two
     * publishes. (The configuration, the view, the tree and the transform all come from here.)
     */
    const current = (): AppState => dispatch(
        ((_: unknown, getState: () => AppState) => getState()) as any,
    ) as unknown as AppState;

    /**
     * A CAMERA CHANGE THAT IS NOT A TWEEN STOPS THE TWEEN FIRST. The reducer was applied, then the
     * running tween's next frame wrote its own camera over it: the nudges, `space.cameraDelta`
     * without `animate`, the legacy `…With` / `…To` topics and `space.transform` all did nothing
     * while a tween ran.
     */
    const jump = (
        action: AnyAction,
    ) => {
        dispatch(((innerDispatch: (action: AnyAction) => unknown, _: unknown, extra?: PluridThunkExtra) => {
            extra?.motion?.cancel();
            innerDispatch(action);
        }) as any);
    };

    /** A finite number, or nothing: a command without its number does nothing, and says so. */
    const finite = (
        topic: string,
        data: unknown,
    ): number | undefined => {
        const value = (data as { value?: unknown } | undefined)?.value;
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            warn(topic, '`value` must be a finite number');
            return undefined;
        }
        return value;
    };

    const {
        dispatchSetConfiguration,
        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,
        dispatchSpaceSetView,
        dispatchSetSpaceField,
    } = dispatchers;

    /**
     * NOTHING KEEPS POINTING AT A PLANE THAT IS GONE: the selection, the active plane and the
     * isolation forget it. A removed plane left isolated rendered every other plane transparent
     * and inert, with nothing on screen to lift it.
     */
    const forgetPlanes = (
        gone: Set<string>,
    ) => {
        if (gone.size === 0) {
            return;
        }
        const now = current().space;
        const selected: string[] = now.selectedPlaneIDs ?? [];
        if (selected.some((id) => gone.has(id))) {
            dispatch(actions.space.setSelection(selected.filter((id) => !gone.has(id))));
        }
        if (gone.has(now.activePlaneID ?? '')) {
            dispatchSetSpaceField({ field: 'activePlaneID', value: '' });
        }
        if (gone.has(now.isolatePlane ?? '')) {
            dispatchSetSpaceField({ field: 'isolatePlane', value: '' });
        }
    };

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

                    const previousConfiguration = current().configuration;
                    const computedConfiguration = generalEngine.configuration.merge(
                        data,
                        previousConfiguration,
                    );

                    // The themes: the one resolution the store was created with (the engine's) — a
                    // name is checked, an object is taken, and without a host theme the look decides.
                    const resolvedThemes = stateEngine.resolveThemes(computedConfiguration, undefined);
                    dispatchSetGeneralTheme(resolvedThemes.general);
                    dispatchSetInteractionTheme(resolvedThemes.interaction);


                    dispatchSetConfiguration(computedConfiguration);

                    // A LAYOUT KEY CHANGED THROUGH THE BUS: the roots are laid out again, as the
                    // configuration PROP does. A layout published on the bus used to land in the
                    // store and change nothing on screen until something else relaid it out.
                    const signature = layoutSignature(computedConfiguration);
                    if (layoutSignature(previousConfiguration) !== signature) {
                        if (relaidLayout) {
                            relaidLayout.current = signature;
                        }
                        const now = current();
                        latest.current.treeUpdate(now.space.view, computedConfiguration, true, { transition: true, tree: now.space.tree });
                    }
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM,
                callback: (data) => {
                    const value = (data as any)?.value;
                    if ((data as any)?.internal) {
                        return;
                    }
                    if (!value || typeof value !== 'object') {
                        warn('space.transform', '`value` must be the transform ({ rotationX, rotationY, translationX, translationY, translationZ, scale })');
                        return;
                    }

                    jump(actions.space.setSpaceLocation(value));
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH,
                callback: (data) => {
                    const value = finite('space.rotateXWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.rotateXWith(value));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO,
                callback: (data) => {
                    const value = finite('space.rotateXTo', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.rotateX(value));
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH,
                callback: (data) => {
                    const value = finite('space.rotateYWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.rotateYWith(value));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO,
                callback: (data) => {
                    const value = finite('space.rotateYTo', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.rotateY(value));
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH,
                callback: (data) => {
                    const value = finite('space.translateXWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.translateXWith(value));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO,
                callback: (data) => {
                    const value = finite('space.translateXTo', data);
                    if (value === undefined) {
                        return;
                    }
                    // TO, not WITH: the difference from where the space is NOW
                    jump(actions.space.translateXWith(value - selectors.space.getTransform(current()).translationX));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH,
                callback: (data) => {
                    const value = finite('space.translateYWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.translateYWith(value));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO,
                callback: (data) => {
                    const value = finite('space.translateYTo', data);
                    if (value === undefined) {
                        return;
                    }
                    // TO, not WITH: the difference from where the space is NOW
                    jump(actions.space.translateYWith(value - selectors.space.getTransform(current()).translationY));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH,
                callback: (data) => {
                    const value = finite('space.translateZWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(actions.space.translateZWith(value));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO,
                callback: (data) => {
                    const value = finite('space.translateZTo', data);
                    if (value === undefined) {
                        return;
                    }
                    // TO, not WITH: the difference from where the space is NOW
                    jump(actions.space.translateZWith(value - selectors.space.getTransform(current()).translationZ));
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE,
                callback: (data) => {
                    const plane = data?.planeID;
                    if (typeof plane !== 'string') {
                        warn('view.addPlane', '`planeID` must be the route to open');
                        return;
                    }

                    const token = (data as any)?.token;
                    if (!registered(plane)) {
                        // added all the same (a host may register the plane next), and said: the
                        // tree leaves a route without a plane out, so no plane answers the token
                        warn('view.addPlane', 'no plane is registered at \'' + plane + '\'');
                        answer(pubsub, token, 'refused', { route: plane, reason: 'unregistered' });
                    } else {
                        notePending(token, plane);
                    }

                    // THE STORE'S VIEW, NOT A CLOSURE'S OR THE LAST RENDER'S. A captured view is
                    // frozen at mount (for a route declaring `view: []`, every `view.addPlane`
                    // REPLACED the view with one plane), and the rendered one lags a publish in the
                    // same tick (two `view.addPlane`s kept one).
                    const now = current();
                    const updatedView = [
                        ...now.space.view,
                        plane,
                    ];
                    dispatchSpaceSetView(updatedView);

                    latest.current.treeUpdate(updatedView, undefined, true, { transition: true, tree: now.space.tree });
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES,
                callback: (data) => {
                    const view = (data as any)?.view;
                    // a malformed view leaves the view as it was: it used to throw in a render. The
                    // entries are what `view` takes everywhere (`PluridApplicationView`): a route, or
                    // `{ plane: route }`; `{ route }` used to pass here and then throw in the layout
                    if (!Array.isArray(view) || !view.every((entry: unknown) => viewEntryRoute(entry) !== undefined)) {
                        warn('view.setPlanes', 'the view must be an array of routes: strings, or { plane: route }');
                        return;
                    }

                    dispatchSpaceSetView([
                        ...view,
                    ]);

                    latest.current.treeUpdate(view, undefined, true, { transition: true, tree: current().space.tree });
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE,
                callback: (data) => {
                    const plane = data?.planeID;
                    if (typeof plane !== 'string') {
                        warn('view.removePlane', '`planeID` must be a plane id or a route');
                        return;
                    }

                    const now = current();
                    const inView = now.space.view.some((entry) => viewEntryRoute(entry) === plane);

                    // A SPAWNED PLANE IS NOT IN THE VIEW. The view holds the roots; a plane a link
                    // or `space.spawnPlane` made hangs in the tree only, and matching the view
                    // alone left it there: shown, bridged, leashed and empty once its host had
                    // forgotten what it rendered (dechat's obliterate, 2026-09-17). By its runtime
                    // id, or by its route (every plane at that path), the node and its subtree go.
                    if (!inView) {
                        const tree = now.space.tree;
                        const targets: TreePlane[] = [];
                        const walk = (nodes: TreePlane[]) => {
                            for (const node of nodes || []) {
                                if (node.planeID === plane || answersTo(node, plane)) {
                                    targets.push(node);
                                    continue;
                                }
                                walk(node.children || []);
                            }
                        };
                        walk(tree);
                        if (targets.length === 0) {
                            warn('view.removePlane', 'no plane in the view or the tree is \'' + plane + '\'');
                            return;
                        }
                        const gone = new Set<string>();
                        const forget = (nodes: TreePlane[]) => {
                            for (const node of nodes || []) {
                                gone.add(node.planeID);
                                forget(node.children || []);
                            }
                        };
                        forget(targets);
                        let updated = tree;
                        for (const target of targets) {
                            updated = space.tree.logic.removePlaneFromTree(updated, target.planeID);
                        }
                        dispatch(actions.space.setTree(updated));
                        forgetPlanes(gone);
                        return;
                    }

                    // REMOVE the matching root, keep everything else (`view === plane` once did
                    // the inverse: kept only the plane that was supposed to go)
                    const updatedView = now.space.view.filter((entry) => viewEntryRoute(entry) !== plane);
                    const goneRoots = new Set<string>();
                    const forgetRoot = (nodes: TreePlane[]) => {
                        for (const node of nodes || []) {
                            goneRoots.add(node.planeID);
                            forgetRoot(node.children || []);
                        }
                    };
                    forgetRoot(now.space.tree.filter((root) => answersTo(root, plane)));

                    dispatchSpaceSetView(updatedView);

                    // A relayout, like `VIEW_ADD_PLANE`: without `layout = true` the remaining
                    // planes collapsed to the origin.
                    latest.current.treeUpdate(updatedView, undefined, true, { transition: true, tree: now.space.tree });
                    forgetPlanes(goneRoots);
                },
            },

            {
                topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
                callback: (data) => {
                    const id = data?.planeID;

                    const plane = typeof id === 'string'
                        ? space.tree.logic.getTreePlaneByID(
                            current().space.tree,
                            id,
                        )
                        : undefined;
                    if (!plane) {
                        warn('space.navigateToPlane', 'no plane has the id \'' + String(id) + '\'');
                        return;
                    }

                    // face-on unless the host asks for the pair: "go to this plane" names ONE plane
                    navigateToPluridPlane(
                        dispatch,
                        plane,
                        undefined,
                        true,
                        { pair: data?.framing === 'pair' },
                    );
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
                callback: (data) => {
                    const id = (data as any)?.planeID;

                    // `null` or `''` clears the isolation; it used to be ignored, and a host had
                    // no way out through the topic that led in
                    if (id !== null && id !== '' && typeof id !== 'string') {
                        return;
                    }

                    dispatchSetSpaceField({
                        field: 'isolatePlane',
                        value: id || '',
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
                    const id = data?.planeID;
                    const navigate = data?.navigate;
                    if (typeof id !== 'string') {
                        return;
                    }

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
                        current(),
                    );
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.NEXT_ROOT,
                callback: () => {
                    focusNextRoot(
                        dispatch,
                        current(),
                    );
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_ROOT,
                callback: (data) => {
                    const index = (data as any)?.index;
                    if (typeof index === 'number') {
                        focusRootIndex(
                            dispatch,
                            current(),
                            index,
                        );
                        return;
                    }

                    // a root's plane id, under `id` or under `planeID` like every other topic
                    const id = (data as any)?.id ?? (data as any)?.planeID;
                    if (typeof id !== 'string') {
                        warn('space.navigateToRoot', 'give `index` (a number) or `id` (a root\'s plane id)');
                        return;
                    }
                    focusRootID(
                        dispatch,
                        current(),
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
                    // `planeIDs` is the alias every other plane-addressing message takes; this topic
                    // used to accept `ids` alone and silently ignore the rest (2026-09-13 — a browser
                    // test was quietly falling back to a store dispatch when its publish did nothing)
                    const ids = (data as any)?.ids ?? (data as any)?.planeIDs;
                    if (!Array.isArray(ids)) {
                        return;
                    }
                    dispatch(actions.space.setSelection(ids));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION,
                callback: (data) => {
                    const id = data?.planeID;
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
                // camera) and move the camera there; `animate` routes it through the transform
                // animation (otherwise it jumps). Invalid encodings are ignored, never corrupting the
                // view. The thunk reads the store's state (no stale closure).
                topic: PLURID_PUBSUB_TOPIC.SET_VIEWPOINT,
                callback: (data) => {
                    const encoded = (data as any)?.viewpoint;
                    if (typeof encoded !== 'string') {
                        warn('space.setViewpoint', 'give `{ viewpoint }`, the encoded string (`api.getViewpoint()`)');
                        return;
                    }
                    dispatch(setViewpoint(encoded, !!(data as any)?.animate) as any);
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
                topic: PLURID_PUBSUB_TOPIC.SPACE_DOCK,
                callback: (data) => {
                    dispatch(dockCommand((data as any)?.planeID, (data as any)?.animate ?? true) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_REVEAL,
                callback: (data) => {
                    dispatch(revealCommand((data as any)?.animate ?? true) as any);
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
                        to: (data as any)?.to,
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
                // a host's own copy: the same fragment the ⌘C over the space writes, to the system
                // clipboard where the browser allows it and always to the document's slot
                topic: PLURID_PUBSUB_TOPIC.SPACE_COPY,
                callback: (data) => {
                    dispatch(copySelection({ cut: (data as any)?.cut === true }) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_CUT,
                callback: () => {
                    dispatch(copySelection({ cut: true }) as any);
                },
            },
            {
                // the text, a fragment the host holds, or — with neither — what was last copied here
                topic: PLURID_PUBSUB_TOPIC.SPACE_PASTE,
                callback: (data) => {
                    dispatch(pasteFragment({
                        text: (data as any)?.text,
                        fragment: (data as any)?.fragment,
                    }) as any);
                },
            },
            /**
             * TOTAL CONTROL (2026-09-13). Everything the chrome, the keyboard and the imperative
             * handle can do, the bus can do.
             *
             * THE GENERAL ONE FIRST: `space.command` runs any entry of `PLURID_SHORTCUTS` by name,
             * through the same `runShortcut` the command palette uses — so a command the engine grows
             * next month is reachable from the bus the day it lands, with no topic of its own. The
             * bindings that need a real keyboard event (they read `event.code`) refuse by design.
             */
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_COMMAND,
                callback: (data) => {
                    const id = (data as any)?.id;
                    if (typeof id !== 'string') {
                        return;
                    }
                    // a disabled shortcut is a KEY the host took from the reader; a command on the
                    // bus is the host's own act, and it is told what came of it
                    const now = current();
                    const report = runShortcutReported(
                        id as never,
                        {
                            dispatch,
                            state: now,
                            pubsub,
                        } as never,
                        now.configuration.space.shortcuts,
                        { ignoreDisabled: true },
                    );
                    pubsub.publish({
                        topic: PLURID_PUBSUB_TOPIC.CHANGED,
                        data: { kind: 'command', value: report, application: applicationID },
                    } as any);
                },
            },
            {
                // open a plane as a child of another, exactly as following a link does
                topic: PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE,
                callback: (data) => {
                    const route = (data as any)?.route;
                    const parentPlaneID = (data as any)?.parentPlaneID;
                    const token = (data as any)?.token;
                    const registrar = latest.current.planesRegistrar;
                    if (typeof route !== 'string' || typeof parentPlaneID !== 'string') {
                        warn('space.spawnPlane', 'give `route` and `parentPlaneID` (strings)');
                        return;
                    }
                    if (!registrar) {
                        return;
                    }
                    const tree = current().space.tree;
                    const parent = space.tree.logic.getTreePlaneByID(tree, parentPlaneID);
                    if (!parent) {
                        warn('space.spawnPlane', 'no plane has the id \'' + parentPlaneID + '\'');
                        answer(pubsub, token, 'refused', { route, reason: 'noParent' });
                        return;
                    }
                    if (!registered(route)) {
                        warn('space.spawnPlane', 'no plane is registered at \'' + route + '\'');
                        answer(pubsub, token, 'refused', { route, reason: 'unregistered' });
                        return;
                    }

                    // WHERE THE BRIDGE LEAVES: the coordinates given; else a link named by a
                    // selector inside the parent, measured as a PluridLink measures itself; else
                    // the parent's middle height (the anchor puts the x at the edge). `{0, 0}`
                    // used to be the default, which hung every branch off the parent's corner.
                    const measured = measureLinkInPlane(parentPlaneID, (data as any)?.link, latest.current.viewElement?.current);
                    // A NAMED `PluridLink` TO THIS ROUTE OPENS ITS OWN PLANE: the spawn takes the
                    // anchor's identity, so the link shows it open and a click on it later finds it.
                    // An `#api` identity of its own made a second plane beside the link's.
                    const local = (value: string) => value.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '') || '/';
                    const linkID = measured?.linkID && measured.linkRoute && local(measured.linkRoute) === local(route)
                        ? measured.linkID
                        : parentPlaneID + '#' + route + '#api';

                    // a route already open and shown: the spawn goes to it and changes no tree, so
                    // the tree's diff would never answer the token; answer it here
                    const existing = space.tree.fields.findPlaneByLinkID(tree, parentPlaneID, linkID);
                    if (existing && existing.show !== false) {
                        answer(pubsub, token, 'plane', {
                            planeID: existing.planeID,
                            route: existing.route,
                            parameters: parametersOf(existing),
                            parentPlaneID: existing.parentPlaneID ?? '',
                        });
                    } else {
                        notePending(token, route);
                    }

                    const framing = (data as any)?.framing;
                    dispatch(toggleLinkPlane({
                        parentPlaneID,
                        linkID,
                        route,
                        linkCoordinates: (data as any)?.linkCoordinates
                            ?? measured?.coordinates
                            ?? { x: 0, y: (parent.height || 0) / 2 },
                        planesRegistry: registrar.getAll(),
                        hostname: latest.current.hostname,
                        mode: 'open',
                        navigate: framing !== 'none',
                        framing: framing === 'pair' || framing === 'plane' ? framing : undefined,
                        bridgeLength: typeof (data as any)?.bridgeLength === 'number' ? (data as any).bridgeLength : undefined,
                        bridgeKind: (data as any)?.bridgeKind === 'leash' || (data as any)?.bridgeKind === 'strip' ? (data as any).bridgeKind : undefined,
                    }) as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SET_PLANE_SHOW,
                callback: (data) => {
                    const planeID = (data as any)?.planeID;
                    const show = (data as any)?.show;
                    if (typeof planeID !== 'string' || typeof show !== 'boolean') {
                        return;
                    }
                    dispatch(actions.space.setPlaneShow({ planeID, show }));
                },
            },
            {
                // the ones named, else the selection; the selection untouched, pinned only when
                // asked, in world or plane axes: one history entry either way
                topic: PLURID_PUBSUB_TOPIC.SPACE_MOVE_PLANES,
                callback: (data) => {
                    const deltaX = (data as any)?.deltaX;
                    const deltaY = (data as any)?.deltaY;
                    if (typeof deltaX !== 'number' || typeof deltaY !== 'number') {
                        return;
                    }
                    const planeIDs = (data as any)?.planeIDs;
                    const deltaZ = (data as any)?.deltaZ;
                    const frame = (data as any)?.frame;
                    dispatch(actions.space.movePlanes({
                        ...(Array.isArray(planeIDs) ? { planeIDs: planeIDs.filter((id: unknown) => typeof id === 'string') } : {}),
                        deltaX,
                        deltaY,
                        ...(typeof deltaZ === 'number' ? { deltaZ } : {}),
                        frame: frame === 'plane' ? 'plane' : 'world',
                        pinned: (data as any)?.pinned === true,
                    }));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_PIN_PLANE,
                callback: (data) => {
                    const planeID = (data as any)?.planeID;
                    if (typeof planeID !== 'string') {
                        return;
                    }
                    dispatch(actions.space.setPlanePinned({
                        planeID,
                        pinned: (data as any)?.pinned !== false,
                    }));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_RESIZE_PLANE,
                callback: (data) => {
                    const planeID = (data as any)?.planeID;
                    const width = (data as any)?.width;
                    const height = (data as any)?.height;
                    if (typeof planeID !== 'string' || typeof width !== 'number' || typeof height !== 'number') {
                        return;
                    }
                    dispatch(actions.space.setPlaneSize({
                        planeID,
                        width,
                        height,
                        sizeMode: (data as any)?.sizeMode ?? 'manual',
                    }));
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SNAP,
                callback: () => {
                    dispatch(snapSelectionNow() as any);
                },
            },
            {
                // the marquee, programmatically
                topic: PLURID_PUBSUB_TOPIC.SPACE_SELECT_IN_RECT,
                callback: (data) => {
                    const rect = (data as any)?.rect;
                    if (!rect || typeof rect.left !== 'number' || typeof rect.top !== 'number'
                        || typeof rect.right !== 'number' || typeof rect.bottom !== 'number') {
                        return;
                    }
                    dispatch(selectInScreenRect(rect, (data as any)?.mode ?? 'set') as any);
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_NAVIGATE_DIRECTION,
                callback: (data) => {
                    const direction = (data as any)?.direction;
                    if (!['up', 'down', 'left', 'right'].includes(direction)) {
                        return;
                    }
                    dispatch(navigateDirection(direction) as any);
                },
            },
            {
                // `on` omitted toggles, as the key does
                topic: PLURID_PUBSUB_TOPIC.SPACE_GRAB,
                callback: (data) => {
                    const on = (data as any)?.on;
                    if (typeof on === 'boolean') {
                        dispatch(actions.ui.setUIGrabMode(on));
                        return;
                    }
                    dispatch(actions.ui.toggleUIGrabMode());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_PALETTE,
                callback: (data) => {
                    const on = (data as any)?.on;
                    if (typeof on === 'boolean') {
                        dispatch(actions.ui.setPaletteVisible(on));
                        return;
                    }
                    dispatch(actions.ui.togglePalette());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SHORTCUTS_OVERLAY,
                callback: (data) => {
                    const on = (data as any)?.on;
                    if (typeof on === 'boolean') {
                        dispatch(actions.ui.setShortcutsOverlayVisible(on));
                        return;
                    }
                    dispatch(actions.ui.toggleShortcutsOverlay());
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_FOCUS,
                callback: () => {
                    const view = latest.current.viewElement?.current;
                    if (view && typeof view.focus === 'function') {
                        view.focus({ preventScroll: true });
                    }
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_BLUR,
                callback: () => {
                    const view = latest.current.viewElement?.current;
                    if (!view || typeof document === 'undefined') {
                        return;
                    }
                    const active = document.activeElement as HTMLElement | null;
                    if (active && (active === view || view.contains(active)) && typeof active.blur === 'function') {
                        active.blur();
                    }
                },
            },
            {
                // THE SPACE, DESCRIBED, for a host that has no api (a route-driven product): the
                // inspection `api.inspect()` gives, answered with the token on `space.changed`
                topic: PLURID_PUBSUB_TOPIC.SPACE_DESCRIBE,
                callback: (data) => {
                    const token = (data as any)?.token;
                    if (typeof token !== 'string' || !token) {
                        return;
                    }
                    pubsub.publish({
                        topic: PLURID_PUBSUB_TOPIC.CHANGED,
                        data: {
                            kind: 'describe',
                            value: {
                                token,
                                inspection: buildInspection(current(), inspector),
                            },
                            application: applicationID,
                        },
                    } as any);
                },
            },

            /**
             * THE NICETIES: one step of what a key press gives a reader. `space.cameraDelta` is the
             * primitive and wants a vector; these are the ergonomic layer over it, and the reducer
             * actions behind them existed all along — they were simply never wired to a topic.
             */
            ...([
                ['SPACE_ROTATE_UP', 'rotateUp', 'rotateXWith', -1],
                ['SPACE_ROTATE_DOWN', 'rotateDown', 'rotateXWith', 1],
                ['SPACE_ROTATE_LEFT', 'rotateLeft', 'rotateYWith', -1],
                ['SPACE_ROTATE_RIGHT', 'rotateRight', 'rotateYWith', 1],
                ['SPACE_TRANSLATE_UP', 'translateUp', 'translateYWith', -1],
                ['SPACE_TRANSLATE_DOWN', 'translateDown', 'translateYWith', 1],
                ['SPACE_TRANSLATE_LEFT', 'translateLeft', 'translateXWith', -1],
                ['SPACE_TRANSLATE_RIGHT', 'translateRight', 'translateXWith', 1],
                ['SPACE_SCALE_UP', 'scaleUp', 'scaleUpWith', 1],
                ['SPACE_SCALE_DOWN', 'scaleDown', 'scaleDownWith', 1],
            ] as const).map(([topic, step, withAction, sign]) => ({
                topic: (PLURID_PUBSUB_TOPIC as any)[topic],
                callback: (data: any) => {
                    const value = data?.value;
                    if (typeof value === 'number' && Number.isFinite(value)) {
                        // an explicit amount goes through the `…With` action, in the topic's direction
                        jump((actions.space as any)[withAction](sign * Math.abs(value)));
                        return;
                    }
                    jump((actions.space as any)[step]());
                },
            })),
            {
                topic: PLURID_PUBSUB_TOPIC.SPACE_SCALE_WITH,
                callback: (data) => {
                    const value = finite('space.scaleWith', data);
                    if (value === undefined) {
                        return;
                    }
                    jump(value >= 0
                        ? actions.space.scaleUpWith(value)
                        : actions.space.scaleDownWith(Math.abs(value)));
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
                topic: PLURID_PUBSUB_TOPIC.HISTORY_GO_TO,
                callback: (data) => {
                    const index = (data as { index?: number } | undefined)?.index;
                    if (typeof index === 'number') {
                        dispatch(actions.space.historyGoTo({ index }));
                    }
                },
            },
            {
                topic: PLURID_PUBSUB_TOPIC.SET_TREE,
                callback: (data) => {
                    const tree = (data as any)?.tree;
                    // a malformed tree leaves the tree as it was, and says what was wrong with it:
                    // it used to throw inside a render, out of the host's reach
                    const validation = space.tree.fields.validateTree(tree);
                    if (!validation.ok) {
                        warn('space.setTree', validation.reason || 'a malformed tree');
                        return;
                    }
                    dispatch(actions.space.setTree(tree));

                    // THE VIEW AGREES WITH THE TREE: a relayout (a resize, a configuration, a
                    // measurement) places the VIEW's roots, so a host that set its tree over an
                    // empty view had it emptied at the first one
                    // the tree holds absolute routes (`plurid://<host>/a`); the view holds the host's own
                    const roots = (tree as TreePlane[]).map((root) => root.route.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, ''));
                    const viewRoutes = (current().space.view || []).map(viewEntryRoute);
                    if (roots.length !== viewRoutes.length || roots.some((route, index) => route !== viewRoutes[index])) {
                        dispatchSpaceSetView(roots);
                    }
                },
            },
        ];

        const indexes: string[] = [];

        for (const subscription of subscriptions) {
            const callback = subscription.callback as (data: unknown) => void;
            const topic = String(subscription.topic);
            const index = pubsub.subscribe({
                ...subscription,
                callback: (data: unknown) => {
                    renamedFields(topic, data);
                    callback(data);
                },
            } as PluridPubSubSubscribeMessage);
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

    /**
     * THE TRANSFORM AND THE CONFIGURATION, EACH ON ITS OWN CHANGE. They used to go out together on
     * either's change, so a gesture re-published the whole configuration sixty times a second to
     * every subscriber that had asked only for the camera.
     */
    const publishTransform = (
        pubsub: IPluridPubSub,
    ) => {
        pubsub.publish({
            topic: PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM,
            data: {
                value: {
                    ...stateTransform,
                },
                camera: state.space.camera,
                internal: true,
            },
        });
    }

    const publishConfiguration = (
        pubsub: IPluridPubSub,
    ) => {
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
    //
    // ONCE PER BUS, AND TAKEN OFF AGAIN. A configurator registered its bus on every mount and never
    // left, so after a plane refresh (or a close and reopen, a detach, StrictMode's double effect)
    // every command on that bus ran twice, three times: an undo undid two steps.
    const registerPubSub = useCallback((
        pubsub: IPluridPubSub,
    ) => {
        setPluridPubSub(previous => (previous.includes(pubsub)
            ? previous
            : [
                ...previous,
                pubsub,
            ]));
        return () => {
            // the application's own bus (the first) is never taken off
            setPluridPubSub(previous => (previous.indexOf(pubsub) > 0
                ? previous.filter((bus) => bus !== pubsub)
                : previous));
        };
    }, []);
    // #endregion handlers pubsub


    // #region effects pubsub
    /**
     * PubSub Subscribe — a LAYOUT effect on purpose: a child's layout effects run before the parent's
     * `componentDidMount`, so the bridge exists when the Application fires `onReady`, and a host may
     * publish a command synchronously from it. React 19 runs it as a no-op on the
     * server.
     */
    useLayoutEffect(() => {
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
        // Once per pubsub instance: the handlers read live state through `latest`. The array, not
        // its length: one bus off and another on is the same length and a different set.
        pluridPubSub,
    ]);

    /** PubSub Publish: the transform on its change */
    useEffect(() => {
        for (const pubsub of pluridPubSub) {
            publishTransform(pubsub);
        }
    }, [
        pluridPubSub,
        stateTransform,
    ]);

    /** and the configuration on its own */
    useEffect(() => {
        for (const pubsub of pluridPubSub) {
            publishConfiguration(pubsub);
        }
    }, [
        pluridPubSub,
        // Reference equality: the configuration object only changes on `setConfiguration` /
        // `SET_STATE` (and `Application` now recomputes the store only when its inputs change),
        // so no per-frame `JSON.stringify`.
        stateConfiguration,
    ]);

    /** FOCUS, REPORTED: whether the keyboard focus is inside the space, on `space.changed` kind `focus` */
    useEffect(() => {
        const view = viewElement?.current;
        if (!view) {
            return;
        }
        const report = (inside: boolean) => {
            for (const pubsub of pluridPubSub) {
                pubsub.publish({
                    topic: PLURID_PUBSUB_TOPIC.CHANGED,
                    data: { kind: 'focus', value: inside, application: applicationID },
                } as any);
            }
        };
        const onFocusIn = () => report(true);
        const onFocusOut = (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null;
            if (!next || !view.contains(next)) {
                report(false);
            }
        };
        view.addEventListener('focusin', onFocusIn);
        view.addEventListener('focusout', onFocusOut);
        return () => {
            view.removeEventListener('focusin', onFocusIn);
            view.removeEventListener('focusout', onFocusOut);
        };
    }, [
        pluridPubSub,
        viewElement,
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
