import React from 'react';

import {
    HelmetProvider,
} from 'react-helmet-async';

import {
    Provider as ReduxProvider,
} from 'react-redux';

import {
    ApolloProvider,
} from '@apollo/react-hooks';

// import {
//     StripeProvider,
// } from 'react-stripe-elements';

import {
    StyleSheetManager,
} from 'styled-components';

import {
    PluridProvider,
    PluridRouterBrowser,
    PluridComponent,
} from '@plurid/plurid-react';

import helmetContext from './App/services/helmet';

import Shell from './App/components/Shell';

import reduxStore from './App/services/state/store';
import graphqlClient from './App/services/graphql/client';
// import {
//     STRIPE_API_KEY as stripeAPIKey,
// } from './App/data/constants';

import {
    paths,
} from '../common';



const state = (window as any).__PRELOADED_STATE__;
delete (window as any).__PRELOADED_STATE__;

const globalShell: PluridComponent = {
    kind: 'react',
    element: Shell,
};


const Client: React.FC<any> = () => {
    return (
        <HelmetProvider context={helmetContext}>
            <ReduxProvider store={reduxStore(state)}>
                <ApolloProvider client={graphqlClient}>
                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                        <StyleSheetManager>
                            <PluridProvider context={{}}>
                                <PluridRouterBrowser
                                    globalShell={globalShell}
                                    paths={paths}
                                />
                            </PluridProvider>
                        </StyleSheetManager>
                    {/* </StripeProvider> */}
                </ApolloProvider>
            </ReduxProvider>
        </HelmetProvider>
    );
}


export default Client;
