import {
    parseHSL,
} from '../utilities';

import HSLColor from '../hslcolor';



describe('parseHSL', () => {
    it('parses HSL from correct string', () => {
        const color = 'hsl(223, 35%, 13%)';
        const result = parseHSL(color);
        expect(result).toBeInstanceOf(HSLColor);

        if (result) {
            expect(result.hue()).toBe(223);
            expect(result.saturation()).toBe(35);
            expect(result.lightness()).toBe(13);
        }
    });

    it('does not parse HSL from incorrect string', () => {
        const color = 'hsl(asd, 35%, 13%)';
        const result = parseHSL(color);
        expect(result).toBe(undefined);
    });
});
