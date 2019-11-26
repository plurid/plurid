import {
    computeZigZagLayout,
} from '../';

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
                pageID: '2',
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
                pageID: '3',
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

        const locatedTree: TreePage[] = [
            {
                pageID: '1',
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
                pageID: '2',
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
                pageID: '3',
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

        const result = computeZigZagLayout(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
