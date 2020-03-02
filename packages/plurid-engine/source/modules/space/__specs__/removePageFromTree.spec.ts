import {
    TreePage,
} from '@plurid/plurid-data';

import {
    removePageFromTree,
} from '../tree/logic';



const location = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};


describe('removePageFromTree', () => {
    it('removes the tree page on the first child', () => {
        const tree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [],
                    }
                ],
            },
            {
                pageID: '3',
                planeID: 'ccc',
                path: '/ccc',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];

        const updatedTree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
            {
                pageID: '3',
                planeID: 'ccc',
                path: '/ccc',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const removePageID = 'bbb';

        const result = removePageFromTree(tree, removePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it('removes the tree page on the second child', () => {
        const tree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
                                height: 0,
                                width: 0,
                                show: true,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                pageID: '4',
                planeID: 'ddd',
                path: '/ddd',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const updatedTree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [],
                    },
                ],
            },
            {
                pageID: '4',
                planeID: 'ddd',
                path: '/ddd',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const removePageID = 'ccc';

        const result = removePageFromTree(tree, removePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it('removes the tree page on the second root', () => {
        const tree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
                                height: 0,
                                width: 0,
                                show: true,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                pageID: '4',
                planeID: 'ddd',
                path: '/ddd',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const updatedTree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
                                height: 0,
                                width: 0,
                                show: true,
                                children: [],
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
