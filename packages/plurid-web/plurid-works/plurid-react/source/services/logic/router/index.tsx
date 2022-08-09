// #region imports
    // #region libraries
    import React from 'react';

    import {
        /** constants */
        PLURID_ENTITY_MULTISPACE,
        PLURID_ROUTE_DEFAULT_PATH_VALUE,
        PLURID_ROUTE_DEFAULT_PATH,
        PLURID_ROUTE_DEFAULT_SPACE_VALUE,
        PLURID_ROUTE_DEFAULT_SPACE,
        PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE,
        PLURID_ROUTE_DEFAULT_UNIVERSE,
        PLURID_ROUTE_DEFAULT_CLUSTER_VALUE,
        PLURID_ROUTE_DEFAULT_CLUSTER,
        PLURID_ROUTE_SEPARATOR,

        /** interfaces */
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,
        IndexedPluridPlane,
        PluridRouterStatic,
        PluridRouteComponentProperty,
    } from '@plurid/plurid-data';

    import {
        routing,
        planes,
        utilities,
    } from '@plurid/plurid-engine';

    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        PluridReactPlane,
        PluridRouteMatch,
    } from '~data/interfaces';

    import PluridApplication from '~containers/Application/index';

    import {
        isReactRenderable,
    } from '~services/utilities/react';
    // #endregion external


    // #region internal
    import {
        StyledSpaces,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    resolvePluridRoutePlaneData,
    Registrar: PluridPlanesRegistrar,
} = planes;



export interface GetComponentFromRouteData {
    matchedRoute: routing.MatcherResponse<PluridReactComponent>;
    protocol: string;
    host: string;
    staticRender?: boolean;
}

