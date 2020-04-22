import React, {
    useRef,
} from 'react';

import {
    PluridRouterPath,
    IndexedPluridPlane,
    // PluridPlane,
} from '@plurid/plurid-data';

import {
    router,
    // utilities,
} from '@plurid/plurid-engine';

// import PluridApplication from '../../../Application';

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

    // const protocol = protocolProperty
    //     ? protocolProperty
    //     : window.location.protocol.replace(':', '');

    // const host = hostProperty
    //     ? hostProperty
    //     : environment.production
    //         ? window.location.host
    //         : 'localhost:3000';


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
        } = getGatewayView(
            gatewayQuery,
            paths,
            gatewayEndpoint,
            undefined,
            protocol,
            host,
            indexedPlanes.current,
        );

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

    // const Component = handleMatchedRoute(matchedRoute);
    const Component = getComponentFromRoute(
        matchedRoute,
        protocol,
        host,
        indexedPlanes.current,
    );

    return (
        <>
            {Component}
        </>
    );
}


export default PluridRouterStatic;
