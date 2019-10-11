import React from 'react';
import { Store, AnyAction } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

import {
    PluridApp as PluridAppProperties,
} from '@plurid/plurid-data';

import { StyledRoot } from './styled';

import { AppState } from '../../modules/services/state/store';
import StateContext from '../../modules/services/state/context';

import View from '../View';



interface RootProperties {
    store: Store<AppState, AnyAction>;
    appProperties: PluridAppProperties;
}

const Root: React.FC<RootProperties> = (properties) => {
    const {
        store,
        appProperties,
    } = properties;

    return (
        <StyledRoot>
            <ReduxProvider
                store={store}
                context={StateContext}
            >
                <View
                    appProperties={appProperties}
                />
            </ReduxProvider>
        </StyledRoot>
    );
}


export default Root;
