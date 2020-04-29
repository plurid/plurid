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
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    PluridProvider,
    PluridRouterStatic,
} from '@plurid/plurid-react';

import {
    PluridServerService,
    PluridServerServicesData,
} from '../../data/interfaces';

import wrapping from '../../utilities/wrapping';


interface PluridContentGeneratorData {
    services: PluridServerService[],
    servicesData: PluridServerServicesData | undefined,
    stylesheet: ServerStyleSheet,
    helmet: Helmet,
    matchedRoute: router.MatcherResponse,
    paths: PluridRouterPath[],
    pluridContext: any,
    gateway: boolean,
    gatewayEndpoint: string,
    gatewayQuery: string,
}


export default class PluridContentGenerator {
    private data: PluridContentGeneratorData;

    constructor(
        data: PluridContentGeneratorData,
    ) {
        this.data = data;
    }

    render() {
        const RoutedApplication = () => (
            <PluridProvider context={this.data.pluridContext}>
                <PluridRouterStatic
                    path={this.data.matchedRoute.pathname}
                    paths={this.data.paths}
                    gateway={this.data.gateway}
                    gatewayEndpoint={this.data.gatewayEndpoint}
                    gatewayQuery={this.data.gatewayQuery}
                />
            </PluridProvider>
        );

        const reduxStore = this.data.servicesData?.reduxStore;
        const reduxStoreValue = this.data.servicesData?.reduxStoreValue || {};
        const graphqlClient = this.data.servicesData?.graphqlClient;
        const stripeAPIKey = this.data.servicesData?.stripeAPIKey;

        let Wrap = wrapping(
            HelmetProvider,
            RoutedApplication,
            {
                context: this.data.helmet,
            },
        );

        for (const service of this.data.services) {
            switch (service) {
                case 'Redux':
                    Wrap = wrapping(
                        ReduxProvider,
                        Wrap,
                        {
                            store: reduxStore(reduxStoreValue),
                        },
                    );
                    break;
                case 'GraphQL':
                    Wrap = wrapping(
                        ApolloProvider,
                        Wrap,
                        {
                            client: graphqlClient,
                        },
                    );
                    break;
                case 'Stripe':
                    Wrap = wrapping(
                        StripeProvider,
                        Wrap,
                        {
                            apiKey: stripeAPIKey,
                        },
                    );
                    break;
            }
        }

        const content = renderToString(
            <StyleSheetManager
                sheet={this.data.stylesheet.instance}
                // disableCSSOMInjection={true}
            >
                <Wrap />
            </StyleSheetManager>
        );

        return content;
    }
}
