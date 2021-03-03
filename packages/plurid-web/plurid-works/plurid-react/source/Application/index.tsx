// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';

    import {
        Store,
    } from 'redux';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        PluridApplication as PluridApplicationProperties,
    } from '@plurid/plurid-data';

    import {
        registerPlanes,
        computeState,
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

    public context!: React.ContextType<typeof PluridProviderContext>
    private store: Store;


    constructor(
        properties: PluridApplicationProperties,
        context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.context = context;

        const defaultStore = this.computeStore();

        this.store = store(defaultStore);

        console.log('PluridApplication this.store', this.store);
        console.log('PluridApplication properties', properties);
    }


    public componentDidUpdate() {
        const updatedStore = this.computeStore();

        this.store.dispatch({
            type: 'SET_STATE',
            payload: updatedStore,
        });

        console.log('PluridApplication componentDidUpdate', this.props);
    }


    public render() {
        return (
            <ReduxProvider
                store={this.store}
                context={StateContext}
            >
                <PluridView
                    application={{
                        ...this.props,
                    }}
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
            id,
        } = this.props;

        registerPlanes(
            planes,
        );

        const contextState = id && this.context && this.context.states[id]
            ? this.context.states[id]
            : undefined;

        const store = computeState(
            view,
            planes,
            configuration,
            precomputedState,
            contextState,
        );

        return store;
    }
}
// #endregion module



// #region exports
export default PluridApplication;
// #endregion exports