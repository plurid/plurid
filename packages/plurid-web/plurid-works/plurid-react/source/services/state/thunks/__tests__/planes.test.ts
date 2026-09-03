// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        reducer,
        actions,
    } from '~services/state/modules/space';

    import {
        toggleLinkPlane,
        closePlane,
        openLastClosed,
    } from '../planes';
    // #endregion external
// #endregion imports



// #region module
const plane = (
    planeID: string,
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: {
        translateX: 100,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
});

const registry = new Map<string, any>([
    ['/detail', {
        route: { absolute: '/detail', value: '/detail', fragments: { elements: [], texts: [] }, parameters: {}, query: {} },
        component: () => null,
    }],
]);


/** A minimal store: the space reducer under `state.space`, thunk-aware dispatch. */
const makeStore = () => {
    let space = reducer(reducer(undefined, { type: '@@init' }), actions.setViewSize({ width: 1000, height: 600 }));
    space = reducer(space, actions.restoreArrangement({ tree: [plane('a')], links: [] }));
    const getState = () => ({ space, configuration: defaultConfiguration } as any);
    const dispatched: any[] = [];
    const dispatch: any = (action: any) => {
        if (typeof action === 'function') {
            return action(dispatch, getState);
        }
        dispatched.push(action);
        space = reducer(space, action);
        return action;
    };
    return { dispatch, getState, dispatched, tree: () => space.tree, state: () => space };
};

const parameters = (overrides: Partial<Parameters<typeof toggleLinkPlane>[0]> = {}) => ({
    parentPlaneID: 'a',
    linkID: 'a#/detail#0',
    route: '/detail',
    linkCoordinates: { x: 300, y: 40 },
    planesRegistry: registry,
    navigate: false,
    ...overrides,
});


describe('toggleLinkPlane()', () => {
    it('spawns once, then toggles the SAME plane by the link id', () => {
        const store = makeStore();

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        const spawned = store.tree()[0].children![0];
        expect(spawned.spawnedByLinkID).toBe('a#/detail#0');
        expect(spawned.show).toBe(true);
        expect(spawned.location.translateX).toBeCloseTo(400, 9);

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        expect(store.tree()[0].children).toHaveLength(1);
        expect(store.tree()[0].children![0].planeID).toBe(spawned.planeID);
        expect(store.tree()[0].children![0].show).toBe(false);
        expect(store.state().lastClosedPlane).toBe(spawned.planeID);

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        expect(store.tree()[0].children).toHaveLength(1);
        expect(store.tree()[0].children![0].show).toBe(true);
    });

    it('two links in one plane spawn two distinct children', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ linkID: 'a#/detail#0', linkCoordinates: { x: 300, y: 40 } }))(store.dispatch, store.getState);
        toggleLinkPlane(parameters({ linkID: 'a#/detail#1', linkCoordinates: { x: 300, y: 140 } }))(store.dispatch, store.getState);
        const children = store.tree()[0].children!;
        expect(children).toHaveLength(2);
        expect(children[0].planeID).not.toBe(children[1].planeID);
        // deterministic: the id derives from the link id
        expect(children[0].planeID).toMatch(/\/detail@[0-9a-f]{8}$/);
        expect(children[0].location.translateY).toBe(40);
        expect(children[1].location.translateY).toBe(140);
    });

    it('closePlane / openLastClosed round-trip a spawned child', () => {
        const store = makeStore();
        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        const id = store.tree()[0].children![0].planeID;

        closePlane(id)(store.dispatch, store.getState);
        expect(store.tree()[0].children![0].show).toBe(false);
        expect(store.state().lastClosedPlane).toBe(id);

        openLastClosed()(store.dispatch, store.getState);
        expect(store.tree()[0].children![0].show).toBe(true);
        expect(store.state().lastClosedPlane).toBe('');
    });

    it('does nothing for an unregistered route', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ route: '/missing', linkID: 'a#/missing#0' }))(store.dispatch, store.getState);
        expect(store.tree()[0].children ?? []).toHaveLength(0);
    });
});
// #endregion module
