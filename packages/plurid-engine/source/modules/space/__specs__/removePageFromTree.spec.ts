import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import {
    removePageFromTree,
} from '../tree/logic';



describe('removePageFromTree', () => {
    it('removes the tree page on the first child', () => {
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

        const updatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                path: '/ccc',
                show: true,
            },
        ];
        const removePageID = 'bbb';

        const result = removePageFromTree(tree, removePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it('removes the tree page on the second child', () => {
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
                        path: '/aaa/bbb',
                        show: true,
                        children: [
                            {
                                ...defaultTreePlane,
                                sourceID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                show: true,
                            },
                        ],
                    },
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                planeID: 'ddd',
                path: '/ddd',
                show: true,
            },
        ];
        const updatedTree: TreePlane[] = [
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
                        path: '/aaa/bbb',
                        show: true,
                    },
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                planeID: 'ddd',
                path: '/ddd',
                show: true,
            },
        ];
        const removePageID = 'ccc';

        const result = removePageFromTree(tree, removePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it('removes the tree page on the second root', () => {
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
                        path: '/aaa/bbb',
                        show: true,
                        children: [
                            {
                                ...defaultTreePlane,
                                sourceID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                show: true,
                            },
                        ],
                    },
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                planeID: 'ddd',
                path: '/ddd',
                show: true,
            },
        ];
        const updatedTree: TreePlane[] = [
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
                        path: '/aaa/bbb',
                        show: true,
                        children: [
                            {
                                ...defaultTreePlane,
                                sourceID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                show: true,
                            },
                        ],
                    },
                ],
            },
        ];
        const removePageID = 'ddd';

        const result = removePageFromTree(tree, removePageID);
        expect(result).toMatchObject(updatedTree);
    });
})
