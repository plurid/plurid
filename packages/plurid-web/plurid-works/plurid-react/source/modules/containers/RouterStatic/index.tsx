// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRoute,
        PluridRoutePlane,
        // PluridComponent,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import PluridRouterBrowser from '../RouterBrowser';
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
        directPlane,
        routes,
        planes,
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
            planes={planes}
            exterior={exterior}
            shell={shell}
            static={{
                path,
                directPlane,
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
