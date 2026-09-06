// #region module
/**
 * The little colour arithmetic a look needs: parse a CSS colour (hex, `rgb()`, `rgba()`, `hsl()`,
 * `hsla()`), give it an alpha, mix two, lighten or darken, and measure contrast (WCAG). Output is
 * always `rgba()` or `#rrggbb`, so the derived tokens are plain CSS wherever they land.
 */

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const hue = ((h % 360) + 360) % 360 / 360;
    const sat = clamp(s, 0, 1);
    const lig = clamp(l, 0, 1);
    if (sat === 0) {
        return [lig * 255, lig * 255, lig * 255];
    }
    const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
    const p = 2 * lig - q;
    const channel = (t: number) => {
        let x = t;
        if (x < 0) x += 1;
        if (x > 1) x -= 1;
        if (x < 1 / 6) return p + (q - p) * 6 * x;
        if (x < 1 / 2) return q;
        if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
        return p;
    };
    return [channel(hue + 1 / 3) * 255, channel(hue) * 255, channel(hue - 1 / 3) * 255];
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const l = (max + min) / 2;
    if (max === min) {
        return [0, 0, l];
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    return [h * 60, s, l];
};

/** Parse a CSS colour; `undefined` for anything it does not understand (`transparent`, a name, a var). */
export const parseColor = (
    input: string,
): RGBA | undefined => {
    const value = input.trim().toLowerCase();
    const hex = /^#([0-9a-f]{3,8})$/.exec(value);
    if (hex) {
        const digits = hex[1];
        const expand = digits.length === 3 || digits.length === 4;
        const pair = (index: number) => (expand
            ? parseInt(digits[index] + digits[index], 16)
            : parseInt(digits.slice(index * 2, index * 2 + 2), 16));
        const hasAlpha = digits.length === 4 || digits.length === 8;
        if (![3, 4, 6, 8].includes(digits.length)) {
            return undefined;
        }
        return { r: pair(0), g: pair(1), b: pair(2), a: hasAlpha ? pair(3) / 255 : 1 };
    }
    const rgb = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(value);
    if (rgb) {
        const alpha = rgb[4] === undefined ? 1 : (rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]));
        return { r: parseFloat(rgb[1]), g: parseFloat(rgb[2]), b: parseFloat(rgb[3]), a: clamp(alpha, 0, 1) };
    }
    const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(value);
    if (hsl) {
        const [r, g, b] = hslToRgb(parseFloat(hsl[1]), parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100);
        const alpha = hsl[4] === undefined ? 1 : (hsl[4].endsWith('%') ? parseFloat(hsl[4]) / 100 : parseFloat(hsl[4]));
        return { r, g, b, a: clamp(alpha, 0, 1) };
    }
    return undefined;
};

const round = (value: number) => Math.round(value * 1000) / 1000;

/** `rgba(r, g, b, a)`, or `#rrggbb` when opaque. */
export const formatColor = (
    color: RGBA,
): string => {
    const r = Math.round(clamp(color.r, 0, 255));
    const g = Math.round(clamp(color.g, 0, 255));
    const b = Math.round(clamp(color.b, 0, 255));
    if (color.a >= 1) {
        return '#' + [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('');
    }
    return `rgba(${r}, ${g}, ${b}, ${round(color.a)})`;
};

/** The colour with the given alpha (the input's own alpha is replaced). */
export const withAlpha = (
    input: string,
    alpha: number,
): string => {
    const color = parseColor(input);
    if (!color) {
        return input;
    }
    return formatColor({ ...color, a: clamp(alpha, 0, 1) });
};

/** Linear mix of two colours, `t` from `a` (0) to `b` (1); the alphas mix too. */
export const mix = (
    a: string,
    b: string,
    t: number,
): string => {
    const from = parseColor(a);
    const to = parseColor(b);
    if (!from || !to) {
        return t < 0.5 ? a : b;
    }
    const k = clamp(t, 0, 1);
    return formatColor({
        r: from.r + (to.r - from.r) * k,
        g: from.g + (to.g - from.g) * k,
        b: from.b + (to.b - from.b) * k,
        a: from.a + (to.a - from.a) * k,
    });
};

/** Lightness shifted by `amount` (−1..1) in HSL; the hue and the saturation kept. */
export const shiftLightness = (
    input: string,
    amount: number,
): string => {
    const color = parseColor(input);
    if (!color) {
        return input;
    }
    const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
    const [r, g, b] = hslToRgb(h, s, clamp(l + amount, 0, 1));
    return formatColor({ r, g, b, a: color.a });
};

/** WCAG relative luminance, 0 (black) to 1 (white). */
export const luminance = (
    input: string,
): number => {
    const color = parseColor(input);
    if (!color) {
        return 0;
    }
    const channel = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
};

/** WCAG contrast ratio between two opaque colours (a translucent one is composited over `over`). */
export const contrastRatio = (
    a: string,
    b: string,
    over?: string,
): number => {
    const composite = (input: string) => {
        const color = parseColor(input);
        const ground = over ? parseColor(over) : undefined;
        if (!color) {
            return input;
        }
        if (color.a >= 1 || !ground) {
            return formatColor({ ...color, a: 1 });
        }
        return formatColor({
            r: color.r * color.a + ground.r * (1 - color.a),
            g: color.g * color.a + ground.g * (1 - color.a),
            b: color.b * color.a + ground.b * (1 - color.a),
            a: 1,
        });
    };
    const la = luminance(composite(a));
    const lb = luminance(composite(b));
    const light = Math.max(la, lb);
    const dark = Math.min(la, lb);
    return (light + 0.05) / (dark + 0.05);
};

/** Whether the colour reads as dark (luminance under 0.5): the scheme a base implies. */
export const isDark = (
    input: string,
): boolean => luminance(input) < 0.5;
// #endregion module
