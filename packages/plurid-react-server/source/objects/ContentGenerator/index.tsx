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
    PluridRouterRouting,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    PluridRouterStatic,
} from '@plurid/plurid-react';

import {
    PluridServerService,
    PluridServerServicesData,
} from '../../data/interfaces';

import wrapping from '../../utilities/wrapping';



export default class PluridContentGenerator<T> {
    // private Application: React.FC<any>;
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private stylesheet: ServerStyleSheet;
    private helmet: Helmet;
    private matchedRoute: router.MatcherResponse<T>;
    private routing: PluridRouterRouting<T>;

    constructor(
        // Application: React.FC<any>,
        services: PluridServerService[],
        servicesData: PluridServerServicesData | undefined,
        stylesheet: ServerStyleSheet,
        helmet: Helmet,
        matchedRoute: router.MatcherResponse<T>,
        routing: PluridRouterRouting<T>,
    ) {
        // this.Application = Application;
        this.services = services;
        this.servicesData = servicesData;
        this.stylesheet = stylesheet;
        this.helmet = helmet;
        this.matchedRoute = matchedRoute;
        this.routing = routing;
    }

    render() {
        // const Application = this.Application;
        const RoutedApplication = () => (
            <PluridRouterStatic<T>
                path={this.matchedRoute.pathname}
                routing={this.routing}
            />
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
            }
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
                <StyleSheetManager sheet={this.stylesheet.instance}>
                    <Wrap />
                </StyleSheetManager>
            ),
        );

        return content;
    }
}
