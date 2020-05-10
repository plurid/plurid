import {
    defaultConfiguration,

    PluridMetastate,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';



export const serverComputeMetastate = (
    matchedRoute: router.MatcherResponse,
): PluridMetastate => {

    return {
        states: {
            'one': {
                configuration: {
                    ...defaultConfiguration,
                },
                ui: {
                    toolbarScrollPosition: 50,
                },
                space: {
                    loading: false,
                    animatedTransform: false,
                    scale: 0,
                    rotationX: 0,
                    rotationY: 0,
                    translationX: 0,
                    translationY: 0,
                    translationZ: 0,
                    initialTree: [],
                    tree: [],
                    activeUniverseID: '',
                    camera: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                    viewSize: {
                        width: 0,
                        height: 0,
                    },
                    spaceSize: {
                        width: 0,
                        height: 0,
                        depth: 0,
                        topCorner: {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                    },
                    view: [],
                    culledView: [],
                },
            },
        },
    };
}
