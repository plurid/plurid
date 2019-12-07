export const sumTo = (
    values: number[],
    index: number,
) => {
    if (index === 0 ) {
        return 0;
    }

    const _values = values.slice(
        0,
        index,
    );
    return _values.reduce((total, val) => total + val);
}
