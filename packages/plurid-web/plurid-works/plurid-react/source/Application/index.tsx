// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';

    import {
        Store,
        Unsubscribe as ReduxUnsubscribe,
    } from 'redux';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        PluridApplication as PluridApplicationProperties,
        PluridState,
    } from '@plurid/plurid-data';

    import {
        registerPlanes,
        state,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import store from '~services/state/store';
    import StateContext from '~services/state/context';

    import PluridProviderContext from '~components/Provider/context';
    // #endregion external


    // #region internal
    import PluridView from './View';
    // #endregion internal
// #endregion imports



// #region module
class PluridApplication extends Component<PluridApplicationProperties, {}> {
    static contextType = PluridProviderContext;

    public context!: React.ContextType<typeof PluridProviderContext>;

    private store: Store;
    private storeSubscriber: ReduxUnsubscribe | undefined;


    constructor(
        properties: PluridApplicationProperties,
        context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.context = context;

        const defaultStore = this.computeStore();

        this.store = store(defaultStore);

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
        if (this.storeSubscriber) {
            this.storeSubscriber();
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
                />
            </ReduxProvider>
        );
    }


    private computeStore() {
        const {
            view,
            planes,
            configuration,
            precomputedState,
            planesRegistrar,
            id,
            useLocalStorage,
        } = this.props;

        registerPlanes(
            planes,
            planesRegistrar,
        );

        const currentState: PluridState | undefined = this.store
            ? this.store.getState()
            : undefined;

        const localState = state.local.load(
            id,
            useLocalStorage,
        );

        const contextState = id && this.context && this.context.states[id]
            ? this.context.states[id]
            : undefined;

        const store = state.compute(
            view,
            configuration,
            planesRegistrar,
            currentState,
            localState,
            precomputedState,
            contextState,
        );

        return store;
    }

    private subscribeStore() {
        if (!this.store) {
            return;
        }

        const {
            id,
            useLocalStorage,
        } = this.props;

        if (!useLocalStorage) {
            return;
        }

        this.storeSubscriber = this.store.subscribe(() => {
            const state = this.store.getState();
            const stateData = JSON.stringify(state);
            const stateID = id || 'default';

            localStorage.setItem(
                'pluridState-' + stateID,
                stateData,
            );
        });
    }
}
// #endregion module



// #region exports
export default PluridApplication;
// #endregion exports
