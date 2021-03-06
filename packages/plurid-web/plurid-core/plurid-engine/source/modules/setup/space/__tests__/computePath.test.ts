// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        computePath,
    } from '../location';
    // #endregion external
// #endregion imports



// #region module
describe('computePath', () => {
    it('computes the path on the first child', () => {
        const targetPage: TreePlane = {
            ...defaultTreePlane,
            sourceID: '1',
            planeID: 'aaa',
            route: '/aaa',
            show: true,
        };
        const tree: TreePlane[] = [
            targetPage,
            {
                ...defaultTreePlane,
                sourceID: '2',
                planeID: 'bbb',
                route: '/bbb',
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
                route: '/aaa',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                planeID: 'bbb',
                route: '/bbb',
                show: true,
            },
        ];
        const planeID = 'ccc';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([]);
    });

    it('computes the path on the second child', () => {
        const targetPage_1: TreePlane = {
            ...defaultTreePlane,
            sourceID: '1',
            planeID: 'aaa',
            route: '/aaa',
            show: true,
        };
        const targetPage_2: TreePlane = {
            ...defaultTreePlane,
            sourceID: '2',
            planeID: 'bbb',
            parentPlaneID: 'aaa',
            route: '/aaa/bbb',
            show: true,
        };
        const tree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        parentPlaneID: 'aaa',
                        route: '/aaa/bbb',
                        show: true,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
        ];
        const planeID = 'bbb';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage_1, targetPage_2]);
    });
});
// #endregion module
