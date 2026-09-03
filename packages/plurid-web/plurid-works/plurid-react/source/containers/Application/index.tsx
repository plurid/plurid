// #region imports
    // #region libraries
    import React, {
        // useContext,
        // useState,
        // useEffect,
        Component,
        forwardRef,
        useImperativeHandle,
        useRef,
    } from 'react';

    import {
        Store,
        Unsubscribe as ReduxUnsubscribe,
    } from '@reduxjs/toolkit';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        StyleSheetManager,
    } from 'styled-components';

    import isPropValid from '@emotion/is-prop-valid';


    import {
        PluridApplication as PluridApplicationProperties,
        PluridState,
        PluridApi,
        PluridPubSub as IPluridPubSub,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    // import PluridProviderContext from '~containers/Provider/context';

    import store from '~services/state/store';
    import actions from '~services/state/actions';
    import {
        PluridThunkExtra,
        createThunkExtra,
    } from '~services/state/extra';

    import {
        cameraCommand,
        applyCameraDeltaCommand,
        setHome,
    } from '~services/logic/camera';
    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
    } from '~services/state/thunks/selection';
    import {
        toggleLinkPlane,
        closePlane,
        openPlane,
    } from '~services/state/thunks/planes';
    import { warnOnce } from '~services/logic/development/warn';

    import {
        PluridApplicationHandle,
    } from './handle';
    import StateContext from '~services/state/context';

    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';

    // import {
    //     loadStateFromContext,
    // } from '~services/logic/state';

    import {
        state,
        registerPlanes,
        getPlanesRegistrar,
        PluridPlanesRegistrar,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import PluridView from './View';
    // #endregion internal
// #endregion imports


// #region module
/** A registered plane's identity for the stability check (route, else id). */
const planeIdentity = (
    plane: any,
): string => String(plane?.route ?? plane?.id ?? plane?.path ?? '');


class PluridApplicationShell extends Component<
    PluridApplicationProperties<PluridReactComponent>
    // any,
    // any
> {
    // static contextType = PluridProviderContext;

    // public context!: React.ContextType<typeof PluridProviderContext>;

    private store: Store<PluridState>;
    // Own the instance pubsub (use the host's if passed, else create one) so it's the SAME bus the
    // View subscribes its topics on AND the one handed to the host via `onReady(api)`.
    private pubsub: IPluridPubSub;
    private storeUnubscriber: ReduxUnsubscribe | undefined;
    private persistTimeout: ReturnType<typeof setTimeout> | undefined;
    private persistDirty = false;
    private flushPersistImmediate: (() => void) | undefined;
    private onVisibilityChange: (() => void) | undefined;
    private viewpointUnsubscriber: ReduxUnsubscribe | undefined;
    private viewpointTimeout: ReturnType<typeof setTimeout> | undefined;
    private lastViewpoint: string | undefined;
    // Resolved `space.timings` debounce windows (ms), captured once from the merged configuration.
    private thunkExtra: PluridThunkExtra = createThunkExtra();
    private appliedConfiguration: PluridApplicationProperties<PluridReactComponent>['configuration'];
    private persistDebounceMs = 300;
    private viewpointDebounceMs = 250;
    private readyFired = false;
    private storeID: string;
    private planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined;


    constructor(
        properties: PluridApplicationProperties<PluridReactComponent>,
        // context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.storeID = properties.id || 'default';
        this.pubsub = properties.pubsub || new PluridPubSub();
        // this.context = context;

        this.prepare();

        // Build the preloaded state once, then read the resolved `space.undo` off the merged
        // configuration to decide whether the store includes the history middleware. Default true;
        // an explicit `space.undo: false` drops it (no per-action signature cost / snapshot memory).
        const preloadedState = this.computeStore();
        const resolvedSpace = (preloadedState as any)?.configuration?.space;
        const perspective = resolvedSpace?.perspective;
        if (typeof perspective === 'number' && (perspective < 500 || perspective > 5000)) {
            warnOnce(
                'perspective-range',
                `space.perspective is ${perspective}px — below 500 the space distorts, above 5000 it flattens; 1200–2500 reads as a camera.`,
                resolvedSpace?.development?.warnings !== false,
            );
        }
        const historyEnabled = resolvedSpace?.undo !== false;
        this.store = store(preloadedState, {
            history: historyEnabled,
            extra: this.thunkExtra,
        });

        // Resolve the tunable debounce windows once (default 300 / 250 if unset).
        const timings = resolvedSpace?.timings;
        if (typeof timings?.persistDebounce === 'number') {
            this.persistDebounceMs = timings.persistDebounce;
        }
        if (typeof timings?.viewpointChangeDebounce === 'number') {
            this.viewpointDebounceMs = timings.viewpointChangeDebounce;
        }

        this.subscribeStore();
        this.subscribeViewpoint();
    }


    public componentDidMount() {
        // Restore the product's persisted content AFTER the plane subtree has mounted (so the
        // consumer's components exist to receive it). Counterpart to the `onPersistContent` save
        // in `persistState`; opt-in + gated on `useLocalStorage`, same as the space snapshot.
        if (this.props.useLocalStorage && this.props.onRestoreContent) {
            const content = state.local.loadContent(this.storeID, this.props.storageAdapter);
            if (content !== undefined) {
                this.props.onRestoreContent(content);
            }
        }

        // The master escape hatch. Fired here (post-mount) so the View has already subscribed the
        // pubsub control/emit topics — a host can publish on `api.pubsub` immediately. The `store`
        // is structurally a `PluridStore` (getState/dispatch/subscribe).
        // Once per instance: StrictMode double-invokes mount effects in development, and a host
        // that wires its app up in `onReady` must not be wired twice.
        if (this.props.onReady && !this.readyFired) {
            this.readyFired = true;
            this.props.onReady(this.getApi());
        }
    }

    public componentDidUpdate(
        previousProperties: PluridApplicationProperties<PluridReactComponent>,
    ) {
        // Recompute the store only when one of its INPUTS changed identity. A host re-render that
        // passes the same view/planes/configuration/space (the common case: unrelated parent
        // state) is a no-op — previously every update rebuilt the whole store, re-registered the
        // planes, and clobbered the live `view` (planes added through `VIEW_ADD_PLANE`) with the
        // prop.
        const inputs: (keyof PluridApplicationProperties<PluridReactComponent>)[] = [
            'view',
            'planes',
            'configuration',
            'space',
            'id',
            'hostname',
            'precomputedState',
            'useLocalStorage',
        ];
        const changed = inputs.some((key) => this.props[key] !== previousProperties[key]);
        if (!changed) {
            return;
        }

        // A `planes` array rebuilt on every host render (same routes, new identity) recomputes the
        // store on every render — a memoization the host should own.
        const planes = this.props.planes;
        const previousPlanes = previousProperties.planes;
        if (
            planes && previousPlanes && planes !== previousPlanes
            && planes.length === previousPlanes.length
            && planes.every((plane, index) => planeIdentity(plane) === planeIdentity(previousPlanes[index]))
        ) {
            warnOnce(
                'planes-identity',
                'the `planes` prop is a new array with the same routes on every render — memoize it (useMemo / a module constant), or the store is recomputed on every host render.',
                this.props.configuration?.development?.warnings !== false,
            );
        }

        const previousPerspective = this.store.getState().space.camera.perspective;
        const updatedStore = this.computeStore();

        this.store.dispatch({
            type: 'SET_STATE',
            payload: updatedStore,
        });

        // A changed `space.perspective` re-derives the camera matrix.
        const perspective = updatedStore.space.camera.perspective;
        if (perspective !== previousPerspective) {
            this.store.dispatch(actions.space.setPerspective(perspective));
        }
    }

    public componentWillUnmount() {
        if (this.storeUnubscriber) {
            this.storeUnubscriber();
        }
        if (this.viewpointUnsubscriber) {
            this.viewpointUnsubscriber();
        }
        if (this.viewpointTimeout) {
            clearTimeout(this.viewpointTimeout);
            this.viewpointTimeout = undefined;
        }
        if (typeof window !== 'undefined') {
            if (this.flushPersistImmediate) {
                window.removeEventListener('pagehide', this.flushPersistImmediate);
            }
            if (this.onVisibilityChange && typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this.onVisibilityChange);
            }
        }
        // Flush any pending debounced persistence so the latest state isn't lost.
        if (this.persistTimeout) {
            clearTimeout(this.persistTimeout);
            this.persistTimeout = undefined;
        }
        if (this.persistDirty) {
            this.persistState();
        }
    }

    public render() {
        return (
            // styled-components v6 no longer auto-filters props, so engine-internal props
            // (transformMode, show, active, face, …) would leak onto DOM nodes. Forward
            // only valid HTML/SVG attributes; the styled templates still receive them all.
            <StyleSheetManager shouldForwardProp={isPropValid}>
                <ReduxProvider
                    store={this.store}
                    context={StateContext}
                >
                    <PluridView
                        {...this.props}
                        planesRegistrar={this.planesRegistrar}
                        pubsub={this.pubsub}
                        thunkExtra={this.thunkExtra}
                    />
                </ReduxProvider>
            </StyleSheetManager>
        );
    }


    /** The `onReady` api: the store, the bus, and synchronous reads. */
    public getApi(): PluridApi {
        return {
            store: this.store,
            pubsub: this.pubsub,
            getSnapshot: () => this.store.getState(),
            getViewpoint: (options) => this.encodeViewpoint(options?.version),
        };
    }

    /** The imperative handle (`ref`): the api plus typed camera / selection / history / tree commands. */
    public getHandle(): PluridApplicationHandle {
        const dispatch = (action: unknown) => this.store.dispatch(action as any);
        const getState = () => this.store.getState();

        return {
            ...this.getApi(),
            camera: {
                get: () => getState().space.camera,
                motion: () => getState().space.motion,
                moveBy: (delta, options = {}) => dispatch(applyCameraDeltaCommand(delta, options.animate ?? false)),
                moveTo: (viewpoint, options = {}) => dispatch(cameraCommand({ kind: 'viewpoint', viewpoint }, { animate: true, ...options })),
                frame: (target = {}, options = {}) => dispatch(cameraCommand({ kind: 'frame', planeID: target.planeID, selection: target.selection }, { animate: true, ...options })),
                fit: (options = {}) => dispatch(cameraCommand({ kind: 'fit' }, { animate: true, ...options })),
                reset: (options = {}) => dispatch(cameraCommand({ kind: 'reset' }, { animate: true, ...options })),
                home: (options = {}) => dispatch(cameraCommand({ kind: 'home' }, { animate: true, ...options })),
                setHome: (viewpoint) => dispatch(setHome(viewpoint)),
                preset: (name, options = {}) => dispatch(cameraCommand({ kind: 'preset', name }, { animate: true, ...options })),
                bookmark: (name, action = 'go', options = {}) => dispatch(cameraCommand({ kind: 'bookmark', name, action }, { animate: true, ...options })),
            },
            selection: {
                get: () => getState().space.selectedPlaneIDs,
                set: (planeIDs) => dispatch(actions.space.setSelection(planeIDs)),
                toggle: (planeID) => dispatch(actions.space.toggleSelection(planeID)),
                clear: () => dispatch(actions.space.clearSelection()),
                all: () => dispatch(actions.space.selectAll()),
                invert: () => dispatch(actions.space.invertSelection()),
                align: (edge) => dispatch(alignSelection(edge)),
                distribute: (axis) => dispatch(distributeSelection(axis)),
                duplicate: (offset) => dispatch(duplicateSelection(offset)),
            },
            history: {
                get: () => getState().space.history,
                undo: () => dispatch(actions.space.undo()),
                redo: () => dispatch(actions.space.redo()),
            },
            tree: {
                get: () => getState().space.tree,
                setView: (view) => dispatch(actions.space.spaceSetView(view)),
                spawn: (route, parentPlaneID, linkCoordinates = { x: 0, y: 0 }) => {
                    const registrar = getPlanesRegistrar(this.planesRegistrar);
                    if (!registrar) {
                        return;
                    }
                    dispatch(toggleLinkPlane({
                        parentPlaneID,
                        linkID: parentPlaneID + '#' + route + '#api',
                        route,
                        linkCoordinates,
                        planesRegistry: registrar.getAll(),
                        hostname: this.props.hostname,
                    }));
                },
                close: (planeID) => dispatch(closePlane(planeID)),
                open: (planeID) => dispatch(openPlane(planeID)),
                remove: (planeID) => dispatch(actions.space.removePlane(planeID)),
            },
            focus: () => {
                const view = this.thunkExtra.view;
                if (view && typeof view.focus === 'function') {
                    view.focus({ preventScroll: true });
                }
            },
        };
    }


    private prepare() {
        this.planesRegistrar = typeof window === 'undefined' && !this.props.planesRegistrar
            ? new PluridPlanesRegistrar(
                this.props.planes,
                this.props.hostname,
            ) : this.props.planesRegistrar;
    }

    private computeStore() {
        const {
            // id,
            view,
            planes,
            configuration,
            precomputedState,
            useLocalStorage,
            hostname,
            space,
        } = this.props;

        registerPlanes(
            planes,
            this.planesRegistrar,
            hostname,
        );

        const currentState = this.store
            ? this.store.getState()
            : undefined;

        const localState = state.local.load(
            this.storeID,
            useLocalStorage,
            this.props.storageAdapter,
        );

        const contextState = undefined;
        // const contextState = loadStateFromContext(
        //     this.context,
        //     space,
        // );
        // console.log({
        //     currentState,
        //     localState,
        //     precomputedState,
        //     contextState,
        // });

        // A changed `configuration` prop overrides the store's (the host's authority); an unchanged
        // one leaves runtime configuration changes (pubsub `configuration` topic) in place.
        const configurationAuthoritative = !!this.store && configuration !== this.appliedConfiguration;
        this.appliedConfiguration = configuration;

        const store = state.compute(
            view,
            configuration,
            this.planesRegistrar,
            currentState,
            localState,
            precomputedState,
            contextState,
            hostname,
            {
                configurationAuthoritative,
            },
        );
        // console.log({
        //     store: store.space,
        // });

        return store;
    }

    private subscribeStore() {
        if (!this.store) {
            return;
        }

        // A custom `storageAdapter` works without `localStorage` (SSR, React Native, tests).
        if (typeof localStorage === 'undefined' && !this.props.storageAdapter) {
            return;
        }

        if (!this.props.useLocalStorage) {
            return;
        }

        // Persist on a debounce: a single orbit/zoom drag emits a store change per frame,
        // and serializing the entire state to localStorage on every frame is a real jank
        // source. Coalesce to one write ~300ms after the state settles; flush on unmount.
        this.storeUnubscriber = this.store.subscribe(() => {
            this.persistDirty = true;
            if (this.persistTimeout) {
                clearTimeout(this.persistTimeout);
            }
            this.persistTimeout = setTimeout(() => {
                this.persistState();
            }, this.persistDebounceMs);
        });

        // Flush the pending debounced write SYNCHRONOUSLY when the page is hidden or torn down.
        // A full reload / navigation does NOT run React's `componentWillUnmount`, so a change made
        // within the last debounce window (e.g. a plane just spawned by a link click) would be lost
        // on reload. `pagehide` covers reload/navigation/close (and is bfcache- and mobile-safe
        // where `beforeunload`/`unload` are not); `visibilitychange: hidden` covers tab switches.
        if (typeof window !== 'undefined') {
            this.flushPersistImmediate = () => {
                if (this.persistTimeout) {
                    clearTimeout(this.persistTimeout);
                    this.persistTimeout = undefined;
                }
                if (this.persistDirty) {
                    this.persistState();
                }
            };
            this.onVisibilityChange = () => {
                if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                    this.flushPersistImmediate?.();
                }
            };
            window.addEventListener('pagehide', this.flushPersistImmediate);
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', this.onVisibilityChange);
            }
        }
    }

    /**
     * Programmatic GET seam: push the ENCODED viewpoint to `onViewpointChange` whenever the camera
     * settles (debounced ~250ms — the camera changes per frame during an orbit). Independent of the
     * URL config + `useLocalStorage`, so a host can drive its OWN share links / storage / sync. Only
     * wired when the host actually supplies the callback.
     */
    private subscribeViewpoint() {
        if (!this.store || !this.props.onViewpointChange) {
            return;
        }

        this.viewpointUnsubscriber = this.store.subscribe(() => {
            if (this.viewpointTimeout) {
                clearTimeout(this.viewpointTimeout);
            }
            this.viewpointTimeout = setTimeout(() => {
                if (!this.store || !this.props.onViewpointChange) {
                    return;
                }
                const viewpoint = this.encodeViewpoint();
                // Fire only when the viewpoint actually changed — store updates fire for unrelated
                // state too (a spawn, a selection), which don't move the camera.
                if (viewpoint !== this.lastViewpoint) {
                    this.lastViewpoint = viewpoint;
                    this.props.onViewpointChange(viewpoint);
                }
            }, this.viewpointDebounceMs);
        });
    }

    /**
     * The camera as an encoded viewpoint — v1 (the legacy scalars) by default, or v2 (the full
     * camera) when asked or configured (`space.viewpointURLVersion`).
     */
    private encodeViewpoint(
        version?: 1 | 2,
    ): string {
        const state = this.store.getState();
        const resolvedVersion = version
            ?? state.configuration?.space?.viewpointURLVersion
            ?? 1;

        return encodeCameraViewpoint(
            state.space.camera,
            state.space.viewSize,
            resolvedVersion,
        );
    }

    private persistState() {
        if (!this.store) {
            return;
        }
        // Persist a focused, versioned snapshot (just the durable space fields) via the
        // engine's local-state primitive — not the whole Redux state. See
        // plurid-engine `modules/state/local`.
        state.local.save(
            this.storeID,
            this.store.getState(),
            this.props.storageAdapter,
        );

        // Opt-in CONTENT seam: ride the same debounce + pagehide flush to persist the product's
        // own content (e.g. note bodies). The engine stores the returned value opaquely.
        if (this.props.onPersistContent) {
            state.local.saveContent(
                this.storeID,
                this.props.onPersistContent(),
                this.props.storageAdapter,
            );
        }

        this.persistDirty = false;
    }
}


/**
 * The application, with an imperative handle on `ref` (`PluridApplicationHandle`: the `onReady`
 * api plus typed camera / selection / history / tree commands and `focus()`).
 */
const PluridApplication = forwardRef<
    PluridApplicationHandle,
    PluridApplicationProperties<PluridReactComponent>
>((properties, reference) => {
    const shell = useRef<PluridApplicationShell>(null);

    useImperativeHandle(reference, () => (shell.current
        ? shell.current.getHandle()
        : (undefined as unknown as PluridApplicationHandle)), []);

    return (
        <PluridApplicationShell
            ref={shell}
            {...properties}
        />
    );
});
PluridApplication.displayName = 'PluridApplication';
// #endregion module



// #region exports
export {
    PluridApplicationShell,
};

export type {
    PluridApplicationHandle,
};

export default PluridApplication;
// #endregion exports
