import generateTheme from '..';



describe('generateTheme', () => {
    const baseColor = 'hsl(220, 20%, 40%)';

    it('generates a Theme from a type + base color', () => {
        const theme = generateTheme('dark', baseColor);

        expect(theme).toBeDefined();
        expect(theme?.type).toBe('dark');
        // the base color round-trips, and the derived backgrounds are real HSL strings
        expect(theme?.baseColor).toBe(baseColor);
        expect(theme?.backgroundColorPrimary.startsWith('hsl(')).toBe(true);
        expect(theme?.backgroundColorDark).toContain('10%');
        expect(theme?.backgroundColorBright).toContain('90%');
    });

    it('returns undefined for an invalid theme type', () => {
        expect(generateTheme('nonsense' as any, baseColor)).toBeUndefined();
    });

    it('returns undefined for an unparseable base color', () => {
        expect(generateTheme('dark', 'not-a-color')).toBeUndefined();
    });
});
