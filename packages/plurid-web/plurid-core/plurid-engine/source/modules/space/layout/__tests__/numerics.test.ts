// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
        defaultTreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        computeColumnLayout,
        computeRowLayout,
        computeFaceToFaceLayout,
    } from '../index';
    import {
        finiteNumber,
        groupSizes,
        layoutCount,
    } from '../pitch';
    import {
        splitIntoGroups,
    } from '../../utilities';
    // #endregion external
// #endregion imports



// #region module
/**
 * EVERY LAYOUT NUMBER IS ONE THE ARITHMETIC CAN TAKE (audit 2026-09-29 #2, #3). A face-to-face
 * `middle` of −2, NaN or −1.5 made a row of 0, NaN or 0.5 planes and looped until the heap ran out;
 * a fractional or huge `columnLength` / `rowLength` sized an array and threw a RangeError, which
 * unmounted the application from a relayout effect (or threw from the store's constructor on a deep
 * link, or from a server render).
 */
const view = { width: 1440, height: 840 };

const roots = (
    count: number,
): TreePlane[] => Array.from({ length: count }, (_, index) => ({
    ...defaultTreePlane,
    sourceID: '/p' + index,
    planeID: '/p' + index + '@' + index,
    route: '/p' + index,
    show: true,
    width: 0,
    height: 0,
    children: [],
}));

const finiteLocations = (
    tree: TreePlane[],
) => tree.every((root) => Object.values(root.location).every((value) => Number.isFinite(value)));


describe('layout numbers', () => {
    it('face to face: a middle of −2, NaN, −1.5 or Infinity lays every root out, and returns', () => {
        for (const middle of [-2, -5, NaN, -1.5, Infinity, -Infinity, 0.5, 1e10, '1' as any, null as any]) {
            const tree = computeFaceToFaceLayout(roots(5), 90, 0, middle, defaultConfiguration, view);
            expect(tree.length).toBe(5);
            expect(finiteLocations(tree)).toBe(true);
        }
        // −2 and below: a row of one plane each; 0.5 reads as the default two
        const single = computeFaceToFaceLayout(roots(3), 90, 0, -2, defaultConfiguration, view);
        expect(new Set(single.map((root) => root.location.translateY)).size).toBe(3);
        const pair = computeFaceToFaceLayout(roots(4), 90, 0, 0.5, defaultConfiguration, view);
        expect(new Set(pair.map((root) => root.location.translateY)).size).toBe(2);
    });

    it('face to face: `middle: true` is one plane in the middle, as it always was (a row of three)', () => {
        const rows = (middle: unknown) => new Set(
            computeFaceToFaceLayout(roots(6), 90, 0, middle as any, defaultConfiguration, view)
                .map((root) => root.location.translateY),
        ).size;
        expect(rows(true)).toBe(2);
        expect(rows(1)).toBe(2);
        expect(rows(false)).toBe(3);
        expect(rows(0)).toBe(3);
    });

    it('splitIntoGroups is safe for any length: a whole number of at least 1', () => {
        const data = [1, 2, 3, 4, 5];
        for (const length of [0, -1, NaN, 0.5]) {
            expect(splitIntoGroups(data, length)).toEqual([[1], [2], [3], [4], [5]]);
        }
        expect(splitIntoGroups(data, 2.7)).toEqual([[1, 2], [3, 4], [5]]);
        expect(splitIntoGroups(data, Infinity)).toEqual([[1, 2, 3, 4, 5]]);
        expect(splitIntoGroups([], 3)).toEqual([]);
    });

    it('columns: a fractional, huge or garbage columnLength is floored and clamped, never thrown', () => {
        expect(() => computeColumnLayout(roots(3), 1, 1.5, 0, defaultConfiguration, view)).not.toThrow();
        const fractional = computeColumnLayout(roots(3), 1, 1.5, 0, defaultConfiguration, view);
        // 1.5 planes per column is 1: three columns of one
        expect(new Set(fractional.map((root) => root.location.translateX)).size).toBe(3);
        const huge = computeColumnLayout(roots(3), 1, 1e10, 0, defaultConfiguration, view);
        expect(new Set(huge.map((root) => root.location.translateX)).size).toBe(1);
        for (const columnLength of [NaN, -3, Infinity, 'x' as any, null as any]) {
            const tree = computeColumnLayout(roots(4), 2, columnLength, 0, defaultConfiguration, view);
            expect(tree.length).toBe(4);
            expect(finiteLocations(tree)).toBe(true);
        }
        // a numeric string, as a configuration read from JSON holds it
        expect(computeColumnLayout(roots(4), 1, '2' as any, 0, defaultConfiguration, view).map((root) => root.location.translateX))
            .toEqual(computeColumnLayout(roots(4), 1, 2, 0, defaultConfiguration, view).map((root) => root.location.translateX));
        // `columns` that is not a positive finite number is one column
        for (const columns of [0, -2, NaN, Infinity]) {
            const tree = computeColumnLayout(roots(3), columns, undefined, 0, defaultConfiguration, view);
            expect(new Set(tree.map((root) => root.location.translateX)).size).toBe(1);
        }
        expect(computeColumnLayout([], 2, 1.5, 0, defaultConfiguration, view)).toEqual([]);
    });

    it('rows: the same for rowLength', () => {
        expect(() => computeRowLayout(roots(3), 1, 2.5, 0, defaultConfiguration, view)).not.toThrow();
        const tree = computeRowLayout(roots(3), 1, 2.5, 0, defaultConfiguration, view);
        // 2.5 planes per row is 2: two rows
        expect(new Set(tree.map((root) => root.location.translateY)).size).toBe(2);
        const huge = computeRowLayout(roots(3), 1, 1e10, 0, defaultConfiguration, view);
        expect(new Set(huge.map((root) => root.location.translateY)).size).toBe(1);
        for (const rows of [0, NaN, -1]) {
            expect(finiteLocations(computeRowLayout(roots(3), rows, undefined, 0, defaultConfiguration, view))).toBe(true);
        }
    });

    it('the helpers: finite numbers, whole counts, floored group counts', () => {
        expect(finiteNumber(3, 1)).toBe(3);
        expect(finiteNumber('2.5', 1)).toBe(2.5);
        expect(finiteNumber(' ', 1)).toBe(1);
        expect(finiteNumber(NaN, 1)).toBe(1);
        expect(finiteNumber(Infinity, 1)).toBe(1);
        expect(finiteNumber(undefined, 7)).toBe(7);
        expect(layoutCount(2.9, 1)).toBe(2);
        expect(layoutCount(0.5, 4)).toBe(4);
        expect(layoutCount(1e10, 1, 3)).toBe(3);
        expect(layoutCount(undefined, 0)).toBe(1);
        expect(groupSizes(roots(3), 2.7, (index) => index % 2, () => 10, 5)).toEqual([10, 10]);
        expect(groupSizes(roots(2), NaN, () => 0, () => 10, 5)).toEqual([]);
        expect(groupSizes(roots(2), 1e10, (index) => index, () => 10, 5)).toEqual([10, 10]);
    });
});
// #endregion module
