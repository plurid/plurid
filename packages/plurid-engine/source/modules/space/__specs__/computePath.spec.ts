import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import {
    computePath,
} from '../location';



describe('computePath', () => {
    it('computes the path on the first child', () => {
        const targetPage = {
            ...defaultTreePlane,
            sourceID: '1',
            planeID: 'aaa',
            path: '/aaa',
            show: true,
        };
        const tree: TreePlane[] = [
            targetPage,
            {
                ...defaultTreePlane,
                sourceID: '2',
                planeID: 'bbb',
                path: '/bbb',
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
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                planeID: 'bbb',
                path: '/bbb',
                show: true,
            },
        ];
        const planeID = 'ccc';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([]);
    });

    it('computes the path on the second child', () => {
        const targetPage_1 = {
            ...defaultTreePlane,
            sourceID: '1',
            planeID: 'aaa',
            path: '/aaa',
            show: true,
        };
        const targetPage_2 = {
            ...defaultTreePlane,
            sourceID: '2',
            planeID: 'bbb',
            parentPlaneID: 'aaa',
            path: '/aaa/bbb',
            show: true,
        };
        const tree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        parentPlaneID: 'aaa',
                        path: '/aaa/bbb',
                        show: true,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                path: '/ccc',
                show: true,
            },
        ];
        const planeID = 'bbb';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage_1, targetPage_2]);
    });
});
