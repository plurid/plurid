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
        planeId: 'aaa',
        path: '/aaa',
        location,
        children: [
            {
                planeId: 'bbb',
                path: '/aaa/bbb',
                location,
                children: [
                    {
                        planeId: 'ccc',
                        path: '/aaa/bbb/ccc',
                        location,
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        planeId: 'ddd',
        path: '/ddd',
        location,
        children: [],
    },
];



describe('getTreePageByPlaneID', () => {
    it('gets the tree page with id "aaa"', () => {
        const planeID = 'aaa';
        const page = getTreePageByPlaneID(tree, planeID);
        const path = '/aaa';

        if (page) {
            expect(page.path).toBe(path);
        }
    });
});
