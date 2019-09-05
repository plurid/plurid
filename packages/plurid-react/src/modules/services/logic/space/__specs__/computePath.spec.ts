import {
    computePath,
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


describe.only('computePath', () => {
    it('computes the path on the first child', () => {
        const targetPage = {
            planeID: 'aaa',
            path: '/aaa',
            location,
            children: [],
        };
        const tree: TreePage[] = [
            targetPage,
            {
                planeID: 'bbb',
                path: '/bbb',
                location,
                children: [],
            },
        ];
        const planeID = 'aaa';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage]);
    });

    it('computes the path on the first child - without finding any', () => {
        const tree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [],
            },
            {
                planeID: 'bbb',
                path: '/bbb',
                location,
                children: [],
            },
        ];
        const planeID = 'ccc';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([]);
    });

    it('computes the path on the second child', () => {
        const targetPage_1 = {
            planeID: 'aaa',
            path: '/aaa',
            location,
            children: [],
        };
        const targetPage_2 = {
            planeID: 'bbb',
            parentPlaneID: 'aaa',
            path: '/aaa/bbb',
            location,
            children: [],
        };
        const tree: TreePage[] = [
            {
                planeID: 'aaa',
                path: '/aaa',
                location,
                children: [
                    {
                        planeID: 'bbb',
                        parentPlaneID: 'aaa',
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
        const planeID = 'bbb';

        const result = computePath(tree, planeID);
        expect(result).toStrictEqual([targetPage_1, targetPage_2]);
    });
});
