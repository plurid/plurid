// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRoute,
        PluridRoutePlane,
        PluridRouterProperties,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import PluridRouterBrowser from '~containers/RouterBrowser';
    // #endregion external
// #endregion imports



// #region module
export interface PluridRouterStaticOwnProperties {
    path: string;
    directPlane?: string;
    exterior?: PluridReactComponent;
    shell?: PluridReactComponent;
    routes: PluridRoute<PluridReactComponent>[];
    planes: PluridRoutePlane<PluridReactComponent>[];
    protocol?: string;
    hostname?: string;
    gateway?: boolean;
    gatewayQuery?: string;
    gatewayEndpoint?: string;
    routerProperties?: Partial<PluridRouterProperties<PluridReactComponent>>;
}


const PluridRouterStatic = (
    properties: PluridRouterStaticOwnProperties,
) => {
    // #region properties
    const {
        path,
        directPlane,
        routes,
        planes,
        exterior,
        shell,
        protocol: protocolProperty,
        hostname: hostnameProperty,
        gateway,
        gatewayQuery: gatewayQueryProperty,
        gatewayEndpoint: gatewayEndpointProperty,
        routerProperties,
    } = properties;

    const protocol = protocolProperty || 'http';
    const hostname = hostnameProperty || 'origin';
    const gatewayQuery = gatewayQueryProperty || '';
    const gatewayEndpoint = gatewayEndpointProperty || '/gateway';
    // #endregion properties


    // #region render
    return (
        <PluridRouterBrowser
            routes={routes}
            planes={planes}
            exterior={exterior}
            shell={shell}
            static={{
                path,
                directPlane,
            }}
            protocol={protocol}
            hostname={hostname}
            {...routerProperties}
        />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridRouterStatic;
// #endregion exports
