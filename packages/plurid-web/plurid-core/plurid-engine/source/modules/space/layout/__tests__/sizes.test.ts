// #region imports
    import {
        defaultConfiguration,
        defaultTreePlane,
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
        carryRootRuntime,
    } from '../../tree/logic';
    import {
        configuredPlaneSize,
        configuredPlaneExtent,
        fallbackPlaneSize,
    } from '../size';
    import computeColumnLayout from '../column';
    import {
        placedWidth,
        placedHeight,
    } from '../pitch';
    // #endregion imports



// #region module
describe('a configured length read from JSON (2026-10-22)', () => {
    it('a px gap given as a string is a number: the columns were placed by concatenation', () => {
        const roots = [{ ...defaultTreePlane, planeID: 'a', sourceID: 'a' }, { ...defaultTreePlane, planeID: 'b', sourceID: 'b' }] as any;
        const placed = computeColumnLayout(roots, 2, undefined, '50' as any, defaultConfiguration, { width: 1000, height: 600 });
        expect(typeof placed[1].location.translateX).toBe('number');
        expect(Number.isFinite(placed[1].location.translateX)).toBe(true);
    });
});

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
        // two columns of two: a, b in the first, c, d in the second; unmeasured → the fallback
        // height (a reading proportion of the width), never the view's 600
        expect(fresh[1].location.translateY).toBe(fresh[3].location.translateY);
        expect(fresh[1].location.translateY).toBe(fallbackPlaneSize(columns(), view).height + ROOTS_GAP);
        const measured = fresh.map((root, index) => ({ ...root, width: 400, height: [300, 200, 500, 100][index] }));
        const laid = compute(columns(), measured);
        // row 0 is as tall as its tallest plane (c: 500), then the gap
        const pitch = laid[1].location.translateY;
        expect(pitch).toBe(500 + ROOTS_GAP);
        expect(laid[3].location.translateY).toBe(pitch);
        // the placed roots keep every measurement; the PITCH was by the configured width (a measured
        // width is an observation of it, stale after a resize): the columns did not move
        expect(laid[2].height).toBe(500);
        expect(laid[0].width).toBe(400);
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
        // one rule with the store's carry (`carryRootRuntime`): a node keeps what is known of it
        expect(carryRootRuntime({ ...fresh[1], width: 123, height: 45 }, fresh[1])).toEqual({ width: 123, height: 45 });
        expect(carryRootRuntime({ ...fresh[1], width: 123, height: 45 }, { ...fresh[1], width: 700, height: 0 })).toEqual({ width: 700, height: 45 });
        expect(carryRootRuntime({ ...fresh[1], width: 123, height: 45, sizeMode: 'manual' }, { ...fresh[1], width: 700, height: 1 })).toEqual({ width: 123, height: 45 });
    });

    it('a layout pitches by the configuration where it speaks and by the measurement where it does not', () => {
        const measured = { ...compute(columns())[0], width: 400, height: 300 };
        expect(placedWidth(measured, 0)).toBe(400);
        expect(placedWidth(measured, 500)).toBe(0);
        expect(placedHeight(measured, 0)).toBe(300);
        expect(placedHeight(measured, 700)).toBe(0);
        // a declared or hand-set size is the plane's own, whatever the configuration says
        expect(placedWidth({ ...measured, sizeMode: 'declared' }, 500)).toBe(400);
        expect(placedHeight({ ...measured, sizeMode: 'manual' }, 700)).toBe(300);
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


describe('a configured dimension without a view', () => {
    it('is a fraction of the view, a length in px, or the content\'s: the rule the view resolves', () => {
        expect(configuredPlaneExtent(1)).toEqual({ fraction: 1 });
        expect(configuredPlaneExtent(0.6)).toEqual({ fraction: 0.6 });
        expect(configuredPlaneExtent(1.5)).toEqual({ fraction: 1.5 });
        expect(configuredPlaneExtent(460)).toEqual({ px: 460 });
        expect(configuredPlaneExtent(0)).toBeUndefined();
        expect(configuredPlaneExtent(undefined)).toBeUndefined();

        // one rule: what the extent states is what the size resolves to, at any view
        for (const configured of [1, 0.6, 1.5, 460, 0, undefined]) {
            const extent = configuredPlaneExtent(configured);
            const resolved = configuredPlaneSize({
                ...defaultConfiguration,
                elements: { ...defaultConfiguration.elements, plane: { ...defaultConfiguration.elements.plane, width: configured as number } },
            }, view).width;
            expect(resolved).toBe(!extent ? 0 : 'px' in extent ? extent.px : extent.fraction * view.width);
        }
    });

    it('reads a length with a decimal as px, and a fraction only up to a few views (2026-10-20)', () => {
        // Every non-integer was a fraction: 460.5 (a measured width passed on) was 460.5 views wide.
        expect(configuredPlaneExtent(460.5)).toEqual({ px: 460.5 });
        expect(configuredPlaneExtent(2.5)).toEqual({ fraction: 2.5 });

        const layout = (configured: Partial<PluridConfiguration['elements']['plane']>, gap?: number) => computeColumnLayout(
            [
                { ...defaultTreePlane, sourceID: 'a', route: '/a', planeID: 'a', show: true },
                { ...defaultTreePlane, sourceID: 'b', route: '/b', planeID: 'b', show: true },
            ],
            2,
            undefined,
            gap,
            {
                ...defaultConfiguration,
                elements: { ...defaultConfiguration.elements, plane: { ...defaultConfiguration.elements.plane, ...configured } },
            },
            view,
        );
        const [first, second] = layout({ width: 460.5 });
        expect(second.location.translateX - first.location.translateX).toBeLessThan(1000);
        // a gap in px with a decimal is px too, not that many plane widths
        const [left, right] = layout({ width: 400 }, 12.5);
        expect(right.location.translateX - left.location.translateX).toBe(412.5);
    });
});
// #endregion module
