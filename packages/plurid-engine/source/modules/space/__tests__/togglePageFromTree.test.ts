import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import {
    logic,
} from '../tree';



describe('togglePageFromTree', () => {
    it('toggle page level one child', () => {
        const tree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        route: '/aaa/bbb',
                        show: true,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
        ];

        const updatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        route: '/aaa/bbb',
                        show: false,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
        ];

        const togglePageID = 'bbb';

        const result = logic.togglePageFromTree(tree, togglePageID);
        expect(result).toMatchObject(updatedTree);
    });

    it.only('toggle page', () => {
        const tree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        route: '/aaa/bbb',
                        show: true,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                planeID: 'ddd',
                route: '/ddd',
                show: true,
            },
        ];

        const updatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                planeID: 'aaa',
                route: '/aaa',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '2',
                        planeID: 'bbb',
                        route: '/aaa/bbb',
                        show: false,
                    }
                ],
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                planeID: 'ccc',
                route: '/ccc',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                planeID: 'ddd',
                route: '/ddd',
                show: true,
            },
        ];

        const togglePageID = 'bbb';

        const result = logic.togglePageFromTree(tree, togglePageID);

        expect(result).toMatchObject(updatedTree);
    });
});
