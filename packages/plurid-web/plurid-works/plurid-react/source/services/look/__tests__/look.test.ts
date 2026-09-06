// #region imports
    // #region libraries
    import {
        looks,
        LOOK_TOKENS,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region internal
    import {
        lookStylesheet,
        PLURID_ATTRIBUTE_APPLICATION,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
describe('lookStylesheet()', () => {
    it('emits every token as a scoped custom property, the fade alias and the colour scheme', () => {
        const css = lookStylesheet(looks.graphite, 'rt');
        expect(css.startsWith(`[${PLURID_ATTRIBUTE_APPLICATION}="rt"] {`)).toBe(true);
        for (const token of LOOK_TOKENS) {
            expect(css).toContain(`${token.property}: ${looks.graphite.tokens[token.name]};`);
        }
        expect(css).toContain('--plurid-dock-fade: var(--plurid-fade);');
        expect(css).toContain('color-scheme: dark;');
        expect(lookStylesheet(looks.paper, 'rt')).toContain('color-scheme: light;');
    });

    it('a configured docking fade overrides the token; the id is escaped', () => {
        const css = lookStylesheet(looks.graphite, 'a"b', { fade: '400ms' });
        expect(css).toContain('--plurid-fade: 400ms;');
        expect(css).toContain('[data-plurid-application="a\\"b"]');
    });
});
// #endregion module
