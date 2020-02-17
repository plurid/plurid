import computeZigZagLayout from '../zigZag';

import {
    TreePage,
} from '@plurid/plurid-data';



describe.only('computeZigZagLayout', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('computes the default zig zag layout', () => {
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
                    rotateY: 45,
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
                    rotateY: -45,
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
                    rotateY: 45,
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
                    rotateY: 45,
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
                    rotateY: -45,
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
                    rotateY: 45,
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

        const result = computeZigZagLayout(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
