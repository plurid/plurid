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
    private providers: Record<string, any> | undefined;

    constructor(
        data: PluridContentGeneratorData,
    ) {
        this.data = data;
    }


    public async render() {
        if (!this.providers) {
            await this.importProviders();
        }

        if (!this.providers) {
            console.log('Plurid Server Error :: Providers not loaded');
            return '';
        }

        const {
            pluridMetastate,
            routes,
            planes,
            exterior,
            shell,
            gateway,
            gatewayEndpoint,
            gatewayQuery,
            helmet,
            services,
            stylesheet,
            preserveResult,
            matchedPlane,

            pathname,
        } = this.data;

        const RoutedApplication = () => (
            <PluridProvider
                metastate={pluridMetastate}
            >
                <PluridRouterStatic
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

        let Wrap = wrapping(
            HelmetProvider,
            RoutedApplication,
            {
                context: helmet,
            },
        );

        for (const service of services) {
            const preserveProperties = preserveResult?.providers?.[service.name];

            Wrap = wrapping(
                this.providers[service.name],
                Wrap,
                {
                    ...service.properties,
                    ...preserveProperties,
                },
            );
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
        const providers: Record<string, any> = {};

        for (const service of this.data.services) {
            try {
                const importedService = await import(service.package);
                const ImportedServiceProvider = service.provider === 'default'
                    ? importedService
                    : importedService[service.provider];
                providers[service.name] = ImportedServiceProvider;
            } catch (error) {
                console.log(`Plurid Server Error :: Service '${service.name}' from '${service.package}' could not be imported.`);
                continue;
            }
        }

        this.providers = providers;
    }
}
// #endregion module



// #region exports
export default PluridContentGenerator;
// #endregion exports
