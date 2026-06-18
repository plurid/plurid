// #region module
/**
 * Convert the `angle` from radians to degrees.
 *
 * @param angle
 */
export const toDegrees = (
    angle: number
) => {
    return angle * (180 / Math.PI);
}


/**
 * Convert the `angle` from degrees to radians.
 * @param angle
 */
export const toRadians = (
    angle: number,
) => {
    return angle * (Math.PI / 180);
}
// #endregion module
