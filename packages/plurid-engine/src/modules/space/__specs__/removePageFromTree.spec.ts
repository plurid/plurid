import {
    removePageFromTree,
} from '../';

import {
    TreePage,
} from '@plurid/plurid-data';



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
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
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
                show: true,
                children: [],
            },
        ];

        const updatedTree: TreePage[] = [
            {
                pageID: '4',
                planeID: 'aaa',
                path: '/aaa',
                location,
                show: true,
                children: [],
            },
            {
                pageID: '5',
                planeID: 'ccc',
                path: '/ccc',
                location,
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
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
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
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        show: true,
                        children: [],
                    },
                ],
            },
            {
                pageID: '3',
                planeID: 'ddd',
                path: '/ddd',
                location,
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
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
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
                show: true,
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        show: true,
                        children: [
                            {
                                pageID: '3',
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
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
