// #region imports
    import themes, {
        themeFromLook,
    } from '@plurid/plurid-themes';

    // #region external
    import {
        merge,
    } from '../../../../general/configuration';
    import {
        resolveThemes,
    } from '../index';
    import {
        resolveLook,
    } from '../../../../general/look';
    // #endregion external
// #endregion imports



// #region module
describe('the themes a configuration resolves', () => {
    it('takes a Theme object as given, the plurid one too (2026-10-20)', () => {
        // Only names were read: an object in `global.theme` (the type allows it) was ignored, and the
        // look's theme came out instead.
        const custom = { ...themes.night, backgroundColorPrimary: '#123456' };
        const resolved = resolveThemes(merge({ global: { theme: { general: custom, interaction: 'night' } } } as any), undefined);
        expect(resolved.general).toBe(custom);
        expect(resolved.interaction).toBe(themes.night);
        const plurid = resolveThemes(merge({ global: { theme: { general: themes.plurid, interaction: themes.plurid } } } as any), undefined);
        expect(plurid.general).toBe(themes.plurid);
    });

    it('the name `plurid` is the plurid theme; `look`, the default, follows the look (2026-10-21)', () => {
        // The name `plurid` was the default value, so it left the theme to the look: the plurid theme
        // could be asked for only by its object.
        const named = resolveThemes(merge({ global: { theme: 'plurid' } } as any), undefined);
        expect(named.general).toBe(themes.plurid);
        expect(named.interaction).toBe(themes.plurid);
        const fromLook = themeFromLook(resolveLook(merge().global.look));
        expect(resolveThemes(merge(), undefined).general).toEqual(fromLook);
        expect(resolveThemes(merge({ global: { theme: 'look' } } as any), undefined).interaction).toEqual(fromLook);
        const mixed = resolveThemes(merge({ global: { theme: { interaction: 'night' } } } as any), undefined);
        expect(mixed.general).toEqual(fromLook);
        expect(mixed.interaction).toBe(themes.night);
    });

    it('a Theme object that gives some colours takes the rest from the look\'s (2026-10-22)', () => {
        // Any object was taken as a whole Theme, so a partial one left the other colours undefined.
        const resolved = resolveThemes(merge({ global: { theme: { general: { backgroundColorPrimary: '#000000' } } } } as any), undefined);
        const fromLook = themeFromLook(resolveLook(merge().global.look));
        expect(resolved.general.backgroundColorPrimary).toBe('#000000');
        expect(resolved.general.colorPrimary).toBe(fromLook.colorPrimary);
    });

    it('says once, accurately, that the name `plurid` is the plurid theme now (2026-10-22)', () => {
        // The warning told a host that chose `plurid` to pass `look`, and the merge's own form of the
        // name (both parts) set it off on every later merge.
        jest.isolateModules(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const { merge: isolated } = require('../../../../general/configuration');
                isolated(isolated({ global: { theme: 'plurid' } }));
                isolated({ global: { theme: { general: 'plurid', interaction: 'plurid' } } });
                const said = warn.mock.calls.map(([message]) => String(message)).filter((message) => message.includes('global.theme'));
                expect(said).toHaveLength(1);
                expect(said[0]).toContain('the plurid theme itself');
                expect(said[0]).not.toContain('Pass');
            } finally {
                warn.mockRestore();
            }
        });
    });
});
// #endregion module
