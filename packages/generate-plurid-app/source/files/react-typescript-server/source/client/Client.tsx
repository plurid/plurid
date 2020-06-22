import React, {
    useRef,
} from 'react';

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
    PluridProvider,
    PluridRouterBrowser,
} from '@plurid/plurid-react';

import helmetContext from '../shared/kernel/services/helmet';

// [START ReduxStore]
import reduxStore from '../shared/kernel/services/state/store';
// [START ReduxStore]
// [START GraphqlClient]
import graphqlClient from '../shared/kernel/services/graphql/client';
// [START GraphqlClient]
// [START StripeAPIKey]
// import {
//     STRIPE_API_KEY as stripeAPIKey,
// } from './App/data/constants';
// [END StripeAPIKey]

import {
    routes,
    shell,
} from '../shared';



const reduxState = (window as any).__PRELOADED_REDUX_STATE__;
delete (window as any).__PRELOADED_REDUX_STATE__;

const pluridMetastate = (window as any).__PRELOADED_PLURID_METASTATE__;
delete (window as any).__PRELOADED_PLURID_METASTATE__;


const Client: React.FC<any> = () => {
    /** references */
    const store = useRef(reduxStore(reduxState));


    /** render */
    return (
        // [START ClientReturn]
        <HelmetProvider context={helmetContext}>
            <ReduxProvider store={store.current}>
                <ApolloProvider client={graphqlClient}>
                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                        <PluridProvider metastate={pluridMetastate}>
                            <PluridRouterBrowser
                                shell={shell}
                                routes={routes}
                            />
                        </PluridProvider>
                    {/* </StripeProvider> */}
                </ApolloProvider>
            </ReduxProvider>
        </HelmetProvider>
        // [END ClientReturn]
    );
}


export default Client;
