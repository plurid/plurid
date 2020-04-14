import React, {
    Component,
} from 'react';
import {
    Provider as ReduxProvider,
} from 'react-redux';
import {
    createStore,
} from 'redux';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import Root from './Root';

import reducer from '../modules/services/state/store/reducers';
import StateContext from '../modules/services/state/context';



class PluridApplication extends Component<PluridApplicationProperties, {}> {
    private store: any;

    constructor(
        properties: PluridApplicationProperties,
    ) {
        super(properties);
        this.store = createStore(reducer);
    }

    render() {
        return (
            <ReduxProvider
                store={this.store}
                context={StateContext}
            >
                <Root
                    appProperties={{...this.props}}
                />
            </ReduxProvider>
        );
    }
}


export default PluridApplication;
