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
    logic,
} from '../tree';



describe('computeSpaceTree', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    Object.defineProperty(window, 'innerWidth', {
        value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
        value: 300,
    });


    it('computes the default spaceTree', () => {
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
        ];

        const locatedTree: TreePlane[] = [
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
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 350,
                    translateZ: 0,
                },
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 700,
                    translateZ: 0,
                },
            },
        ];

        const result = logic.computeSpaceTree(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the spaceTree of 1 columns', () => {
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
        ];

        const locatedTree: TreePlane[] = [
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
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 350,
                    translateZ: 0,
                },
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 700,
                    translateZ: 0,
                },
            },
        ];

        const result = logic.computeSpaceTree(treePages, configuration);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });
});
