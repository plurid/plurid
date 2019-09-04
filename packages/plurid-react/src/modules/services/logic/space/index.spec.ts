import {
    getTreePageByPlaneID,
} from './';


// to parse this kind of tree and determine that there are
// two roots which need to be placed one near another
// the first root has a child which has a child
// to determine the locations of the children

const location = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};
const tree = [
    {
        planeID: 'aaa',
        path: '/aaa',
        location,
        children: [
            {
                planeID: 'bbb',
                path: '/aaa/bbb',
                location,
                children: [
                    {
                        planeID: 'ccc',
                        path: '/aaa/bbb/ccc',
                        location,
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
        children: [],
    },
    {
        planeID: 'eee',
        path: '/eee',
        location,
        children: [
            {
                planeID: 'fff',
                path: '/eee/fff',
                location,
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
