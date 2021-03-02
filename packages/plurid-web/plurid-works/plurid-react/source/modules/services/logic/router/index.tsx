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
    } from '@plurid/plurid-engine';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
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
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined;
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
            const planes: PluridPlane[] = [];
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

                    if (component.kind === 'react') {
                        const pluridPlane: PluridPlane = {
                            component: {
                                kind: 'react',
                                element: component.element,
                                properties: {
                                    plurid: pluridProperty,
                                },
                            },
                            route: fullPath,
                        };

                        planes.push(pluridPlane);
                        view.push(fullPath);
                    }
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

                                if (component.kind === 'react') {
                                    const pluridPlane: PluridPlane = {
                                        component: {
                                            kind: 'react',
                                            element: component.element,
                                            properties: {
                                                plurid: pluridProperty,
                                            },
                                        },
                                        route: fullPath,
                                    };

                                    planes.push(pluridPlane);

                                    if (!path.view) {
                                        view.push(fullPath);
                                    } else {
                                        if (path.view.includes(plane.value)) {
                                            view.push(fullPath);
                                        }
                                    }
                                }
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

                            if (component.kind === 'react') {
                                const pluridPlane: PluridPlane = {
                                    component: {
                                        kind: 'react',
                                        element: component.element,
                                        properties: {
                                            plurid: pluridProperty,
                                        },
                                    },
                                    route: fullPath,
                                };

                                planes.push(pluridPlane);
                                view.push(fullPath);
                            }
                        }
                    }
                }
            }

            // console.log('spaces path.value', path.value);
            // console.log('getComponentFromRoute spaces view', view);

            const App = (
                <PluridApplication
                    key={uuid.generate()}
                    id={path.value}
                    planes={planes}
                    indexedPlanes={indexedPlanes}
                    view={view}
                    static={staticRender}
                    configuration={space.configuration}
                />
            );
            spacesArray.push(App);
        }
    }

    if (planes) {
        const pluridPlanes: PluridPlane[] = [];
        const view = [];

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

            if (component.kind === 'react') {
                const pluridPlane: PluridPlane = {
                    component: {
                        kind: 'react',
                        element: component.element,
                        properties: {
                            plurid: pluridProperty,
                        },
                    },
                    route: fullPath,
                };

                pluridPlanes.push(pluridPlane);

                if (!path.view) {
                    view.push(fullPath);
                } else {
                    if (path.view.includes(plane.value)) {
                        view.push(fullPath);
                    }
                }
            }
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
    routes: PluridRoute[];
    gatewayPath: string | undefined;
    gatewayExterior: any;
    protocol: string;
    host: string;
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined;
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

    const planes: PluridPlane[] = [];
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

                                        if (gatewayViewPlane === planeAddress) {
                                            if (component.kind === 'react') {
                                                const pluridPlane: PluridPlane = {
                                                    component: {
                                                        kind: 'react',
                                                        element: component.element,
                                                    },
                                                    route: planeAddress,
                                                };

                                                planes.push(pluridPlane);
                                                view.push(planeAddress);
                                            }
                                        }
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
                                    if (gatewayViewPlane === planeAddress) {
                                        if (component.kind === 'react') {
                                            const pluridPlane: PluridPlane = {
                                                component: {
                                                    kind: 'react',
                                                    element: component.element,
                                                },
                                                route: planeAddress,
                                            };

                                            planes.push(pluridPlane);
                                            view.push(planeAddress);
                                        }
                                    }
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
                            if (gatewayViewPlane === planeAddress) {
                                if (component.kind === 'react') {
                                    const pluridPlane: PluridPlane = {
                                        component: {
                                            kind: 'react',
                                            element: component.element,
                                        },
                                        route: planeAddress,
                                    };

                                    planes.push(pluridPlane);
                                    view.push(planeAddress);
                                }
                            }
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

                if (component.kind === 'react') {
                    const pluridPlane: PluridPlane = {
                        component: {
                            kind: 'react',
                            element: component.element,
                        },
                        route: planeAddress,
                    };

                    planes.push(pluridPlane);
                    view.push(planeAddress);
                }
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
    routes: PluridRoute[],
    protocol: string,
    host: string,
) => {
    const indexedPlanes = new Map<string, IndexedPluridPlane>();

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

                const indexedPlane: IndexedPluridPlane = {
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

            const indexedPlane: IndexedPluridPlane = {
                protocol,
                host,
                path: pathName,
                space: '',
                universe: '',
                cluster: '',
                plane: '',
                component: path.exterior || {
                    kind: 'react',
                    element: () => (<></>),
                },
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

                        const indexedPlane: IndexedPluridPlane = {
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
    plane: PluridRoutePlane,
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

    const indexedPlane: IndexedPluridPlane = {
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
    indexedPlane: IndexedPluridPlane;
}

export const generateIndexedPlanes = (
    path: PluridRoute,
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
        planes: PluridPlane[],
        view: string[],
    }[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane[] = [];
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

                    if (component.kind === 'react') {
                        const pluridPlane: PluridPlane = {
                            component: {
                                kind: 'react',
                                element: component.element,
                                properties: {
                                    plurid: pluridProperty,
                                },
                            },
                            route: fullPath,
                        };

                        planes.push(pluridPlane);
                        view.push(fullPath);
                    }
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

                                if (component.kind === 'react') {
                                    const pluridPlane: PluridPlane = {
                                        component: {
                                            kind: 'react',
                                            element: component.element,
                                            properties: {
                                                plurid: pluridProperty,
                                            },
                                        },
                                        route: fullPath,
                                    };

                                    planes.push(pluridPlane);
                                    view.push(fullPath);
                                }
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

                            if (component.kind === 'react') {
                                const pluridPlane: PluridPlane = {
                                    component: {
                                        kind: 'react',
                                        element: component.element,
                                        properties: {
                                            plurid: pluridProperty,
                                        },
                                    },
                                    route: fullPath,
                                };

                                planes.push(pluridPlane);
                                view.push(fullPath);
                            }
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
        const pluridPlanes: PluridPlane[] = [];
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

            if (component.kind === 'react') {
                const pluridPlane: PluridPlane = {
                    component: {
                        kind: 'react',
                        element: component.element,
                        properties: {
                            plurid: pluridProperty,
                        },
                    },
                    route: fullPath,
                };

                pluridPlanes.push(pluridPlane);
                // view.push(fullPath);
            }
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