export const getComponentFromRoute = (
    data: GetComponentFromRouteData,
) => {
    const {
        matchedRoute,
        protocol,
        host,
        staticRender,
    } = data;

    const {
        path,
        parameters,
        query,
    } = matchedRoute;

    const pluridProperty = {
        path: {
            parameters,
            query,
        },
    };

    const {
        exterior,
        planes,
        spaces,
        slotted,
    } = path;

    // console.log('path', path);

    const multispaceAlignment = path.multispace?.alignment || 'y';
    const multispaceSnapType = path.multispace?.snapType || 'mandatory';

    let PluridExterior: React.FC<any> = () => (<></>);
    if (exterior) {
        if (typeof exterior == 'function') {
            PluridExterior = exterior;
        }
    }

    let PluridSpaces: React.FC<any> = () => (<></>);
    const spacesArray: any[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane<PluridReactComponent>[] = [];
            const view = [];

            if (space.planes) {
                for (const plane of space.planes) {
                    const planeData = resolvePluridRoutePlaneData(plane);

                    const {
                        component,
                    } = planeData;

                    const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                        ? PLURID_ROUTE_DEFAULT_PATH
                        : utilities.cleanPathElement(path.value);
                    const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                        ? PLURID_ROUTE_DEFAULT_SPACE
                        : utilities.cleanPathElement(space.value);
                    const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                    const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                    const planeName = utilities.cleanPathElement(planeData.value);

                    const pathDivisions = [
                        protocol,
                        host,
                        pathName,
                        spaceName,
                        universeName,
                        clusterName,
                        planeName,
                    ];
                    const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                    const pluridPlane: PluridPlane<PluridReactComponent> = {
                        component,
                        route: fullPath,
                    };

                    planes.push(pluridPlane);
                    view.push(fullPath);

                    // if (component.kind === 'react') {
                    //     const pluridPlane: PluridPlane<PluridReactComponent> = {
                    //         component: {
                    //             kind: 'react',
                    //             element: component.element,
                    //             properties: {
                    //                 plurid: pluridProperty,
                    //             },
                    //         },
                    //         route: fullPath,
                    //     };

                    //     planes.push(pluridPlane);
                    //     view.push(fullPath);
                    // }
                }
            }

            if (space.universes) {
                for (const universe of space.universes) {
                    if (universe.clusters) {
                        for (const cluster of universe.clusters) {
                            for (const plane of cluster.planes) {
                                const planeData = resolvePluridRoutePlaneData(plane);

                                const {
                                    component,
                                } = planeData;

                                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                    ? PLURID_ROUTE_DEFAULT_PATH
                                    : utilities.cleanPathElement(path.value);
                                const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_SPACE
                                    : utilities.cleanPathElement(space.value);
                                const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                    : utilities.cleanPathElement(universe.value);
                                const clusterName = cluster.value === PLURID_ROUTE_DEFAULT_CLUSTER_VALUE
                                    ? PLURID_ROUTE_DEFAULT_CLUSTER
                                    : utilities.cleanPathElement(cluster.value);
                                const planeName = utilities.cleanPathElement(planeData.value);

                                const pathDivisions = [
                                    protocol,
                                    host,
                                    pathName,
                                    spaceName,
                                    universeName,
                                    clusterName,
                                    planeName,
                                ];
                                const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                                // if (component.kind === 'react') {
                                //     const pluridPlane: PluridPlane = {
                                //         component: {
                                //             kind: 'react',
                                //             element: component.element,
                                //             properties: {
                                //                 plurid: pluridProperty,
                                //             },
                                //         },
                                //         route: fullPath,
                                //     };

                                //     planes.push(pluridPlane);

                                //     if (!path.view) {
                                //         view.push(fullPath);
                                //     } else {
                                //         if (path.view.includes(plane.value)) {
                                //             view.push(fullPath);
                                //         }
                                //     }
                                // }
                            }
                        }
                    }

                    if (universe.planes) {
                        for (const plane of universe.planes) {
                            const planeData = resolvePluridRoutePlaneData(plane);

                            const {
                                component,
                            } = planeData;

                            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                ? PLURID_ROUTE_DEFAULT_PATH
                                : utilities.cleanPathElement(path.value);
                            const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                ? PLURID_ROUTE_DEFAULT_SPACE
                                : utilities.cleanPathElement(space.value);
                            const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                : utilities.cleanPathElement(universe.value);
                            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                            const planeName = utilities.cleanPathElement(planeData.value);

                            const pathDivisions = [
                                protocol,
                                host,
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                planeName,
                            ];
                            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                            // if (component.kind === 'react') {
                            //     const pluridPlane: PluridPlane = {
                            //         component: {
                            //             kind: 'react',
                            //             element: component.element,
                            //             properties: {
                            //                 plurid: pluridProperty,
                            //             },
                            //         },
                            //         route: fullPath,
                            //     };

                            //     planes.push(pluridPlane);
                            //     view.push(fullPath);
                            // }
                        }
                    }
                }
            }

            // console.log('spaces path.value', path.value);
            // console.log('getComponentFromRoute spaces view', view);
            const pluridPlanesRegistrar = new PluridPlanesRegistrar<PluridReactComponent>(
                [],
                'localhost:63000',
            );

            const App = (
                <PluridApplication
                    key={uuid.generate()}
                    id={path.value}
                    planes={planes}
                    view={view}
                    static={staticRender}
                    configuration={space.configuration}
                    planesRegistrar={pluridPlanesRegistrar}
                    hostname={host}
                />
            );
            spacesArray.push(App);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
        const view: any[] = [];

        for (const plane of planes) {
            const planeData = resolvePluridRoutePlaneData(plane);

            const {
                component,
            } = planeData;

            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);
            const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
            const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
            const planeName = utilities.cleanPathElement(planeData.value);

            const pathDivisions = [
                protocol,
                host,
                pathName,
                spaceName,
                universeName,
                clusterName,
                planeName,
            ];
            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

            // if (component.kind === 'react') {
            //     const pluridPlane: PluridPlane<PluridReactComponent> = {
            //         component: {
            //             kind: 'react',
            //             element: component.element,
            //             properties: {
            //                 plurid: pluridProperty,
            //             },
            //         },
            //         route: fullPath,
            //     };

            //     pluridPlanes.push(pluridPlane);

            //     if (!path.view) {
            //         view.push(fullPath);
            //     } else {
            //         if (path.view.includes(plane.value)) {
            //             view.push(fullPath);
            //         }
            //     }
            // }
        }

        const planesProperties = new Map();

        // console.log('path.value', path.value);

        // console.log('getComponentFromRoute planes view', view);

        const App = (
            <PluridApplication
                key={uuid.generate()}
                id={path.value}
                planes={pluridPlanes}
                planesProperties={planesProperties}
                view={view}
                static={staticRender}
                configuration={path.defaultConfiguration}
                hostname={host}
            />
        );
        spacesArray.push(App);
    }


    let MultispaceHeader: React.FC<any>;
    let MultispaceFooter: React.FC<any>;
    if (path.multispace?.header) {
        const header = path.multispace.header;
        if (typeof header == 'function') {
            MultispaceHeader = header;
        }
    }
    if (path.multispace?.footer) {
        const footer = path.multispace.footer;
        if (typeof footer == 'function') {
            MultispaceFooter = footer;
        }
    }

    PluridSpaces = () => (
        <StyledSpaces
            alignment={multispaceAlignment}
            snapType={multispaceSnapType}
            data-plurid-entity={PLURID_ENTITY_MULTISPACE}
        >
            {MultispaceHeader && (
                <MultispaceHeader />
            )}

            {spacesArray}

            {MultispaceFooter && (
                <MultispaceFooter />
            )}
        </StyledSpaces>
    );

    const Component = (
        <>
            {exterior && (
                <PluridExterior
                    spaces={slotted ? spacesArray : undefined}
                    plurid={pluridProperty}
                />
            )}

            {
                (spaces || planes)
                && !slotted
                && (
                    <PluridSpaces />
                )
            }
        </>
    );
    return Component;
}


