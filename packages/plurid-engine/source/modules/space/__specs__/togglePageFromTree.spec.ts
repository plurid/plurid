import {
    togglePageFromTree,
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


describe('togglePageFromTree', () => {
    it('toggle page level one child', () => {
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
                show: true,
                children: [],
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

        const togglePageID = 'bbb';

        const result = togglePageFromTree(tree, togglePageID);

        expect(result).toMatchObject(updatedTree);
    });
});
