// #region imports
    // #region external
    import {
        PLURID_ICON_SIZES,
    } from '../enumerations';

    import {
        PluridIconSize,
    } from '../interfaces';

    import {
        PLURID_ICON_SIZES_VALUES,
    } from '../constants';
    // #endregion external
// #endregion imports



// #region module
export const handleSize = (
    size: PluridIconSize | undefined,
) => {
    if (!size) {
        return PLURID_ICON_SIZES_VALUES.normal;
    }

    if (typeof size === 'number') {
        return size;
    }

    switch (size) {
        case PLURID_ICON_SIZES.small:
            return PLURID_ICON_SIZES_VALUES.small;
        case PLURID_ICON_SIZES.normal:
            return PLURID_ICON_SIZES_VALUES.normal;
        case PLURID_ICON_SIZES.large:
            return PLURID_ICON_SIZES_VALUES.large;
        default:
            return PLURID_ICON_SIZES_VALUES.normal;
    }
}


export const numberOrDefault = (
    value: number | undefined,
    defaultValue: number,
) => {
    return typeof value === 'number' && !isNaN(value)
        ? value
        : defaultValue;
}
// #endregion module
