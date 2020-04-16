import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import computeColumnLayout from '../column';



describe('computeColumnLayout', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default column layout', () => {
        const innerWidth = 1200;

        (global as any).window = {
            innerWidth,
            innerHeight: 800,
        };

        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
            },
        ]

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const result = computeColumnLayout(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the column layout with 3 columns and 5 pages', () => {
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 800,
        };

        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                route: '/page-4',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '5',
                route: '/page-5',
                planeID: '',
                show: true,
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-4',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '5',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 2500,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-5',
                planeID: '',
                show: true,
            },
        ];

        const columns = 3;
        const result = computeColumnLayout(treePages, columns);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
