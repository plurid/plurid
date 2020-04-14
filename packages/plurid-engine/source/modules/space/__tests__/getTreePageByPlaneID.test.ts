import {
    /** constants */
    defaultTreePlane,

    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';

import {
    getTreePlaneByPlaneID,
} from '../utilities';



const tree: TreePlane[] = [
    {
        ...defaultTreePlane,
        sourceID: '1',
        planeID: 'aaa',
        path: '/aaa',
        show: true,
        children: [
            {
                ...defaultTreePlane,
                sourceID: '2',
                planeID: 'bbb',
                path: '/aaa/bbb',
                show: true,
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '3',
                        planeID: 'ccc',
                        path: '/aaa/bbb/ccc',
                        show: true,
                    },
                ],
            },
        ],
    },
    {
        ...defaultTreePlane,
        sourceID: '4',
        planeID: 'ddd',
        path: '/ddd',
        show: true,
    },
    {
        ...defaultTreePlane,
        sourceID: '5',
        planeID: 'eee',
        path: '/eee',
        show: true,
        children: [
            {
                ...defaultTreePlane,
                sourceID: '6',
                planeID: 'fff',
                path: '/eee/fff',
                show: true,
            },
        ],
    },
];


describe('getTreePlaneByPlaneID', () => {
    it('gets the tree page with id "aaa"', () => {
        const planeID = 'aaa';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/aaa';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "bbb"', () => {
        const planeID = 'bbb';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/aaa/bbb';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "ccc"', () => {
        const planeID = 'ccc';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/aaa/bbb/ccc';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "ddd"', () => {
        const planeID = 'ddd';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/ddd';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "eee"', () => {
        const planeID = 'eee';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/eee';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "fff"', () => {
        const planeID = 'fff';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const path = '/eee/fff';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });
});
