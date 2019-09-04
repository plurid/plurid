import {
    updateTreePage,
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


describe('updateTreePage', () => {
    it('updates the tree page on the first child', () => {
        const tree: TreePage[] = [
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
        const updatedPage: TreePage = {
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
        }
        const updatedTree: TreePage[] = [
            updatedPage,
            {
                planeID: 'ccc',
                path: '/ccc',
                location,
                children: [],
            },
        ];

        const result = updateTreePage(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });

    it('updates the tree page on the second child', () => {
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
                planeID: 'ddd',
                path: '/ddd',
                location,
                children: [],
            },
        ];
        const updatedPage: TreePage = {
            planeID: 'bbb',
            path: '/aaa/bbb',
            location,
            children: [
                {
                    planeID: 'ccc',
                    path: '/aaa/bbb/ccc',
                    location,
                    children: [],
                }
            ],
        }
        const updatedTree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    updatedPage,
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
                children: [],
            },
        ];

        const result = updateTreePage(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
