// #region module
/**
 * Return true if `value` is an integer
 * but not equal to `1`.
 *
 * @param value
 */
export const checkIntegerNonUnit = (
    value: number,
) => {
    if (
        Number.isInteger(value)
        && value !== 1
    ) {
        return true;
    }

    return false;
}


/**
 * Normalizes the `value` between the `lower` and `upper` limits.
 *
 * ```
 * normalizeBetween( 20, 0, 100) -> 20
 * normalizeBetween(-20, 0, 100) -> 0
 * normalizeBetween(120, 0, 100) -> 100
 * ```
 *
 * @param value
 * @param lower
 * @param upper
 * @returns
 */
 export const normalizeBetween = (
    value: number,
    lower: number,
    upper: number,
) => {
    if (value < lower) {
        return lower;
    }

    if (value > upper) {
        return upper;
    }

    return value;
}
// #endregion module
