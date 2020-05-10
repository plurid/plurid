export const cleanTemplate = (
    template: string,
) => {
    const cleanNewLines = template.replace(/(?:\r\n|\r|\n)/g, ' ');
    const cleanWhitespace = cleanNewLines.replace(/  +/g, ' ');

    return cleanWhitespace;
}
