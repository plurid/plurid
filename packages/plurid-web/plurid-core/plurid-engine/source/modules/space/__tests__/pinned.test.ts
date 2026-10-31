// #region imports
    import {
        defaultConfiguration,
        TreePlane,
    } from '@plurid/plurid-data';

    import {
        Registrar,
    } from '../../planes/registrar';
    import {
        computeSpaceTree,
        reconcileTree,
    } from '../tree/logic';
    import {
        resolvePinnedRect,
        freePinnedRect,
        collapsedSlots,
        pinnedRectOf,
        PINNED_MARGIN,
        PINNED_COLLAPSED_HEIGHT,
    } from '../pinned';
    // #endregion imports



// #region module
const view = { width: 1440, height: 840 };
const component = () => null;
const planes = () => new Registrar<any>([
    { route: '/a', component },
    { route: '/b', component },
    { route: '/c', component },
    { route: '/d', component },
]).getAll();

const build = (
    routes: string[],
    previousTree?: TreePlane[],
) => {
    let count = 0;
    return computeSpaceTree(planes(), routes, defaultConfiguration, true, 'origin', () => { count += 1; return count; }, view, previousTree);
};

const at = (tree: TreePlane[], route: string) => tree.find((plane) => plane.route.endsWith(route))!;


describe('the pinned layer\'s geometry', () => {
    it('reads a rect in px or in fractions, from any corner', () => {
        expect(resolvePinnedRect({ x: 20, y: 30, width: 400, height: 300 }, view)).toEqual({ left: 20, top: 30, width: 400, height: 300 });
        expect(resolvePinnedRect({ x: 20, y: 30, width: 400, height: 300, anchor: 'bottom-right' }, view)).toEqual({ left: 1440 - 20 - 400, top: 840 - 30 - 300, width: 400, height: 300 });
        expect(resolvePinnedRect({ x: 0.1, y: 0.25, width: 0.5, height: 0.5, unit: 'fraction', anchor: 'top-right' }, view)).toEqual({ left: 1440 - 144 - 720, top: 210, width: 720, height: 420 });
        expect(resolvePinnedRect({ x: Number.NaN, y: 0, width: -5, height: 10 } as any, view)).toEqual({ left: 0, top: 0, width: 0, height: 10 });
        expect(pinnedRectOf({ left: 1, top: 2, width: 3, height: 4 })).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it('finds a free slot along the right edge, then in the columns to its left, and cascades when every column is full', () => {
        const first = resolvePinnedRect(freePinnedRect(view, []), view);
        expect(first.left + first.width).toBe(view.width - PINNED_MARGIN);
        expect(first.top).toBe(PINNED_MARGIN);
        expect(first.width).toBe(480);

        const small = { width: 360, height: 300 };
        const one = resolvePinnedRect(freePinnedRect(view, [], small), view);
        const two = resolvePinnedRect(freePinnedRect(view, [one], small), view);
        expect(two.top).toBeGreaterThanOrEqual(one.top + one.height);
        expect(two.left).toBe(one.left);

        // the right column full: the column to its left
        const next = resolvePinnedRect(freePinnedRect(view, [first, { ...first, top: 400 }]), view);
        expect(next.left + next.width).toBeLessThanOrEqual(first.left);
        expect(next.top).toBe(PINNED_MARGIN);
        // every column full: a cascade, inside the view
        const columns = [0, 1, 2].map((index) => ({ ...first, left: first.left - index * (first.width + PINNED_MARGIN) }));
        const full = resolvePinnedRect(freePinnedRect(view, columns), view);
        expect(full.left).toBeGreaterThanOrEqual(PINNED_MARGIN);
        expect(full.top + full.height).toBeLessThanOrEqual(view.height - PINNED_MARGIN);
        expect(full.left).toBeLessThan(first.left);
    });

    it('lines collapsed bars up along the bottom edge from the right, none over another', () => {
        const slots = collapsedSlots(['a', 'b', 'c', 'd', 'e', 'f'], view);
        const rects = Object.values(slots);
        expect(slots.a.top).toBe(view.height - PINNED_MARGIN - PINNED_COLLAPSED_HEIGHT);
        expect(slots.a.left + slots.a.width).toBe(view.width - PINNED_MARGIN);
        for (const [index, a] of rects.entries()) {
            for (const b of rects.slice(index + 1)) {
                const apart = a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top;
                expect(apart).toBe(true);
            }
        }
    });
});


describe('a pinned or free root is not in the layout', () => {
    it('LIFTING A ROOT MOVES NO OTHER: the others stand where they would without it, and it keeps its place', () => {
        const without = build(['/b', '/c', '/d']);
        const first = build(['/a', '/b', '/c', '/d']);
        const lifted = first.map((plane) => (plane.route.endsWith('/a')
            ? { ...plane, pinned: { rect: { x: 10, y: 10, width: 300, height: 200 }, order: 1 } }
            : plane));
        const again = build(['/a', '/b', '/c', '/d'], lifted);
        for (const route of ['/b', '/c', '/d']) {
            expect(at(again, route).location).toEqual(at(without, route).location);
        }
        expect(at(again, '/a').pinned).toEqual({ rect: { x: 10, y: 10, width: 300, height: 200 }, order: 1 });
        expect(at(again, '/a').location).toEqual(at(first, '/a').location);
    });

    it('a free root keeps its own placement and its manual size, and takes no slot', () => {
        const without = build(['/a', '/b', '/c']);
        const placed = { translateX: 5000, translateY: -400, translateZ: 300, rotateX: 0, rotateY: 30 };
        const previous = [...build(['/a', '/b', '/c']), {
            ...build(['/d'])[0],
            free: true,
            manuallyPositioned: true,
            sizeMode: 'manual' as const,
            width: 420,
            height: 360,
            location: placed,
        }];
        const again = build(['/a', '/b', '/c', '/d'], previous);
        for (const route of ['/a', '/b', '/c']) {
            expect(at(again, route).location).toEqual(at(without, route).location);
        }
        expect(at(again, '/d')).toMatchObject({ free: true, manuallyPositioned: true, location: placed, width: 420, height: 360 });
    });

    it('A PINNED DUPLICATE KEEPS ITS PIN: the second root at a path is the second one, not the first', () => {
        const first = build(['/a', '/b']);
        const pin = { rect: { x: 1, y: 2, width: 300, height: 200 }, order: 1 };
        const opened = { ...build(['/b'])[0], planeID: 'pinned-b', pinned: pin };
        const again = build(['/a', '/b', '/b'], [...first, opened]);
        expect(again[1].pinned).toBeUndefined();
        expect(again[1].location).toEqual(first[1].location);
        expect(again[2].pinned).toEqual(pin);
        expect(again[0].location).toEqual(first[0].location);
    });

    it('the reconcile carries a pin and a free placement through a relayout\'s fresh nodes', () => {
        const previous = build(['/a', '/b']);
        const pinned = { rect: { x: 1, y: 2, width: 3, height: 4 }, order: 2 };
        const withPin = previous.map((plane, index) => (index === 0 ? { ...plane, pinned, free: true } : plane));
        const reconciled = reconcileTree(withPin, build(['/a', '/b']));
        expect(reconciled[0].pinned).toBe(pinned);
        expect(reconciled[0].free).toBe(true);
        expect(reconciled[1]).toBe(withPin[1]);
    });
});
// #endregion module
