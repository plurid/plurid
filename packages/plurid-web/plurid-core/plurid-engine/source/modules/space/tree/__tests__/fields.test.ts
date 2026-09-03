// #region imports
    // #region external
    import {
        updateTreePlaneFields,
        collectPlaneIDs,
    } from '../fields';
    // #endregion external
// #endregion imports



// #region module
const plane = (planeID: string, children?: any[]) => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    height: 0,
    width: 0,
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    show: true,
    children,
});


describe('updateTreePlaneFields', () => {
    it('patches a nested plane and path-copies only its ancestors', () => {
        const grandchild = plane('c');
        const child = plane('b', [grandchild]);
        const sibling = plane('d');
        const root = plane('a', [child, sibling]);
        const tree = [root, plane('e')];

        const next = updateTreePlaneFields(tree, 'c', { width: 300, height: 200 });

        expect(next).not.toBe(tree);
        expect(next[0]).not.toBe(root);
        expect(next[0].children![0]).not.toBe(child);
        expect(next[0].children![0].children![0].width).toBe(300);
        // untouched branches keep their references
        expect(next[0].children![1]).toBe(sibling);
        expect(next[1]).toBe(tree[1]);
    });

    it('returns the same reference for a no-op patch or an unknown plane', () => {
        const tree = [plane('a', [plane('b')])];
        expect(updateTreePlaneFields(tree, 'b', { width: 0 })).toBe(tree);
        expect(updateTreePlaneFields(tree, 'zzz', { width: 10 })).toBe(tree);
    });

    it('collectPlaneIDs() walks children', () => {
        const ids = collectPlaneIDs([plane('a', [plane('b', [plane('c')])]), plane('d')]);
        expect([...ids].sort()).toEqual(['a', 'b', 'c', 'd']);
    });
});
// #endregion module
