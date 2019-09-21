import React from 'react';

import {
    computeZigZagLayout,
} from '../';

import {
    PluridPage,
    TreePage,
} from '@plurid/plurid-data';



describe.only('computeZigZagLayout', () => {
    // handle crypto for jest - https://stackoverflow.com/a/52612372
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default zig zag layout', () => {
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
        ];
        // console.log(pluridPages);
        const locatedTree: TreePage[] = [
            {
                location: {
                    rotateX: 0,
                    rotateY: 45,
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
                    rotateY: -45,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                location: {
                    rotateX: 0,
                    rotateY: 45,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];
        const result = computeZigZagLayout(pluridPages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });
        console.log(result);

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
