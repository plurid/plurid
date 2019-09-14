import React from 'react';

import {
    computeSpaceTree,
} from '../';

import {
    PluridPage,
    PluridConfiguration,
    TreePage,
} from '@plurid/plurid-data';



describe('computeSpaceTree', () => {
    // handle crypto for jest - https://stackoverflow.com/a/52612372
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default spaceTree', () => {
        // set window for jest
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 300,
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
        const configuration: PluridConfiguration = {};
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
        ];
        const result = computeSpaceTree(pluridPages, configuration);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the spaceTree of 1 columns', () => {
        // set window for jest
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 300,
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
        const configuration: PluridConfiguration = {
            space: {
                layout: {
                    type: 'COLUMNS',
                    columns: 2,
                },
            }
        };
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
                    translateY: 350,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];
        const result = computeSpaceTree(pluridPages, configuration);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
