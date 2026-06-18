// #region module
export enum OPERATION_TYPES {
    SUM = 'SUM',
    PRODUCT = 'PRODUCT',
    DIFFERENCE = 'DIFFERENCE',
}

/**
 * Operate on the `values` up to the given `index` based the specific `operation`.
 * If the `index` is not given it operates to the end.
 *
 * @param type
 * @param values
 * @param index
 */
export const operation = (
    type: keyof typeof OPERATION_TYPES,
    values: number[],
    index?: number,
): number => {
    const _index = typeof index === 'number'
        ? index
        : values.length;

    if (_index === 0) {
        return 0;
    }

    if (_index > values.length) {
        throw 'sum(): Index Out of Bounds.';
    }

    const _values = values.slice(
        0,
        _index,
    );
    return _values.reduce(
        (total, val) => {
            switch(type) {
                case OPERATION_TYPES.SUM:
                    return total + val;
                case OPERATION_TYPES.PRODUCT:
                    return total * val;
                case OPERATION_TYPES.DIFFERENCE:
                    return total - val;
                default:
                    return total + val;
            }
        },
    );
}


/**
 * Sum the `values` up to the given `index`.
 * If the `index` is not given it sums to the end.
 *
 * @param values
 * @param index
 */
export const sum = (
    values: number[],
    index?: number,
): number => {
    const value = operation(
        OPERATION_TYPES.SUM,
        values,
        index
    );
    return value;
}


/**
 * Multiply the `values` up to the given `index`.
 * If the `index` is not given it multiplies to the end.
 *
 * @param values
 * @param index
 */
export const product = (
    values: number[],
    index?: number,
): number => {
    const value = operation(
        OPERATION_TYPES.PRODUCT,
        values,
        index
    );
    return value;
}
// #endregion module
