// #region imports
    // #region libraries
    import themes, {
        themeFromLook,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';

    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        pickLook,
        pickTheme,
    } from '../look';
    // #endregion internal
// #endregion imports



// #region module
const fromLook = (look: string) => themeFromLook(generalEngine.look.resolveLook(look as any));

/**
 * THE GLOBAL DRAWER'S PICKS (2026-10-21). A theme picked was looked up by name (`themes[name]`), so
 * the default `look` would have set no theme at all, and the look itself could not be picked.
 */
describe('the Global drawer\'s picks', () => {
    it('a theme part resolves the themes as the store does: `look` follows the look, a name is its theme', () => {
        const store = makeSpaceStore();
        store.dispatch(pickTheme('general', 'plurid'));
        expect(store.getState().configuration.global.theme).toEqual({ general: 'plurid', interaction: 'look' });
        expect(store.getState().themes.general).toBe(themes.plurid);
        expect(store.getState().themes.interaction).toEqual(fromLook('graphite'));

        store.dispatch(pickTheme('general', 'look'));
        expect(store.getState().themes.general).toEqual(fromLook('graphite'));
    });

    it('a look sets `global.look`, and the themes that follow it', () => {
        const store = makeSpaceStore();
        store.dispatch(pickTheme('interaction', 'night'));
        store.dispatch(pickLook('paper'));
        expect(store.getState().configuration.global.look).toBe('paper');
        expect(store.getState().themes.general).toEqual(fromLook('paper'));
        expect(store.getState().themes.interaction).toBe(themes.night);
    });
});
// #endregion module
