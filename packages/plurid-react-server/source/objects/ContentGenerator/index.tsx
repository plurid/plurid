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



export default class PluridContentGenerator {
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private stylesheet: ServerStyleSheet;
    private helmet: Helmet;
    private matchedRoute: router.MatcherResponse;
    private paths: PluridRouterPath[];
    private pluridContext: any;

    constructor(
        services: PluridServerService[],
        servicesData: PluridServerServicesData | undefined,
        stylesheet: ServerStyleSheet,
        helmet: Helmet,
        matchedRoute: router.MatcherResponse,
        paths: PluridRouterPath[],
        pluridContext: any,
    ) {
        this.services = services;
        this.servicesData = servicesData;
        this.stylesheet = stylesheet;
        this.helmet = helmet;
        this.matchedRoute = matchedRoute;
        this.paths = paths;
        this.pluridContext = pluridContext;
    }

    render() {
        const RoutedApplication = () => (
            <PluridProvider context={this.pluridContext}>
                <PluridRouterStatic
                    path={this.matchedRoute.pathname}
                    paths={this.paths}
                />
            </PluridProvider>
        );

        const reduxStore = this.servicesData?.reduxStore;
        const reduxStoreValue = this.servicesData?.reduxStoreValue || {};
        const graphqlClient = this.servicesData?.graphqlClient;
        const stripeAPIKey = this.servicesData?.stripeAPIKey;

        let Wrap = wrapping(
            HelmetProvider,
            RoutedApplication,
            {
                context: this.helmet,
            },
        );

        for (const service of this.services) {
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
            this.stylesheet.collectStyles(
                <StyleSheetManager
                    sheet={this.stylesheet.instance}
                    disableCSSOMInjection={true}
                >
                    <Wrap />
                </StyleSheetManager>
            ),
        );

        return content;
    }
}
