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
    PluridApp as PluridAppProperties,
} from '@plurid/plurid-data';

import PluridApp from '../';
import reducer from '../../modules/services/state/reducers';



class PluridSubApp extends Component {
    private store: any;

    constructor(props: PluridAppProperties) {
        super(props);
        this.store = createStore(reducer);
    }

    render() {
        return (
            <ReduxProvider store={this.store}>
                <PluridApp
                    {...this.props}
                />
            </ReduxProvider>
        );
    }
}


export default PluridSubApp;
