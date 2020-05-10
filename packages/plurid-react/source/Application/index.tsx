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

        const {
            id,
        } = this.properties;

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
                    pluridApplication={{
                        ...this.properties,
                    }}
                />
            </ReduxProvider>
        );
    }
}


export default PluridApplication;
