import React from 'react';

import {
    computeColumnLayout,
} from '../';

import {
    PluridPage,
    TreePage,
} from '@plurid/plurid-data';



describe('computeColumnLayout', () => {
    // handle crypto for jest - https://stackoverflow.com/a/52612372
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default column layout', () => {
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
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];
        const result = computeColumnLayout(pluridPages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });
        console.log(result);

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the column layout with 3 columns and 5 pages', () => {
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
        const columns = 3;
        const result = computeColumnLayout(pluridPages, columns);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });
        console.log(result);

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
