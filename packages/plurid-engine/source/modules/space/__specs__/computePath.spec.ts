import {
    TreePlane,
} from '@plurid/plurid-data';

import {
    computePath,
} from '../location';



const location = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};

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


describe('computePath', () => {
    it('computes the path on the first child', () => {
        const targetPage = {
            sourceID: '1',
            height: 0,
            width: 0,
            planeID: 'aaa',
            path: '/aaa',
            pathDivisions,
            location,
            children: [],
            show: true,
        };
        const tree: TreePlane[] = [
            targetPage,
            {
                sourceID: '2',
                planeID: 'bbb',
                path: '/bbb',
                pathDivisions,
                location,
                height: 0,
                width: 0,
                children: [],
                show: true,
            },
        ];
        const planeID = 'aaa';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage]);
    });

    it('computes the path on the first child - without finding any', () => {
        const tree: TreePlane[] = [
            {
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                pathDivisions,
                location,
                height: 0,
                width: 0,
                children: [],
                show: true,
            },
            {
                sourceID: '2',
                planeID: 'bbb',
                path: '/bbb',
                pathDivisions,
                location,
                height: 0,
                width: 0,
                children: [],
                show: true,
            },
        ];
        const planeID = 'ccc';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([]);
    });

    it('computes the path on the second child', () => {
        const targetPage_1 = {
            sourceID: '1',
            planeID: 'aaa',
            path: '/aaa',
            location,
            height: 0,
            width: 0,
            show: true,
            children: [],
        };
        const targetPage_2 = {
            sourceID: '2',
            planeID: 'bbb',
            parentPlaneID: 'aaa',
            path: '/aaa/bbb',
            location,
            height: 0,
            width: 0,
            show: true,
            children: [],
        };
        const tree: TreePlane[] = [
            {
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                pathDivisions,
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        sourceID: '2',
                        planeID: 'bbb',
                        parentPlaneID: 'aaa',
                        path: '/aaa/bbb',
                        location,
                        pathDivisions,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [],
                    }
                ],
            },
            {
                sourceID: '3',
                planeID: 'ccc',
                path: '/ccc',
                location,
                pathDivisions,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const planeID = 'bbb';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage_1, targetPage_2]);
    });
});
