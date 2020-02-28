import React from 'react';

import {
    renderToString,
} from 'react-dom/server';

import {
    ServerStyleSheet,
    StyleSheetManager,
} from 'styled-components';

import {
    Provider as ReduxProvider,
} from 'react-redux';
import {
    ApolloProvider,
} from '@apollo/react-hooks';

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

    constructor(
        Application: React.FC<any>,
        services: PluridServerService[],
        servicesData: PluridServerServicesData | undefined,
        stylesheet: ServerStyleSheet,
    ) {
        this.Application = Application;
        this.services = services;
        this.servicesData = servicesData;
        this.stylesheet = stylesheet;
    }

    render() {
        const Application = this.Application;

        const reduxStore = this.servicesData?.reduxStore;
        const graphqlClient = this.servicesData?.graphqlClient;
        const stripeAPIKey = this.servicesData?.stripeAPIKey;

        let Wrap: JSX.Element = (<Application />);

        for (const service of this.services) {
            switch (service) {
                case 'Redux':
                    Wrap = wrapping(
                        ReduxProvider,
                        Wrap,
                        {
                            store: reduxStore,
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
                        // Stripe Provider
                        <></>,
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
                    {Wrap}
                </StyleSheetManager>
            ),
        );

        return content;
    }
}
