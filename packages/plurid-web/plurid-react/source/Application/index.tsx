// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        PluridApplication as PluridApplicationProperties,
    } from '@plurid/plurid-data';
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
    private store: any;

    constructor(
        properties: PluridApplicationProperties,
        context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties, context);

        this.context = context;

        const {
            id,
        } = properties;

        const defaultStore = id && context && context.states[id]
            ? context.states[id]
            : {};

        this.store = store(defaultStore);
    }

    render() {
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
}
// #endregion module



// #region exports
export default PluridApplication;
// #endregion exports
