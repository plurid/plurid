import React, {
    Component,
} from 'react';

import {
    Provider as ReduxProvider,
} from 'react-redux';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import PluridView from './View';

import store from '../modules/services/state/store';
import StateContext from '../modules/services/state/context';

import PluridProviderContext from '../modules/components/Provider/context';



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

        const defaultStore = context && id && context.states[id]
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


export default PluridApplication;
