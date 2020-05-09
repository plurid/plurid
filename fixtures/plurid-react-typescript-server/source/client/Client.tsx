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
} from '@plurid/plurid-react';

import helmetContext from '../shared/kernel/services/helmet';

import reduxStore from '../shared/kernel/services/state/store';
import graphqlClient from '../shared/kernel/services/graphql/client';
// import {
//     STRIPE_API_KEY as stripeAPIKey,
// } from './App/data/constants';

import {
    paths,
    shell,
} from '../shared';



const reduxState = (window as any).__PRELOADED_REDUX_STATE__;
delete (window as any).__PRELOADED_REDUX_STATE__;

const pluridMetastate = (window as any).__PRELOADED_PLURID_METASTATE__;
delete (window as any).__PRELOADED_PLURID_METASTATE__;


const Client: React.FC<any> = () => {
    return (
        // [START ClientReturn]
        <HelmetProvider context={helmetContext}>
            <ReduxProvider store={reduxStore(reduxState)}>
                <ApolloProvider client={graphqlClient}>
                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                        <StyleSheetManager>
                            <PluridProvider metastate={pluridMetastate}>
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
