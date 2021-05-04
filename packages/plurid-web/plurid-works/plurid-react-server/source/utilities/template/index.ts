// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const cleanTemplate = (
    template: string,
) => {
    return template
        // clean new lines
        .replace(
            /(?:\r\n|\r|\n)/g,
            ' ',
        )
        // clean whitespace
        .replace(
            /  +/g,
            ' ',
        )
        .trim();
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


export const recordToString = (
    record: Record<string, string> | undefined,
) => {
    if (!record) {
        return '';
    }

    let recordString = '';

    for (const [key, value] of Object.entries(record)) {
        recordString += `${key}="${value}"`;
    }

    return recordString;
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
