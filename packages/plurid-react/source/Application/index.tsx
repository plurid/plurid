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

import PluridProviderContext from '../modules/components/PluridProvider/context';



class PluridApplication extends Component<PluridApplicationProperties, {}> {
    static contextType = PluridProviderContext;

    public context!: React.ContextType<typeof PluridProviderContext>
    private store: any;
    private properties: React.PropsWithChildren<PluridApplicationProperties>;

    constructor(
        properties: PluridApplicationProperties,
        context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties, context);

        this.context = context;
        this.properties = properties;

        // get applicationID from properties
        // const {
        // } = this.properties;
        const applicationID = 'one';

        const defaultStore = context && context.states[applicationID]
            ? context.states[applicationID]
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
                    pluridApplication={{
                        ...this.properties,
                    }}
                />
            </ReduxProvider>
        );
    }
}


export default PluridApplication;
