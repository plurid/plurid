// #region imports
    // #region external
    import {
        updateTreePlaneFields,
        collectPlaneIDs,
        linkIndexOf,
        findPlaneByLinkID,
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


describe('the link index', () => {
    const spawned = (planeID: string, spawnedByLinkID: string, children: any[] = []) => ({ ...plane(planeID, children), spawnedByLinkID });

    it('finds a spawned plane at any depth by its parent and link, once per tree reference', () => {
        const grandchild = spawned('c', 'link-2');
        const child = spawned('b', 'link-1', [grandchild]);
        const tree: any[] = [plane('a', [child]), plane('e')];
        expect(findPlaneByLinkID(tree, 'a', 'link-1')).toBe(child);
        expect(findPlaneByLinkID(tree, 'b', 'link-2')).toBe(grandchild);
        expect(findPlaneByLinkID(tree, 'a', 'link-2')).toBeUndefined();
        expect(findPlaneByLinkID(tree, 'nobody', 'link-1')).toBeUndefined();
        // the same tree keeps its index; a new tree gets its own
        expect(linkIndexOf(tree)).toBe(linkIndexOf(tree));
        expect(linkIndexOf([...tree])).not.toBe(linkIndexOf(tree));
        // holes in a tree are walked over
        expect(findPlaneByLinkID([undefined as any, ...tree], 'a', 'link-1')).toBe(child);
    });
});
// #endregion module
