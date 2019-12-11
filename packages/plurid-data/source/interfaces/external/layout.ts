import {
    LAYOUT_TYPES,
} from '../../enumerations';



interface Layout {
    type: keyof typeof LAYOUT_TYPES;
}


export interface LayoutMeta extends Layout {
    type: LAYOUT_TYPES.META;
    layouts: LayoutMetaLayout[];
}

export interface LayoutMetaLayout {
    size?: number;
    pages?: string[];
    layout: LayoutColumns | LayoutFaceToFace | LayoutZigZag | LayoutSheaves;
}


export interface LayoutColumns extends Layout {
    type: LAYOUT_TYPES.COLUMNS;

    /**
     * Integer value indicating the number of columns.
     *
     * If the number of pages is greater than the number of columns, the pages will overflow onto the next row.
     */
    columns?: number;
}


export interface LayoutFaceToFace extends Layout {
    type: LAYOUT_TYPES.FACE_TO_FACE;

    /**
     * Value between `0.00` and `360.00` and can be negative.
     */
    halfAngle?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    middleSpace?: number;

    /**
     * Integer value indicating the number of columns to be inserted in the middle.
     */
    middleVideos?: number;
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
