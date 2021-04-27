import React from 'react';

import {
    PluridApplication,
    PluridPlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/',
            component: {
                kind: 'react',
                element: Plane1,
            },
        },
    ];

    const pluridView: string[] = [
        '/',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
            precomputedState={{
                space: {
                    loading: true,
                    animatedTransform: false,
                    transformTime: 450,
                    scale: 1,
                    rotationX: 0,
                    rotationY: 25,
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
                        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
                        height: typeof window === 'undefined' ? 821 : window.innerHeight,
                    },
                    spaceSize: {
                        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
                        height: typeof window === 'undefined' ? 821 : window.innerHeight,
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
            }}
        />
    );
}


export default App;
