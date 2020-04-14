import {
    TreePlane,
} from '@plurid/plurid-data';

import computeColumnLayout from '../column';



const pathDivisions = {
    protocol: '',
    origin: {
        value: '',
        controlled: false,
    },
    route: {
        value: '',
        parameters: {},
        query: {},
    },
    space: {
        value: '',
        parameters: {},
        query: {},
    },
    universe: {
        value: '',
        parameters: {},
        query: {},
    },
    cluster: {
        value: '',
        parameters: {},
        query: {},
    },
    plane: {
        value: '',
        parameters: {},
        query: {},
    },
    valid: false,
};


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
                sourceID: '1',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '2',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '3',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
        ]

        const locatedTree: TreePlane[] = [
            {
                sourceID: '1',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '2',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '3',
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
                pathDivisions,
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
                sourceID: '1',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '2',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '3',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '4',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '5',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                sourceID: '1',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '2',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '3',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '4',
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
                pathDivisions,
                planeID: '',
                show: true,
                children: [],
            },
            {
                sourceID: '5',
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
                pathDivisions,
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
