import React, {
    useRef,
} from 'react';

import {
    PluridRouterPath,
    IndexedPluridPlane,
    PluridPlane,
} from '@plurid/plurid-data';

import {
    router,
    utilities,
} from '@plurid/plurid-engine';

import PluridApplication from '../../../Application';

import environment from '../../services/utilities/environment';



const PluridRouter = router.default;


interface PluridRouterStaticOwnProperties {
    path: string;
    paths: PluridRouterPath[];
    protocol?: string;
    host?: string;
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
    } = properties;

    const protocol = 'http';
    const host = 'localhost:63000';
    // const protocol = protocolProperty
    //     ? protocolProperty
    //     : window.location.protocol.replace(':', '');

    // const host = hostProperty
    //     ? hostProperty
    //     : environment.production
    //         ? window.location.host
    //         : 'localhost:3000';


    /** references */
    const indexedPlanes = useRef<Map<string, IndexedPluridPlane>>(new Map());
    const pluridRouter = useRef(new PluridRouter(
        paths,
    ));

    const handleMatchedRoute = (
        matchedRoute: router.MatcherResponse,
    ) => {
        const {
            path,
        } = matchedRoute;

        const {
            exterior,
            spaces,
            slotted,
        } = path;

        let Exterior: React.FC<any> = () => (<></>);
        if (exterior) {
            switch (exterior.kind) {
                case 'elementql':
                    break;
                case 'react':
                    Exterior = exterior.element
            }
        }

        let Spaces: React.FC<any> = () => (<></>);
        const spacesArray: any[] = [];
        if (spaces) {
            for (const space of spaces) {
                // console.log('SPACE', space);
                const planes: PluridPlane[] = [];
                const view = [];

                for (const universe of space.universes) {
                    for (const cluster of universe.clusters) {
                        for (const plane of cluster.planes) {
                            const {
                                component,
                                value,
                            } = plane;

                            const pathDivisions = [
                                protocol,
                                host,
                                path.value === '/' ? 'p' : utilities.cleanPathElement(path.value),
                                space.value === 'default' ? 's' : utilities.cleanPathElement(space.value),
                                universe.value === 'default' ? 'u' : utilities.cleanPathElement(universe.value),
                                cluster.value === 'default' ? 'c' : utilities.cleanPathElement(cluster.value),
                                utilities.cleanPathElement(value),
                            ];
                            const fullPath = pathDivisions.join('://');
                            // console.log('pathDivisions', pathDivisions);

                            if (component.kind === 'react') {
                                const pluridPlane: PluridPlane = {
                                    component: {
                                        element: component.element,
                                    },
                                    path: fullPath,
                                };

                                planes.push(pluridPlane);
                                view.push(fullPath);
                            }
                        }
                    }

                    // console.log('PLANES', planes);

                    const App = (
                        <PluridApplication
                            key={Math.random() + ''}
                            planes={planes}
                            indexedPlanes={indexedPlanes.current}
                            view={view}
                        />
                    );
                    spacesArray.push(App);
                }
            }

            Spaces = () => (
                <>
                    {spacesArray}
                </>
            );
        }

        const Component = (
            <>
                {exterior && (
                    <Exterior
                        spaces={slotted ? spacesArray : undefined}
                    />
                )}

                {spaces && !slotted && (
                    <Spaces />
                )}
            </>
        );
        return Component;
    }


    /** render */
    const matchedRoute = pluridRouter.current.match(path);

    if (!matchedRoute) {
        return (
            <></>
        );
    }

    const Component = handleMatchedRoute(matchedRoute);

    return (
        <>
            {Component}
        </>
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
