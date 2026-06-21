// #region imports
    // #region libraries
    import React, {
        // useContext,
        // useState,
        // useEffect,
        Component,
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
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    // import PluridProviderContext from '~containers/Provider/context';

    import store from '~services/state/store';
    import StateContext from '~services/state/context';

    import {
        encodeViewpoint,
    } from '~services/logic/viewpoint';

    // import {
    //     loadStateFromContext,
    // } from '~services/logic/state';

    import {
        state,
        registerPlanes,
        PluridPlanesRegistrar,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import PluridView from './View';
    // #endregion internal
// #endregion imports


// #region module


class PluridApplication extends Component<
    PluridApplicationProperties<PluridReactComponent>
    // any,
    // any
> {
    // static contextType = PluridProviderContext;

    // public context!: React.ContextType<typeof PluridProviderContext>;

    private store: Store<PluridState>;
    private storeUnubscriber: ReduxUnsubscribe | undefined;
    private persistTimeout: ReturnType<typeof setTimeout> | undefined;
    private persistDirty = false;
    private flushPersistImmediate: (() => void) | undefined;
    private onVisibilityChange: (() => void) | undefined;
    private viewpointUnsubscriber: ReduxUnsubscribe | undefined;
    private viewpointTimeout: ReturnType<typeof setTimeout> | undefined;
    private lastViewpoint: string | undefined;
    private storeID: string;
    private planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined;


    constructor(
        properties: PluridApplicationProperties<PluridReactComponent>,
        // context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.storeID = properties.id || 'default';
        // this.context = context;

        this.prepare();

        this.store = store(this.computeStore());
        this.subscribeStore();
        this.subscribeViewpoint();
    }


    public componentDidMount() {
        // Restore the product's persisted content AFTER the plane subtree has mounted (so the
        // consumer's components exist to receive it). Counterpart to the `onPersistContent` save
        // in `persistState`; opt-in + gated on `useLocalStorage`, same as the space snapshot.
        if (this.props.useLocalStorage && this.props.onRestoreContent) {
            const content = state.local.loadContent(this.storeID);
            if (content !== undefined) {
                this.props.onRestoreContent(content);
            }
        }
    }

    public componentDidUpdate() {
        const updatedStore = this.computeStore();

        this.store.dispatch({
            type: 'SET_STATE',
            payload: updatedStore,
        });
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
                    />
                </ReduxProvider>
            </StyleSheetManager>
        );
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

        const store = state.compute(
            view,
            configuration,
            this.planesRegistrar,
            currentState,
            localState,
            precomputedState,
            contextState,
            hostname,
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

        if (typeof localStorage === 'undefined') {
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
            }, 300);
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
                const space = this.store.getState().space;
                const viewpoint = encodeViewpoint({
                    rotationX: space.rotationX,
                    rotationY: space.rotationY,
                    translationX: space.translationX,
                    translationY: space.translationY,
                    translationZ: space.translationZ,
                    scale: space.scale,
                });
                // Fire only when the viewpoint actually changed — store updates fire for unrelated
                // state too (a spawn, a selection), which don't move the camera.
                if (viewpoint !== this.lastViewpoint) {
                    this.lastViewpoint = viewpoint;
                    this.props.onViewpointChange(viewpoint);
                }
            }, 250);
        });
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
        );

        // Opt-in CONTENT seam: ride the same debounce + pagehide flush to persist the product's
        // own content (e.g. note bodies). The engine stores the returned value opaquely.
        if (this.props.onPersistContent) {
            state.local.saveContent(
                this.storeID,
                this.props.onPersistContent(),
            );
        }

        this.persistDirty = false;
    }
}
// #endregion module


// #region exports
export default PluridApplication;
// #endregion exports