export interface GetGatewayViewData {
    queryString: string;
    routes: PluridRoute<PluridReactComponent>[];
    gatewayPath: string | undefined;
    gatewayExterior: any;
    protocol: string;
    host: string;
}

export const getGatewayView = (
    data: GetGatewayViewData,
) => {
    const {
        queryString,
        routes,
        gatewayPath,
        gatewayExterior,
        protocol,
        host,
    } = data

    const query = routing.extractQuery(queryString);

    const gatewayView: string[] = [];

    if (query.plurid) {
        gatewayView.push(query.plurid);
    }

    if (query.plurids) {
        const gatewayViews = query.plurids.split(',');
        gatewayView.push(...gatewayViews);
    }

    const planes: PluridPlane<PluridReactComponent>[] = [];
    const view: string[] = [];

    for (const path of routes) {
        if (path.spaces) {
            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);

            for (const space of path.spaces) {
                const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                    ? PLURID_ROUTE_DEFAULT_SPACE
                    : utilities.cleanPathElement(space.value);

                if (space.universes) {
                    for (const universe of space.universes) {
                        const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                            ? PLURID_ROUTE_DEFAULT_UNIVERSE
                            : utilities.cleanPathElement(universe.value);

                        if (universe.clusters) {
                            for (const cluster of universe.clusters) {
                                const clusterName = cluster.value === PLURID_ROUTE_DEFAULT_CLUSTER_VALUE
                                    ? PLURID_ROUTE_DEFAULT_CLUSTER
                                    : utilities.cleanPathElement(cluster.value);

                                for (const plane of cluster.planes) {
                                    const planeData = resolvePluridRoutePlaneData(plane);

                                    const {
                                        component,
                                        value,
                                    } = planeData;

                                    const planeName = utilities.cleanPathElement(value);

                                    const planeAddressElements = [
                                        protocol,
                                        host,
                                        pathName,
                                        spaceName,
                                        universeName,
                                        clusterName,
                                        planeName,
                                    ];
                                    const planeAddress = planeAddressElements.join(PLURID_ROUTE_SEPARATOR);

                                    for (const gatewayViewPlane of gatewayView) {
                                        // check that the planeAddress is the same as gatewayViewPlane
                                        // considering parameters / query

                                        // if (gatewayViewPlane === planeAddress) {
                                        //     if (component.kind === 'react') {
                                        //         const pluridPlane: PluridPlane = {
                                        //             component: {
                                        //                 kind: 'react',
                                        //                 element: component.element,
                                        //             },
                                        //             route: planeAddress,
                                        //         };

                                        //         planes.push(pluridPlane);
                                        //         view.push(planeAddress);
                                        //     }
                                        // }
                                    }
                                }
                            }
                        }

                        if (universe.planes) {
                            for (const plane of universe.planes) {
                                const planeData = resolvePluridRoutePlaneData(plane);

                                const {
                                    component,
                                    value,
                                } = planeData;

                                const planeName = utilities.cleanPathElement(value);

                                const planeAddressElements = [
                                    protocol,
                                    host,
                                    pathName,
                                    spaceName,
                                    universeName,
                                    PLURID_ROUTE_DEFAULT_CLUSTER,
                                    planeName,
                                ];
                                const planeAddress = planeAddressElements.join(PLURID_ROUTE_SEPARATOR);

                                for (const gatewayViewPlane of gatewayView) {
                                    // if (gatewayViewPlane === planeAddress) {
                                    //     if (component.kind === 'react') {
                                    //         const pluridPlane: PluridPlane = {
                                    //             component: {
                                    //                 kind: 'react',
                                    //                 element: component.element,
                                    //             },
                                    //             route: planeAddress,
                                    //         };

                                    //         planes.push(pluridPlane);
                                    //         view.push(planeAddress);
                                    //     }
                                    // }
                                }
                            }
                        }
                    }
                }

                if (space.planes) {
                    for (const plane of space.planes) {
                        const planeData = resolvePluridRoutePlaneData(plane);

                        const {
                            component,
                            value,
                        } = planeData;

                        const planeName = utilities.cleanPathElement(value);

                        const planeAddressElements = [
                            protocol,
                            host,
                            pathName,
                            spaceName,
                            PLURID_ROUTE_DEFAULT_UNIVERSE,
                            PLURID_ROUTE_DEFAULT_CLUSTER,
                            planeName,
                        ];
                        const planeAddress = planeAddressElements.join(PLURID_ROUTE_SEPARATOR);

                        for (const gatewayViewPlane of gatewayView) {
                            // if (gatewayViewPlane === planeAddress) {
                            //     if (component.kind === 'react') {
                            //         const pluridPlane: PluridPlane = {
                            //             component: {
                            //                 kind: 'react',
                            //                 element: component.element,
                            //             },
                            //             route: planeAddress,
                            //         };

                            //         planes.push(pluridPlane);
                            //         view.push(planeAddress);
                            //     }
                            // }
                        }
                    }
                }
            }
        }

        if (path.planes) {
            for (const plane of path.planes) {
                const planeData = resolvePluridRoutePlaneData(plane);

                const {
                    component,
                } = planeData;

                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                    ? PLURID_ROUTE_DEFAULT_PATH
                    : utilities.cleanPathElement(path.value);
                const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
                const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                const planeName = utilities.cleanPathElement(planeData.value);

                const pathDivisions = [
                    protocol,
                    host,
                    pathName,
                    spaceName,
                    universeName,
                    clusterName,
                    planeName,
                ];
                const planeAddress = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                // if (component.kind === 'react') {
                //     const pluridPlane: PluridPlane = {
                //         component: {
                //             kind: 'react',
                //             element: component.element,
                //         },
                //         route: planeAddress,
                //     };

                //     planes.push(pluridPlane);
                //     view.push(planeAddress);
                // }
            }
        }
    }

    let Exterior: React.FC<any> = () => (<></>);
    if (gatewayExterior) {
        switch (gatewayExterior.kind) {
            case 'react':
                Exterior = gatewayExterior.element;
                break;
        }
    }

    const Component = (
        <>
            <Exterior />

            <PluridApplication
                planes={planes}
                view={view}
            />
        </>
    );

    const gatewayRoute: routing.MatcherResponse<PluridReactComponent> = {
        path: {
            value: gatewayPath || 'gateway',
        },
        pathname: '',
        fragments: {
            elements: [],
            texts: [],
        },
        parameters: {},
        query: {},
        route: '',
    };


    return {
        Component,
        gatewayRoute,
    };
}


