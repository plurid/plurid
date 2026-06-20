// #region imports
    // #region external
    import {
        defaultConfigurationGlobal,
        defaultConfigurationElements,
    } from '../constants/configuration';
    // #endregion external
// #endregion imports



// #region module
// Invariant tests for the shared default configuration. The engine's config `merge` layers user
// configuration on top of these defaults, so their shape is a real contract — a structural break
// here silently changes how every consumer's configuration resolves.
describe('plurid-data default configuration', () => {
    it('defaultConfigurationGlobal has the expected theme + flags', () => {
        // `theme` is a `string | PluridConfigurationTheme` union — assert the whole object
        // form rather than narrowing to `.general`/`.interaction`.
        expect(defaultConfigurationGlobal.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });
        expect(defaultConfigurationGlobal.micro).toBe(false);
        expect(defaultConfigurationGlobal.transparentUI).toBe(false);
    });

    it('defaultConfigurationElements exposes a plane element config', () => {
        expect(defaultConfigurationElements).toBeDefined();
        expect(typeof defaultConfigurationElements).toBe('object');
        expect(defaultConfigurationElements.plane).toBeDefined();
    });
});
// #endregion module
