import {
    getTreePageByPlaneID,
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
                children: [
                    {
                        planeID: 'ccc',
                        path: '/aaa/bbb/ccc',
                        location,
                        show: true,
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        planeID: 'ddd',
        path: '/ddd',
        location,
        show: true,
        children: [],
    },
    {
        planeID: 'eee',
        path: '/eee',
        location,
        show: true,
        children: [
            {
                planeID: 'fff',
                path: '/eee/fff',
                location,
                show: true,
                children: [],
            },
        ],
    },
];


describe('getTreePageByPlaneID', () => {
    it('gets the tree page with id "aaa"', () => {
        const planeID = 'aaa';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/aaa';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "bbb"', () => {
        const planeID = 'bbb';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/aaa/bbb';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "ccc"', () => {
        const planeID = 'ccc';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/aaa/bbb/ccc';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "ddd"', () => {
        const planeID = 'ddd';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/ddd';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "eee"', () => {
        const planeID = 'eee';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/eee';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });

    it('gets the tree page with id "fff"', () => {
        const planeID = 'fff';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/eee/fff';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.path).toBe(path);
        }
    });
});
