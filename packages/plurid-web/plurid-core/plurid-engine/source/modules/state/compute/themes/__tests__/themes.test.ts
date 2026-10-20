// #region imports
    import themes from '@plurid/plurid-themes';

    // #region external
    import {
        merge,
    } from '../../../../general/configuration';
    import {
        resolveThemes,
    } from '../index';
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

        // the plurid theme's own object is the way to ask for it: its NAME is the default value,
        // which leaves the theme to the look
        const plurid = resolveThemes(merge({ global: { theme: { general: themes.plurid, interaction: themes.plurid } } } as any), undefined);
        expect(plurid.general).toBe(themes.plurid);
        const named = resolveThemes(merge({ global: { theme: 'plurid' } } as any), undefined);
        expect(named.general).not.toBe(themes.plurid);
    });
});
// #endregion module
