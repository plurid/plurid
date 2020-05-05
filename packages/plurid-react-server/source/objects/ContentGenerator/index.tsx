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
// import {
//     Provider as ReduxProvider,
// } from 'react-redux';
// import {
//     ApolloProvider,
// } from '@apollo/react-hooks';
// import {
//     StripeProvider,
// } from 'react-stripe-elements';

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

    public async render() {
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
        const apolloClient = this.data.servicesData?.apolloClient;
        const stripeAPIKey = this.data.servicesData?.stripeAPIKey;

        let Wrap = wrapping(
            HelmetProvider,
            RoutedApplication,
            {
                context: this.data.helmet,
            },
        );

        const providers = await this.importProviders();

        for (const service of this.data.services) {
            switch (service) {
                case 'Redux':
                    Wrap = wrapping(
                        providers.ReduxProvider,
                        Wrap,
                        {
                            store: reduxStore(reduxStoreValue),
                        },
                    );
                    break;
                case 'Apollo':
                    Wrap = wrapping(
                        providers.ApolloProvider,
                        Wrap,
                        {
                            client: apolloClient,
                        },
                    );
                    break;
                case 'Stripe':
                    Wrap = wrapping(
                        providers.StripeProvider,
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
            >
                <Wrap />
            </StyleSheetManager>
        );

        return content;
    }

    private async importProviders() {
        let ReduxProvider;
        let StripeProvider;
        let ApolloProvider;

        for (const service of this.data.services) {
            switch (service) {
                case 'Redux':
                    const redux = await import('react-redux');
                    ReduxProvider = redux.Provider;
                    break;
                case 'Apollo':
                    const apollo = await import('@apollo/react-hooks');
                    ApolloProvider = apollo.ApolloProvider;
                    break;
                case 'Stripe':
                    const stripe = await import('react-stripe-elements');
                    StripeProvider = stripe.StripeProvider;
                    break;
            }
        }

        return {
            ReduxProvider,
            ApolloProvider,
            StripeProvider,
        };
    }
}
