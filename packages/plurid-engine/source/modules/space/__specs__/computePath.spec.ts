import {
    computePath,
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


describe('computePath', () => {
    it('computes the path on the first child', () => {
        const targetPage = {
            pageID: '1',
            planeID: 'aaa',
            path: '/aaa',
            location,
            children: [],
            show: true,
        };
        const tree: TreePage[] = [
            targetPage,
            {
                pageID: '2',
                planeID: 'bbb',
                path: '/bbb',
                location,
                children: [],
                show: true,
            },
        ];
        const planeID = 'aaa';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage]);
    });

    it('computes the path on the first child - without finding any', () => {
        const tree: TreePage[] = [
            {
                pageID: '1',
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [],
                show: true,
            },
            {
                pageID: '2',
                planeID: 'bbb',
                path: '/bbb',
                location,
                children: [],
                show: true,
            },
        ];
        const planeID = 'ccc';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([]);
    });

    it('computes the path on the second child', () => {
        const targetPage_1 = {
            pageID: '1',
            planeID: 'aaa',
            path: '/aaa',
            location,
            show: true,
            children: [],
        };
        const targetPage_2 = {
            pageID: '2',
            planeID: 'bbb',
            parentPlaneID: 'aaa',
            path: '/aaa/bbb',
            location,
            show: true,
            children: [],
        };
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
                        parentPlaneID: 'aaa',
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
        const planeID = 'bbb';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage_1, targetPage_2]);
    });
});
