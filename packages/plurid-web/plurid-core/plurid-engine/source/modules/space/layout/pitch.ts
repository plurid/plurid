// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * A layout knob as a finite number: a number or a numeric string (a configuration read from JSON),
 * else `fallback`. NaN, ±Infinity, `null` and garbage never reach the arithmetic.
 */
export const finiteNumber = (
    value: unknown,
    fallback: number,
): number => {
    const number = typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : value;
    return typeof number === 'number' && Number.isFinite(number)
        ? number
        : fallback;
};

/**
 * A layout COUNT (columns, planes per column, …): a whole number of at least 1, floored, never more
 * than `max` (a count past the number of roots only sizes arrays for nothing), else `fallback`. A
 * fractional or huge count used to size an array (`new Array(1.5)`, `new Array(1e10)`) and throw.
 */
export const layoutCount = (
    value: unknown,
    fallback: number,
    max = Infinity,
): number => {
    const number = finiteNumber(value, NaN);
    const count = number >= 1 ? Math.floor(number) : fallback;
    return Math.max(1, Math.min(count, Math.max(1, max)));
};


/**
 * The width a layout PLACES a root by: a hand-set or declared width is the plane's own; a measured
 * one counts only where the configuration leaves the width to the content (`configuredWidth` 0),
 * since where the configuration sets it the measurement is an observation of THAT, made for the
 * previous view. 0 means "the fallback".
 */
export const placedWidth = (
    root: TreePlane,
    configuredWidth: number,
): number => {
    if (root.sizeMode === 'manual' || root.sizeMode === 'declared') {
        return root.width || 0;
    }
    return configuredWidth > 0 ? 0 : (root.width || 0);
};

/** The height a layout places a root by (see `placedWidth`). */
export const placedHeight = (
    root: TreePlane,
    configuredHeight: number,
): number => {
    if (root.sizeMode === 'manual' || root.sizeMode === 'declared') {
        return root.height || 0;
    }
    return configuredHeight > 0 ? 0 : (root.height || 0);
};

/**
 * The size of each group (a column or a row) of a grid: the largest plane in it, a plane without
 * that dimension counting as `fallback`. A group with no plane stays 0. The group count is floored
 * and never more than the roots (a group needs a plane to have a size).
 */
export const groupSizes = (
    roots: TreePlane[],
    groups: number,
    groupOf: (index: number) => number,
    sizeOf: (root: TreePlane) => number,
    fallback: number,
): number[] => {
    const count = Math.min(Math.floor(finiteNumber(groups, 0)), roots.length);
    const sizes: number[] = new Array(Math.max(0, count)).fill(0);
    for (const [index, root] of roots.entries()) {
        const group = groupOf(index);
        if (group < 0 || group >= sizes.length) {
            continue;
        }
        sizes[group] = Math.max(sizes[group], sizeOf(root) || fallback);
    }
    return sizes;
};


/** Where each group starts: `[0, s0 + gap, s0 + gap + s1 + gap, …]`. */
export const prefixOffsets = (
    sizes: number[],
    gap: number,
): number[] => {
    const offsets: number[] = [];
    let offset = 0;
    for (const size of sizes) {
        offsets.push(offset);
        offset += size + gap;
    }
    return offsets;
};
// #endregion module



// #region exports
export default groupSizes;
// #endregion exports
