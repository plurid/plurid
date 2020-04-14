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

import SubAppRoot from './SubAppRoot';

import reducer from '../../modules/services/state/store/reducers';
import StateContext from '../../modules/services/state/context';



class PluridSubApplication extends Component<PluridApplicationProperties, {}> {
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
                <SubAppRoot
                    appProperties={{...this.props}}
                />
            </ReduxProvider>
        );
    }
}


export default PluridSubApplication;
