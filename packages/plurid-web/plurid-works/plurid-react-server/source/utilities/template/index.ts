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


/**
 * JavaScript source for an inline `<script>`: `<` becomes `\u003c`, so `</script>` or `<!--` in the
 * data can never end or bend the script, and U+2028 / U+2029 their escapes. In the JSON these values
 * are (`JSON.stringify(state)`) each can only occur inside a string literal, where the escape reads
 * back as the same character — the value is unchanged, only its spelling.
 */
export const safeStore = (
    store: string,
) => {
    return store
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}


/** A name `window.<name> = …` can carry: a JavaScript identifier, nothing that reads as more code. */
const GLOBAL_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;


/**
 * The preserve's `globals` as `window.<key> = <value>;` lines. The value is JavaScript source (by
 * convention `JSON.stringify(store.getState())`) and went in raw: a user's search term in the store
 * state carrying `</script><script>…` closed the inline script and ran its own (2026-09-29). Every value
 * is written through `safeStore` now, as the metastate always was; a key that is not an identifier is
 * refused (the request fails with the error page) instead of being written into the script.
 */
export const globalsInjector = (
    globals: Record<string, string>,
) => {
    let globalsScript = '';

    for (const [key, value] of Object.entries(globals)) {
        if (!GLOBAL_NAME.test(key)) {
            throw new Error(
                `[plurid-server] the preserve global ${JSON.stringify(key)} is not a JavaScript identifier; name it like a variable (window.<name>)`,
            );
        }

        // a string is the value's source; anything else (a JavaScript host passing an object) is serialized
        const source = typeof value === 'string'
            ? value
            : JSON.stringify(value) ?? 'undefined';
        globalsScript += `window.${key} = ${safeStore(source)};\n`;
    }

    return globalsScript;
}
// #endregion module
