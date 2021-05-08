// #region module
export const cleanTemplate = (
    template: string,
) => {
    return template
        .replace(/(?:\r\n|\r|\n)/g, ' ')
        .replace(/  +/g, ' ')
        .trim();
}
// #endregion module
