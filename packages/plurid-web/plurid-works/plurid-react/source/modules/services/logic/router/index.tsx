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
    } from '@plurid/plurid-data';

    import {
        router,
        utilities,

        PluridPlanesRegistrar,
    } from '@plurid/plurid-engine';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import PluridApplication from '~Application/index';
    // #endregion external


    // #region internal
    import {
        StyledSpaces,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface GetComponentFromRouteData {
    matchedRoute: router.MatcherResponse;
    protocol: string;
    host: string;
    indexedPlanes: Map<string, IndexedPluridPlane<PluridReactComponent>> | undefined;
    staticRender?: boolean;
}

export const getComponentFromRoute = (
    data: GetComponentFromRouteData,
) => {
    const {
        matchedRoute,
        protocol,
        host,
        indexedPlanes,
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
        switch (exterior.kind) {
            case 'elementql':
                break;
            case 'react':
                PluridExterior = exterior.element
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
                    const {
                        component,
                    } = plane;

                    const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                        ? PLURID_ROUTE_DEFAULT_PATH
                        : utilities.cleanPathElement(path.value);
                    const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                        ? PLURID_ROUTE_DEFAULT_SPACE
                        : utilities.cleanPathElement(space.value);
                    const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                    const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                    const planeName = utilities.cleanPathElement(plane.value);

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
                                const {
                                    component,
                                } = plane;

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
                                const planeName = utilities.cleanPathElement(plane.value);

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
                            const {
                                component,
                            } = plane;

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
                            const planeName = utilities.cleanPathElement(plane.value);

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
            const pluridPlanesRegistrar = new PluridPlanesRegistrar();

            const App = (
                <PluridApplication
                    key={uuid.generate()}
                    id={path.value}
                    planes={planes}
                    indexedPlanes={indexedPlanes}
                    view={view}
                    static={staticRender}
                    configuration={space.configuration}
                    planesRegistrar={pluridPlanesRegistrar}
                />
            );
            spacesArray.push(App);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
        const view: any[] = [];

        for (const plane of planes) {
            const {
                component,
            } = plane;

            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);
            const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
            const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
            const planeName = utilities.cleanPathElement(plane.value);

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
                indexedPlanes={indexedPlanes}
                planesProperties={planesProperties}
                view={view}
                static={staticRender}
                configuration={path.defaultConfiguration}
            />
        );
        spacesArray.push(App);
    }


    let MultispaceHeader: React.FC<any>;
    let MultispaceFooter: React.FC<any>;
    if (path.multispace?.header) {
        const header = path.multispace.header;

        if (header.kind === 'react') {
            MultispaceHeader = header.element;
        }
    }
    if (path.multispace?.footer) {
        const footer = path.multispace.footer;

        if (footer.kind === 'react') {
            MultispaceFooter = footer.element;
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
    indexedPlanes: Map<string, IndexedPluridPlane<PluridReactComponent>> | undefined;
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
        indexedPlanes,
    } = data

    const query = router.extractQuery(queryString);

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
                                    const {
                                        component,
                                        value,
                                    } = plane;

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
                                const {
                                    component,
                                    value,
                                } = plane;

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
                        const {
                            component,
                            value,
                        } = plane;

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
                const {
                    component,
                } = plane;

                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                    ? PLURID_ROUTE_DEFAULT_PATH
                    : utilities.cleanPathElement(path.value);
                const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
                const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                const planeName = utilities.cleanPathElement(plane.value);

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
                indexedPlanes={indexedPlanes}
                view={view}
            />
        </>
    );

    const gatewayRoute: router.MatcherResponse = {
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



export const computeIndexedPlanes = (
    routes: PluridRoute<PluridReactComponent>[],
    protocol: string,
    host: string,
) => {
    const indexedPlanes = new Map<string, IndexedPluridPlane<PluridReactComponent>>();

    for (const path of routes) {
        if (path.planes) {
            for (const plane of path.planes) {
                const pathName = path.value === '/'
                    ? 'p'
                    : utilities.cleanPathElement(path.value);
                const spaceName = 's';
                const universeName = 'u';
                const clusterName = 'c';
                const planeName = utilities.cleanPathElement(plane.value);

                const planeAddressElements = [
                    protocol,
                    host,
                    pathName,
                    spaceName,
                    universeName,
                    clusterName,
                    planeName,
                ];
                const planeAddress = planeAddressElements.join('://');

                const indexedPlane: IndexedPluridPlane<PluridReactComponent> = {
                    protocol,
                    host,
                    path: pathName,
                    space: spaceName,
                    universe: universeName,
                    cluster: clusterName,
                    plane: planeName,
                    component: plane.component,
                    route: planeAddress,
                };

                indexedPlanes.set(planeAddress, indexedPlane);
            }
        }

        if (!path.spaces) {
            const pathName = path.value === '/'
                ? 'p'
                : utilities.cleanPathElement(path.value);

            const planeAddressElements = [
                protocol,
                host,
                pathName,
            ];
            const planeAddress = planeAddressElements.join('://');

            const indexedPlane: IndexedPluridPlane<PluridReactComponent> = {
                protocol,
                host,
                path: pathName,
                space: '',
                universe: '',
                cluster: '',
                plane: '',
                component: path.exterior || (() => (<></>)),
                // component: path.exterior || {
                //     kind: 'react',
                //     element: () => (<></>),
                // },
                route: planeAddress,
            };

            indexedPlanes.set(planeAddress, indexedPlane);

            continue;
        }

        for (const space of path.spaces) {
            if (!space.universes) {
                continue;
            }

            for (const universe of space.universes) {
                if (!universe.clusters) {
                    continue;
                }

                for (const cluster of universe.clusters) {
                    for (const plane of cluster.planes) {
                        const pathName = path.value === '/'
                            ? 'p'
                            : utilities.cleanPathElement(path.value);
                        const spaceName = space.value === 'default'
                            ? 's'
                            : utilities.cleanPathElement(space.value);
                        const universeName = universe.value === 'default'
                            ? 'u'
                            : utilities.cleanPathElement(universe.value);
                        const clusterName = cluster.value === 'default'
                            ? 'c'
                            : utilities.cleanPathElement(cluster.value);
                        const planeName = utilities.cleanPathElement(plane.value);

                        const planeAddressElements = [
                            protocol,
                            host,
                            pathName,
                            spaceName,
                            universeName,
                            clusterName,
                            planeName,
                        ];
                        const planeAddress = planeAddressElements.join('://');

                        const indexedPlane: IndexedPluridPlane<PluridReactComponent> = {
                            protocol,
                            host,
                            path: pathName,
                            space: spaceName,
                            universe: universeName,
                            cluster: clusterName,
                            plane: planeName,
                            component: plane.component,
                            route: planeAddress,
                        };

                        indexedPlanes.set(planeAddress, indexedPlane);
                    }
                }
            }
        }
    }

    return indexedPlanes;
}



export const generateIndexedPlane = (
    plane: PluridRoutePlane<PluridReactComponent>,
    protocol: string,
    host: string,
    path: string,
    space: string,
    universe: string,
    cluster: string,
) => {
    const pathName = path === PLURID_ROUTE_DEFAULT_PATH_VALUE
        ? PLURID_ROUTE_DEFAULT_PATH
        : utilities.cleanPathElement(path);
    const spaceName = space === PLURID_ROUTE_DEFAULT_SPACE_VALUE
        ? PLURID_ROUTE_DEFAULT_SPACE
        : utilities.cleanPathElement(space);
    const universeName = universe === PLURID_ROUTE_DEFAULT_UNIVERSE_VALUE
        ? PLURID_ROUTE_DEFAULT_UNIVERSE
        : utilities.cleanPathElement(universe);
    const clusterName = cluster === PLURID_ROUTE_DEFAULT_CLUSTER_VALUE
        ? PLURID_ROUTE_DEFAULT_CLUSTER
        : utilities.cleanPathElement(cluster);
    const planeName = utilities.cleanPathElement(plane.value);

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

    const indexedPlane: IndexedPluridPlane<PluridReactComponent> = {
        protocol,
        host,
        path: pathName,
        space: spaceName,
        universe: universeName,
        cluster: clusterName,
        plane: planeName,
        route: planeAddress,
        component: plane.component,
    };

    const id = planeAddress;
    // const id = uuid.generate();

    return {
        id,
        indexedPlane,
    };
}


export interface GeneratedIndexedPlane {
    id: string;
    indexedPlane: IndexedPluridPlane<PluridReactComponent>;
}

export const generateIndexedPlanes = (
    path: PluridRoute<PluridReactComponent>,
    protocol: string,
    host: string,
) => {
    const indexedPlanes: GeneratedIndexedPlane[] = [];

    const defaultPathPlanes = path.planes || [];

    for (const defaultPathPlane of defaultPathPlanes) {
        const {
            id,
            indexedPlane,
        } = generateIndexedPlane(
            defaultPathPlane,
            protocol,
            host,
            path.value,
            PLURID_ROUTE_DEFAULT_SPACE,
            PLURID_ROUTE_DEFAULT_UNIVERSE,
            PLURID_ROUTE_DEFAULT_CLUSTER,
        );

        indexedPlanes.push({
            id,
            indexedPlane,
        });
    }

    if (!path.spaces) {
        return indexedPlanes;
    }

    for (const space of path.spaces) {
        const defaultSpacePlanes = space.planes || [];

        for (const defaultSpacePlane of defaultSpacePlanes) {
            const {
                id,
                indexedPlane,
            } = generateIndexedPlane(
                defaultSpacePlane,
                protocol,
                host,
                path.value,
                space.value,
                PLURID_ROUTE_DEFAULT_UNIVERSE,
                PLURID_ROUTE_DEFAULT_CLUSTER,
            );

            indexedPlanes.push({
                id,
                indexedPlane,
            });
        }

        if (space.universes) {
            for (const universe of space.universes) {
                const defaultUniversePlanes = universe.planes || [];

                for (const defaultUniversePlane of defaultUniversePlanes) {
                    const {
                        id,
                        indexedPlane,
                    } = generateIndexedPlane(
                        defaultUniversePlane,
                        protocol,
                        host,
                        path.value,
                        space.value,
                        universe.value,
                        PLURID_ROUTE_DEFAULT_CLUSTER,
                    );

                    indexedPlanes.push({
                        id,
                        indexedPlane,
                    });
                }

                if (universe.clusters) {
                    for (const cluster of universe.clusters) {
                        for (const plane of cluster.planes) {
                            const {
                                id,
                                indexedPlane,
                            } = generateIndexedPlane(
                                plane,
                                protocol,
                                host,
                                path.value,
                                space.value,
                                universe.value,
                                cluster.value,
                            );

                            indexedPlanes.push({
                                id,
                                indexedPlane,
                            });
                        }
                    }
                }
            }
        }
    }

    return indexedPlanes;
}



export const collectApplicationsFromPath = (
    matchedRoute: router.MatcherResponse,
    protocol: string,
    host: string,
) => {
    const {
        path,
        parameters,
        query,
    } = matchedRoute;

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
    }[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane<PluridReactComponent>[] = [];
            const view: any[] = [];

            if (space.planes) {
                for (const plane of space.planes) {
                    const {
                        component,
                    } = plane;

                    const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                        ? PLURID_ROUTE_DEFAULT_PATH
                        : utilities.cleanPathElement(path.value);
                    const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                        ? PLURID_ROUTE_DEFAULT_SPACE
                        : utilities.cleanPathElement(space.value);
                    const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                    const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                    const planeName = utilities.cleanPathElement(plane.value);

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
                                const {
                                    component,
                                } = plane;

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
                                const planeName = utilities.cleanPathElement(plane.value);

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
                            const {
                                component,
                            } = plane;

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
                            const planeName = utilities.cleanPathElement(plane.value);

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
            };
            plurids.push(pluridApplication);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
        // const view = [];

        for (const plane of planes) {
            const {
                component,
            } = plane;

            const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                ? PLURID_ROUTE_DEFAULT_PATH
                : utilities.cleanPathElement(path.value);
            const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
            const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
            const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
            const planeName = utilities.cleanPathElement(plane.value);

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

            //     pluridPlanes.push(pluridPlane);
            //     // view.push(fullPath);
            // }
        }

        const pluridApplication = {
            planes: pluridPlanes,
            view: view || [],
        };
        plurids.push(pluridApplication);
    }

    return plurids;
}
// #endregion module





// #region module update
export const gatherPluridPlanes = (
    routes: PluridRoute<PluridReactComponent>[],
    planes: PluridRoutePlane<PluridReactComponent>[] | undefined,
) => {
    const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];

    for (const route of routes) {
        if (route.planes) {
            for (const plane of route.planes) {
                // if (plane.component.kind === 'react') {
                //     const planeRoute = plane.link
                //         ? plane.link
                //         : route.value === '/'
                //             ? plane.value
                //             : route.value + plane.value;

                //     const pluridPlane: PluridPlane = {
                //         route: planeRoute,
                //         component: {
                //             kind: 'react',
                //             element: plane.component.element,
                //         },
                //     };
                //     pluridPlanes.push(pluridPlane);
                // }
            }
        }

        if (route.spaces) {
            // gather planes from spaces
        }
    }

    if (planes) {
        for (const plane of planes) {
            // if (plane.component.kind === 'react') {
            //     const pluridPlane: PluridPlane = {
            //         route: plane.value,
            //         component: {
            //             kind: 'react',
            //             element: plane.component.element,
            //         },
            //     };
            //     pluridPlanes.push(pluridPlane);
            // }
        }
    }

    return pluridPlanes;
}


export const computePluridRoute = (
    matchedRoute: router.MatcherResponse | undefined,
    routes: PluridRoute<PluridReactComponent>[],
    planesRegistrar: PluridPlanesRegistrar,
    directPlane?: any,
) => {
    if (directPlane) {
        const {
            matchedPlane,
            DirectPlane,
        } = renderDirectPlane(
            directPlane,
            routes,
            undefined,
            planesRegistrar,
        );

        if (matchedPlane && DirectPlane) {
            // setMatchedRoute(matchedPlane);
            // setPluridRoute(DirectPlane);
            return DirectPlane;
        }
    }

    if (!matchedRoute) {
        return () => () => (<></>);
    }

    let matchedRouteData: PluridRoute<PluridReactComponent> | undefined;
    for (const route of routes) {
        if (route.value === matchedRoute.path.value) {
            matchedRouteData = {
                ...route,
            };
        }
    }

    if (!matchedRouteData) {
        return () => () => (<></>);
    }

    const {
        exterior,
        view,
        planes,
        spaces,
    } = matchedRouteData;

    let PluridRouteExterior: React.FC<any> | undefined;
    if (exterior) {
        PluridRouteExterior = exterior;
        PluridRouteExterior.displayName = 'PluridRouteExterior';
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
                        <PluridRouteExterior />
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
            const PluridRoute = () => (
                <>
                    {PluridRouteExterior && (
                        <PluridRouteExterior />
                    )}

                    <PluridApplication
                        view={view}
                        planesRegistrar={planesRegistrar}
                    />
                </>
            );

            return PluridRoute;
        };
    }


    // Render a multispace route.
    {
        const protocol = 'http';
        const host = 'localhost:63000';

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
            switch (exterior.kind) {
                case 'elementql':
                    break;
                case 'react':
                    PluridExterior = exterior.element
            }
        }

        let PluridSpaces: React.FC<any> = () => (<></>);
        const spacesArray: any[] = [];
        if (spaces) {
            for (const space of spaces) {
                const planes: PluridPlane<PluridReactComponent>[] = [];
                const view: any[] = [];

                if (space.planes) {
                    for (const plane of space.planes) {
                        const {
                            component,
                        } = plane;

                        const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                            ? PLURID_ROUTE_DEFAULT_PATH
                            : utilities.cleanPathElement(path.value);
                        const spaceName = space.value === PLURID_ROUTE_DEFAULT_SPACE_VALUE
                            ? PLURID_ROUTE_DEFAULT_SPACE
                            : utilities.cleanPathElement(space.value);
                        const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                        const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                        const planeName = utilities.cleanPathElement(plane.value);

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
                                    const {
                                        component,
                                    } = plane;

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
                                    const planeName = utilities.cleanPathElement(plane.value);

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
                                const {
                                    component,
                                } = plane;

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
                                const planeName = utilities.cleanPathElement(plane.value);

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
                const pluridPlanesRegistrar = new PluridPlanesRegistrar();

                const App = (
                    <PluridApplication
                        key={uuid.generate()}
                        id={path.value}
                        planes={planes}
                        view={view}
                        configuration={space.configuration}
                        planesRegistrar={pluridPlanesRegistrar}
                    />
                );
                spacesArray.push(App);
            }
        }

        if (planes) {
            const pluridPlanes: PluridPlane<PluridReactComponent>[] = [];
            const view: any[] = [];

            for (const plane of planes) {
                const {
                    component,
                } = plane;

                const pathName = path.value === PLURID_ROUTE_DEFAULT_PATH_VALUE
                    ? PLURID_ROUTE_DEFAULT_PATH
                    : utilities.cleanPathElement(path.value);
                const spaceName = PLURID_ROUTE_DEFAULT_SPACE;
                const universeName = PLURID_ROUTE_DEFAULT_UNIVERSE;
                const clusterName = PLURID_ROUTE_DEFAULT_CLUSTER;
                const planeName = utilities.cleanPathElement(plane.value);

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
                    configuration={path.defaultConfiguration}
                />
            );
            spacesArray.push(App);
        }


        let MultispaceHeader: React.FC<any>;
        let MultispaceFooter: React.FC<any>;
        if (path.multispace?.header) {
            const header = path.multispace.header;

            if (header.kind === 'react') {
                MultispaceHeader = header.element;
            }
        }
        if (path.multispace?.footer) {
            const footer = path.multispace.footer;

            if (footer.kind === 'react') {
                MultispaceFooter = footer.element;
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

        return (): React.FC<any> => {
            const PluridRoute = () => (
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

            return PluridRoute;
        }
    }

    // return (): React.FC<any> => {
    //     const PluridRoute = () => (
    //         <>
    //             {PluridRouteExterior && (
    //                 <PluridRouteExterior />
    //             )}

    //             <PluridApplication
    //                 view={view || []}
    //                 planesRegistrar={planesRegistrar}
    //             />
    //         </>
    //     );

    //     return PluridRoute;
    // };

    // return () => <></>;
}


export const computeInitialMatchedPath = (
    staticContext?: any,
): string => {
    if (staticContext) {
        return staticContext.path;
    }

    if (typeof window !== 'undefined') {
        return window.location.pathname;
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
                const planePath = route.value === '/'
                    ? plane.value
                    : route.value + plane.value;
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
            if (matchedPath === plane.value) {
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
    matchedPath: string,
    routes: PluridRoute<PluridReactComponent>[],
    planes: PluridRoutePlane<PluridReactComponent>[] | undefined,
    planesRegistrar: PluridPlanesRegistrar,
) => {
    let matchedPlane: router.MatcherResponse | undefined;
    let DirectPlane: React.FC<any> | undefined;

    const {
        matchRoute,
        matchPlane,
        matchPath,
    } = getDirectPlaneMatch(
        matchedPath,
        routes,
        planes,
    );
    console.log(
        'renderDirectPlane',
        matchRoute,
        matchPlane,
        matchPath,
    );

    if (matchRoute) {
        const parsedRoute = new router.RouteParser(
            matchedPath,
            matchRoute,
        );
        matchedPlane = parsedRoute.extract();
    }

    if (
        matchRoute && matchPlane && matchPath
    ) {
        DirectPlane = (): any => {
            const PluridRoute = () => (
                <>
                    <PluridApplication
                        view={matchPath
                            ? [
                                matchPath,
                            ] : []
                        }
                        planesRegistrar={planesRegistrar}
                    />
                </>
            );

            return PluridRoute;
        };
    }

    return {
        matchedPlane,
        DirectPlane,
    };
}
// #endregion module update
