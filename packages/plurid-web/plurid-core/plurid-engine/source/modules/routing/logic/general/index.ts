// #region imports
    // #region external
    import {
        extractPathname,
    } from '~modules/routing/Parser/logic';
    // #endregion external
// #endregion imports



// #region module
export const stringInsertInitial = (
    value: string,
    insert: string,
) => {
    if (!value.startsWith(insert)) {
        value = insert + value;
    }

    return value;
}

export const stringRemoveTrailing = (
    value: string,
    trail: string,
) => {
    if (value.endsWith(trail)) {
        value = value.slice(0, value.length - trail.length);
    }

    return value;
}


const PATH_SEPARATOR = '/';
const PTTP_PROTOCOL = 'pttp://';

export const cleanupPath = (
    value: string,
) => {
    value = stringInsertInitial(value, PATH_SEPARATOR);
    value = stringRemoveTrailing(value, PATH_SEPARATOR);
    return value;
}


export const computePlaneAddress = (
    plane: string,
    route?: string,
    origin: string = 'origin',
) => {
    const cleanPlane = extractPathname(plane);

    const planeAddressType = checkPlaneAddressType(cleanPlane);

    switch(planeAddressType) {
        case 'http':
        case 'https':
        case 'pttp':
            return cleanPlane;
    }

    origin = stringRemoveTrailing(origin, '/');

    const absolutePlane = isAbsolutePlane(plane)

    const path = route && route !== '/'
        ? absolutePlane
            ? cleanupPath(cleanPlane)
            : cleanupPath(route) + cleanupPath(cleanPlane)
        : cleanupPath(cleanPlane);

    const planeAddress = PTTP_PROTOCOL + origin + path;

    return planeAddress;
}

export const isAbsolutePlane = (
    value: string,
) => {
    return value[0] === '/';
}


export const checkPlaneAddressType = (
    value: string,
) => {
    value = value
        .toLowerCase()
        .trim();

    if (value.startsWith(PTTP_PROTOCOL)) {
        return 'pttp';
    }

    if (value.startsWith('https://')) {
        return 'https';
    }

    if (value.startsWith('http://')) {
        return 'http';
    }

    return 'relative';
}
// #endregion module
