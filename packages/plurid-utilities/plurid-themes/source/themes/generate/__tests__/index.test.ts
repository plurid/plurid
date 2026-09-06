import generateTheme from '..';



describe('generateTheme (deprecated: a shim over the look derivation)', () => {
    const baseColor = 'hsl(220, 20%, 40%)';

    it('generates a Theme from a type + base color', () => {
        const theme = generateTheme('dark', baseColor);

        expect(theme).toBeDefined();
        expect(theme?.type).toBe('dark');
        expect(theme?.name).toBe('generated');
        // the base color round-trips; every field the drawers and content read is filled
        expect(theme?.baseColor).toBe(baseColor);
        for (const field of ['backgroundColorPrimary', 'backgroundColorSecondary', 'backgroundColorTertiary', 'colorPrimary', 'colorSecondary', 'boxShadowUmbra', 'fontFamilySansSerif'] as const) {
            expect(typeof theme?.[field]).toBe('string');
            expect((theme?.[field] as string).length).toBeGreaterThan(0);
        }
    });

    it('a bright type gives a bright theme', () => {
        expect(generateTheme('bright', 'hsl(40, 30%, 92%)')?.type).toBe('bright');
    });

    it('returns undefined for an invalid theme type', () => {
        expect(generateTheme('nonsense' as any, baseColor)).toBeUndefined();
    });

    it('returns undefined for an unparseable base color', () => {
        expect(generateTheme('dark', 'not-a-color')).toBeUndefined();
    });
});
