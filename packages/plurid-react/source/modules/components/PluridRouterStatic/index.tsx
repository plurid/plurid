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



const PluridRouter = router.default;


interface PluridRouterStaticOwnProperties {
    path: string;
    paths: PluridRouterPath[];
}

const PluridRouterStatic = (
    properties: PluridRouterStaticOwnProperties,
) => {
    /** properties */
    const {
        path,
        paths,
    } = properties;


    /** references */
    const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(new Map());
    const pluridRouter = useRef(new PluridRouter(
        paths,
    ));


    /** render */
    const matchedRoute = pluridRouter.current.match(path);

    if (!matchedRoute) {
        return (
            <></>
        );
    }

    return (
        <></>
    );

    // const view = matchedRoute.route.view;
    // const routeComponent = indexedComponents[view as any];

    // if (!routeComponent) {
    //     return (
    //         <></>
    //     )
    // }

    // const Component = routeComponent.component;
    // return (
    //     <>
    //         {matchedRoute && Component && (
    //             <Component />
    //         )}
    //     </>
    // );
}


export default PluridRouterStatic;
