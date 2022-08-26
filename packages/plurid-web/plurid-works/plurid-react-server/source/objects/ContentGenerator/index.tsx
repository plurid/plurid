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
            hostname,
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
                    hostname={hostname}
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
                service.Provider,
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
}
// #endregion module



// #region exports
export default PluridContentGenerator;
// #endregion exports
