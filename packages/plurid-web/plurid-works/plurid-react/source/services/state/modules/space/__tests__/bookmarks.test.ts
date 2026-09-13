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
        makeSpaceStore,
    } from '../../../../../testing/store';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE BOOKMARKS as state: a record of name → encoded viewpoint whose ORDER is the order they were
 * saved in — and a rename edits it in place, so the drawer's rows never jump under the pointer.
 */
const store = () => makeSpaceStore(defaultConfiguration, []);
const names = (state: any) => Object.keys(state.space.bookmarks);


describe('the bookmarks', () => {
    it('saving keeps the order; saving an existing name overwrites it where it is', () => {
        const { dispatch, getState } = store();
        dispatch(actions.setBookmark({ name: 'one', viewpoint: 'v1' }));
        dispatch(actions.setBookmark({ name: 'two', viewpoint: 'v2' }));
        dispatch(actions.setBookmark({ name: 'three', viewpoint: 'v3' }));
        expect(names(getState())).toEqual(['one', 'two', 'three']);

        dispatch(actions.setBookmark({ name: 'two', viewpoint: 'v2-again' }));
        expect(names(getState())).toEqual(['one', 'two', 'three']);
        expect(getState().space.bookmarks.two).toBe('v2-again');
    });

    it('a rename keeps the bookmark\'s place in the list', () => {
        const { dispatch, getState } = store();
        dispatch(actions.setBookmark({ name: 'one', viewpoint: 'v1' }));
        dispatch(actions.setBookmark({ name: 'two', viewpoint: 'v2' }));
        dispatch(actions.setBookmark({ name: 'three', viewpoint: 'v3' }));

        dispatch(actions.renameBookmark({ from: 'two', to: 'middle' }));
        expect(names(getState())).toEqual(['one', 'middle', 'three']);
        expect(getState().space.bookmarks.middle).toBe('v2');
    });

    it('a rename onto a name already taken replaces it, in the renamed one\'s place', () => {
        const { dispatch, getState } = store();
        dispatch(actions.setBookmark({ name: 'one', viewpoint: 'v1' }));
        dispatch(actions.setBookmark({ name: 'two', viewpoint: 'v2' }));
        dispatch(actions.setBookmark({ name: 'three', viewpoint: 'v3' }));

        dispatch(actions.renameBookmark({ from: 'one', to: 'three' }));
        expect(names(getState())).toEqual(['three', 'two']);
        expect(getState().space.bookmarks.three).toBe('v1');
    });

    it('an empty, unchanged or unknown rename changes nothing', () => {
        const { dispatch, getState } = store();
        dispatch(actions.setBookmark({ name: 'one', viewpoint: 'v1' }));
        const before = getState().space.bookmarks;

        dispatch(actions.renameBookmark({ from: 'one', to: '' }));
        dispatch(actions.renameBookmark({ from: 'one', to: 'one' }));
        dispatch(actions.renameBookmark({ from: 'missing', to: 'other' }));
        expect(getState().space.bookmarks).toBe(before);
    });

    it('removing drops only that one; an unknown name is a no-op', () => {
        const { dispatch, getState } = store();
        dispatch(actions.setBookmark({ name: 'one', viewpoint: 'v1' }));
        dispatch(actions.setBookmark({ name: 'two', viewpoint: 'v2' }));

        dispatch(actions.removeBookmark('one'));
        expect(names(getState())).toEqual(['two']);

        const after = getState().space.bookmarks;
        dispatch(actions.removeBookmark('missing'));
        expect(getState().space.bookmarks).toBe(after);
    });
});
// #endregion module