export const collectApplicationsFromPath = async (
    isoMatch: PluridRouteMatch,
    protocol: string,
    host: string,
    globals: Record<string, string> | undefined,
) => {
    const parameters = {};
    const query = {};
    const path: any = {
        planes: [],
        spaces: [],
        view: [],
        value: '',
    };
    let defaultConfiguration;

    if (isoMatch.kind === 'Route') {
        let routeData: any = isoMatch.data;
        defaultConfiguration = routeData.defaultConfiguration;

        if (isoMatch.data.resolver) {
            routeData = await isoMatch.data.resolver(globals);
        }

        path.planes = routeData.planes || [];
        path.spaces = routeData.spaces || [];
        path.view = routeData.view || [];
        path.value = isoMatch.data.value || '';
    }

    // const {
    //     path,
    //     parameters,
    //     query,
    // } = matchedRoute;

    const {
        planes,
        spaces,
        view,
    } = path;

    const pluridProperty = {
        path: {
            parameters,
            query,
        },
    };

    const plurids: {
        planes: PluridPlane<PluridReactComponent>[],
        view: string[],
        configuration?: any,
    }[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane<PluridReactComponent>[] = [];
            const view: any[] = [];

            if (space.planes) {
                for (const plane of space.planes) {
                    const planeData = resolvePluridRoutePlaneData(plane);

                    const {
                        component,
                    } = planeData;

                    const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                        ? PLURID_ROUTE_DEFAULT_PATH
                        : utilities.cleanPathElement(path.value);
                    const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                        ? PLURID_ROUTE_DEFAULT_SPACE
                        : utilities.cleanPathElement(space.value);
                    const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                    const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                    const planeName = utilities.cleanPathElement(planeData.value);

                    const pathDivisions = [
                        protocol,
                        host,
                        pathName,
                        spaceName,
                        universeName,
                        clusterName,
                        planeName,
                    ];
                    const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                    // if (component.kind === 'react') {
                    //     const pluridPlane: PluridPlane = {
                    //         component: {
                    //             kind: 'react',
                    //             element: component.element,
                    //             properties: {
                    //                 plurid: pluridProperty,
                    //             },
                    //         },
                    //         route: fullPath,
                    //     };

                    //     planes.push(pluridPlane);
                    //     view.push(fullPath);
                    // }
                }
            }

            if (space.universes) {
                for (const universe of space.universes) {
                    if (universe.clusters) {
                        for (const cluster of universe.clusters) {
                            for (const plane of cluster.planes) {
                                const planeData = resolvePluridRoutePlaneData(plane);

                                const {
                                    component,
                                } = planeData;

                                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                    ? PLURID_ROUTE_DEFAULT_PATH
                                    : utilities.cleanPathElement(path.value);
                                const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_SPACE
                                    : utilities.cleanPathElement(space.value);
                                const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                    : utilities.cleanPathElement(universe.value);
                                const clusterName = cluster.value === PLURID_ROUTE_DEFAULT_CLUSTER_VALUE
                                    ? PLURID_ROUTE_DEFAULT_CLUSTER
                                    : utilities.cleanPathElement(cluster.value);
                                const planeName = utilities.cleanPathElement(planeData.value);

                                const pathDivisions = [
                                    protocol,
                                    host,
                                    pathName,
                                    spaceName,
                                    universeName,
                                    clusterName,
                                    planeName,
                                ];
                                const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                                // if (component.kind === 'react') {
                                //     const pluridPlane: PluridPlane = {
                                //         component: {
                                //             kind: 'react',
                                //             element: component.element,
                                //             properties: {
                                //                 plurid: pluridProperty,
                                //             },
                                //         },
                                //         route: fullPath,
                                //     };

                                //     planes.push(pluridPlane);
                                //     view.push(fullPath);
                                // }
                            }
                        }
                    }

                    if (universe.planes) {
                        for (const plane of universe.planes) {
                            const planeData = resolvePluridRoutePlaneData(plane);

                            const {
                                component,
                            } = planeData;

                            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                ? PLURID_ROUTE_DEFAULT_PATH
                                : utilities.cleanPathElement(path.value);
                            const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                ? PLURID_ROUTE_DEFAULT_SPACE
                                : utilities.cleanPathElement(space.value);
                            const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                : utilities.cleanPathElement(universe.value);
                            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                            const planeName = utilities.cleanPathElement(planeData.value);

                            const pathDivisions = [
                                protocol,
                                host,
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                planeName,
                            ];
                            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                            // if (component.kind === 'react') {
                            //     const pluridPlane: PluridPlane = {
                            //         component: {
                            //             kind: 'react',
                            //             element: component.element,
                            //             properties: {
                            //                 plurid: pluridProperty,
                            //             },
                            //         },
                            //         route: fullPath,
                            //     };

                            //     planes.push(pluridPlane);
                            //     view.push(fullPath);
                            // }
                        }
                    }
                }
            }

            const pluridApplication = {
                planes,
                view,
                configuration: defaultConfiguration,
            };
            plurids.push(pluridApplication);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
        // const view = [];

        for (const plane of planes) {
            const planeData = resolvePluridRoutePlaneData<any>(plane);

            const {
                value,
                component,
            } = planeData;

            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);
            const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
            const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
            const planeName = utilities.cleanPathElement(planeData.value);

            const pathDivisions = [
                protocol,
                host,
                pathName,
                spaceName,
                universeName,
                clusterName,
                planeName,
            ];
            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

            const pluridPlane: PluridPlane<PluridReactComponent> = {
                component,
                route: value,
            };

            pluridPlanes.push(pluridPlane);

            // if (component.kind === 'react') {
            //     const pluridPlane: PluridPlane = {
            //         component: {
            //             kind: 'react',
            //             element: component.element,
            //             properties: {
            //                 plurid: pluridProperty,
            //             },
            //         },
            //         route: fullPath,
            //     };

            //     pluridPlanes.push(pluridPlane);
            //     // view.push(fullPath);
            // }
        }

        const pluridApplication = {
            planes: pluridPlanes,
            view,
            configuration: defaultConfiguration,
        };
        plurids.push(pluridApplication);
    }

    return plurids;
}





