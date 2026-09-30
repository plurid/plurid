// #region imports
    // #region external
    import {
        computeSnap,
        collectSnapBoxes,
        boxesBounds,
        SnapBox,
    } from '../snap';
    import {
        Tree,
    } from '../tree';
    import {
        updateTreeWithNewPlane,
    } from '../tree/logic';
    import {
        recomputeTree,
    } from '../location';
    import {
        Registrar,
    } from '../../planes/registrar';
    import {
        merge,
    } from '../../general/configuration';
    // #endregion external
// #endregion imports



// #region module
const box = (
    id: string,
    left: number,
    top: number,
    width = 100,
    height = 80,
): SnapBox => ({
    id,
    left,
    top,
    right: left + width,
    bottom: top + height,
});


describe('computeSnap()', () => {
    it('snaps the nearest edge within the threshold and reports the guide', () => {
        const result = computeSnap([box('s', 108, 300)], [box('o', 100, 0)], { threshold: 12 });
        expect(result.dx).toBe(-8);
        expect(result.dy).toBe(0);
        expect(result.guides).toEqual([{ axis: 'x', position: 100, edge: 'left' }]);
    });

    it('a side attracts to either side, a center only to a center', () => {
        // selection right edge (208) near the other's left (200)
        expect(computeSnap([box('s', 108, 300)], [box('o', 200, 0)]).dx).toBe(-8);
        // centers: selection center 150, other center 156 → +6
        const centered = computeSnap([box('s', 100, 300)], [box('o', 106, 0)], { edges: ['centerX'] });
        expect(centered.dx).toBe(6);
        expect(centered.guides[0].edge).toBe('centerX');
    });

    it('ignores edges beyond the threshold, is deterministic on ties (first wins)', () => {
        expect(computeSnap([box('s', 130, 300)], [box('o', 100, 0)]).dx).toBe(0);
        const tie = computeSnap([box('s', 105, 300)], [box('a', 100, 0), box('b', 110, 0)]);
        expect(tie.dx).toBe(-5);
        expect(tie.guides[0].position).toBe(100);
    });

    it('falls back to the grid when nothing attracts', () => {
        const result = computeSnap([box('s', 103, 297)], [], { grid: 50, threshold: 12 });
        expect(result.dx).toBe(-3);
        expect(result.dy).toBe(3);
        expect(result.guides.map((guide) => guide.edge)).toEqual(['grid', 'grid']);
    });

    it('collects boxes from the tree, shown planes only, children included', () => {
        const tree: any[] = [
            { planeID: 'a', show: true, width: 100, height: 80, location: { translateX: 0, translateY: 0 }, children: [
                { planeID: 'b', show: true, width: 0, height: 0, location: { translateX: 500, translateY: 0 } },
                { planeID: 'hidden', show: false, width: 100, height: 80, location: { translateX: 900, translateY: 0 } },
            ] },
        ];
        const { selection, others } = collectSnapBoxes(tree, new Set(['b']), { width: 40, height: 30 });
        expect(selection).toEqual([{ id: 'b', left: 500, top: 0, right: 540, bottom: 30 }]);
        expect(others.map((entry) => entry.id)).toEqual(['a']);
        expect(boxesBounds([...selection, ...others])).toEqual({ id: '', left: 0, top: 0, right: 540, bottom: 80 });
    });

    /**
     * THE SELECTION DOES NOT SNAP TO ITSELF: a spawned child follows its parent, so as a target it
     * pulled the parent toward it on every release (10 px per release under the `objects` preset,
     * 0.17 px under `reading`) and then followed — the pair crept across the space.
     */
    it('the selection\'s own spawned descendants are no targets; a child placed by hand is', () => {
        const configuration = merge({ space: { bridge: { preset: 'objects' } }, elements: { plane: { width: 400 } } });
        const planes = new Registrar<any>([{ route: '/parent', component: null }, { route: '/child', component: null }], 'host').getAll();
        const [root] = new Tree<any>({ planes, view: ['/parent'], configuration, layout: true, viewSize: { width: 1440, height: 840 } }, 'host').compute();
        const parent = { ...root, width: 400, height: 300 };
        const { updatedTree } = updateTreeWithNewPlane('/child', parent.planeID, { x: 10, y: 0 }, [parent], planes, configuration, 'host', { linkID: 'l', fallbackWidth: 400 });
        const fallback = { width: 400, height: 300 };

        let tree = updatedTree;
        for (let release = 0; release < 3; release += 1) {
            const { selection, others } = collectSnapBoxes(tree, new Set([parent.planeID]), fallback);
            expect(others).toEqual([]);
            const { dx, dy } = computeSnap(selection, others, { threshold: 12 });
            expect([dx, dy]).toEqual([0, 0]);
            tree = recomputeTree(tree.map((node) => ({ ...node, location: { ...node.location, translateX: node.location.translateX + dx } })));
        }

        // a grandchild follows the child that follows the selection; a child moved by hand stays put
        const child = tree[0].children![0];
        const grandchild = { ...child, planeID: 'grandchild', parentPlaneID: child.planeID, children: [] };
        const nested = [{ ...tree[0], children: [{ ...child, children: [grandchild] }] }];
        expect(collectSnapBoxes(nested, new Set([parent.planeID]), fallback).others).toEqual([]);
        const pinned = [{ ...tree[0], children: [{ ...child, manuallyPositioned: true, children: [grandchild] }] }];
        expect(collectSnapBoxes(pinned, new Set([parent.planeID]), fallback).others.map((entry) => entry.id)).toEqual([child.planeID, 'grandchild']);
    });
});
// #endregion module
