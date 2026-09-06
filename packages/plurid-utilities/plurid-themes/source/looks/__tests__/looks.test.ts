// #region imports
    // #region internal
    import {
        parseColor,
        formatColor,
        withAlpha,
        mix,
        contrastRatio,
        isDark,
    } from '../color';
    import {
        LOOK_TOKENS,
        LOOK_TOKEN_NAMES,
        lookProperty,
    } from '../tokens';
    import {
        deriveLook,
    } from '../derive';
    import {
        looks,
        LOOK_NAMES,
        LOOK_BASES,
        DEFAULT_LOOK_NAME,
        isLookName,
    } from '../presets';
    import {
        themeFromLook,
    } from '../theme';
    import {
        LookTokens,
    } from '../interfaces';
    // #endregion internal
// #endregion imports



// #region module
describe('the colour arithmetic', () => {
    it('parses hex, rgb(a) and hsl(a), and formats back', () => {
        expect(parseColor('#4da3ff')).toEqual({ r: 77, g: 163, b: 255, a: 1 });
        expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        expect(parseColor('#00000080')?.a).toBeCloseTo(0.502, 2);
        expect(parseColor('rgba(12, 14, 18, 0.62)')).toEqual({ r: 12, g: 14, b: 18, a: 0.62 });
        expect(parseColor('hsl(220, 10%, 32%)')).toBeDefined();
        expect(parseColor('transparent')).toBeUndefined();
        expect(formatColor({ r: 77, g: 163, b: 255, a: 1 })).toBe('#4da3ff');
        expect(formatColor({ r: 12, g: 14, b: 18, a: 0.62 })).toBe('rgba(12, 14, 18, 0.62)');
    });

    it('gives an alpha, mixes, and measures', () => {
        expect(withAlpha('#ffffff', 0.22)).toBe('rgba(255, 255, 255, 0.22)');
        expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
        expect(isDark('#0a0c0f')).toBe(true);
        expect(isDark('#f6f5f1')).toBe(false);
        // a translucent colour is composited over its ground before it is measured
        expect(contrastRatio('rgba(255, 255, 255, 0.5)', '#000000', '#000000')).toBeLessThan(21);
    });
});


describe('the token table', () => {
    it('has one row per token, in a stable order, with the custom property spelled from the name', () => {
        const sample = deriveLook(LOOK_BASES.graphite, 'graphite').tokens;
        const keys = Object.keys(sample) as (keyof LookTokens)[];
        expect([...LOOK_TOKEN_NAMES].sort()).toEqual([...keys].sort());
        expect(new Set(LOOK_TOKEN_NAMES).size).toBe(LOOK_TOKEN_NAMES.length);
        expect(lookProperty('spaceGridMinorSize')).toBe('--plurid-space-grid-minor-size');
        expect(LOOK_TOKENS.find((token) => token.name === 'accent')?.property).toBe('--plurid-accent');
        for (const token of LOOK_TOKENS) {
            expect(token.description.length).toBeGreaterThan(8);
        }
    });
});


describe('the looks', () => {
    it('twelve presets, seven dark and five light, the default among them', () => {
        expect(LOOK_NAMES).toHaveLength(12);
        expect(LOOK_NAMES.filter((name) => LOOK_BASES[name].scheme === 'dark')).toHaveLength(7);
        expect(isLookName(DEFAULT_LOOK_NAME)).toBe(true);
        expect(isLookName('velvet')).toBe(false);
        expect(looks.graphite.name).toBe('graphite');
    });

    it('every preset derives every token, non-empty, and keeps the contrast rules', () => {
        for (const name of LOOK_NAMES) {
            const { tokens, base } = looks[name];
            for (const key of LOOK_TOKEN_NAMES) {
                expect(typeof tokens[key]).toBe('string');
                expect((tokens[key] as string).length).toBeGreaterThan(0);
            }
            // text on an opaque panel
            expect(contrastRatio(tokens.ink, tokens.surfaceSolid)).toBeGreaterThanOrEqual(4.5);
            // the accent on the space (a beam's focus, a link)
            expect(contrastRatio(tokens.accent, tokens.space)).toBeGreaterThanOrEqual(3);
            // a plane's text on its sheet
            expect(contrastRatio(tokens.planeInk, tokens.plane)).toBeGreaterThanOrEqual(7);
            // the grid is on for every look unless the base says otherwise
            expect(tokens.spaceGrid === 'none').toBe(base.grid === false);
            expect(tokens.scheme).toBe(base.scheme);
        }
    });

    it('a custom base makes a whole look; the platform fonts fill in; the grid can be asked for', () => {
        const look = deriveLook({ scheme: 'light', space: '#fffaf0', surface: '#ffffff', ink: '#222222', accent: '#b0003a', grid: true, vignette: true });
        expect(look.name).toBe('custom');
        expect(look.tokens.spaceGrid).not.toBe('none');
        expect(look.tokens.spaceVignette).toContain('radial-gradient');
        expect(look.tokens.font).toContain('system-ui');
        expect(look.tokens.accentInk).toBe('#ffffff');
        expect(look.base).not.toBe(LOOK_BASES.paper);
    });

    it('the legacy Theme a look implies is complete and follows its scheme', () => {
        const dark = themeFromLook(looks.graphite);
        const light = themeFromLook(looks.paper);
        expect(dark.type).toBe('dark');
        expect(light.type).toBe('bright');
        for (const value of Object.values(dark)) {
            expect(typeof value).toBe('string');
            expect((value as string).length).toBeGreaterThan(0);
        }
        expect(dark.colorPrimary).toBe(looks.graphite.tokens.ink);
        expect(dark.backgroundColorPrimary).toBe(looks.graphite.tokens.plane);
        expect(dark.fontFamilySansSerif).toBe(looks.graphite.tokens.font);
        expect(contrastRatio(light.colorPrimary, light.backgroundColorSecondary)).toBeGreaterThanOrEqual(4.5);
    });
});
// #endregion module
