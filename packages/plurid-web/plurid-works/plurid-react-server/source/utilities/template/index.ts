// #region imports
    // #region libraries
    import {
        minify,
    } from 'html-minifier-terser';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const cleanTemplate = (
    template: string,
) => {
    return minify(
        template,
        {
            collapseWhitespace: true,
            conservativeCollapse: true,
            collapseInlineTagWhitespace: false,
        },
    );
}


export const resolveBackgroundStyle = (
    store: string,
) => {
    const defaultBackground = {
        gradientBackground: 'hsl(220, 10%, 32%)',
        gradientForeground: 'hsl(220, 10%, 18%)',
    };

    try {
        const storeJSON = JSON.parse(store);
        const generalPluridTheme: Theme | undefined = storeJSON?.themes?.general;

        if (!generalPluridTheme) {
            return defaultBackground;
        }

        const gradientBackground = generalPluridTheme.type === 'dark'
            ? generalPluridTheme.backgroundColorTertiary
            : generalPluridTheme.backgroundColorPrimary
        const gradientForeground = generalPluridTheme.type === 'dark'
            ? generalPluridTheme.backgroundColorPrimary
            : generalPluridTheme.backgroundColorTertiary

        return {
            gradientBackground,
            gradientForeground,
        };
    } catch (error) {
        return defaultBackground;
    }
}


/**
 * Escape a value destined for a double-quoted HTML attribute, so a value containing `"` (or angle
 * brackets) cannot break out of the attribute / tag. `&` first to avoid double-encoding.
 */
export const escapeAttribute = (
    value: string,
) => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


export const recordToString = (
    record: Record<string, string> | undefined,
) => {
    if (!record) {
        return '';
    }

    // Space-separated `key="value"` pairs, values escaped against attribute/tag breakout.
    return Object.entries(record)
        .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
        .join(' ');
}


export const assetsPathRewrite = (
    content: string,
) => {
    return content.replace(
        /="client\//g,
        '="/',
    );
}


export const safeStore = (
    store: string,
) => {
    return store.replace(
        /</g,
        '\\u003c',
    );
}


export const globalsInjector = (
    globals: Record<string, string>,
) => {
    let globalsScript = '';

    for (const [key, value] of Object.entries(globals)) {
        const globalScript = `window.${key} = ${value};\n`;
        globalsScript += globalScript;
    }

    return globalsScript;
}
// #endregion module
