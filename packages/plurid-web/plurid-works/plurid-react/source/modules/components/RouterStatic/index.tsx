// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRoute,
        PluridComponent,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridRouterBrowser from '../RouterBrowser';
    // #endregion external
// #endregion imports



// #region module
export interface PluridRouterStaticOwnProperties {
    path: string;
    exterior?: PluridComponent;
    shell?: PluridComponent;
    routes: PluridRoute[];
    protocol?: string;
    host?: string;
    gateway?: boolean;
    gatewayQuery?: string;
    gatewayEndpoint?: string;
}


const PluridRouterStatic = (
    properties: PluridRouterStaticOwnProperties,
) => {
    /** properties */
    const {
        path,
        routes,
        exterior,
        shell,
        protocol: protocolProperty,
        host: hostProperty,
        gateway,
        gatewayQuery: gatewayQueryProperty,
        gatewayEndpoint: gatewayEndpointProperty,
    } = properties;

    const protocol = protocolProperty || 'http';
    const host = hostProperty || 'localhost:63000';
    const gatewayQuery = gatewayQueryProperty || '';
    const gatewayEndpoint = gatewayEndpointProperty || '/gateway';


    /** render */
    return (
        <PluridRouterBrowser
            routes={routes}
            exterior={exterior}
            shell={shell}
            static={{
                path,
            }}
            protocol={protocol}
            host={host}
        />
    );
}
// #endregion module



// #region exports
export default PluridRouterStatic;
// #endregion exports
