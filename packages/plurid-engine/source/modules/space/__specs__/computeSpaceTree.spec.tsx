import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    PluridConfiguration,
    TreePlane,
    defaultConfiguration,
    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from '../tree';



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

        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',

                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                path: '/page-3',
                planeID: '',
                show: true,
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

        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                path: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                path: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                path: '/page-3',
                planeID: '',
                show: true,
            },
        ];

        const result = computeSpaceTree(treePages, configuration);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
