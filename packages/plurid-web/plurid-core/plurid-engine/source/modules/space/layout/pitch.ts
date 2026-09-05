// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * The size of each group (a column or a row) of a grid: the largest plane in it, a plane without
 * that dimension counting as `fallback`. A group with no plane stays 0.
 */
export const groupSizes = (
    roots: TreePlane[],
    groups: number,
    groupOf: (index: number) => number,
    sizeOf: (root: TreePlane) => number,
    fallback: number,
): number[] => {
    const sizes: number[] = new Array(Math.max(0, groups)).fill(0);
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
