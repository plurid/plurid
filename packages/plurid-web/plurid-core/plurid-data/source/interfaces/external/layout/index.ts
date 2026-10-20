// #region imports
    // #region external
    import {
        LAYOUT_TYPES,
    } from '~enumerations/index';
    // #endregion external
// #endregion imports



// #region module
export interface Layout {
    type: keyof typeof LAYOUT_TYPES;
}


export interface LayoutMeta extends Layout {
    type: LAYOUT_TYPES.META;
    layouts: LayoutMetaLayout[];
}

export interface LayoutMetaLayout {
    size?: number;
    pages?: string[];
    layout: LayoutColumns | LayoutRows | LayoutFaceToFace | LayoutZigZag | LayoutSheaves;
}


export interface LayoutColumns extends Layout {
    /**
     * Layout Top View
     *
     * ‾1‾ ‾4‾
     * ‾2‾ ‾5‾
     * ‾3‾
     *
     */
    type: LAYOUT_TYPES.COLUMNS;

    /**
     * Integer value indicating the number of columns.
     *
     * If the number of pages is greater than the number of columns,
     * the pages will overflow onto the next row.
     */
    columns?: number;

    /**
     * Number of planes per column.
     */
    columnLength?: number;

    /**
     * Distance between columns: a share of the plane width — `1`, or a number with a decimal up to `4`
     * (`0.5` is half a plane, `1` a whole one, `1.35` 135 % of one) — or px, any other number (`5`,
     * `135`, `12.5`). The rule of every configured length (`isFractionalLength`, 2026-10-20: `1` was
     * documented as one pixel and a decimal was always a share).
     */
    gap?: number;
}


export interface LayoutRows extends Layout {
    /**
     * Layout Top View
     *
     * ‾1‾ ‾2‾
     * ‾3‾ ‾4‾
     * ‾5‾
     *
     */
    type: LAYOUT_TYPES.ROWS;

    /**
     * Integer value indicating the number of rows.
     *
     * If the number of pages is greater than the number of rows,
     * the pages will overflow onto the next column.
     */
    rows?: number;

    /**
     * Number of planes per row.
     */
    rowLength?: number;

    /**
     * Distance between rows: a share of the plane width — `1`, or a number with a decimal up to `4`
     * (`0.5` is half a plane, `1` a whole one, `1.35` 135 % of one) — or px, any other number (`5`,
     * `135`, `12.5`). The rule of every configured length (`isFractionalLength`, 2026-10-20: `1` was
     * documented as one pixel and a decimal was always a share).
     */
    gap?: number;
}


export interface LayoutFaceToFace extends Layout {
    /**
     * Layout Top View
     *
     * ╱ ‾‾ ╲
     *
     * ╱    first plane
     *
     * —    (optional) middle plane(s)
     *
     * ╲    last plane
     */
    type: LAYOUT_TYPES.FACE_TO_FACE;

    /**
     * Angle between the first plane and the last plane of a row.
     *
     * Value between `0.00` and `360.00`. Recommended between `0` and `180`.
     *
     * Default is `45`.
     */
    angle?: number;

    /**
     * Distance between columns: a share of the plane width — `1`, or a number with a decimal up to `4`
     * (`0.5` is half a plane, `1` a whole one, `1.35` 135 % of one) — or px, any other number (`5`,
     * `135`, `12.5`). The rule of every configured length (`isFractionalLength`, 2026-10-20: `1` was
     * documented as one pixel and a decimal was always a share).
     */
    gap?: number;

    /**
     * Integer value indicating the number of planes (columns) to be inserted in the middle.
     *
     * Default is `0`.
     */
    middle?: number;
}


export interface LayoutZigZag extends Layout {
    type: LAYOUT_TYPES.ZIG_ZAG;

    /**
     * Value between `0.00` and `360.00` and can be negative.
     */
    angle?: number;
}


export interface LayoutSheaves extends Layout {
    type: LAYOUT_TYPES.SHEAVES;

    /**
     * The step back in depth from one sheet to the next: a share of the plane width (`1`, or a number
     * with a decimal up to `4`; default `0.3`) or px (any other number). Can be negative.
     */
    depth?: number;

    /**
     * The step across from one sheet to the next, px (default `0`). Can be negative. (It was
     * documented as a share of the screen width; it is px.)
     */
    offsetX?: number;

    /**
     * The step down from one sheet to the next, px (default `0`). Can be negative.
     */
    offsetY?: number;
}



export type PluridLayout = LayoutColumns
    | LayoutRows
    | LayoutZigZag
    | LayoutFaceToFace
    | LayoutSheaves
    | LayoutMeta;
// #endregion module
