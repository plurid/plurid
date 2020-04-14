import {
    TreePlane,
} from '@plurid/plurid-data';

import {
    updateTreePlane,
} from '../tree';



const location = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};


describe('updateTreePlane', () => {
    it('updates the tree page on the first child', () => {
        const tree: TreePlane[] = [
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
        const updatedPage: TreePlane = {
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
        const updatedTree: TreePlane[] = [
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

        const result = updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });

    it('updates the tree page on the second child', () => {
        const tree: TreePlane[] = [
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
        const updatedPage: TreePlane = {
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
        const updatedTree: TreePlane[] = [
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

        const result = updateTreePlane(tree, updatedPage);
        expect(result).toMatchObject(updatedTree);
    });
});
