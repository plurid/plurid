import React, {
    Component,
} from 'react';

import {
    Provider as ReduxProvider,
} from 'react-redux';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import View from './View';

import store from '../modules/services/state/store';
import StateContext from '../modules/services/state/context';

import PluridProviderContext from '../modules/components/PluridProvider/context';



class PluridApplication extends Component<PluridApplicationProperties, {}> {
    static contextType = PluridProviderContext;

    public context!: React.ContextType<typeof PluridProviderContext>
    private store: any;

    constructor(
        properties: PluridApplicationProperties,
    ) {
        super(properties);

        const defaultStore = this.context
            ? {}
            : {};

        this.store = store(defaultStore);
    }

    render() {
        return (
            <ReduxProvider
                store={this.store}
                context={StateContext}
            >
                <View
                    pluridApplication={
                        { ...this.props }
                    }
                />
            </ReduxProvider>
        );
    }
}


export default PluridApplication;
