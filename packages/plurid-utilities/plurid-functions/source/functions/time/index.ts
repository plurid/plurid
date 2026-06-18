// #region module
const now = () => {
    return Math.floor(
        Date.now() / 1000,
    );
}


const stamp = () => {
    const date = new Date();

    return `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`;
}


/**
 * Delay the program flow for `value` time, in milliseconds.
 *
 * Default: `500`
 *
 * @param value
 */
const delay = async (
    value: number = 500,
) => {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, value);
    });
}
// #endregion module



// #region exports
export {
    now,
    stamp,
    delay,
};
// #endregion exports
