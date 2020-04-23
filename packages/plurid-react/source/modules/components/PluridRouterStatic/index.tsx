import React, {
    useRef,
} from 'react';

import {
    PluridRouterPath,
    IndexedPluridPlane,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    getComponentFromRoute,
    getGatewayView,
    computeIndexedPlanes,
} from '../../services/logic/router';



const PluridRouter = router.default;


interface PluridRouterStaticOwnProperties {
    path: string;
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


    /** references */
    const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(
        computeIndexedPlanes(
            paths,
            protocol,
            host,
        ),
    );
    const pluridRouter = useRef(new PluridRouter(
        paths,
    ));


    /** render */
    if (gateway) {
        const {
            Component,
        } = getGatewayView({
            queryString: gatewayQuery,
            paths,
            gatewayPath: gatewayEndpoint,
            gatewayExterior: undefined,
            protocol,
            host,
            indexedPlanes: indexedPlanes.current,
        });

        return (
            <>
                {Component}
            </>
        );
    }

    const matchedRoute = pluridRouter.current.match(path);
    if (!matchedRoute) {
        return (
            <></>
        );
    }

    const Component = getComponentFromRoute({
        matchedRoute,
        protocol,
        host,
        indexedPlanes: indexedPlanes.current,
    });

    return (
        <>
            {Component}
        </>
    );
}


export default PluridRouterStatic;
