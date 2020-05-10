import themes from '@plurid/plurid-themes';

import {
    defaultConfiguration,

    PluridMetastate,
    PluridRouterPath,
    PluridPlane,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    collectApplicationsFromPath,
    computeIndexedPlanes,
} from '../router';

import {
    computeApplication,
} from '../computing';




export const serverComputeMetastate = (
    matchedRoute: router.MatcherResponse,
    paths: PluridRouterPath[],
): PluridMetastate => {
    const protocol = 'http';
    const host = 'localhost:63000';

    const indexedPlanes = computeIndexedPlanes(
        paths,
        protocol,
        host,
    );

    const pluridApplications = collectApplicationsFromPath(
        matchedRoute,
        protocol,
        host,
    );

    const states: any = {};

    for (const application of pluridApplications) {
        const {
            planes,
            view,
        } = application;

        const {
            computedTree,
            indexedPlanesReference,
            planesPropertiesReference,
            appConfiguration,
        } = computeApplication(
            indexedPlanes,
            planes,
            defaultConfiguration,
            view,
        );

        const state = {
            configuration: {
                ...appConfiguration,
            },
            data: {
                universes: {},
                planeSources: {},
            },
            shortcuts: {
                global: true,
            },
            themes: {
                general: themes.plurid,
                interaction: themes.plurid,
            },
            ui: {
                toolbarScrollPosition: 50,
            },
            space: {
                loading: false,
                animatedTransform: false,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                translationX: 0,
                translationY: 0,
                translationZ: 0,
                initialTree: computedTree,
                tree: computedTree,
                activeUniverseID: '',
                camera: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                viewSize: {
                    width: 1440,
                    height: 800,
                },
                spaceSize: {
                    width: 1440,
                    height: 800,
                    depth: 0,
                    topCorner: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                },
                view,
                culledView: [],
            },
        };

        const id = matchedRoute.path.value;

        states[id] = state;
    }


    return {
        states,
    };
}
