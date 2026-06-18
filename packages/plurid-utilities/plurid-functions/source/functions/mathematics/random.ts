// #region module
/**
 * Generate a random number between the given `maximum` and `minimum` values.
 *
 * @param maximum - `1` by default.
 * @param minimum - `0` by default.
 * @param integer - `false` by default. If `true` it returns an integer.
 * @param closedInterval - `true` by default. If `false` it does not include the endpoints.
 * @returns A rational number by default.
 */
export const number = (
    maximum: number = 1,
    minimum: number = 0,
    integer: boolean = false,
    closedInterval: boolean = true,
): number => {
    const value = Math.random() * (maximum - minimum);

    if (!integer) {
        return value + minimum;
    }

    if (!closedInterval) {
        return Math.floor(value) + minimum;
    }

    const randomInterval = Math.random();
    return Math.floor(value) + minimum + Math.round(randomInterval);
};
// #endregion module
