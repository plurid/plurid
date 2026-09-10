import {
    createInspector,
    recordRender,
    buildInspection,
} from '..';
import actions from '~services/state/actions';
import {
    makeSpaceStore,
    configurationWith,
    treePlane,
} from '../../../../testing';



describe('the diagnostic surface', () => {
    it('records renders only while enabled; the inspection carries the planes, their parentage, the culling and the counts', () => {
        const inspector = createInspector();
        recordRender(inspector, 'a');
        expect(inspector.renders.size).toBe(0);
        inspector.enabled = true;
        recordRender(inspector, 'a');
        recordRender(inspector, 'a');
        recordRender(undefined, 'a');
        expect(inspector.renders.get('a')).toBe(2);

        const child = treePlane('c', { parentPlaneID: 'a', spawnedByLinkID: 'l1' });
        const store = makeSpaceStore(
            configurationWith({ space: { culling: { enabled: true } } }),
            [treePlane('a', { children: [child] }), treePlane('b'), treePlane('hidden', { show: false })],
        );
        store.dispatch(actions.space.setCulled({ hidden: ['b'], frozen: [], detached: ['b'] }));
        inspector.gesture = 'orbit';
        inspector.dispatches = 7;
        const inspection = buildInspection(store.getState(), inspector);
        expect(inspection.inspector).toBe(true);
        expect(inspection.gesture).toBe('orbit');
        expect(inspection.counts).toMatchObject({ dispatches: 7, renders: 2, shown: 3, mounted: 2, hidden: 1, detached: 1 });
        expect(inspection.planes.map((plane) => plane.planeID)).toEqual(['a', 'c', 'b']);
        expect(inspection.planes[1]).toMatchObject({ parentPlaneID: 'a', spawnedByLinkID: 'l1', renders: 0 });
        expect(inspection.planes[2].culled).toBe('detached');
        expect(inspection.planes[0].renders).toBe(2);
        // a plain object: editing it never touches the store
        inspection.planes[0].location.translateX = 999;
        expect(store.getState().space.tree[0].location.translateX).not.toBe(999);
        // without a registry: silent counters, everything else the same
        const quiet = buildInspection(store.getState(), undefined);
        expect(quiet.inspector).toBe(false);
        expect(quiet.counts.dispatches).toBe(0);
        expect(quiet.gesture).toBeNull();
    });
});
