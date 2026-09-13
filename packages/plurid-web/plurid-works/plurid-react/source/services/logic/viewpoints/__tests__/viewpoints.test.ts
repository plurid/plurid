// #region imports
    // #region libraries
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';

    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';

    import {
        TEST_VIEW as view,
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionSpy,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        homeViewpoint,
        bookmarkViewpoints,
        presetViewpoints,
        namedViewpoints,
        goViewpoint,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE NAMED VIEWPOINTS: the bookmarks, the presets and home as ONE list — the shape the Bookmarks
 * drawer, the command palette and a host's own menu read, each entry carrying the camera it decodes
 * to against the LIVE view.
 */
const at = (
    pivotX: number,
    scale = 1,
) => encodeCameraViewpoint(
    { yaw: 0, pitch: 0, scale, pivot: { x: pivotX, y: 300, z: 0 }, offset: { x: 0, y: 0, z: 0 }, perspective: 2000 },
    view,
    2,
);

const makeStore = (
    configuration = defaultConfiguration,
) => {
    const store = makeSpaceStore(configuration, [treePlane('a'), treePlane('b', { location: { translateX: 900 } })]);
    const tweens = motionSpy(store);
    return { ...store, tweens };
};


describe('the named viewpoints', () => {
    it('home is always a row: unset, it is still where `home` would take you', () => {
        const store = makeStore();
        const home = homeViewpoint(store.getState());
        expect(home.id).toBe('home');
        expect(home.source).toBe('home');
        expect(home.viewpoint).toBe('');
        expect(home.editable).toBe(false);
        // the identity camera, so a thumbnail draws even before anything was saved
        expect(home.camera).not.toBeNull();

        store.dispatch(actions.setHome(at(1200)));
        const saved = homeViewpoint(store.getState());
        expect(saved.viewpoint).toBe(at(1200));
        expect(saved.camera!.pivot.x).toBeCloseTo(1200, 6);
    });

    it('the bookmarks keep the order they were saved in, decoded against the live view', () => {
        const store = makeStore();
        store.dispatch(actions.setBookmark({ name: 'wide', viewpoint: at(100, 0.5) }));
        store.dispatch(actions.setBookmark({ name: 'close', viewpoint: at(900, 2) }));

        const entries = bookmarkViewpoints(store.getState());
        expect(entries.map((entry) => entry.name)).toEqual(['wide', 'close']);
        expect(entries.map((entry) => entry.id)).toEqual(['bookmark:wide', 'bookmark:close']);
        expect(entries.every((entry) => entry.editable)).toBe(true);
        expect(entries[0].camera!.scale).toBeCloseTo(0.5, 6);
        expect(entries[1].camera!.pivot.x).toBeCloseTo(900, 6);

        // a viewpoint this build cannot read is still a row — without a camera to draw
        store.dispatch(actions.setBookmark({ name: 'broken', viewpoint: 'not-a-viewpoint' }));
        expect(bookmarkViewpoints(store.getState())[2].camera).toBeNull();
    });

    it('the presets are the host\'s, never editable; the whole list is home, bookmarks, presets', () => {
        const store = makeStore(configurationWith({
            space: { navigation: { presets: { overview: at(500, 0.25) } } },
        }));
        store.dispatch(actions.setBookmark({ name: 'mine', viewpoint: at(200) }));

        const presets = presetViewpoints(store.getState());
        expect(presets.map((entry) => entry.id)).toEqual(['preset:overview']);
        expect(presets[0].editable).toBe(false);
        expect(presets[0].camera!.scale).toBeCloseTo(0.25, 6);

        expect(namedViewpoints(store.getState()).map((entry) => entry.id))
            .toEqual(['home', 'bookmark:mine', 'preset:overview']);
    });

    it('going to one runs the command its own kind names — one definition for the drawer and the palette', () => {
        const store = makeStore(configurationWith({
            space: { navigation: { presets: { overview: at(500, 0.25) } } },
        }));
        store.dispatch(actions.setBookmark({ name: 'mine', viewpoint: at(200) }));
        const [home, bookmark, preset] = namedViewpoints(store.getState());

        store.dispatch(goViewpoint(bookmark) as any);
        expect(store.tweens[0].target.pivot.x).toBeCloseTo(200, 6);

        store.dispatch(goViewpoint(preset) as any);
        expect(store.tweens[1].target.scale).toBeCloseTo(0.25, 6);

        store.dispatch(actions.setHome(at(1200)));
        store.dispatch(goViewpoint(home) as any);
        expect(store.tweens[2].target.pivot.x).toBeCloseTo(1200, 6);

        // a jump is the caller's to ask for
        store.dispatch(goViewpoint(bookmark, { animate: false }) as any);
        expect(store.tweens).toHaveLength(3);
        expect(store.space().camera.pivot.x).toBeCloseTo(200, 6);
    });
});
// #endregion module
