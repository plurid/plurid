// #region module
export const removeTrailingSlash = (
    value: string,
): string => {
    if (!value) {
        return '';
    }

    if (value.endsWith('/')) {
        return removeTrailingSlash(
            value.slice(0, value.length - 1)
        );
    }

    return value;
}
// #endregion module
