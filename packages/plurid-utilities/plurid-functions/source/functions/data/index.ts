// #region imports
    // #region external
    import {
        PossibleDataString,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const parse = <T = any>(
    value: PossibleDataString,
) => {
    if (!value) {
        return;
    }

    try {
        const data = JSON.parse(value);
        return data as T;
    } catch (error) {
        return;
    }
}


export const parseFromString = <T = any>(
    value: string,
) => {
    try {
        const data = JSON.parse(value);
        return data as T;
    } catch (error) {
        return value;
    }
}


export const stringifyOrDefault = (
    data: any,
) => {
    if (typeof data === 'undefined') {
        return undefined;
    }

    if (typeof data === 'string') {
        return data;
    }

    return JSON.stringify(
        data,
        (_, value) => typeof value === 'undefined' ? null : value,
    );
}
// #endregion module
