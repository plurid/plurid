import React from 'react';

import {
    computeFaceToFaceLayout,
} from '../';

import {
    PluridPage,
    TreePage,
} from '@plurid/plurid-data';



xdescribe('computeColumnLayout', () => {
    // handle crypto for jest - https://stackoverflow.com/a/52612372
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the face to face layout', () => {
        // set window for jest
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 800,
        };
        // console.log(window);

        const pluridPages: PluridPage[] = [
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-1',
                root: true,
            },
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-2',
                root: true,
            },
            // {
            //     component: {
            //         element: () => (<></>),
            //         properties: {},
            //     },
            //     path: '/page-3',
            //     root: true,
            // },
        ];
        // console.log(pluridPages);
        const locatedTree: TreePage[] = [
            {
                location: {
                    rotateX: 0,
                    rotateY: 90.1,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 90.1,
                    translateX: 1250,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
            },
            // {
            //     location: {
            //         rotateX: 0,
            //         rotateY: 0,
            //         translateX: 0,
            //         translateY: 850,
            //         translateZ: 0,
            //     },
            //     path: '/page-3',
            //     planeID: '',
            //     show: true,
            // },
        ];
        const result = computeFaceToFaceLayout(pluridPages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });
        console.log(result);

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the face to face layout', () => {
        // set window for jest
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 800,
        };
        // console.log(window);

        const pluridPages: PluridPage[] = [
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-1',
                root: true,
            },
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-2',
                root: true,
            },
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-3',
                root: true,
            },
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-4',
                root: true,
            },
            {
                component: {
                    element: () => (<></>),
                    properties: {},
                },
                path: '/page-5',
                root: true,
            },
        ];
        // console.log(pluridPages);
        const locatedTree: TreePage[] = [
            {
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 2500,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-4',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-5',
                planeID: '',
                show: true,
            },
        ];
        const result = computeFaceToFaceLayout(pluridPages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