export const gatherPluridPlanes = (
    routes: PluridRoute<PluridReactComponent>[],
    planes: PluridRoutePlane<PluridReactComponent>[] | undefined,
) => {
    const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];

    for (const route of routes) {
        if (route.planes) {
            for (const plane of route.planes) {
                const planeData = resolvePluridRoutePlaneData(plane);

                const planeRoute = planeData.link
                    ? planeData.link
                    : planeData.value.startsWith('/')
                        ? planeData.value
                        : route.value + '/' + planeData.value;

                const pluridPlane: PluridReactPlane = {
                    route: planeRoute,
                    component: planeData.component,
                };
                pluridPlanes.push(pluridPlane);
            }
        }

        if (route.spaces) {
            // gather planes from spaces
        }
    }

    if (planes) {
        for (const plane of planes) {
            const planeData = resolvePluridRoutePlaneData(plane);

            const pluridPlane: PluridReactPlane = {
                route: planeData.value,
                component: planeData.component,
            };
            pluridPlanes.push(pluridPlane);
        }
    }

    return pluridPlanes;
}


export const renderMultispace = (
    matchedRoute: PluridRouteMatch,
    hostname = 'origin',
) => {
    if (matchedRoute.kind !== 'Route') {
        return () => () => (<></>);
    }

    const protocol = 'http';
    const host = hostname;

    const {
        match,
        data: path,
    } = matchedRoute;

    const {
        parameters,
        query,
    } = match;

    const pluridRouteProperty: PluridRouteComponentProperty = {
        value: match.value,
        parameters,
        query,
    };

    const {
        exterior,
        planes,
        spaces,
        slotted,
    } = matchedRoute.data;

    const multispaceAlignment = path.multispace?.alignment || 'y';
    const multispaceSnapType = path.multispace?.snapType || 'mandatory';

    let PluridExterior: React.FC<any> = () => (<></>);
    if (isReactRenderable(exterior)) {
        PluridExterior = exterior as any;
    }

    let PluridSpaces: React.FC<any> = () => (<></>);
    const spacesArray: any[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane<PluridReactComponent>[] = [];
            const view: any[] = [];

            if (space.planes) {
                for (const plane of space.planes) {
                    const planeData = resolvePluridRoutePlaneData<React.FC<any>>(plane as any);

                    const {
                        component,
                    } = planeData;

                    const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                        ? PLURID_ROUTE_DEFAULT_PATH
                        : utilities.cleanPathElement(path.value);
                    const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                        ? PLURID_ROUTE_DEFAULT_SPACE
                        : utilities.cleanPathElement(space.value);
                    const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                    const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                    const planeName = utilities.cleanPathElement(planeData.value);

                    const pathDivisions = [
                        protocol,
                        host,
                        pathName,
                        spaceName,
                        universeName,
                        clusterName,
                        planeName,
                    ];
                    const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                    const pluridPlane: PluridReactPlane = {
                        component,
                        // plurid: pluridProperty,
                        route: fullPath,
                    };

                    planes.push(pluridPlane);
                    view.push(fullPath);
                }
            }

            if (space.universes) {
                for (const universe of space.universes) {
                    if (universe.clusters) {
                        for (const cluster of universe.clusters) {
                            for (const plane of cluster.planes) {
                                const planeData = resolvePluridRoutePlaneData<any>(plane);

                                const {
                                    component,
                                } = planeData;

                                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                    ? PLURID_ROUTE_DEFAULT_PATH
                                    : utilities.cleanPathElement(path.value);
                                const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_SPACE
                                    : utilities.cleanPathElement(space.value);
                                const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                    ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                    : utilities.cleanPathElement(universe.value);
                                const clusterName = cluster.value === PLURID_ROUTE_DEFAULT_CLUSTER_VALUE
                                    ? PLURID_ROUTE_DEFAULT_CLUSTER
                                    : utilities.cleanPathElement(cluster.value);
                                const planeName = utilities.cleanPathElement(planeData.value);

                                const pathDivisions = [
                                    protocol,
                                    host,
                                    pathName,
                                    spaceName,
                                    universeName,
                                    clusterName,
                                    planeName,
                                ];
                                const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                                const pluridPlane: PluridReactPlane = {
                                    component,
                                    // plurid: pluridProperty,
                                    route: fullPath,
                                };

                                planes.push(pluridPlane);

                                if (!path.view) {
                                    view.push(fullPath);
                                } else {
                                    if (path.view.includes(planeData.value)) {
                                        view.push(fullPath);
                                    }
                                }
                            }
                        }
                    }

                    if (universe.planes) {
                        for (const plane of universe.planes) {
                            const planeData = resolvePluridRoutePlaneData<any>(plane);

                            const {
                                component,
                            } = planeData;

                            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                                ? PLURID_ROUTE_DEFAULT_PATH
                                : utilities.cleanPathElement(path.value);
                            const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                                ? PLURID_ROUTE_DEFAULT_SPACE
                                : utilities.cleanPathElement(space.value);
                            const universeName = universe.value === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
                                ? PLURID_ROUTE_DEFAULT_UNIVERSE
                                : utilities.cleanPathElement(universe.value);
                            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                            const planeName = utilities.cleanPathElement(planeData.value);

                            const pathDivisions = [
                                protocol,
                                host,
                                pathName,
                                spaceName,
                                universeName,
                                clusterName,
                                planeName,
                            ];
                            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

                            const pluridPlane: PluridReactPlane = {
                                component,
                                // plurid: pluridProperty,
                                route: fullPath,
                            };

                            planes.push(pluridPlane);
                            view.push(fullPath);
                        }
                    }
                }
            }

            // console.log('spaces path.value', path.value);
            // console.log('getComponentFromRoute spaces view', view);
            const pluridPlanesRegistrar = new PluridPlanesRegistrar<PluridReactComponent>(
                [],
                'localhost:63000',
            );

            const App = (
                <PluridApplication
                    key={uuid.generate()}
                    id={path.value}
                    planes={planes}
                    view={view}
                    configuration={space.configuration}
                    planesRegistrar={pluridPlanesRegistrar}
                    hostname={hostname}
                />
            );
            spacesArray.push(App);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
        const view: any[] = [];

        for (const plane of planes) {
            const planeData = resolvePluridRoutePlaneData<any>(plane);

            const {
                component,
            } = planeData;

            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);
            const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
            const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
            const planeName = utilities.cleanPathElement(planeData.value);

            const pathDivisions = [
                protocol,
                host,
                pathName,
                spaceName,
                universeName,
                clusterName,
                planeName,
            ];
            const fullPath = pathDivisions.join(PLURID_ROUTE_SEPARATOR);

            const pluridPlane: PluridReactPlane = {
                component,
                // plurid: pluridProperty,
                route: fullPath,
            };

            pluridPlanes.push(pluridPlane);

            if (!path.view) {
                view.push(fullPath);
            } else {
                if (path.view.includes(planeData.value)) {
                    view.push(fullPath);
                }
            }
        }

        const App = (
            <PluridApplication
                key={uuid.generate()}
                id={path.value}
                planes={pluridPlanes}
                view={view}
                configuration={path.defaultConfiguration}
                hostname={hostname}
            />
        );
        spacesArray.push(App);
    }


    let MultispaceHeader: React.FC<any>;
    let MultispaceFooter: React.FC<any>;
    if (isReactRenderable(path.multispace?.header)) {
        MultispaceHeader = path.multispace?.header as any;
    }
    if (isReactRenderable(path.multispace?.footer)) {
        MultispaceFooter = path.multispace?.footer as any;
    }


    PluridSpaces = () => (
        <StyledSpaces
            alignment={multispaceAlignment}
            snapType={multispaceSnapType}
            data-plurid-entity={PLURID_ENTITY_MULTISPACE}
        >
            {MultispaceHeader && (
                <MultispaceHeader
                    plurid={pluridRouteProperty}
                />
            )}

            {spacesArray}

            {MultispaceFooter && (
                <MultispaceFooter
                    plurid={pluridRouteProperty}
                />
            )}
        </StyledSpaces>
    );

    return (): React.FC<any> => {
        const PluridRoute = () => (
            <>
                {exterior && (
                    <PluridExterior
                        spaces={slotted ? spacesArray : undefined}
                        plurid={pluridRouteProperty}
                    />
                )}

                {
                    (spaces || planes)
                    && !slotted
                    && (
                        <PluridSpaces />
                    )
                }
            </>
        );

        return PluridRoute;
    }
}


