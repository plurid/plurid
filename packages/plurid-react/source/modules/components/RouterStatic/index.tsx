import React from 'react';

import {
    PluridRouterPath,
    PluridComponent,
} from '@plurid/plurid-data';

import PluridRouterBrowser from '../RouterBrowser';



export interface PluridRouterStaticOwnProperties {
    path: string;
    exterior?: PluridComponent;
    shell?: PluridComponent;
    paths: PluridRouterPath[];
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
        paths,
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
            paths={paths}
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


export default PluridRouterStatic;
