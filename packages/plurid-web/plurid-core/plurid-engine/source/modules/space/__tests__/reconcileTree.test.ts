// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        logic,
    } from '../tree';
    // #endregion external
// #endregion imports



// #region module
const makePlane = (
    id: string,
    translateX: number,
    children?: TreePlane[],
): TreePlane => ({
    ...defaultTreePlane,
    sourceID: id,
    planeID: id,
    route: '/' + id,
    show: true,
    width: 160,
    height: 100,
    location: {
        ...defaultTreePlane.location,
        translateX,
    },
    children,
});


describe('reconcileTree (structural sharing)', () => {
    it('reuses the references of unchanged siblings', () => {
        const previous: TreePlane[] = [
            makePlane('geo', 0),
            makePlane('xf', 800),
            makePlane('mat', 1600),
        ];

        // A producer (e.g. a layout recompute) rebuilds the WHOLE tree from scratch: every node is
        // a fresh object, and `geo` additionally gains a child. `width`/`height` come back as 0
        // because the recompute cannot know the measured pixel size.
        const next: TreePlane[] = [
            { ...makePlane('geo', 0, [makePlane('geo-detail', 0)]), width: 0, height: 0 },
            { ...makePlane('xf', 800), width: 0, height: 0 },
            { ...makePlane('mat', 1600), width: 0, height: 0 },
        ];

        const result = logic.reconcileTree(previous, next);

        // The changed node is NOT reused; its new child is present.
        expect(result[0]).not.toBe(previous[0]);
        expect(result[0].children?.[0].planeID).toBe('geo-detail');

        // The unchanged siblings keep their PREVIOUS references.
        expect(result[1]).toBe(previous[1]);
        expect(result[2]).toBe(previous[2]);
    });

    it('carries forward a measured dimension when the incoming one is 0', () => {
        const previous: TreePlane[] = [makePlane('a', 0)]; // width/height measured: 160/100
        const next: TreePlane[] = [{ ...makePlane('a', 0), width: 0, height: 0 }];

        const result = logic.reconcileTree(previous, next);

        // `a` is otherwise identical, so it is reused wholesale — and the measurement survives.
        expect(result[0]).toBe(previous[0]);
        expect(result[0].width).toBe(160);
        expect(result[0].height).toBe(100);
    });

    it('keeps the array reference when nothing changed', () => {
        const previous: TreePlane[] = [makePlane('a', 0), makePlane('b', 800)];
        const next: TreePlane[] = [{ ...makePlane('a', 0) }, { ...makePlane('b', 800) }];

        const result = logic.reconcileTree(previous, next);

        expect(result).toBe(previous);
    });

    it('uses the new node when a plane actually moved', () => {
        const previous: TreePlane[] = [makePlane('a', 0)];
        const next: TreePlane[] = [makePlane('a', 500)]; // translateX changed → real move

        const result = logic.reconcileTree(previous, next);

        expect(result[0]).not.toBe(previous[0]);
        expect(result[0].location.translateX).toBe(500);
    });

    it('returns the next tree as-is when there is no previous tree', () => {
        const next: TreePlane[] = [makePlane('a', 0)];

        expect(logic.reconcileTree(undefined, next)).toBe(next);
    });
});
// #endregion module