export const computePluridRoute = (
    matchedRoute: PluridRouteMatch | undefined,
    planesRegistrar: planes.Registrar<PluridReactComponent>,
    isoMatcher: routing.IsoMatcher<PluridReactComponent>,
    directPlane?: PluridRouteMatch,
    hostname = 'origin',
) => {
    if (
        directPlane
        || matchedRoute?.kind === 'RoutePlane'
    ) {
        const match = directPlane || matchedRoute;
        if (!match) {
            return () => () => (<></>);
        }
        // console.log('Render Direct Plane directPlane', directPlane);
        // console.log('Render Direct Plane matchedRoute', matchedRoute);

        const DirectPlane = renderDirectPlane(
            match,
            planesRegistrar,
            hostname,
        );

        return DirectPlane;
    }

    if (!matchedRoute) {
        // Handle not found.
        const notFoundRoute = isoMatcher.match('/not-found', 'route');
        if (notFoundRoute && notFoundRoute.kind === 'Route') {
            const notFoundRender: any = computePluridRoute(
                notFoundRoute,
                planesRegistrar,
                isoMatcher,
                undefined,
                hostname,
            );

            return notFoundRender as any;
        }

        return () => () => (<></>);
    }


    const {
        exterior,
        view,
        planes,
        spaces,
        defaultConfiguration,
        slotted,
        resolver,
    } = matchedRoute.data;

    if (resolver) {
        const resolved = resolver(undefined);
    }
    // console.log('matchedRoute', matchedRoute);


    const pluridRouteProperty: PluridRouteComponentProperty = {
        value: matchedRoute.match.value,
        parameters: matchedRoute.match.parameters,
        query: matchedRoute.match.query,
    };


    let PluridRouteExterior: React.FC<any> | undefined;
    if (isReactRenderable(exterior)) {
        PluridRouteExterior = exterior as any;
        if (PluridRouteExterior) {
            PluridRouteExterior.displayName = 'PluridRouteExterior';
        }
    }


    // Render only the exterior of the route.
    if (
        exterior
        && PluridRouteExterior
        && !view
        && !planes
        && !spaces
    ) {
        return (): React.FC<any> => {
            const PluridRoute = () => (
                <>
                    {PluridRouteExterior && (
                        <PluridRouteExterior
                            plurid={pluridRouteProperty}
                        />
                    )}
                </>
            );

            return PluridRoute;
        };
    }


    // Render a single Plurid Application in the route.
    if (
        view
    ) {
        return (): React.FC<any> => {
            const pubsub = new PluridPubSub();

            const space = matchedRoute.data.value;

            const pluridApplication = (
                <PluridApplication
                    view={view}
                    planesRegistrar={planesRegistrar}
                    configuration={defaultConfiguration}
                    pubsub={pubsub}
                    matchedRoute={matchedRoute}
                    hostname={hostname}
                    space={space}
                />
            );

            const PluridRoute = () => (
                <>
                    {PluridRouteExterior && (
                        <PluridRouteExterior
                            plurid={pluridRouteProperty}
                            pubsub={pubsub}
                            spaces={slotted ? [pluridApplication] : undefined}
                        />
                    )}

                    {!slotted && (
                        <>
                            {pluridApplication}
                        </>
                    )}
                </>
            );

            return PluridRoute;
        };
    }


    // Render a multispace route.
    return renderMultispace(
        matchedRoute,
    );
}


