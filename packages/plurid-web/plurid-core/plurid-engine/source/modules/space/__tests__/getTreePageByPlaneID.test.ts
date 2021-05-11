// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        getTreePlaneByPlaneID,
    } from '../utilities';
    // #endregion external
// #endregion imports



// #region module
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
                children: [
                    {
                        ...defaultTreePlane,
                        sourceID: '3',
                        planeID: 'ccc',
                        route: '/aaa/bbb/ccc',
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
        route: '/ddd',
        show: true,
    },
    {
        ...defaultTreePlane,
        sourceID: '5',
        planeID: 'eee',
        route: '/eee',
        show: true,
        children: [
            {
                ...defaultTreePlane,
                sourceID: '6',
                planeID: 'fff',
                route: '/eee/fff',
                show: true,
            },
        ],
    },
];


describe('getTreePlaneByPlaneID', () => {
    it('gets the tree page with id "aaa"', () => {
        const planeID = 'aaa';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/aaa';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });

    it('gets the tree page with id "bbb"', () => {
        const planeID = 'bbb';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/aaa/bbb';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });

    it('gets the tree page with id "ccc"', () => {
        const planeID = 'ccc';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/aaa/bbb/ccc';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });

    it('gets the tree page with id "ddd"', () => {
        const planeID = 'ddd';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/ddd';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });

    it('gets the tree page with id "eee"', () => {
        const planeID = 'eee';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/eee';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });

    it('gets the tree page with id "fff"', () => {
        const planeID = 'fff';
        const page = getTreePlaneByPlaneID(tree, planeID);
        const route = '/eee/fff';

        expect(page).toBeTruthy();
        if (page) {
            expect(page.route).toBe(route);
        }
    });
});
// #endregion module
