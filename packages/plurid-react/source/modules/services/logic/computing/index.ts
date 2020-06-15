import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    PluridPlane,
    IndexedPluridPlane,
    TreePlane,
    PluridView,
    PluridPartialConfiguration,
} from '@plurid/plurid-data';

import {
    router,
    space,
    general as generalEngine,
} from '@plurid/plurid-engine';

import {
    uuid,
} from '@plurid/plurid-functions';



export const computeApplication = (
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
    planes: PluridPlane[] | undefined,
    configuration: PluridPartialConfiguration | undefined,
    view: string[] | PluridView[] | undefined,
) => {
    const planesPropertiesReference = new Map();

    const computedIndexedPlanes = new Map<string, IndexedPluridPlane>(
        indexedPlanes || new Map()
    );

    const appConfiguration = generalEngine.configuration.default(configuration);


    if (planes) {
        for (const plane of planes) {
            const linkPath = router.resolveRoute(plane.route);
            if (!linkPath) {
                continue;
            }

            const {
                protocol,
                host,
                path,
                space,
                universe,
                cluster,
                plane: planePath,
                route,
            } = linkPath;

            const computedIndexedPlane: IndexedPluridPlane = {
                protocol: protocol,
                host: host.value,
                path: path.value,
                space: space.value,
                universe: universe.value,
                cluster: cluster.value,
                plane: planePath.value,
                route,
                component: plane.component,
            };
            const id = route;

            const planeProperties = {
                ...plane.component.properties,
            };
            planesPropertiesReference.set(id, planeProperties);

            computedIndexedPlanes.set(id, computedIndexedPlane);
        }
    }

    const indexedPlanesReference = new Map(computedIndexedPlanes);

    const planeSources: Record<string, string> = {};
    for (const [id, indexedPlane] of computedIndexedPlanes) {
        planeSources[indexedPlane.route] = id;
    }

    // create tree planes
    const treePlanes: TreePlane[] = [];

    for (const [id, computedIndexedPlane] of computedIndexedPlanes) {
        const pathProperties = computedIndexedPlane.component.properties?.plurid?.path;

        let planeRouteSource = computedIndexedPlane.route;

        if (pathProperties) {
            for (const [key, value] of Object.entries(pathProperties.parameters)) {
                planeRouteSource = planeRouteSource.replace(`:${key}`, value as string);
            }
        }

        const planeRoute = router.resolveRoute(planeRouteSource);
        if (!planeRoute) {
            continue;
        }

        const {
            protocol,
            host,
            path,
            space,
            universe,
            cluster,
            plane,
        } = planeRoute;

        const treePlane: TreePlane = {
            ...defaultTreePlane,
            routeDivisions: {
                protocol: {
                    value: protocol,
                    secure: false,
                },
                host,
                path,
                space,
                universe,
                cluster,
                plane,
                valid: true,
            },
            sourceID: id,
            route: planeRouteSource,
            planeID: uuid.generate(),
            show: true,
        };
        treePlanes.push(treePlane);
    }


    // create absolute view
    const currentView = view || [];
    const absoluteView = [];

    for (const viewItem of currentView) {
        if (typeof viewItem === 'string') {
            const viewPath = router.resolveRoute(viewItem);
            if (!viewPath) {
                continue;
            }
            absoluteView.push(viewPath.route);
        }
    }

    // console.log('treePlanes', treePlanes);
    // console.log('currentView', currentView);
    // console.log('absoluteView', absoluteView);

    // create tree
    // const spaceTree = new space.tree.Tree({
    //     planes: treePlanes,
    //     configuration: appConfiguration,
    //     view: absoluteView,
    // });
    // const computedTree = spaceTree.compute();


    const data = {
        computedTree: [],
        indexedPlanesReference,
        planesPropertiesReference,
        appConfiguration,
    };

    return data;
}
