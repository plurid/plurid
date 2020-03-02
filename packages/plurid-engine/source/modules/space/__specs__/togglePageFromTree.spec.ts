import {
    TreePage,
} from '@plurid/plurid-data';

import {
    togglePageFromTree,
} from '../tree';



const location = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};


describe('togglePageFromTree', () => {
    it('toggle page level one child', () => {
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
                children: [
                    {
                        pageID: '2',
                        planeID: 'bbb',
                        path: '/aaa/bbb',
                        location,
                        height: 0,
                        width: 0,
                        show: false,
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

        const togglePageID = 'bbb';

        const result = togglePageFromTree(tree, togglePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it.only('toggle page', () => {
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
                        show: false,
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

        const togglePageID = 'bbb';

        const result = togglePageFromTree(tree, togglePageID);

        expect(result).toMatchObject(updatedTree);
    });
});
