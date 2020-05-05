import React from 'react';

import {
    HelmetProvider,
} from 'react-helmet-async';

// [START ReduxProvider]
import {
    Provider as ReduxProvider,
} from 'react-redux';
// [END ReduxProvider]

// [START ApolloProvider]
import {
    ApolloProvider,
} from '@apollo/react-hooks';
// [END ApolloProvider]

// [START StripeProvider]
// import {
//     StripeProvider,
// } from 'react-stripe-elements';
// [END StripeProvider]

import {
    StyleSheetManager,
} from 'styled-components';

import {
    PluridProvider,
    PluridRouterBrowser,
    PluridComponent,
} from '@plurid/plurid-react';

import helmetContext from '../shared/kernel/services/helmet';

import reduxStore from '../shared/kernel/services/state/store';
import graphqlClient from '../shared/kernel/services/graphql/client';
// import {
//     STRIPE_API_KEY as stripeAPIKey,
// } from './App/data/constants';

import {
    paths,
    Shell,
} from '../shared';



const state = (window as any).__PRELOADED_STATE__;
delete (window as any).__PRELOADED_STATE__;


const shell: PluridComponent = {
    kind: 'react',
    element: Shell,
};


const Client: React.FC<any> = () => {
    return (
        // [START ClientReturn]
        <HelmetProvider context={helmetContext}>
            <ReduxProvider store={reduxStore(state)}>
                <ApolloProvider client={graphqlClient}>
                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                        <StyleSheetManager>
                            <PluridProvider context={{}}>
                                <PluridRouterBrowser
                                    shell={shell}
                                    paths={paths}
                                />
                            </PluridProvider>
                        </StyleSheetManager>
                    {/* </StripeProvider> */}
                </ApolloProvider>
            </ReduxProvider>
        </HelmetProvider>
        // [END ClientReturn]
    );
}


export default Client;
