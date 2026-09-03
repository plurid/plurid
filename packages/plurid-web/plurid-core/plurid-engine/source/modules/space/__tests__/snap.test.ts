// #region imports
    // #region external
    import {
        computeSnap,
        collectSnapBoxes,
        boxesBounds,
        SnapBox,
    } from '../snap';
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
});
// #endregion module
