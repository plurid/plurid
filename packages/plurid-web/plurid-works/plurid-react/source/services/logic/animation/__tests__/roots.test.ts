// #region imports
    // #region external
    import {
        treePlane,
    } from '../../../../testing/fixtures';
    // #endregion external


    // #region internal
    import {
        findRootIndex,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE ROOT OF A PLANE: previous/next root (Alt+A / Alt+D) steps from the root the active plane
 * belongs to, however deep the plane is.
 */
describe('findRootIndex', () => {
    const tree = [
        treePlane('first'),
        treePlane('second'),
        treePlane('third', {
            children: [
                treePlane('child', {
                    parentPlaneID: 'third',
                    children: [
                        treePlane('grandchild', {
                            parentPlaneID: 'child',
                            children: [
                                treePlane('deepest', { parentPlaneID: 'grandchild' }),
                            ],
                        }),
                    ],
                }),
            ],
        }),
    ];

    it('names the root of a root, a child, a grandchild and a deeper plane', () => {
        expect(findRootIndex(tree, 'second')).toBe(1);
        expect(findRootIndex(tree, 'child')).toBe(2);
        expect(findRootIndex(tree, 'grandchild')).toBe(2);
        expect(findRootIndex(tree, 'deepest')).toBe(2);
    });

    it('names no root for a plane outside the tree', () => {
        expect(findRootIndex(tree, 'elsewhere')).toBeUndefined();
        expect(findRootIndex(tree, '')).toBeUndefined();
    });
});
// #endregion module
