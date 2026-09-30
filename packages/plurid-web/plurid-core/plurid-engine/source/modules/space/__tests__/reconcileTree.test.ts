// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,
        defaultConfiguration,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        logic,
        Tree,
    } from '../tree';
    import {
        Registrar,
    } from '../../planes/registrar';
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

    it('compares the spawn geometry: link coordinates, the bridge side / offset and the spawning link survive an equal-route reconcile', () => {
        const spawned = (y: number, side: 'start' | 'end', offset: number, link: string): TreePlane => ({ ...makePlane('c', 500), parentPlaneID: 'p', linkCoordinates: { x: 100, y }, bridgeSide: side, bridgeOffset: offset, spawnedByLinkID: link });
        const previous: TreePlane[] = [makePlane('p', 0, [spawned(20, 'start', -15, 'l1')])];
        const result = logic.reconcileTree(previous, [makePlane('p', 0, [spawned(60, 'end', 41, 'l2')])]);
        expect(result[0].children![0]).toMatchObject({ linkCoordinates: { x: 100, y: 60 }, bridgeSide: 'end', bridgeOffset: 41, spawnedByLinkID: 'l2' });
        expect(result[0].children![0]).not.toBe(previous[0].children![0]);
        // equal geometry keeps the reference
        const same = logic.reconcileTree(previous, [makePlane('p', 0, [spawned(20, 'start', -15, 'l1')])]);
        expect(same[0].children![0]).toBe(previous[0].children![0]);
    });

    /**
     * THE QUERY IS A CHANGE (audit 2026-09-29 #7): a plane's route is its pathname's, so a new query
     * (or parameters, or fragment) changes only `routeDivisions` — and a node whose only change was
     * there, or in `bridgeKind` / `bridgeAnchor`, came back as the STALE previous node: the plane
     * kept receiving the old query.
     */
    it('compares every own field by value: the query, the fragment, the bridge kind and anchor', () => {
        const component = () => null;
        const planes = new Registrar<any>([{ route: '/search', component }], 'host').getAll();
        const treeOf = (route: string) => new Tree<any>({ planes, view: [route], configuration: defaultConfiguration }, 'host').compute();

        const a = treeOf('/search?q=a');
        const b = treeOf('/search?q=b');
        expect(b[0].planeID).toBe(a[0].planeID);
        const reconciled = logic.reconcileTree(a, b);
        expect(reconciled).not.toBe(a);
        expect(reconciled[0].routeDivisions.plane.query).toEqual({ q: 'b' });

        // a fresh node with the same leaves is the same: structural sharing holds
        expect(logic.reconcileTree(a, treeOf('/search?q=a'))).toBe(a);

        const withFragment = logic.reconcileTree(a, treeOf('/search?q=a#:~:text=found'));
        expect(withFragment[0].routeDivisions.plane.fragments.texts[0].start).toBe('found');

        const child = (kind: 'strip' | 'leash', anchor: 'link' | 'edge'): TreePlane => ({ ...makePlane('c', 500), parentPlaneID: 'p', linkCoordinates: { x: 1, y: 1 }, bridgeKind: kind, bridgeAnchor: anchor });
        const previous: TreePlane[] = [makePlane('p', 0, [child('strip', 'link')])];
        const next = logic.reconcileTree(previous, [makePlane('p', 0, [child('leash', 'edge')])]);
        expect(next[0].children![0]).toMatchObject({ bridgeKind: 'leash', bridgeAnchor: 'edge' });
        // a field the list never named is compared too
        const extra = logic.reconcileTree(previous, [makePlane('p', 0, [{ ...child('strip', 'link'), host: 'field' } as TreePlane])]);
        expect(extra[0].children![0]).not.toBe(previous[0].children![0]);
    });
});
// #endregion module