export const computeInitialMatchedPath = (
    staticContext?: PluridRouterStatic,
): string => {
    if (staticContext) {
        return staticContext.path;
    }

    if (typeof window !== 'undefined') {
        return window.location.pathname + window.location.search;
    }

    return '/';
}


export const getDirectPlaneMatch = (
    matchedPath: string,
    routes: PluridRoute<PluridReactComponent>[],
    planes: PluridRoutePlane<PluridReactComponent>[] | undefined,
) => {
    let matchRoute: PluridRoute<PluridReactComponent> | undefined;
    let matchPlane: PluridRoutePlane<PluridReactComponent> | undefined;
    let matchPath: string | undefined;

    for (const route of routes) {
        if (route.planes) {
            for (const plane of route.planes) {
                const planeData = resolvePluridRoutePlaneData(plane);

                const planePath = route.value === '/'
                    ? planeData.value
                    : route.value + planeData.value;
                matchPath = planePath;

                if (matchedPath === planePath) {
                    matchPlane = plane;
                    break;
                }
            }
        }

        if (matchPlane) {
            matchRoute = route;
            break;
        }
    }

    if (planes) {
        for (const plane of planes) {
            const planeData = resolvePluridRoutePlaneData(plane);

            if (matchedPath === planeData.value) {
                matchPlane = plane;
                break;
            }
        }
    }

    return {
        matchRoute,
        matchPlane,
        matchPath,
    };
}


