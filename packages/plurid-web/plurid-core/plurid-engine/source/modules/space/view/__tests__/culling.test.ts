// #region imports
    // #region external
    import {
        identityCamera,
        applyCameraDelta,
    } from '../../../interaction/camera';

    import {
        cullPlanes,
        sameCulling,
        CullingPlane,
        CullPassResult,
        EMPTY_CULLING,
        resolveDetachOptions,
        resolveDetached,
    } from '../culling';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };

const plane = (
    id: string,
    x: number,
    y = 0,
    z = 0,
): CullingPlane => ({
    id,
    width: 200,
    height: 150,
    location: {
        translateX: x,
        translateY: y,
        translateZ: z,
        rotateX: 0,
        rotateY: 0,
    },
});


describe('cullPlanes()', () => {
    it('hides planes fully outside the frustum margin and behind the eye, keeps the rest', () => {
        const camera = identityCamera(view);
        const planes = [
            plane('in', 400, 200),
            plane('farRight', 2000, 200),
            plane('edge', 1100, 200),
            plane('behind', 400, 200, 2500),
        ];
        const result = cullPlanes(planes, camera, view, { frustumMargin: 0.25 });
        expect(result.hidden).toEqual(['farRight', 'behind']);
        expect(result.frozen).toEqual([]);
        expect(result.depths.in).toBeCloseTo(camera.perspective, 6);
    });

    it('hides by distance and freezes beyond the freeze distance, exceptions win', () => {
        let camera = identityCamera(view);
        camera = applyCameraDelta(camera, { zoom: { factor: 0.2 } }, view);
        // zoomed out ×0.2: depths (from the eye) near 2000, far 2800, farther 3800
        const planes = [plane('near', 400, 200, 0), plane('far', 400, 200, -4000), plane('farther', 400, 200, -9000)];
        const result = cullPlanes(planes, camera, view, { distance: 3500, freezeDistance: 2500, hysteresis: 0 });
        expect(result.hidden).toEqual(['farther']);
        expect(result.frozen).toEqual(['far']);
        const spared = cullPlanes(planes, camera, view, { distance: 3500, freezeDistance: 2500, hysteresis: 0 }, EMPTY_CULLING, new Set(['farther', 'far']));
        expect(spared.hidden).toEqual([]);
        expect(spared.frozen).toEqual([]);
    });

    it('hysteresis: a plane jittering on the distance boundary never flickers', () => {
        const camera = identityCamera(view);
        let previous: CullPassResult = EMPTY_CULLING;
        const states: boolean[] = [];
        for (let frame = 0; frame < 20; frame += 1) {
            // depth oscillates ±60 around the 1500 threshold (z negative = farther from the eye)
            const z = -(1500 - camera.perspective) - (frame % 2 === 0 ? 60 : -60);
            const result = cullPlanes([plane('p', 400, 200, z)], camera, view, { distance: 1500, hysteresis: 0.15 }, previous);
            states.push(result.hidden.includes('p'));
            previous = result;
        }
        expect(new Set(states).size).toBe(1);
    });

    it('sameCulling compares the three lists, never the depths', () => {
        expect(sameCulling({ hidden: ['a'], frozen: [], detached: [], depths: {} }, { hidden: ['a'], frozen: [], detached: [], depths: { a: 1 } })).toBe(true);
        expect(sameCulling({ hidden: ['a'], frozen: [], detached: [], depths: {} }, { hidden: ['b'], frozen: [], detached: [], depths: {} })).toBe(false);
        expect(sameCulling({ hidden: ['a'], frozen: [], detached: [], depths: {} }, { hidden: ['a'], frozen: [], detached: ['a'], depths: {} })).toBe(false);
        expect(sameCulling({ hidden: ['a'], frozen: ['b'], detached: [], depths: {} }, { hidden: ['a'], frozen: [], detached: [], depths: {} })).toBe(false);
    });
});


