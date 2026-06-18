// #region module
/**
 * Returns the range of integers between start (including) and end (excluding).
 *
 * https://dev.to/namirsab/comment/2050
 * @param start
 * @param end
 */
export const range = (
    start: number,
    end: number,
) => {
    const length = end - start;
    return Array.from({ length }, (_, i) => start + i);
}


/**
 * Check if two arrays are equal.
 *
 * @param a
 * @param b
 */
export const equal = <T>(
    a: T[],
    b: T[],
): Boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}


/**
 * Move the `from` indexed item to the `to` indexed item of an array.
 *
 * @param items
 * @param from
 * @param to
 */
export const move = <T>(
    items: T[],
    from: number,
    to: number,
) => {
    const newItems = [
        ...items,
    ];

    newItems.splice(
        to,
        0,
        newItems.splice(from, 1)[0]
    );

    return newItems;
}


/**
 * Swap item `a` with `b`.
 *
 * @param items
 * @param a
 * @param b
 */
export const swap = <T>(
    items: T[],
    a: number,
    b: number,
) => {
    const newItems = [
        ...items,
    ];

    [newItems[a], newItems[b]] = [newItems[b], newItems[a]];

    return newItems;
}


/**
 * Get unique items based on their `identifier`.
 *
 * @param array
 * @param identifier default `'id'`
 * @returns
 */
export const unique = <T = any>(
    array: T[],
    identifier = 'id',
) => {
    const result = [];
    const map = new Map();

    for (const item of array.reverse()) {
        if (!map.has((item as any)[identifier])) {
            map.set((item as any)[identifier], true);

            result.push({
                ...item,
            });
        }
    }

    return result.reverse();
}



/**
 * Shuffles the `values` of an array.
 *
 * @param array
 * @returns
 */
export const shuffle = <T = any>(
    values: T[],
): T[] => {
    const array = [
        ...values,
    ];

    let m = array.length;
    let i: number | undefined;
    let temporary: T | undefined;

    // From `https://bost.ocks.org/mike/shuffle`.
    // While there are elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        temporary = array[m];
        array[m] = array[i];
        array[i] = temporary;

        temporary = undefined;
    }

    return array;
}
// #endregion module
