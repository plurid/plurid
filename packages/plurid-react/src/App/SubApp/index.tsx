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

import SubAppRoot from './SubAppRoot';

import reducer from '../../modules/services/state/reducers';



class PluridSubApp extends Component {
    private store: any;

    constructor(props: PluridAppProperties) {
        super(props);
        this.store = createStore(reducer);
    }

    render() {
        return (
            <ReduxProvider
                store={this.store}
            >
                <SubAppRoot
                    appProperties={{...this.props}}
                />
            </ReduxProvider>
        );
    }
}


export default PluridSubApp;
