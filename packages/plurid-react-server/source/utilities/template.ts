export const cleanTemplate = (
    template: string,
) => {
    const cleanNewLines = template.replace(/(?:\r\n|\r|\n)/g, ' ');
    const cleanWhitespace = cleanNewLines.replace(/  +/g, ' ');

    return cleanWhitespace;
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
        const generalPluridTheme = storeJSON?.themes?.general;

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


export const templateTecordToString = (
    record: Record<string, string> | undefined
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
