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
        logic,
    } from '../tree';
    // #endregion external
// #endregion imports



// #region module
describe('updateTreePlane', () => {
    it('updates the tree page on the first child', () => {
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
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
        ];
        const updatedPage: TreePlane = {
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
                    route: '/aaa/bbb',
                    show: true,
                }
            ],
        }
        const updatedTree: TreePlane[] = [
            updatedPage,
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
        ];

        const result = logic.updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });

    it('updates the tree page on the second child', () => {
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
                        route: '/aaa/bbb',
                        show: true,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ddd',
                route: '/ddd',
                show: true,
            },
        ];
        const updatedPage: TreePlane = {
            ...defaultTreePlane,
            sourceID: '2',
            planeID: 'bbb',
            route: '/aaa/bbb',
            show: true,
            children: [
                {
                    ...defaultTreePlane,
                    sourceID: '4',
                    planeID: 'ccc',
                    route: '/aaa/bbb/ccc',
                    show: true,
                }
            ],
        }
        const updatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    updatedPage,
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ddd',
                route: '/ddd',
                show: true,
            },
        ];

        const result = logic.updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
// #endregion module
