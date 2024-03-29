// #region imports
    // #region imports
    import {
        protocols,
        PLURID_PROTOCOL,
        HTTPS_PROTOCOL,
        HTTP_PROTOCOL,
    } from '@plurid/plurid-data';
    // #endregion imports


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
    if (origin === 'origin' && typeof location !== 'undefined' && location.host) {
        origin = location.host;
    }

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

    const planeAddress = protocols.plurid + origin + path;

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

    if (value.startsWith(protocols.plurid)) {
        return 'pttp';
    }

    if (value.startsWith(protocols.https)) {
        return HTTPS_PROTOCOL;
    }

    if (value.startsWith(protocols.http)) {
        return HTTP_PROTOCOL;
    }

    return 'relative';
}


export const removeTrailingSlash = (
    value: string,
) => {
    if (value.endsWith('/') && value.length > 1) {
        return value.slice(0, value.length - 1);
    }

    return value;
}


export const cleanPathValue = (
    value: string,
) => {
    const queryStart = value.indexOf('?');
    if (queryStart < 0) {
        return removeTrailingSlash(
            value,
        );
    }

    return removeTrailingSlash(
        value.substring(0, queryStart),
    );
}
// #endregion module
