// #region imports
    import {
        defaultConfiguration,
        LAYOUT_TYPES,
        PluridConfiguration,
        ROOTS_GAP,
    } from '@plurid/plurid-data';

    import {
        Registrar,
    } from '../../../planes/registrar';
    import Tree from '../../tree/object';
    import {
        applyKnownSizes,
    } from '../../tree/logic';
    // #endregion imports



// #region module
const component = () => null;
const view = { width: 1000, height: 600 };
const registrar = () => new Registrar<any>([
    { route: '/a', component },
    { route: '/b', component },
    { route: '/c', component },
    { route: '/d', component },
    { route: '/declared', component, width: 200, height: 150 },
]);
const columns = (extra: Partial<PluridConfiguration['space']['layout']> = {}): PluridConfiguration => ({
    ...defaultConfiguration,
    space: { ...defaultConfiguration.space, layout: { ...defaultConfiguration.space.layout, type: LAYOUT_TYPES.COLUMNS, columns: 2, ...extra } as any },
});
const compute = (configuration: PluridConfiguration, previousTree?: any[]) => new Tree<any>({
    planes: registrar().getAll(),
    configuration,
    view: ['/a', '/b', '/c', '/d'],
    layout: true,
    viewSize: view,
    previousTree,
}).compute();

describe('THE SIZING CONTRACT: the roots are placed by their known sizes', () => {
    it('measured heights from the previous tree set the row pitch; without them the fallback does', () => {
        const fresh = compute(columns());
        // two columns of two: a, b in the first, c, d in the second; unmeasured → the view height
        expect(fresh[1].location.translateY).toBe(fresh[3].location.translateY);
        const measured = fresh.map((root, index) => ({ ...root, width: 400, height: [300, 200, 500, 100][index] }));
        const laid = compute(columns(), measured);
        // row 0 is as tall as its tallest plane (c: 500), then the gap
        const pitch = laid[1].location.translateY;
        expect(pitch).toBe(500 + ROOTS_GAP);
        expect(laid[3].location.translateY).toBe(pitch);
        // the placed roots carry the content-driven heights they were placed by; the width is the
        // configured one (a measured width is an observation of it, stale after a resize)
        expect(laid[2].height).toBe(500);
        expect(laid[0].width).toBe(0);
        expect(laid[0].location.translateX).toBe(fresh[0].location.translateX);
        expect(laid[2].location.translateX).toBe(fresh[2].location.translateX);
    });

    it('a declared dimension is never overridden by a measurement; a hand-set size wins', () => {
        const declared = new Tree<any>({ planes: registrar().getAll(), configuration: columns(), view: ['/declared', '/a'], layout: true, viewSize: view }).compute();
        const previous = [{ ...declared[0], width: 999, height: 999 }, { ...declared[1], width: 300, height: 450, sizeMode: 'manual' as const }];
        const next = new Tree<any>({ planes: registrar().getAll(), configuration: columns(), view: ['/declared', '/a'], layout: true, viewSize: view, previousTree: previous }).compute();
        expect(next[0]).toMatchObject({ width: 200, height: 150 });
        expect(next[1]).toMatchObject({ width: 300, height: 450 });
        // contested: a hand-set size over a fresh declaration — the hand wins
        const contested = [{ ...declared[0], width: 640, height: 480, sizeMode: 'manual' as const }];
        const hand = new Tree<any>({ planes: registrar().getAll(), configuration: columns(), view: ['/declared'], layout: true, viewSize: view, previousTree: contested }).compute();
        expect(hand[0]).toMatchObject({ width: 640, height: 480 });
    });

    it('applyKnownSizes matches by identity in order and returns the same root when nothing is known', () => {
        const fresh = compute(columns());
        expect(applyKnownSizes(fresh, undefined)).toBe(fresh);
        const same = applyKnownSizes(fresh, [{ ...fresh[0], width: 0, height: 0 }]);
        expect(same[0]).toBe(fresh[0]);
        const sized = applyKnownSizes(fresh, [{ ...fresh[1], width: 123, height: 45 }]);
        expect(sized[0]).toBe(fresh[0]);
        // the previous `b` matches `b`, not `a`; nothing configured: both dimensions are the content's
        expect(sized[1]).toMatchObject({ width: 123, height: 45 });
        // a configured height makes the measured one an observation: not copied
        const configured = applyKnownSizes(fresh, [{ ...fresh[1], width: 123, height: 45 }], { width: 300, height: 200 });
        expect(configured[1]).toBe(fresh[1]);
    });

    it('sheaves ignore the sizes by design', () => {
        const sheaves = (): PluridConfiguration => ({
            ...defaultConfiguration,
            space: { ...defaultConfiguration.space, layout: { ...defaultConfiguration.space.layout, type: LAYOUT_TYPES.SHEAVES } as any },
        });
        const fresh = compute(sheaves());
        const laid = compute(sheaves(), fresh.map((root) => ({ ...root, width: 400, height: 900 })));
        expect(laid.map((root) => root.location)).toEqual(fresh.map((root) => root.location));
    });
});
// #endregion module
