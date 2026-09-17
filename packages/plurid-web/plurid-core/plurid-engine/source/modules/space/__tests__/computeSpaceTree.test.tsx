// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        TreePlane,
        defaultConfiguration,
        LAYOUT_TYPES,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        Registrar,
    } from '../../planes/registrar';

    import {
        logic,
    } from '../tree';
    import * as layout from '../layout';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE SPACE TREE: the view (a list of routes) becomes the tree the space renders. This file used to
 * build a whole expected tree and then assert `true` with the real comparison commented out
 * (2026-09-13) — the engine's central layout call had no live test at all. What follows asserts the
 * contract instead of a shape frozen in 2021: what the view resolves to, where a layout puts it, and
 * what carries across a recompute.
 */
const component = () => null;

const registry = (
    routes: string[],
) => new Registrar<any>(routes.map((route) => ({ route, component }))).getAll();

const view = ['/a', '/b', '/c'];
const viewSize = { width: 1200, height: 800 };

/** A counter, so every plane id in a run is distinct and predictable. */
const counter = () => {
    let count = 0;
    return () => {
        count += 1;
        return count;
    };
};

/**
 * A plane is as wide as the view by default (`elements.plane.width: 1`), so "three columns" of
 * default planes stack in ONE column — the layout is honest about the size it was given. These
 * fixtures declare a narrow plane, so the columns are columns.
 */
const columns = (
    count: number,
    planeWidth = 300,
): PluridConfiguration => ({
    ...defaultConfiguration,
    elements: {
        ...defaultConfiguration.elements,
        plane: {
            ...defaultConfiguration.elements.plane,
            width: planeWidth,
        },
    },
    space: {
        ...defaultConfiguration.space,
        layout: {
            type: LAYOUT_TYPES.COLUMNS,
            columns: count,
            // no `columnLength`: it WINS over `columns` when set, and the derived length
            // (`ceil(roots / columns)`) is what an ordinary host gets
            gap: 40,
        } as PluridConfiguration['space']['layout'],
    },
});

const compute = (
    configuration: PluridConfiguration,
    layout: boolean,
    previous?: TreePlane[],
    routes = view,
) => logic.computeSpaceTree(
    registry(['/a', '/b', '/c']),
    routes,
    configuration,
    layout,
    'origin',
    counter(),
    viewSize,
    previous,
);


describe('computeSpaceTree', () => {
    it('resolves every registered route of the view, in order, and skips what it does not know', () => {
        const tree = compute(defaultConfiguration, false);
        expect(tree).toHaveLength(3);
        expect(tree.map((plane) => plane.route.replace(/^plurid:\/\/[^/]+/, ''))).toEqual(['/a', '/b', '/c']);
        // every plane id is distinct (the counter's suffix) and carries its own source
        expect(new Set(tree.map((plane) => plane.planeID)).size).toBe(3);
        for (const plane of tree) {
            expect(plane.planeID.startsWith(plane.sourceID + '@')).toBe(true);
            expect(plane.show).toBe(true);
        }

        // a route nobody registered is not a plane
        const partial = compute(defaultConfiguration, false, undefined, ['/a', '/nowhere', '/c']);
        expect(partial.map((plane) => plane.route.replace(/^plurid:\/\/[^/]+/, ''))).toEqual(['/a', '/c']);
        expect(compute(defaultConfiguration, false, undefined, [])).toEqual([]);
    });

    it('WITHOUT a layout every plane sits at the origin (the boot tree is layout-less)', () => {
        const tree = compute(defaultConfiguration, false);
        for (const plane of tree) {
            expect(plane.location).toEqual({
                rotateX: 0,
                rotateY: 0,
                translateX: 0,
                translateY: 0,
                translateZ: 0,
            });
        }
    });

    it('A SIZE IS AN OBSERVATION: an undeclared plane enters the tree at 0 and is PLACED by the configured size', () => {
        const configuration = columns(3);
        const tree = compute(configuration, true);
        expect(tree).toHaveLength(3);

        // the node carries no size it was never told and never measured
        for (const plane of tree) {
            expect(plane.width).toBe(0);
            expect(plane.height).toBe(0);
        }

        // ...and the layout still separates them, by the configured plane size plus the gap
        const fallback = layout.configuredPlaneSize(configuration, viewSize);
        expect(fallback.width).toBeGreaterThan(0);
        const xs = tree.map((plane) => plane.location.translateX);
        expect(new Set(xs).size).toBe(3);
        expect([...xs].sort((a, b) => a - b)).toEqual(xs);
        for (let index = 1; index < xs.length; index += 1) {
            expect(xs[index] - xs[index - 1]).toBeGreaterThanOrEqual(fallback.width);
        }
    });

    it('one column stacks them: the same x, increasing y, a plane apart', () => {
        const configuration = columns(1);
        const tree = compute(configuration, true);
        const fallback = layout.configuredPlaneSize(configuration, viewSize);

        const xs = tree.map((plane) => plane.location.translateX);
        expect(new Set(xs).size).toBe(1);

        const ys = tree.map((plane) => plane.location.translateY);
        expect([...ys].sort((a, b) => a - b)).toEqual(ys);
        for (let index = 1; index < ys.length; index += 1) {
            const apart = ys[index] - ys[index - 1];
            expect(apart).toBeGreaterThanOrEqual(Math.max(1, fallback.height));
        }
    });

    it('a rows layout lays them the other way: one y, increasing x', () => {
        const rows: PluridConfiguration = {
            ...columns(1),
            space: {
                ...defaultConfiguration.space,
                layout: {
                    type: LAYOUT_TYPES.ROWS,
                    rows: 1,
                    gap: 40,
                } as PluridConfiguration['space']['layout'],
            },
        };
        const tree = compute(rows, true);
        expect(new Set(tree.map((plane) => plane.location.translateY)).size).toBe(1);
        const xs = tree.map((plane) => plane.location.translateX);
        expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    });

    it('THE SIZING CONTRACT: a measured HEIGHT carries into the next tree and the planes below make room for it', () => {
        const before = compute(columns(1), true);
        const measured = before.map((plane, index) => (index === 0
            ? { ...plane, height: 620, width: 400 }
            : plane));

        const after = compute(columns(1), true, measured);
        // the measured height is the node's; the ones nobody measured stay at 0
        expect(after[0].height).toBe(620);
        expect(after[1].height).toBe(0);
        // the plane below made room for exactly that height (plus the layout's gap)
        expect(after[1].location.translateY).toBeGreaterThanOrEqual(after[0].location.translateY + 620);
        expect(after[1].location.translateY).toBeLessThan(after[0].location.translateY + 620 + 200);

        // the measured width is the node's too (one carry rule); the LAYOUT pitched by the configured
        // width, so a stale observation never freezes the next grid
        expect(after[0].width).toBe(400);
    });
});
// #endregion module
