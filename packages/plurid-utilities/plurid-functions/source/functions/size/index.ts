// #region module
/**
 * Convert bytes to human readable text, e.g. `12345678` bytes to `12.34 MB`.
 *
 * `binary` sets the block size to `1024` or `1000` bytes.
 *
 * @param binary
 * @returns
 */
const humanFormat = (
    size: number,
    binary = false,
) => {
    const block = binary
        ? 1024
        : 1000;

    if (size < block) {
        return size + ' B';
    }

    const i = Math.floor(Math.log(size) / Math.log(block));
    let num: number | string = (size / Math.pow(block, i));
    const round = Math.round(num);

    num = round < 10
        ? num.toFixed(2)
        : round < 100
            ? num.toFixed(1)
            : round;

    const binaryText = binary ? 'i' : '';
    const prefix = 'KMGTPEZY'[i - 1] + binaryText;

    return `${num} ${prefix}B`;
}
// #endregion module



// #region exports
export {
    humanFormat,
};
// #endregion exports
