// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';

    import {
        StyleSheetManager,
    } from 'styled-components';

    import {
        HelmetProvider,
    } from 'react-helmet-async';

    import {
        PluridProvider,
        PluridRouterStatic,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridContentGeneratorData,
    } from '~data/interfaces';

    import wrapping from '~utilities/wrapping';
    // #endregion external
// #endregion imports



// #region module
class PluridContentGenerator {
    private data: PluridContentGeneratorData;

    constructor(
        data: PluridContentGeneratorData,
    ) {
        this.data = data;
    }

    public async render() {
        const {
            pluridMetastate,
            // matchedRoute,
            routes,
            planes,
            exterior,
            shell,
            gateway,
            gatewayEndpoint,
            gatewayQuery,
            servicesData,
            helmet,
            services,
            stylesheet,
            preserveResult,
            matchedPlane,

            pathname,
        } = this.data;

        // console.log('ContentGenerator pluridMetastate', pluridMetastate);

        const RoutedApplication = () => (
            <PluridProvider
                metastate={pluridMetastate}
            >
                <PluridRouterStatic
                    // path={matchedRoute.pathname}
                    path={pathname}
                    directPlane={matchedPlane?.value}
                    routes={routes}
                    planes={planes}
                    exterior={exterior}
                    shell={shell}
                    gateway={gateway}
                    gatewayEndpoint={gatewayEndpoint}
                    gatewayQuery={gatewayQuery}
                />
            </PluridProvider>
        );

        let reduxPreserveValue;
        if (preserveResult) {
            reduxPreserveValue = preserveResult.providers?.redux;
        }

        const reduxStore = servicesData?.reduxStore;
        const reduxStoreValue = reduxPreserveValue ?? servicesData?.reduxStoreValue ?? {};

        const apolloClient = servicesData?.apolloClient;

        let Wrap = wrapping(
            HelmetProvider,
            RoutedApplication,
            {
                context: helmet,
            },
        );

        const providers = await this.importProviders();

        for (const service of services) {
            switch (service) {
                case 'Redux':
                    Wrap = wrapping(
                        providers.ReduxProvider,
                        Wrap,
                        {
                            store: reduxStore(reduxStoreValue),
                            context: servicesData?.reduxContext,
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
                            stripe: null,
                        },
                    );
                    break;
            }
        }

        const content = renderToString(
            <StyleSheetManager
                sheet={stylesheet.instance}
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
                    const apollo = await import('@apollo/client');
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
// #endregion module



// #region exports
export default PluridContentGenerator;
// #endregion exports