describe('the detach tier: resolveDetached', () => {
    const base = (extra: Partial<Parameters<typeof resolveDetached>[0]> = {}) => resolveDetached({
        hidden: ['a', 'b', 'c'],
        depths: { a: 1000, b: 5000, c: 9000 },
        childrenOf: new Map(),
        previous: [],
        hiddenSince: new Map(),
        now: 10_000,
        exceptions: new Set(),
        gate: false,
        options: { mode: 'unmount', delay: 1000, distance: 0, max: Infinity },
        ...extra,
    });

    it('resolves the knob: off without the pass or a mode; the string and the object forms', () => {
        expect(resolveDetachOptions(undefined).mode).toBe('off');
        expect(resolveDetachOptions({ enabled: false, detach: 'unmount' }).mode).toBe('off');
        expect(resolveDetachOptions({ enabled: true }).mode).toBe('off');
        expect(resolveDetachOptions({ enabled: true, detach: 'retain' })).toEqual({ mode: 'retain', delay: 1000, distance: 0, max: Infinity });
        expect(resolveDetachOptions({ enabled: true, detach: { mode: 'unmount', delay: 0, distance: 4000, max: 20 } })).toEqual({ mode: 'unmount', delay: 0, distance: 4000, max: 20 });
        // a negative number is clamped like its siblings
        expect(resolveDetachOptions({ enabled: true, detach: { mode: 'unmount', delay: -1, distance: -1, max: -1 } })).toEqual({ mode: 'unmount', delay: 0, distance: 0, max: 0 });
    });

    it('a plane matures after the delay; the clock starts when it becomes hidden; nextDue names the earliest', () => {
        const first = base();
        expect(first.detached).toEqual([]);
        expect(first.nextDue).toBe(11_000);
        expect([...first.hiddenSince.keys()]).toEqual(['a', 'b', 'c']);
        const later = base({ hiddenSince: first.hiddenSince, now: 11_000 });
        expect(later.detached).toEqual(['a', 'b', 'c']);
        expect(later.nextDue).toBeNull();
        // a plane no longer hidden leaves the clock and re-attaches; the others stay detached
        const shown = base({ hidden: ['b', 'c'], hiddenSince: later.hiddenSince, previous: later.detached, now: 11_050 });
        expect(shown.detached).toEqual(['b', 'c']);
        expect(shown.hiddenSince.has('a')).toBe(false);
    });

    it('distance, exceptions and the children rule keep a plane attached', () => {
        const far = base({ now: 20_000, hiddenSince: new Map([['a', 0], ['b', 0], ['c', 0]]), options: { mode: 'unmount', delay: 0, distance: 4000, max: Infinity } });
        expect(far.detached).toEqual(['b', 'c']);
        const except = base({ now: 20_000, hiddenSince: new Map([['a', 0], ['b', 0], ['c', 0]]), exceptions: new Set(['b']) });
        expect(except.detached).toEqual(['a', 'c']);
        // `a` has a shown child `d` that is NOT hidden: `a` keeps its content (the leash)
        const children = base({ now: 20_000, hiddenSince: new Map([['a', 0], ['b', 0], ['c', 0]]), childrenOf: new Map([['a', ['d']], ['b', ['c']]]) });
        expect(children.detached).toEqual(['b', 'c']);
    });

    it('the gate stops new detaches but never re-attaching; the budget detaches the farthest at once', () => {
        const gated = base({ now: 20_000, hiddenSince: new Map([['a', 0], ['b', 0], ['c', 0]]), previous: ['c'], gate: true });
        expect(gated.detached).toEqual(['c']);
        const reattached = base({ hidden: ['a'], previous: ['c'], gate: true });
        expect(reattached.detached).toEqual([]);
        const budget = base({ options: { mode: 'retain', delay: 1000, distance: 0, max: 1 } });
        // nothing mature yet, but only one hidden plane may stay mounted: the two farthest go
        expect(budget.detached).toEqual(['b', 'c']);
        // an exception counts against the budget (it is mounted) but is never the one detached
        const counted = base({ exceptions: new Set(['a']), options: { mode: 'retain', delay: 1000, distance: 0, max: 2 } });
        expect(counted.detached).toEqual(['c']);
        const off = base({ now: 20_000, hiddenSince: new Map([['a', 0]]), options: { mode: 'off', delay: 0, distance: 0, max: Infinity } });
        expect(off.detached).toEqual([]);
    });
});

