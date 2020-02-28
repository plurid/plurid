import React from 'react';

import {
    renderToString,
} from 'react-dom/server';

import {
    ServerStyleSheet,
    StyleSheetManager,
} from 'styled-components';

import {
    Helmet,
    HelmetProvider,
} from 'react-helmet-async';
import {
    Provider as ReduxProvider,
} from 'react-redux';
import {
    ApolloProvider,
} from '@apollo/react-hooks';
import {
    StripeProvider,
} from 'react-stripe-elements';

import {
    PluridServerService,
    PluridServerServicesData,
} from '../../data/interfaces';

import wrapping from '../../utilities/wrapping';



export default class ContentHandler {
    private Application: React.FC<any>;
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private stylesheet: ServerStyleSheet;
    private helmet: Helmet;

    constructor(
        Application: React.FC<any>,
        services: PluridServerService[],
        servicesData: PluridServerServicesData | undefined,
        stylesheet: ServerStyleSheet,
        helmet: Helmet,
    ) {
        this.Application = Application;
        this.services = services;
        this.servicesData = servicesData;
        this.stylesheet = stylesheet;
        this.helmet = helmet;
    }

    render() {
        const Application = this.Application;

        const reduxStore = this.servicesData?.reduxStore;
        const reduxStoreValue = this.servicesData?.reduxStoreValue || {};
        const graphqlClient = this.servicesData?.graphqlClient;
        const stripeAPIKey = this.servicesData?.stripeAPIKey;

        // let Wrap: React.ClassType<any, any, any> = () => (<Application />);

        // for (const service of this.services) {
        //     switch (service) {
        //         case 'Redux':
        //             Wrap = wrapping(
        //                 ReduxProvider,
        //                 Wrap,
        //                 {
        //                     store: reduxStore(reduxStoreValue),
        //                 },
        //             );
        //             break;
        //         case 'GraphQL':
        //             Wrap = wrapping(
        //                 ApolloProvider,
        //                 Wrap,
        //                 {
        //                     client: graphqlClient,
        //                 },
        //             );
        //             break;
        //         case 'Stripe':
        //             Wrap = wrapping(
        //                 StripeProvider,
        //                 Wrap,
        //                 {
        //                     apiKey: stripeAPIKey,
        //                 },
        //             );
        //             break;
        //     }
        // }

        // console.log('this.services', this.services);
        // console.log('Wrap', Wrap);

        const content = renderToString(
            this.stylesheet.collectStyles(
                <StyleSheetManager sheet={this.stylesheet.instance}>
                    <HelmetProvider context={this.helmet}>
                        <ReduxProvider store={reduxStore(reduxStoreValue)}>
                            {/* {graphqlClient && (
                                <ApolloProvider client={graphqlClient}> */}
                                    {/* <StripeProvider apiKey={stripeAPIKey || ''}> */}
                                        <Application />
                                    {/* </StripeProvider> */}
                                {/* </ApolloProvider>
                            )} */}
                        </ReduxProvider>
                    </HelmetProvider>
                    {/* <Wrap /> */}
                </StyleSheetManager>
            ),
        );

        return content;
    }
}
