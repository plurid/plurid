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
     * Distance between columns.
     *
     * Value between `0.00` and `x.00` (floating numbers) indicating percent of view width
     * or between `0` and `x0...0` (integers) indicating pixel values.
     *
     * For example:
     * `0.5` is 50% of view width,
     * `5` is five pixels,
     * `1.00` is 100% of view width,
     * `1` is one pixels,
     * `1.35` is 135% of view width,
     * `135` is 135 pixels.
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
     * Distance between rows.
     *
     * Value between `0.00` and `x.00` (floating numbers) indicating percent of view width
     * or between `0` and `x0...0` (integers) indicating pixel values.
     *
     * For example:
     * `0.5` is 50% of view width,
     * `5` is five pixels,
     * `1.00` is 100% of view width,
     * `1` is one pixels,
     * `1.35` is 135% of view width,
     * `135` is 135 pixels.
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
     * Default is `90`.
     */
    angle?: number;

    /**
     * Distance between columns.
     *
     * Value between `0.00` and `x.00` (floating numbers) indicating percent of view width
     * or between `0` and `x0...0` (integers) indicating pixel values.
     *
     * For example:
     * `0.5` is 50% of view width,
     * `5` is five pixels,
     * `1.00` is 100% of view width,
     * `1` is one pixels,
     * `1.35` is 135% of view width,
     * `135` is 135 pixels.
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
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    depth?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    offsetX?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current height of the screen and can be negative.
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
