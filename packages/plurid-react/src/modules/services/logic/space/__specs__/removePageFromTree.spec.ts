import {
    removePageFromTree,
} from '../';

import {
    TreePage,
} from '../../../../data/interfaces';



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
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        children: [],
                    }
                ],
            },
            {
                planeID: 'ccc',
                path: '/ccc',
                location,
                children: [],
            },
        ];
        const updatedTree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [],
            },
            {
                planeID: 'ccc',
                path: '/ccc',
                location,
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
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        children: [
                            {
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
                children: [],
            },
        ];
        const updatedTree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        children: [],
                    },
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
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
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        children: [
                            {
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
                children: [],
            },
        ];
        const updatedTree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        children: [
                            {
                                planeID: 'ccc',
                                path: '/aaa/bbb/ccc',
                                location,
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
