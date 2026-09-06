// #region imports
    // #region libraries
    import {
        looks,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region internal
    import {
        resolveLook,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
describe('resolveLook()', () => {
    it('a name is its preset; an unknown name or nothing is the default', () => {
        expect(resolveLook('paper')).toBe(looks.paper);
        expect(resolveLook(undefined)).toBe(looks.graphite);
        expect(resolveLook('velvet' as any)).toBe(looks.graphite);
    });

    it('a legacy theme name is its nearest preset (a string the type does not admit, mapped at runtime)', () => {
        expect(resolveLook('night' as any).name).toBe('noir');
        expect(resolveLook('plurid' as any).name).toBe('paper');
        expect(resolveLook('furor' as any).name).toBe('ember');
        expect(resolveLook('denote' as any).name).toBe('graphite');
    });

    it('a base derives a custom look, once per object', () => {
        const base = { scheme: 'light' as const, space: '#fffaf0', surface: '#ffffff', ink: '#222222', accent: '#b0003a' };
        const first = resolveLook(base);
        expect(first.name).toBe('custom');
        expect(first.tokens.space).toBe('#fffaf0');
        expect(resolveLook(base)).toBe(first);
    });

    it('a preset with overrides keeps the preset and lays the tokens over it', () => {
        const setting = { preset: 'paper' as const, tokens: { accent: '#b0003a', radius: '4px' } };
        const look = resolveLook(setting);
        expect(look.name).toBe('paper+');
        expect(look.tokens.accent).toBe('#b0003a');
        expect(look.tokens.radius).toBe('4px');
        expect(look.tokens.space).toBe(looks.paper.tokens.space);
        expect(resolveLook({ tokens: { accent: '#000000' } }).tokens.space).toBe(looks.graphite.tokens.space);
    });
});
// #endregion module
