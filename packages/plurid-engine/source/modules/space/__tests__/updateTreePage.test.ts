import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import {
    updateTreePlane,
} from '../tree';



describe('updateTreePlane', () => {
    it('updates the tree page on the first child', () => {
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
                sourceID: '3',
                planeID: 'ccc',
                path: '/ccc',
                show: true,
            },
        ];
        const updatedPage: TreePlane = {
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
        }
        const updatedTree: TreePlane[] = [
            updatedPage,
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                path: '/ccc',
                show: true,
            },
        ];

        const result = updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });

    it('updates the tree page on the second child', () => {
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
                planeID: 'ddd',
                path: '/ddd',
                show: true,
            },
        ];
        const updatedPage: TreePlane = {
            ...defaultTreePlane,
            sourceID: '2',
            planeID: 'bbb',
            path: '/aaa/bbb',
            show: true,
            children: [
                {
                    ...defaultTreePlane,
                    sourceID: '4',
                    planeID: 'ccc',
                    path: '/aaa/bbb/ccc',
                    show: true,
                }
            ],
        }
        const updatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                path: '/aaa',
                show: true,
                children: [
                    updatedPage,
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ddd',
                path: '/ddd',
                show: true,
            },
        ];

        const result = updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
