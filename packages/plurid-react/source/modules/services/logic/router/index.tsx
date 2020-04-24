import React from 'react';

import {
    /** constants */
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
    PluridRouterPath,
    PluridRouterPlane,
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

import PluridApplication from '../../../../Application';



export interface GetComponentFromRouteData {
    matchedRoute: router.MatcherResponse,
    protocol: string,
    host: string,
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
}

export const getComponentFromRoute = (
    data: GetComponentFromRouteData,
) => {
    const {
        matchedRoute,
        protocol,
        host,
        indexedPlanes,
    } = data;

    const {
        path,
    } = matchedRoute;

    const {
        exterior,
        planes,
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
                            },
                            path: fullPath,
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
                                        },
                                        path: fullPath,
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
                                    },
                                    path: fullPath,
                                };

                                planes.push(pluridPlane);
                                view.push(fullPath);
                            }
                        }
                    }

                    const App = (
                        <PluridApplication
                            key={Math.random() + ''}
                            planes={planes}
                            indexedPlanes={indexedPlanes}
                            view={view}
                        />
                    );
                    spacesArray.push(App);
                }
            }
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
                    },
                    path: fullPath,
                };

                pluridPlanes.push(pluridPlane);
                view.push(fullPath);
            }
        }

        const App = (
            <PluridApplication
                key={Math.random() + ''}
                planes={pluridPlanes}
                indexedPlanes={indexedPlanes}
                view={view}
            />
        );
        spacesArray.push(App);
    }

    Spaces = () => (
        <>
            {spacesArray}
        </>
    );

    const Component = (
        <>
            {exterior && (
                <Exterior
                    spaces={slotted ? spacesArray : undefined}
                />
            )}

            {
                (spaces || planes)
                && !slotted
                && (
                    <Spaces />
                )
            }
        </>
    );
    return Component;
}


export interface GetGatewayViewData {
    queryString: string,
    paths: PluridRouterPath[],
    gatewayPath: string | undefined,
    gatewayExterior: any,
    protocol: string,
    host: string,
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
}

export const getGatewayView = (
    data: GetGatewayViewData,
) => {
    const {
        queryString,
        paths,
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

    for (const path of paths) {
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
                                                    path: planeAddress,
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
                                                path: planeAddress,
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
                                        path: planeAddress,
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
                        path: planeAddress,
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
    paths: PluridRouterPath[],
    protocol: string,
    host: string,
) => {
    const indexedPlanes = new Map<string, IndexedPluridPlane>();

    for (const path of paths) {
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

            const id = uuid.generate();

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

            indexedPlanes.set(id, indexedPlane);

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

                        const id = uuid.generate();

                        indexedPlanes.set(id, indexedPlane);
                    }
                }
            }
        }
    }

    return indexedPlanes;
}



export const generateIndexedPlane = (
    plane: PluridRouterPlane,
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

    const id = uuid.generate();

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
    path: PluridRouterPath,
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
