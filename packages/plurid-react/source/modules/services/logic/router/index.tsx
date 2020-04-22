import React from 'react';

import {
    /** interfaces */
    PluridRouterPath,
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

    // console.log('gatewayView', gatewayView);
    // console.log('paths', paths);

    const planes: PluridPlane[] = [];
    const view: any[] = [];

    for (const path of paths) {
        if (!path.spaces) {
            continue;
        }

        const pathName = path.value === '/'
            ? 'p'
            : utilities.cleanPathElement(path.value);

        for (const space of path.spaces) {
            const spaceName = space.value === 'default'
                ? 's'
                : utilities.cleanPathElement(space.value);

            for (const universe of space.universes) {
                const universeName = universe.value === 'default'
                    ? 'u'
                    : utilities.cleanPathElement(universe.value);

                for (const cluster of universe.clusters) {
                    const clusterName = cluster.value === 'default'
                        ? 'c'
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
                        const planeAddress = planeAddressElements.join('://');
                        // console.log('planeAddress', planeAddress);

                        for (const gatewayViewPlane of gatewayView) {
                            // check that the planeAddress is the same as gatewayViewPlane
                            // considering parameters / query

                            if (gatewayViewPlane === planeAddress) {
                                if (component.kind === 'react') {
                                    const pluridPlane: PluridPlane = {
                                        component: {
                                            element: component.element,
                                        },
                                        path: value,
                                    };

                                    planes.push(pluridPlane);
                                    view.push(value);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // console.log('planes', planes);
    // console.log('view', view);

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
                component: path.exterior,
                route: planeAddress,
            };

            indexedPlanes.set(id, indexedPlane);

            continue;
        }

        for (const space of path.spaces) {
            for (const universe of space.universes) {
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
