import {
    updateTreePage,
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


describe('updateTreePage', () => {
    it('updates the tree page on the first child', () => {
        const tree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                show: true,
                children: [],
            },
            {
                planeID: 'ccc',
                path: '/ccc',
                location,
                show: true,
                children: [],
            },
        ];
        const updatedPage: TreePage = {
            planeID: 'aaa',
            path: '/aaa',
            location,
            show: true,
            children: [
                {
                    planeID: 'bbb',
                    path: '/aaa/bbb',
                    location,
                    show: true,
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
                show: true,
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
                show: true,
                children: [
                    {
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        show: true,
                        children: [],
                    }
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
                show: true,
                children: [],
            },
        ];
        const updatedPage: TreePage = {
            planeID: 'bbb',
            path: '/aaa/bbb',
            location,
            show: true,
            children: [
                {
                    planeID: 'ccc',
                    path: '/aaa/bbb/ccc',
                    location,
                    show: true,
                    children: [],
                }
            ],
        }
        const updatedTree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                show: true,
                children: [
                    updatedPage,
                ],
            },
            {
                planeID: 'ddd',
                path: '/ddd',
                location,
                show: true,
                children: [],
            },
        ];

        const result = updateTreePage(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
