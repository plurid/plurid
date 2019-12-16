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
        const updatedPage: TreePage = {
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
        }
        const updatedTree: TreePage[] = [
            updatedPage,
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

        const result = updateTreePage(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });

    it('updates the tree page on the second child', () => {
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
                planeID: 'ddd',
                path: '/ddd',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];
        const updatedPage: TreePage = {
            pageID: '2',
            planeID: 'bbb',
            path: '/aaa/bbb',
            location,
            height: 0,
            width: 0,
            show: true,
            children: [
                {
                    pageID: '4',
                    planeID: 'ccc',
                    path: '/aaa/bbb/ccc',
                    location,
                    height: 0,
                    width: 0,
                    show: true,
                    children: [],
                }
            ],
        }
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
                    updatedPage,
                ],
            },
            {
                pageID: '3',
                planeID: 'ddd',
                path: '/ddd',
                location,
                height: 0,
                width: 0,
                show: true,
                children: [],
            },
        ];

        const result = updateTreePage(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
