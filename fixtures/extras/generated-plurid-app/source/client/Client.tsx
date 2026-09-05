import React from 'react';


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
} from '@plurid/plurid-react';

import themes from '@plurid/plurid-themes';

import {
    GlobalStyle,
} from './styled';


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


const Client: React.FC<any> = () => {
    return (
            <ReduxProvider store={reduxStore(state)}>
                <ApolloProvider client={graphqlClient}>
                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                        <StyleSheetManager disableCSSOMInjection={true}>
                            <PluridProvider context={{}}>
                                <GlobalStyle
                                    theme={themes.plurid}
                                />

                                <PluridRouterBrowser
                                    paths={paths}
                                />
                            </PluridProvider>
                        </StyleSheetManager>
                    {/* </StripeProvider> */}
                </ApolloProvider>
            </ReduxProvider>
    );
}


export default Client;