export const renderDirectPlane = (
    routePlane: PluridRouteMatch,
    planesRegistrar: planes.Registrar<PluridReactComponent>,
    hostname = 'origin',
) => {
    if (routePlane.match.query.flat) {
        const flat = routePlane.match.query.flat.toLowerCase();
        const renderFlat = flat === 'true' || flat === '1';

        if (renderFlat) {
            const pluridRoute = planesRegistrar.get(routePlane.match.value);

            if (pluridRoute) {
                const Flat = pluridRoute.component;
                if (typeof Flat !== 'function') {
                    return () => () => (<></>);
                }

                const DirectPlane = (): any => {
                    const PluridRoute = () => (
                        <>
                            <Flat />
                        </>
                    );

                    return PluridRoute;
                };

                return DirectPlane;
            }
        }
    }

    // let matchedPlane: router.MatcherResponse<PluridReactComponent> | undefined;
    const {
        defaultConfiguration,
    } = routePlane?.data as any;

    const DirectPlane = (): any => {
        const PluridRoute = () => (
            <>
                <PluridApplication
                    view={[
                        routePlane.match.value,
                    ]}
                    planesRegistrar={planesRegistrar}
                    configuration={defaultConfiguration}
                    hostname={hostname}
                />
            </>
        );

        return PluridRoute;
    };

    return DirectPlane;

    // const {
    //     matchRoute,
    //     matchPlane,
    //     matchPath,
    // } = getDirectPlaneMatch(
    //     matchedPath,
    //     routes,
    //     planes,
    // );
    // console.log(
    //     'renderDirectPlane',
    //     matchRoute,
    //     matchPlane,
    //     matchPath,
    // );

    // if (matchRoute) {
    //     const parsedRoute = new router.RouteParser(
    //         matchedPath,
    //         matchRoute,
    //     );
    //     matchedPlane = parsedRoute.extract();
    // }

    // if (
    //     matchRoute && matchPlane && matchPath
    // ) {
    //     DirectPlane = (): any => {
    //         const PluridRoute = () => (
    //             <>
    //                 <PluridApplication
    //                     view={matchPath
    //                         ? [
    //                             matchPath,
    //                         ] : []
    //                     }
    //                     planesRegistrar={planesRegistrar}
    //                 />
    //             </>
    //         );

    //         return PluridRoute;
    //     };
    // }

    // return {
    //     matchedPlane,
    //     DirectPlane,
    // };
}
// #endregion module
