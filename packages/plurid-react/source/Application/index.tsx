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



class PluridApplication extends Component<PluridApplicationProperties, {}> {
    private store: any;

    constructor(
        properties: PluridApplicationProperties,
    ) {
        super(properties);
        this.store = store({});
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
