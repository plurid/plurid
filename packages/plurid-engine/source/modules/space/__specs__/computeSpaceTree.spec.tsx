import {
    computeSpaceTree,
} from '../';

import {
    PluridConfiguration,
    TreePage,
    defaultConfiguration,
    LAYOUT_TYPES,
} from '@plurid/plurid-data';



describe('computeSpaceTree', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default spaceTree', () => {
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 300,
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
                    translateY: 350,
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
                    translateY: 700,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const result = computeSpaceTree(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the spaceTree of 1 columns', () => {
        (global as any).window = {
            innerWidth: 1200,
            innerHeight: 300,
        };

        const configuration: PluridConfiguration = {
            ...defaultConfiguration,
            space: {
                ...defaultConfiguration.space,
                layout: {
                    type: LAYOUT_TYPES.COLUMNS,
                    columns: 1,
                },
            }
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
                    translateX: 1250,
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
                    translateX: 2500,
                    translateY: 0,
                    translateZ: 0,
                },
                path: '/page-3',
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
                    translateY: 350,
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
                    translateY: 700,
                    translateZ: 0,
                },
                path: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const result = computeSpaceTree(treePages, configuration);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
