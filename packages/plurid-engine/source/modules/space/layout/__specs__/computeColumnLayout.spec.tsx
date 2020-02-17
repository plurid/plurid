import computeColumnLayout from '../column';

import {
    TreePage,
} from '@plurid/plurid-data';



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

        const treePages: TreePage[] = [
            {
                pageID: '1',
                height: 0,
                width: 0,
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
                children: [],
            },
            {
                pageID: '2',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '3',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
        ]

        const locatedTree: TreePage[] = [
            {
                pageID: '1',
                height: 0,
                width: 0,
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
                children: [],
            },
            {
                pageID: '2',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '3',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                path: '/page-3',
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

        const treePages: TreePage[] = [
            {
                pageID: '1',
                height: 0,
                width: 0,
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
                children: [],
            },
            {
                pageID: '2',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '3',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '4',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-4',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '5',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-5',
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const locatedTree: TreePage[] = [
            {
                pageID: '1',
                height: 0,
                width: 0,
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
                children: [],
            },
            {
                pageID: '2',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-2',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '3',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '4',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 850,
                    translateZ: 0,
                },
                path: '/page-4',
                planeID: '',
                show: true,
                children: [],
            },
            {
                pageID: '5',
                height: 0,
                width: 0,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 2500,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-5',
                planeID: '',
                show: true,
                children: [],
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
