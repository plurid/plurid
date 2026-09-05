// #region imports
    // #region libraries
    import {
        defaultTreePlane,
        defaultConfiguration,
        LAYOUT_TYPES,

        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import computeRowLayout from '../row';
    import computeSheavesLayout from '../sheaves';
    // #endregion external
// #endregion imports



// #region module
const planes = (): TreePlane[] => ['1', '2', '3'].map((id) => ({
    ...defaultTreePlane,
    sourceID: id,
    route: '/page-' + id,
    planeID: 'p' + id,
    show: true,
}));

const configurationWith = (
    layout: Record<string, unknown>,
): PluridConfiguration => ({
    ...defaultConfiguration,
    space: {
        ...defaultConfiguration.space,
        layout: layout as any,
    },
});

const large = { width: 1200, height: 800 };
const small = { width: 600, height: 400 };


describe('computeRowLayout', () => {
    const configuration = configurationWith({ type: LAYOUT_TYPES.ROWS, rows: 1, gap: 0.05 });

    it('spaces the planes along X from the given view size, keeping ids and order', () => {
        const tree = computeRowLayout(planes(), 1, undefined, 0.05, configuration, large);
        expect(tree.map((plane) => plane.planeID)).toEqual(['p1', 'p2', 'p3']);
        expect(tree[1].location.translateX).toBeGreaterThan(tree[0].location.translateX);
        expect(tree[2].location.translateX).toBeGreaterThan(tree[1].location.translateX);
    });

    it('reads the view size it is given, not the window', () => {
        const wide = computeRowLayout(planes(), 1, undefined, 0.05, configuration, large);
        const narrow = computeRowLayout(planes(), 1, undefined, 0.05, configuration, small);
        expect(wide[2].location.translateX).not.toBe(narrow[2].location.translateX);
    });
});


describe('computeSheavesLayout', () => {
    const configuration = configurationWith({ type: LAYOUT_TYPES.SHEAVES, depth: 0.5, offsetX: 60, offsetY: 42 });

    it('stacks the planes in depth with the configured offsets', () => {
        const tree = computeSheavesLayout(planes(), 0.5, 60, 42, configuration, large);
        expect(tree).toHaveLength(3);
        const z = tree.map((plane) => plane.location.translateZ);
        const x = tree.map((plane) => plane.location.translateX);
        expect(new Set(z).size).toBe(3);
        expect(x[1] - x[0]).toBeCloseTo(x[2] - x[1], 6);
        expect(x[1] - x[0]).not.toBe(0);
    });

    it('reads the view size it is given', () => {
        const wide = computeSheavesLayout(planes(), 0.5, 60, 42, configuration, large);
        const narrow = computeSheavesLayout(planes(), 0.5, 60, 42, configuration, small);
        const differs = wide.some((plane, index) => (
            plane.location.translateX !== narrow[index].location.translateX
            || plane.location.translateY !== narrow[index].location.translateY
            || plane.location.translateZ !== narrow[index].location.translateZ
        ));
        expect(differs).toBe(true);
    });

describe('computeRowLayout with mixed declared sizes', () => {
    it('advances each column by the plane before it and makes the row as tall as its tallest plane', () => {
        const configuration = configurationWith({ type: LAYOUT_TYPES.ROWS, rows: 1, gap: 50 });
        const sized = (id: string, width: number, height: number): TreePlane => ({
            ...defaultTreePlane, sourceID: id, route: '/' + id, planeID: id, show: true, width, height, sizeMode: 'declared',
        });
        const tree = computeRowLayout(
            [sized('a', 300, 200), sized('b', 500, 400), sized('c', 300, 300), sized('d', 300, 300)],
            1,
            undefined,
            50,
            configuration,
            large,
        );
        expect(tree.map((plane) => plane.location.translateX)).toEqual([0, 350, 900, 1250]);
        expect(tree.map((plane) => plane.location.translateY)).toEqual([0, 0, 0, 0]);
        // two rows of two: the second row starts after the first row's tallest plane (400) + gap
        const rows = computeRowLayout(
            [sized('a', 300, 200), sized('b', 500, 400), sized('c', 300, 300), sized('d', 300, 300)],
            2,
            undefined,
            50,
            configuration,
            large,
        );
        expect(rows.map((plane) => plane.location.translateY)).toEqual([0, 0, 450, 450]);
        expect(rows.map((plane) => plane.location.translateX)).toEqual([0, 350, 0, 350]);
    });
});

});
// #endregion module
