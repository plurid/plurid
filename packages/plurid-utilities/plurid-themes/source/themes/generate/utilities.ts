// #region imports
    import HSLColor from './hslcolor';

    import {
        HSLColorValues,
    } from '../../interfaces';
// #endregion imports



// #region module
const hueRE = /\((\d{1,3})\s?,/;
const saturationRE = /,\s?(\d{1,3})%\s?,/;
const lightnessRE = /,\s?(\d{1,3})%\)/;

export const parseHSL = (color: string): HSLColor | undefined => {
    const hueMatch = color.match(hueRE);
    const saturationMatch = color.match(saturationRE);
    const lightnessMatch = color.match(lightnessRE);

    if (!hueMatch || !saturationMatch || !lightnessMatch) {
        return;
    }

    const colorValues: HSLColorValues = {
        hue: parseInt(hueMatch[1]),
        saturation: parseInt(saturationMatch[1]),
        lightness: parseInt(lightnessMatch[1]),
    };
    const hslColor = new HSLColor(colorValues);

    return hslColor;
}


export const invertColor = (color: HSLColor): HSLColor => {
    const colorValues: HSLColorValues = {
        hue: color.hue(),
        saturation: color.saturation(),
        lightness: 100 - color.lightness(),
    };
    const hslColor = new HSLColor(colorValues);

    return hslColor;
}
// #endregion module
