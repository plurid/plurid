// #region imports
    // #region libraries
    import React, {
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
        PluridApplication as PluridApplicationProperties,
        PluridState,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import PluridProviderContext from '~containers/Provider/context';

    import store from '~services/state/store';
    import StateContext from '~services/state/context';

    import {
        loadStateFromContext,
    } from '~services/logic/state';

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
    PluridApplicationProperties<PluridReactComponent>,
    {}
> {
    static contextType = PluridProviderContext;

    public context!: React.ContextType<typeof PluridProviderContext>;

    private store: Store<PluridState>;
    private storeUnubscriber: ReduxUnsubscribe | undefined;
    private storeID: string;
    private planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined;


    constructor(
        properties: PluridApplicationProperties<PluridReactComponent>,
        context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.storeID = properties.id || 'default';
        this.context = context;

        this.prepare();

        this.store = store(this.computeStore());
        this.subscribeStore();
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
    }

    public render() {
        return (
            <ReduxProvider
                store={this.store}
                context={StateContext}
            >
                <PluridView
                    {...this.props}
                    planesRegistrar={this.planesRegistrar}
                />
            </ReduxProvider>
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

        this.storeUnubscriber = this.store.subscribe(() => {
            const state = this.store.getState();
            const stateData = JSON.stringify(state);

            localStorage.setItem(
                'pluridState-' + this.storeID,
                stateData,
            );
        });
    }
}
// #endregion module



// #region exports
export default PluridApplication;
// #endregion exports
